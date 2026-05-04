import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantId, customerName, tableNumber, items } = body;

    if (!restaurantId || !customerName || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const dish = await prisma.dish.findUnique({
        where: { id: item.dishId }
      });
      
      if (!dish) continue;

      const price = dish.price || 0;
      totalAmount += price * item.quantity;
      
      orderItemsData.push({
        dishId: item.dishId,
        quantity: item.quantity,
        price: price
      });
    }

    const order = await prisma.order.create({
      data: {
        restaurantId,
        customerName,
        tableNumber,
        totalAmount,
        status: "PENDING",
        items: {
          create: orderItemsData
        }
      },
      include: {
        items: {
          include: { dish: true }
        }
      }
    });

    // TODO: Trigger real-time notification (e.g. Supabase Realtime or WebSocket)
    
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to place order" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request, new NextResponse());
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) return NextResponse.json({ error: "Restaurant ID required" }, { status: 400 });

    // Verify ownership
    const restaurant = await prisma.restaurant.findFirst({
      where: { id: restaurantId, ownerId: user.id }
    });

    if (!restaurant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const orders = await prisma.order.findMany({
      where: { restaurantId },
      include: {
        items: { include: { dish: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
    try {
      const user = await getCurrentUser(request, new NextResponse());
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
      const body = await request.json();
      const { orderId, status } = body;
  
      if (!orderId || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  
      // Verify ownership through restaurant
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { restaurant: true }
      });
  
      if (!order || order.restaurant.ownerId !== user.id) {
        return NextResponse.json({ error: "Order not found or access denied" }, { status: 404 });
      }
  
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status }
      });
  
      return NextResponse.json(updatedOrder);
    } catch (error) {
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}
