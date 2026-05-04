// PATCH /api/admin/qr/[id]/redirect
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if admin
    const adminUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    if (adminUser?.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { redirectUrl } = body;

    const qrCode = await prisma.qRCode.update({
      where: { id },
      data: { redirectUrl },
    });

    return NextResponse.json({ success: true, qrCode });
  } catch (error) {
    console.error("QR redirect update error:", error);
    return NextResponse.json({ error: "Failed to update redirect" }, { status: 500 });
  }
}
