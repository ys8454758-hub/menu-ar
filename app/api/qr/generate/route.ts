import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateQRCode } from "@/lib/qr-generator";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const data = searchParams.get("data");
        if (!data) {
            return NextResponse.json({ error: "Missing data parameter" }, { status: 400 });
        }

        const size = parseInt(searchParams.get("size") || "512");
        const foregroundColor = searchParams.get("foregroundColor") || "#00ff88";
        const backgroundColor = searchParams.get("backgroundColor") || "#0a0a0a";
        const errorCorrectionLevel = (searchParams.get("errorCorrectionLevel") || "H") as "L" | "M" | "Q" | "H";

        const qrDataUrl = await QRCode.toDataURL(data, {
            errorCorrectionLevel,
            width: size,
            margin: 2,
            color: {
                dark: foregroundColor,
                light: backgroundColor,
            },
        });

        const base64 = qrDataUrl.split(",")[1];
        const buffer = Buffer.from(base64, "base64");

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "image/png",
                "Cache-Control": "public, max-age=3600",
            },
        });
    } catch (error) {
        console.error("QR generation error:", error);
        return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request, new NextResponse());
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { dishId, restaurantId, ...config } = body;

    // Validate ownership
    const restaurant = await prisma.restaurant.findFirst({
      where: { id: restaurantId, ownerId: user.id }
    });
    if (!restaurant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    let url = "";
    if (dishId) {
      const dish = await prisma.dish.findUnique({
        where: { id: dishId },
        include: { restaurant: true }
      });
      if (!dish) return NextResponse.json({ error: "Dish not found" }, { status: 404 });
      url = `${new URL(request.url).origin}/ar/${dish.restaurant.slug}/${dish.slug}`;
    } else {
      url = `${new URL(request.url).origin}/livin3d/${restaurant.slug}`;
    }

    const result = await generateQRCode(url, restaurantId, dishId || null, config);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Save to DB
    if (dishId) {
      await prisma.qrCode.upsert({
        where: { dishId },
        update: {
          pngUrl: result.pngUrl,
          svgUrl: result.svgUrl,
          designConfig: config as any,
          scanReliabilityScore: result.reliabilityScore
        },
        create: {
          dishId,
          arUrl: url,
          pngUrl: result.pngUrl,
          svgUrl: result.svgUrl,
          designConfig: config as any,
          scanReliabilityScore: result.reliabilityScore
        }
      });
    } else {
      await prisma.restaurant.update({
        where: { id: restaurantId },
        data: {
          menuQrUrl: result.pngUrl,
          // menuQrPdfUrl: result.pdfUrl // if we had it
        }
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("QR save error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}