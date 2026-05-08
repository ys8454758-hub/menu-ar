import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";


export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  });

  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select(`
        *,
        restaurant: restaurants(name, slug)
      `)
      .order("createdAt", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error("Failed to fetch subscriptions:", err);
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
  }
}