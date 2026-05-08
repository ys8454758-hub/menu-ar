import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import JSZip from "jszip";

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  });

  try {
    const body = await request.json();
    const { restaurantId, format = "png" } = body;

    const { data: dishes, error: dishesError } = await supabase
      .from("dishes")
      .select(`
        id,
        name,
        slug,
        restaurant: restaurants(name, slug),
        qrCode: qr_codes(pngUrl, svgUrl)
      `)
      .eq("restaurantId", restaurantId)
      .eq("isArchived", false);

    if (dishesError) throw dishesError;

    const zip = new JSZip();
    const qrFolder = zip.folder("qrcodes");

    if (!qrFolder) {
      return NextResponse.json({ error: "Failed to create ZIP folder" }, { status: 500 });
    }

    for (const dish of dishes) {
      if (!dish.qrCode?.[0]?.pngUrl && !dish.qrCode?.[0]?.svgUrl) {
        continue;
      }

      const restaurantName = dish.restaurant?.name?.replace(/[^a-zA-Z0-9]/g, "_") || "restaurant";
      const dishName = dish.name?.replace(/[^a-zA-Z0-9]/g, "_") || dish.slug;
      const filename = `${restaurantName}_${dishName}_qr.${format}`;

      let qrUrl = "";
      if (format === "svg" && dish.qrCode?.[0]?.svgUrl) {
        qrUrl = dish.qrCode[0].svgUrl;
      } else if (dish.qrCode?.[0]?.pngUrl) {
        qrUrl = dish.qrCode[0].pngUrl;
      }

      if (qrUrl) {
        try {
          const response = await fetch(qrUrl);
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            qrFolder.file(filename, arrayBuffer);
          }
        } catch (err) {
          console.error(`Failed to fetch QR for ${dish.name}:`, err);
        }
      }
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="qrcodes_${restaurantId}_${Date.now()}.zip"`,
      },
    });
  } catch (err) {
    console.error("Failed to create bulk ZIP:", err);
    return NextResponse.json({ error: "Failed to create bulk download" }, { status: 500 });
  }
}