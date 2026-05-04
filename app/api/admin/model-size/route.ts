// PATCH /api/admin/model-size
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { modelId, scaleX, scaleY, scaleZ, widthCm, heightCm, depthCm, arSizeLocked, note } = body;

    if (!modelId) {
      return NextResponse.json({ error: "Model ID required" }, { status: 400 });
    }

    // Get current model data for audit log
    const currentModel = await prisma.dishModel.findUnique({
      where: { id: modelId },
      include: { dish: { include: { restaurant: true } } },
    });

    if (!currentModel) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    // Update model
    const updatedModel = await prisma.dishModel.update({
      where: { id: modelId },
      data: {
        scaleX,
        scaleY,
        scaleZ,
        widthCm,
        heightCm,
        depthCm,
        arSizeLocked,
      },
    });

    // Create audit log
    await prisma.modelSizeAuditLog.create({
      data: {
        modelId,
        changedBy: user.email || "admin",
        oldScaleX: currentModel.scaleX,
        oldScaleY: currentModel.scaleY,
        oldScaleZ: currentModel.scaleZ,
        newScaleX: scaleX,
        newScaleY: scaleY,
        newScaleZ: scaleZ,
        note: note || null,
      },
    });

    return NextResponse.json({ success: true, model: updatedModel });
  } catch (error) {
    console.error("Model size update error:", error);
    return NextResponse.json({ error: "Failed to update model size" }, { status: 500 });
  }
}
