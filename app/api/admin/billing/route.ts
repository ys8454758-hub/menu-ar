import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (adminUser?.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });

    const subscriptions = await prisma.subscription.findMany({
      include: {
        restaurant: true
      },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    const mappedSubs = subscriptions.map(s => ({
      id: s.id,
      restaurantName: s.restaurant.name,
      plan: s.plan,
      status: s.status,
      currentPeriodEnd: s.currentPeriodEnd,
      createdAt: s.createdAt
    }));

    return NextResponse.json(mappedSubs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch billing data" }, { status: 500 });
  }
}
