import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    if (adminUser?.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const restaurantsCount = await prisma.restaurant.count();
    const dishesCount = await prisma.dish.count();
    const scansCount = await prisma.scanEvent.count();
    
    // Calculate active subscriptions and MRR
    const activeSubs = await prisma.subscription.count({
      where: { status: "ACTIVE" }
    });
    
    const subscriptions = await prisma.subscription.findMany({
      where: { status: "ACTIVE" }
    });
    
    let mrr = 0;
    for (const sub of subscriptions) {
      if (sub.plan === "STARTER") mrr += 999;
      else if (sub.plan === "GROWTH") mrr += 2999;
      else if (sub.plan === "PRO") mrr += 4999;
    }

    const stats = {
      restaurantsCount,
      dishesCount,
      scansCount,
      activeSubs,
      mrr
    };

    const restaurants = await prisma.restaurant.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        owner: true,
        _count: { select: { dishes: true, scanEvents: true } },
        subscription: true
      }
    });

    const mappedRestaurants = restaurants.map(r => ({
      id: r.id,
      name: r.name,
      ownerEmail: r.owner.email,
      dishesCount: r._count.dishes,
      scansCount: r._count.scanEvents,
      plan: r.subscription?.plan || "NONE",
      isOnMap: r.isOnMap
    }));

    return NextResponse.json({ stats, restaurants: mappedRestaurants });
  } catch (error) {
    console.error("Admin overview fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch overview" }, { status: 500 });
  }
}
