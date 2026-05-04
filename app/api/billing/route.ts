import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { PlanType } from "@/lib/business-rules";

const PLAN_LIMITS: Record<string, { dishes: number; restaurants: number; price: number }> = {
    STARTER: { dishes: 10, restaurants: 1, price: 99900 },
    GROWTH: { dishes: 50, restaurants: 1, price: 299900 },
    PRO: { dishes: -1, restaurants: -1, price: 799900 },
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { restaurantId, plan } = body as { restaurantId: string; plan: string };
        if (!restaurantId || !plan || !PLAN_LIMITS[plan]) {
            return NextResponse.json({ error: "Invalid restaurantId or plan" }, { status: 400 });
        }
        const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId }, include: { subscription: true } });
        if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });

        const planConfig = PLAN_LIMITS[plan];
        const now = new Date();
        const currentPeriodEnd = new Date(now);
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

        const subscription = await prisma.subscription.upsert({
            where: { restaurantId },
            update: { plan: plan as PlanType, status: "ACTIVE", currentPeriodStart: now, currentPeriodEnd },
            create: { restaurantId, plan: plan as PlanType, status: "ACTIVE", currentPeriodStart: now, currentPeriodEnd },
        });

        const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return NextResponse.json({ orderId, subscription, amount: planConfig.price, currency: "INR", key: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder" });
    } catch (error) {
        console.error("Billing error:", error);
        return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const restaurantId = searchParams.get("restaurantId");
        if (!restaurantId) return NextResponse.json({ error: "restaurantId required" }, { status: 400 });

        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            include: { subscription: true, _count: { select: { dishes: true } } },
        });
        if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });

        const currentPlan = restaurant.subscription?.plan || "FREE";
        const planConfig = PLAN_LIMITS[currentPlan] || null;
        const dishCount = restaurant._count.dishes;
        const dishLimit = planConfig?.dishes || 3;
        const isAtLimit = dishLimit > 0 && dishCount >= dishLimit;

        return NextResponse.json({ currentPlan, dishCount, dishLimit, isAtLimit, subscription: restaurant.subscription, plans: PLAN_LIMITS });
    } catch (error) {
        console.error("Billing GET error:", error);
        return NextResponse.json({ error: "Failed to fetch billing info" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { restaurantId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = body;
        if (!restaurantId || !razorpayPaymentId) return NextResponse.json({ error: "Missing payment data" }, { status: 400 });

        const subscription = await prisma.subscription.update({ where: { restaurantId }, data: { status: "ACTIVE" } });
        await prisma.payment.create({
            data: { restaurantId, amount: 0, currency: "INR", razorpayPaymentId, razorpayOrderId: razorpayOrderId || "", razorpaySignature: razorpaySignature || "", status: "PAID" },
        });
        return NextResponse.json({ success: true, subscription });
    } catch (error) {
        console.error("Payment verification error:", error);
        return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
    }
}