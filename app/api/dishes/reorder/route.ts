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
    const { restaurantId, dishIds } = body;

    if (!restaurantId || !dishIds || !Array.isArray(dishIds)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const updates = dishIds.map((dishId, index) => ({
      id: dishId,
      displayOrder: index,
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from("dishes")
        .update({ displayOrder: update.displayOrder })
        .eq("id", update.id)
        .eq("restaurantId", restaurantId);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to reorder dishes:", err);
    return NextResponse.json({ error: "Failed to reorder dishes" }, { status: 500 });
  }
}