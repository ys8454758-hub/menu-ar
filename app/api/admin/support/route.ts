import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (adminUser?.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });

    const tickets = await prisma.supportTicket.findMany({
      include: {
        restaurant: true
      },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    const mappedTickets = tickets.map(t => ({
      id: t.id,
      restaurantName: t.restaurant.name,
      subject: t.subject,
      category: t.category,
      status: t.status,
      priority: t.priority,
      createdAt: t.createdAt
    }));

    return NextResponse.json(mappedTickets);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}
