import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import prisma from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { to, subject, html, type, restaurantId } = body;
        if (!to || !subject || !html) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        const { data, error } = await resend.emails.send({
            from: "Livin3D <noreply@livin3d.in>",
            to, subject, html,
        });
        if (error) {
            return NextResponse.json({ error: "Failed to send email", details: error }, { status: 500 });
        }
        if (restaurantId) {
            await prisma.emailLog.create({
                data: { restaurantId, to, subject, type: type || "TRANSACTIONAL", status: "SENT", resendId: data?.id || null },
            }).catch(() => { });
        }
        return NextResponse.json({ success: true, id: data?.id });
    } catch (error) {
        console.error("Email error:", error);
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { restaurantId } = body;
        if (!restaurantId) return NextResponse.json({ error: "restaurantId required" }, { status: 400 });
        const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId }, include: { owner: true } });
        if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
        const { data, error } = await resend.emails.send({
            from: "Livin3D <welcome@livin3d.in>",
            to: restaurant.owner.email,
            subject: `Welcome to Livin3D, ${restaurant.name}!`,
            html: `<div style="font-family:system-ui;max-width:600px;margin:0 auto;background:#0a0a0a;color:#e5e5e5;padding:40px;"><h1 style="color:#00ff88;letter-spacing:0.1em;">LIVIN3D</h1><h2 style="color:#fff;margin-top:30px;">Welcome, ${restaurant.name}!</h2><p style="color:#a3a3a3;line-height:1.6;">Your restaurant is now set up on Livin3D. Start uploading 3D dish models and generating QR codes.</p><a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://livin3d.in"}/dashboard/dishes/new" style="display:inline-block;background:#00ff88;color:#0a0a0a;padding:12px 24px;text-decoration:none;font-weight:600;margin-top:20px;">Add Your First Dish</a></div>`,
        });
        if (error) return NextResponse.json({ error: "Failed to send welcome email" }, { status: 500 });
        return NextResponse.json({ success: true, id: data?.id });
    } catch (error) {
        console.error("Email PUT error:", error);
        return NextResponse.json({ error: "Failed to send welcome email" }, { status: 500 });
    }
}