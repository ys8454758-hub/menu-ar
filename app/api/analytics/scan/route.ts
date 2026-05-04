import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { apiLimiter } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Rate limit by IP
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const limit = apiLimiter(ip);

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limit.resetTime - Date.now()) / 1000)) } }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const dishId = searchParams.get("dishId");
    if (!dishId) {
      return NextResponse.json({ error: "Missing dishId parameter" }, { status: 400 });
    }

    const dish = await prisma.dish.findUnique({
      where: { id: dishId },
      include: { scanEvents: { orderBy: { createdAt: "desc" }, take: 1000 } },
    });

    if (!dish) {
      return NextResponse.json({ error: "Dish not found" }, { status: 404 });
    }

    const scanEvents = dish.scanEvents;
    const totalScans = scanEvents.length;
    const uniqueVisitorIds = new Set(scanEvents.map((e) => e.visitorId).filter(Boolean));
    const uniqueScans = uniqueVisitorIds.size;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scansToday = scanEvents.filter((e) => new Date(e.createdAt) >= today).length;

    const deviceCounts: Record<string, number> = {};
    scanEvents.forEach((e) => {
      if (e.device) deviceCounts[e.device] = (deviceCounts[e.device] || 0) + 1;
    });
    const topDevice = Object.entries(deviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Unknown";
    const lastScannedAt = scanEvents.length > 0 ? scanEvents[0].createdAt : null;

    return NextResponse.json({
      stats: { totalScans, uniqueScans, scansToday, topDevice, lastScannedAt },
      limit: { remaining: limit.remaining, resetTime: limit.resetTime },
    });
  } catch (error) {
    console.error("Analytics scan error:", error);
    return NextResponse.json({ error: "Failed to fetch scan analytics" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Stricter rate limit for POST (scan recording)
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const limit = apiLimiter(ip);

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limit.resetTime - Date.now()) / 1000)) } }
    );
  }

  try {
    const body = await request.json();
    const { dishId, visitorId, device, userAgent, referrer } = body;
    if (!dishId) {
      return NextResponse.json({ error: "Missing dishId" }, { status: 400 });
    }

    const dish = await prisma.dish.findUnique({ where: { id: dishId } });
    if (!dish) {
      return NextResponse.json({ error: "Dish not found" }, { status: 404 });
    }

    const scanEvent = await prisma.scanEvent.create({
      data: {
        dishId,
        visitorId: visitorId || null,
        device: device || null,
        userAgent: userAgent || null,
        referrer: referrer || null,
      },
    });

    return NextResponse.json({ scanEvent, remaining: limit.remaining }, { status: 201 });
  } catch (error) {
    console.error("Scan event creation error:", error);
    return NextResponse.json({ error: "Failed to record scan event" }, { status: 500 });
  }
}
