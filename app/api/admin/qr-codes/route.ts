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
      .from("qr_codes")
      .select(`
        *,
        dish: dishes(name, restaurant: restaurants(name, slug)),
        scanEvents(count)
      `)
      .order("createdAt", { ascending: false });

    if (error) throw error;

    const codesWithCounts = data.map((code) => ({
      ...code,
      scanCount: code.scanEvents?.[0]?.count || 0,
    }));

    return NextResponse.json(codesWithCounts);
  } catch (err) {
    console.error("Failed to fetch QR codes:", err);
    return NextResponse.json({ error: "Failed to fetch QR codes" }, { status: 500 });
  }
}