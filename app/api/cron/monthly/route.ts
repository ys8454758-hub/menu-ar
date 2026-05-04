// GET /api/cron/monthly - Monthly report cron job
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const month = lastMonth.getMonth() + 1;
    const year = lastMonth.getFullYear();

    const results = {
      reportsGenerated: 0,
      emailsSent: 0,
      emailsFailed: 0,
      skipped: 0,
    };

    // Get all restaurants
    const restaurants = await prisma.restaurant.findMany({
      include: {
        subscription: true,
        owner: true,
        _count: {
          select: {
            dishes: true,
            scanEvents: true,
          },
        },
      },
    });

    for (const restaurant of restaurants) {
      // Check if already reported
      const existingReport = await prisma.monthlyReport.findUnique({
        where: {
          restaurantId_month_year: {
            restaurantId: restaurant.id,
            month,
            year,
          },
        },
      });

      if (existingReport) {
        results.skipped++;
        continue;
      }

      // Get scan data for last month
      const scanEvents = await prisma.scanEvent.findMany({
        where: {
          restaurantId: restaurant.id,
          scannedAt: {
            gte: new Date(year, month - 1, 1),
            lt: new Date(year, month + 1, 1),
          },
        },
        include: {
          dish: true,
        },
      });

      const totalScans = scanEvents.length;

      // Top dish
      const dishCounts: Record<string, number> = {};
      scanEvents.forEach((e) => {
        dishCounts[e.dishId] = (dishCounts[e.dishId] || 0) + 1;
      });
      const topDishId = Object.entries(dishCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

      // Save report
      await prisma.monthlyReport.create({
        data: {
          restaurantId: restaurant.id,
          month,
          year,
          totalScans,
          topDishId: topDishId || null,
          reportData: {
            totalScans,
            topDishId,
            scanEvents: scanEvents.length,
          },
        },
      });

      results.reportsGenerated++;

      // Send email
      try {
        await sendEmail({
          to: restaurant.owner.email || "",
          subject: `Livin3D Monthly Report - ${lastMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
          html: `
            <div style="font-family:monospace;max-width:480px;margin:0 auto;padding:24px;background:#0a0a0a;color:#e0e0e0;border:1px solid #00ff8833;">
              <h1 style="color:#00ff88;font-size:20px;letter-spacing:4px;">MONTHLY REPORT</h1>
              <p style="color:#888;">${restaurant.name}</p>
              <p style="color:#888;">${lastMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
              <div style="margin:16px 0;padding:12px;border:1px solid #333;">
                <p style="color:#e0e0e0;">Total Scans: <strong style="color:#00ff88;">${totalScans}</strong></p>
                <p style="color:#e0e0e0;">Active Dishes: <strong style="color:#ff6b35;">${restaurant._count.dishes}</strong></p>
              </div>
              <p style="color:#888;">Thank you for using Livin3D!</p>
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/analytics" style="display:inline-block;margin-top:16px;padding:8px 16px;border:1px solid #00ff88;color:#00ff88;text-decoration:none;letter-spacing:2px;">VIEW ANALYTICS</a>
            </div>
          `,
        });
        results.emailsSent++;
      } catch (error) {
        console.error("Email failed:", error);
        results.emailsFailed++;
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
