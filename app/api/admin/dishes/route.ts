// GET /api/admin/dishes - All dishes for admin panel
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if admin
    const adminUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    if (adminUser?.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const dishes = await prisma.dish.findMany({
      include: {
        restaurant: {
          select: { id: true, name: true, slug: true },
        },
        model: true,
        nutrition: true,
        qrCode: true,
        _count: {
          select: { scanEvents: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(dishes);
  } catch (error) {
    console.error("Admin dishes fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch dishes" }, { status: 500 });
  }
}
