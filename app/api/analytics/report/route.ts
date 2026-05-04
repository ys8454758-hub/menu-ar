// GET /api/analytics/report?restaurantId=...&period=7d|30d|90d
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import { computeDishHealthScore } from "@/lib/health-score";

function getPeriodDays(period: string): number {
    switch (period) {
        case "7d": return 7;
        case "30d": return 30;
        case "90d": return 90;
        default: return 30;
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const restaurantId = searchParams.get("restaurantId");
        const period = searchParams.get("period") || "30d";

        if (!restaurantId) {
            return NextResponse.json({ error: "restaurantId is required" }, { status: 400 });
        }

        const days = getPeriodDays(period);
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const totalScans = await prisma.scanEvent.count({
            where: { restaurantId, scannedAt: { gte: since } },
        });

        const scansByDay = await prisma.scanEvent.findMany({
            where: { restaurantId, scannedAt: { gte: since } },
            select: { scannedAt: true },
            orderBy: { scannedAt: "asc" },
        });

        const dailyScans: Record<string, number> = {};
        for (const scan of scansByDay) {
            const day = scan.scannedAt.toISOString().split("T")[0];
            dailyScans[day] = (dailyScans[day] || 0) + 1;
        }

        const topDishes = await prisma.scanEvent.groupBy({
            by: ["dishId"],
            where: { restaurantId, scannedAt: { gte: since } },
            _count: { dishId: true },
            orderBy: { _count: { dishId: "desc" } },
            take: 10,
        }) as Array<{ dishId: string; _count: { dishId: number } }>;

        const dishIds = topDishes.map((d) => d.dishId);
        const dishes = await prisma.dish.findMany({
            where: { id: { in: dishIds } },
            include: { model: true, scanEvents: { where: { scannedAt: { gte: since } } } },
        });

        const topDishesWithHealth = dishes.map((dish) => ({
            id: dish.id,
            name: dish.name,
            slug: dish.slug,
            scanCount: topDishes.find((t: { dishId: string }) => t.dishId === dish.id)?._count.dishId || 0,
            healthScore: computeDishHealthScore(dish),
            hasModel: !!dish.model,
            isArchived: dish.isArchived,
        }));

        const deviceBreakdown = await prisma.scanEvent.groupBy({
            by: ["deviceType"],
            where: { restaurantId, scannedAt: { gte: since } },
            _count: { deviceType: true },
        }) as Array<{ deviceType: string | null; _count: { deviceType: number } }>;

        const cityBreakdown = await prisma.scanEvent.groupBy({
            by: ["city"],
            where: { restaurantId, scannedAt: { gte: since }, city: { not: null } },
            _count: { city: true },
            orderBy: { _count: { city: "desc" } },
            take: 10,
        }) as Array<{ city: string | null; _count: { city: number } }>;

        const activeQRCodes = await prisma.qRCode.count({
            where: { restaurantId, isActive: true },
        });

        const totalDishes = await prisma.dish.count({
            where: { restaurantId, isArchived: false },
        });

        const dishesWithModels = await prisma.dish.count({
            where: { restaurantId, isArchived: false, model: { isNot: null } },
        });

        return NextResponse.json({
            period,
            since: since.toISOString(),
            totalScans,
            dailyScans,
            topDishes: topDishesWithHealth,
            deviceBreakdown: deviceBreakdown.map((d: { deviceType: string | null; _count: { deviceType: number } }) => ({
                deviceType: d.deviceType || "unknown",
                count: d._count.deviceType,
            })),
            cityBreakdown: cityBreakdown.map((c: { city: string | null; _count: { city: number } }) => ({
                city: c.city || "unknown",
                count: c._count.city,
            })),
            activeQRCodes,
            totalDishes,
            dishesWithModels,
            modelCoverage: totalDishes > 0 ? Math.round((dishesWithModels / totalDishes) * 100) : 0,
        });
    } catch (error) {
        console.error("Error generating analytics report:", error);
        return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
    }
}