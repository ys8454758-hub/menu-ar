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
      .from("support_tickets")
      .select(`
        *,
        restaurant: restaurants(name)
      `)
      .order("createdAt", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error("Failed to fetch tickets:", err);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}