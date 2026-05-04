// GET /api/dishes/[id] — single dish detail
// PATCH /api/dishes/[id] — update dish
// DELETE /api/dishes/[id] — soft delete (isArchived = true)

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const dish = await prisma.dish.findUnique({
            where: { id },
            include: {
                model: true,
                nutrition: { include: { allergens: true } },
                badges: true,
                ingredients: true,
                qrCode: true,
                scanEvents: { take: 1, orderBy: { scannedAt: "desc" } },
            },
        });

        if (!dish) {
            return NextResponse.json({ error: "Dish not found" }, { status: 404 });
        }

        return NextResponse.json(dish);
    } catch (error) {
        console.error("Error fetching dish:", error);
        return NextResponse.json({ error: "Failed to fetch dish" }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const dish = await prisma.dish.update({
            where: { id },
            data: {
                ...(body.name && { name: body.name }),
                ...(body.slug && { slug: body.slug }),
                ...(body.description !== undefined && { description: body.description }),
                ...(body.price !== undefined && { price: body.price }),
                ...(body.displayOrder !== undefined && { displayOrder: body.displayOrder }),
                ...(body.isArchived !== undefined && { isArchived: body.isArchived }),
            },
        });

        // Update badges if provided
        if (body.badges && Array.isArray(body.badges)) {
            await prisma.dishBadge.deleteMany({ where: { dishId: id } });
            await prisma.dishBadge.createMany({
                data: body.badges.map((type: string) => ({ dishId: id, type })),
            });
        }

        // Update ingredients if provided
        if (body.ingredients && Array.isArray(body.ingredients)) {
            await prisma.ingredient.deleteMany({ where: { dishId: id } });
            await prisma.ingredient.createMany({
                data: body.ingredients.map((name: string) => ({ dishId: id, name })),
            });
        }

        // Update nutrition if provided
        if (body.nutrition) {
            await prisma.dishNutrition.upsert({
                where: { dishId: id },
                create: {
                    dishId: id,
                    calories: body.nutrition.calories,
                    protein: body.nutrition.protein,
                    carbs: body.nutrition.carbs,
                    fat: body.nutrition.fat,
                    fiber: body.nutrition.fiber,
                    sodium: body.nutrition.sodium,
                    sugar: body.nutrition.sugar,
                    servingSize: body.nutrition.servingSize,
                    servingUnit: body.nutrition.servingUnit,
                },
                update: {
                    calories: body.nutrition.calories,
                    protein: body.nutrition.protein,
                    carbs: body.nutrition.carbs,
                    fat: body.nutrition.fat,
                    fiber: body.nutrition.fiber,
                    sodium: body.nutrition.sodium,
                    sugar: body.nutrition.sugar,
                    servingSize: body.nutrition.servingSize,
                    servingUnit: body.nutrition.servingUnit,
                },
            });

            if (body.nutrition.allergens && Array.isArray(body.nutrition.allergens)) {
                const nutrition = await prisma.dishNutrition.findUnique({ where: { dishId: id } });
                if (nutrition) {
                    await prisma.allergen.deleteMany({ where: { nutritionId: nutrition.id } });
                    await prisma.allergen.createMany({
                        data: body.nutrition.allergens.map((name: string) => ({
                            nutritionId: nutrition.id,
                            name,
                        })),
                    });
                }
            }
        }

        return NextResponse.json(dish);
    } catch (error) {
        console.error("Error updating dish:", error);
        return NextResponse.json({ error: "Failed to update dish" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Soft delete — set isArchived = true (Rule 7: never serve a 404)
        const dish = await prisma.dish.update({
            where: { id },
            data: { isArchived: true },
            include: { qrCode: true },
        });

        // If dish has a QR code, set redirect
        if (dish.qrCode && dish.qrCode.isActive) {
            const restaurant = await prisma.restaurant.findUnique({
                where: { id: dish.restaurantId },
            });
            if (restaurant) {
                await prisma.qRCode.update({
                    where: { id: dish.qrCode.id },
                    data: { redirectUrl: `/ar/${restaurant.slug}` },
                });
            }
        }

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error("Error deleting dish:", error);
        return NextResponse.json({ error: "Failed to delete dish" }, { status: 500 });
    }
}