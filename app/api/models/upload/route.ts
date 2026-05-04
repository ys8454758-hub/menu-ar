// POST /api/models/upload
import { NextRequest, NextResponse } from "next/server";
import { uploadGLBFile } from "@/lib/upload";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const dishId = formData.get("dishId") as string | null;
        const restaurantId = formData.get("restaurantId") as string | null;

        if (!file || !dishId || !restaurantId) {
            return NextResponse.json(
                { error: "Missing required fields: file, dishId, restaurantId" },
                { status: 400 }
            );
        }

        if (!file.name.endsWith(".glb")) {
            return NextResponse.json(
                { error: "Invalid file type. Only .glb files are accepted." },
                { status: 400 }
            );
        }

        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File size exceeds 50MB limit." },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const result = await uploadGLBFile(buffer, file.name, restaurantId, dishId);

        if (!result.success || !result.url) {
            return NextResponse.json(
                { error: result.error || "Upload failed" },
                { status: 500 }
            );
        }

        const dishModel = await prisma.dishModel.upsert({
            where: { dishId },
            create: {
                dishId,
                glbUrl: result.url,
                fileSizeBytes: buffer.length,
                processingStatus: "READY",
            },
            update: {
                glbUrl: result.url,
                fileSizeBytes: buffer.length,
                processingStatus: "READY",
            },
        });

        return NextResponse.json({
            glbUrl: result.url,
            dishModelId: dishModel.id,
        });
    } catch (error) {
        console.error("Model upload error:", error);
        return NextResponse.json(
            { error: "Model upload failed" },
            { status: 500 }
        );
    }
}