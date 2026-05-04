import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const data = searchParams.get("data");
        if (!data) {
            return NextResponse.json({ error: "Missing data parameter" }, { status: 400 });
        }

        const format = searchParams.get("format") || "png";
        const size = parseInt(searchParams.get("size") || "1024");
        const foregroundColor = searchParams.get("foregroundColor") || "#00ff88";
        const backgroundColor = searchParams.get("backgroundColor") || "#0a0a0a";
        const errorCorrectionLevel = (searchParams.get("errorCorrectionLevel") || "H") as "L" | "M" | "Q" | "H";

        if (format === "svg") {
            const svgString = await QRCode.toString(data, {
                type: "svg",
                errorCorrectionLevel,
                margin: 2,
                color: { dark: foregroundColor, light: backgroundColor },
            });
            return new NextResponse(svgString, {
                headers: {
                    "Content-Type": "image/svg+xml",
                    "Content-Disposition": "attachment; filename=\"qr_code.svg\"",
                },
            });
        }

        const qrDataUrl = await QRCode.toDataURL(data, {
            errorCorrectionLevel,
            width: size,
            margin: 2,
            color: { dark: foregroundColor, light: backgroundColor },
        });

        const base64 = qrDataUrl.split(",")[1];
        const buffer = Buffer.from(base64, "base64");

        const restaurantName = searchParams.get("restaurantName") || "Restaurant";
        const dishName = searchParams.get("dishName") || "Dish";

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "image/png",
                "Content-Disposition": `attachment; filename="${restaurantName}_${dishName}_qr.png"`,
                "Cache-Control": "no-cache",
            },
        });
    } catch (error) {
        console.error("QR download error:", error);
        return NextResponse.json({ error: "Failed to download QR code" }, { status: 500 });
    }
}