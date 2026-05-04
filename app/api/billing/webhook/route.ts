// POST /api/billing/webhook - Razorpay webhook handler
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "";

    // Verify webhook signature
    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSig) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const { type, payload } = event;

    console.log(`Razorpay webhook: ${type}`, payload);

    switch (type) {
      case "subscription.activated":
      case "subscription.charged": {
        const subscriptionId = payload?.subscription?.id;

        if (subscriptionId) {
          await prisma.subscription.updateMany({
            where: { razorpaySubId: subscriptionId },
            data: { status: "ACTIVE" },
          });
        }
        break;
      }

      case "subscription.pending": {
        const subscriptionId = payload?.subscription?.id;
        if (subscriptionId) {
          await prisma.subscription.updateMany({
            where: { razorpaySubId: subscriptionId },
            data: { status: "PAST_DUE" },
          });
        }
        break;
      }

      case "subscription.halted":
      case "subscription.cancelled": {
        const subscriptionId = payload?.subscription?.id;
        if (subscriptionId) {
          await prisma.subscription.updateMany({
            where: { razorpaySubId: subscriptionId },
            data: { status: "CANCELLED", cancelAtPeriodEnd: true },
          });
        }
        break;
      }

      case "payment.failed": {
        const paymentId = payload?.payment?.id;
        if (paymentId) {
          await prisma.invoice.updateMany({
            where: { razorpayPaymentId: paymentId },
            data: { status: "FAILED" },
          });
        }
        break;
      }

      case "payment.captured": {
        const paymentId = payload?.payment?.id;
        const amount = payload?.payment?.amount / 100; // Convert from paise

        if (paymentId) {
          await prisma.invoice.updateMany({
            where: { razorpayPaymentId: paymentId },
            data: { status: "PAID", paidAt: new Date(), amount },
          });
        }
        break;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
