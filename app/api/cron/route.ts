import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const results = { subscriptionsChecked: 0, subscriptionsExpired: 0, healthScoresRecalculated: 0, staleModelsFlagged: 0, timestamp: new Date().toISOString() };

        // Check expired subscriptions
        const activeSubscriptions = await prisma.subscription.findMany({
            where: { status: "ACTIVE", currentPeriodEnd: { lt: new Date() } },
            include: { restaurant: true },
        });
        results.subscriptionsChecked = activeSubscriptions.length;

        for (const sub of activeSubscriptions) {
            await prisma.subscription.update({ where: { id: sub.id }, data: { status: "PAST_DUE" } });
            results.subscriptionsExpired++;
        }

        // Check expired trials
        const expiredTrials = await prisma.subscription.findMany({
            where: { status: "TRIALING", currentPeriodEnd: { lt: new Date() } },
        });
        for (const trial of expiredTrials) {
            await prisma.subscription.update({ where: { id: trial.id }, data: { status: "CANCELLED" } });
            results.subscriptionsExpired++;
        }

        // Recalculate health scores for recently scanned dishes
        const recentScans = await prisma.scanEvent.findMany({
            where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
            select: { dishId: true },
            distinct: ["dishId"],
        });
        for (const scan of recentScans) {
            const dish = await prisma.dish.findUnique({
                where: { id: scan.dishId },
                include: { _count: { select: { scanEvents: true } } },
            });
            if (dish) {
                const scanScore = Math.min(dish._count.scanEvents / 50, 1) * 40;
                const modelScore = dish.modelUrl ? 30 : 0;
                const healthScore = Math.round(scanScore + modelScore + 30);
                await prisma.dish.update({ where: { id: dish.id }, data: { healthScore } });
                results.healthScoresRecalculated++;
            }
        }

        // Flag stale dishes
        const staleDishes = await prisma.dish.findMany({
            where: { isActive: true, modelUrl: { not: null }, scanEvents: { none: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } } },
        });
        results.staleModelsFlagged = staleDishes.length;

        // Clean up old scan events
        const deletedScans = await prisma.scanEvent.deleteMany({
            where: { createdAt: { lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } },
        });

        return NextResponse.json({ ...results, oldScansCleanedUp: deletedScans.count });
    } catch (error) {
        console.error("Cron error:", error);
        return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
    }
}