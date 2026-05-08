import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
    const { restaurantId } = body;

    if (!restaurantId) {
      return NextResponse.json({ error: "Restaurant ID required" }, { status: 400 });
    }

    const { data: restaurant, error: restaurantError } = await supabase
      .from("restaurants")
      .select("id, name, ownerId")
      .eq("id", restaurantId)
      .single();

    if (restaurantError || !restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    const response = NextResponse.json({ 
      success: true, 
      restaurantId: restaurant.id,
      restaurantName: restaurant.name 
    });

    response.cookies.set("impersonate_restaurant_id", restaurant.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Failed to impersonate:", err);
    return NextResponse.json({ error: "Failed to impersonate" }, { status: 500 });
  }
}