import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, category, imageUrl, restaurantId } = body;

    // Validate required fields
    if (!name || !restaurantId) {
      return NextResponse.json(
        { error: "Name and restaurantId are required" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Create the dish
    const dish = await prisma.dish.create({
      data: {
        name,
        slug,
        description,
        price: price ? parseFloat(price) : null,
        restaurantId,
      },
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
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json(
        { error: "restaurantId is required" },
        { status: 400 }
      );
    }

    const dishes = await prisma.dish.findMany({
      where: { restaurantId },
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json(dishes);
  } catch (error) {
    console.error("Error fetching dishes:", error);
    // Return empty array during build when database is not available
    return NextResponse.json([]);
  }
}