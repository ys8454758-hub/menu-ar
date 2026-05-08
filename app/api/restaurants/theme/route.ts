import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  });

  const restaurantId = request.nextUrl.searchParams.get("restaurantId");

  if (!restaurantId) {
    return NextResponse.json({ error: "Restaurant ID required" }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from("qr_brand_themes")
      .select("*")
      .eq("restaurantId", restaurantId)
      .order("themeName");

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error("Failed to fetch themes:", err);
    return NextResponse.json({ error: "Failed to fetch themes" }, { status: 500 });
  }
}

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
    const {
      restaurantId,
      themeName,
      logoUrl,
      logoShape = "CIRCLE",
      logoSizePercent = 20,
      logoBorderColor,
      logoBorderWidth = 2,
      dotStyle = "ROUNDED",
      cornerSquareStyle = "EXTRA_ROUNDED",
      cornerDotStyle = "DOT",
      foregroundColor = "#00FFD1",
      backgroundColor = "#0A0A0F",
      frameStyle = "NONE",
      frameText,
      frameTextFont = "Orbitron",
      frameTextColor = "#00FFD1",
      frameBackgroundColor = "#0A0A0F",
      errorCorrectionLevel = "H",
    } = body;

    const { data, error } = await supabase
      .from("qr_brand_themes")
      .insert({
        restaurantId,
        themeName,
        logoUrl,
        logoShape,
        logoSizePercent,
        logoBorderColor,
        logoBorderWidth,
        dotStyle,
        cornerSquareStyle,
        cornerDotStyle,
        foregroundColor,
        backgroundColor,
        frameStyle,
        frameText,
        frameTextFont,
        frameTextColor,
        frameBackgroundColor,
        errorCorrectionLevel,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error("Failed to create theme:", err);
    return NextResponse.json({ error: "Failed to create theme" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  });

  const themeId = request.nextUrl.searchParams.get("id");

  if (!themeId) {
    return NextResponse.json({ error: "Theme ID required" }, { status: 400 });
  }

  try {
    const { error } = await supabase.from("qr_brand_themes").delete().eq("id", themeId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete theme:", err);
    return NextResponse.json({ error: "Failed to delete theme" }, { status: 500 });
  }
}