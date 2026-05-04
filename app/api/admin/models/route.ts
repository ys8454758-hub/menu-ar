import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (adminUser?.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });

    const models = await prisma.dishModel.findMany({
      include: {
        dish: {
          include: { restaurant: true }
        }
      },
      orderBy: { uploadedAt: "desc" },
      take: 50
    });

    const mappedModels = models.map(m => ({
      id: m.id,
      dishName: m.dish.name,
      restaurantName: m.dish.restaurant.name,
      status: m.processingStatus,
      size: m.fileSizeBytes ? `${(m.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB` : "Unknown",
      uploadedAt: m.uploadedAt
    }));

    return NextResponse.json(mappedModels);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 });
  }
}
