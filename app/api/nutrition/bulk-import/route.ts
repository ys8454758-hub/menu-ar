// POST /api/nutrition/bulk-import
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { restaurantId, data } = body;

    if (!restaurantId || !data || !Array.isArray(data)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const results = { imported: 0, failed: [] as Array<{ row: number; error: string }> };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        const dish = await prisma.dish.findFirst({
          where: { slug: row.dishSlug || row.name, restaurantId },
          include: { nutrition: true },
        });

        if (!dish) {
          results.failed.push({ row: i + 1, error: "Dish not found" });
          continue;
        }

        // Create or update nutrition
        await prisma.dishNutrition.upsert({
          where: { dishId: dish.id },
          create: {
            dishId: dish.id,
            calories: row.calories ? parseFloat(row.calories) : null,
            protein: row.protein ? parseFloat(row.protein) : null,
            carbs: row.carbs ? parseFloat(row.carbs) : null,
            fat: row.fat ? parseFloat(row.fat) : null,
            fiber: row.fiber ? parseFloat(row.fiber) : null,
            servingSize: row.servingSize || null,
          },
          update: {
            calories: row.calories ? parseFloat(row.calories) : undefined,
            protein: row.protein ? parseFloat(row.protein) : undefined,
            carbs: row.carbs ? parseFloat(row.carbs) : undefined,
            fat: row.fat ? parseFloat(row.fat) : undefined,
            fiber: row.fiber ? parseFloat(row.fiber) : undefined,
            servingSize: row.servingSize || undefined,
          },
        });

        results.imported++;
      } catch (err) {
        results.failed.push({
          row: i + 1,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json({ error: "Bulk import failed" }, { status: 500 });
  }
}
