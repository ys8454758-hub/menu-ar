import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateSlug } from "@/lib/slug-generator";
import { canCreateDish, validateDishName } from "@/lib/business-rules";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, displayOrder, category } = body;

    // Get current user
    const user = await getCurrentUser(request, new NextResponse());
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find user's restaurant
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        ownerId: user.id
      }
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Validate dish name
    const nameValidation = validateDishName(name);
    if (!nameValidation.valid) {
      logger.warn(`Invalid dish name: ${nameValidation.error}`);
      return NextResponse.json(
        { error: nameValidation.error },
        { status: 400 }
      );
    }

    // Check plan limits
    const canCreate = await canCreateDish(restaurant.id);
    if (!canCreate.allowed) {
      logger.warn(`Dish creation blocked: ${canCreate.reason}`);
      return NextResponse.json(
        { error: canCreate.reason },
        { status: 403 }
      );
    }

    // Generate slug from name
    const existingDishes = await prisma.dish.findMany({
      where: {
        restaurantId: restaurant.id
      },
      select: {
        slug: true
      }
    });

    const existingSlugs = existingDishes.map((d: { slug: string }) => d.slug);
    const slug = generateSlug(name, existingSlugs);

    // Create the dish using Prisma
    const dish = await prisma.dish.create({
      data: {
        name,
        slug,
        description,
        price: price ? parseFloat(price) : null,
        displayOrder: displayOrder || 0,
        category,
        restaurantId: restaurant.id
      }
    });

    return NextResponse.json(dish, { status: 201 });
  } catch (error) {
    console.error("Error creating dish:", error);
    return NextResponse.json(
      { error: "Failed to create dish" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser(request, new NextResponse());
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find user's restaurant
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        ownerId: user.id
      }
    });

    if (!restaurant) {
      return NextResponse.json([]);
    }

    // Fetch dishes using Prisma
    const dishes = await prisma.dish.findMany({
      where: {
        restaurantId: restaurant.id,
        isArchived: false
      },
      orderBy: {
        displayOrder: 'asc'
      }
    });

    return NextResponse.json(dishes || []);
  } catch (error) {
    console.error("Error fetching dishes:", error);
    return NextResponse.json(
      { error: "Failed to fetch dishes" },
      { status: 500 }
    );
  }
}
