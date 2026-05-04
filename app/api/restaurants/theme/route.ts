import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const restaurant = await prisma.restaurant.findFirst({
      where: { ownerId: user.id },
      include: { menuTheme: true }
    });

    if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });

    return NextResponse.json(restaurant.menuTheme || { themeName: "terminal" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch theme" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const restaurant = await prisma.restaurant.findFirst({
      where: { ownerId: user.id }
    });

    if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });

    const body = await request.json();
    const { themeName, primaryColor, backgroundColor, fontFamily } = body;

    const updatedTheme = await prisma.menuTheme.upsert({
      where: { restaurantId: restaurant.id },
      update: {
        themeName,
        primaryColor,
        backgroundColor,
        fontFamily
      },
      create: {
        restaurantId: restaurant.id,
        themeName,
        primaryColor,
        backgroundColor,
        fontFamily
      }
    });

    return NextResponse.json(updatedTheme);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update theme" }, { status: 500 });
  }
}
