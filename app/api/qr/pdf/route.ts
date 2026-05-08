import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { generatePDFCard, generateBulkPDF, BulkPDFCard } from "@/lib/pdf-generator";

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
    const { dishId, restaurantId, size = "10cm" } = body;

    if (dishId) {
      const { data: dish, error } = await supabase
        .from("dishes")
        .select(`
          name,
          description,
          restaurant: restaurants(name, logoUrl)
        `)
        .eq("id", dishId)
        .single();

      if (error) throw error;
      if (!dish) {
        return NextResponse.json({ error: "Dish not found" }, { status: 404 });
      }

      const { data: qrCode } = await supabase
        .from("qr_codes")
        .select("pngUrl")
        .eq("dishId", dishId)
        .single();

      if (!qrCode?.pngUrl) {
        return NextResponse.json({ error: "QR code not found" }, { status: 404 });
      }

      const result = await generatePDFCard({
        restaurantName: dish.restaurant.name,
        restaurantLogoUrl: dish.restaurant.logoUrl || undefined,
        dishName: dish.name,
        dishDescription: dish.description || undefined,
        qrCodeUrl: qrCode.pngUrl,
        size: size as "a4" | "10cm",
        primaryColor: "#00FFD1",
      });

      return new NextResponse(result.buffer, {
        headers: {
          "Content-Type": result.contentType,
          "Content-Disposition": `attachment; filename="${result.filename}"`,
        },
      });
    }

    if (restaurantId) {
      const { data: dishes, error: dishesError } = await supabase
        .from("dishes")
        .select(`
          name,
          description,
          restaurant: restaurants(name, logoUrl),
          qrCode: qr_codes(pngUrl)
        `)
        .eq("restaurantId", restaurantId)
        .eq("isArchived", false);

      if (dishesError) throw dishesError;

      const bulkCards: BulkPDFCard[] = dishes
        .filter((d) => d.qrCode?.[0]?.pngUrl)
        .map((d) => ({
          restaurantName: d.restaurant.name,
          dishName: d.name,
          dishDescription: d.description || undefined,
          qrCodeUrl: d.qrCode[0].pngUrl!,
        }));

      if (bulkCards.length === 0) {
        return NextResponse.json({ error: "No QR codes found" }, { status: 404 });
      }

      const result = await generateBulkPDF(bulkCards, {
        primaryColor: "#00FFD1",
        tagline: "Scan to see in 3D!",
      });

      return new NextResponse(result.buffer, {
        headers: {
          "Content-Type": result.contentType,
          "Content-Disposition": `attachment; filename="${result.filename}"`,
        },
      });
    }

    return NextResponse.json({ error: "dishId or restaurantId required" }, { status: 400 });
  } catch (err) {
    console.error("Failed to generate PDF:", err);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}