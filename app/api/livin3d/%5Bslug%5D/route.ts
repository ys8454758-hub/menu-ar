import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      include: {
        dishes: {
          where: { isArchived: false },
          orderBy: { displayOrder: "asc" },
          include: {
            model: true,
            nutrition: {
              include: { allergens: true }
            },
            badges: true
          }
        },
        badgeTheme: true,
        menuTheme: true
      }
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}
