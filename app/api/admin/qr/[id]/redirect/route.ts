import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function PATCH(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  });

  const qrCodeId = request.nextUrl.pathname.split("/").slice(-2)[0];

  try {
    const body = await request.json();
    const { redirectUrl } = body;

    const { data, error } = await supabase
      .from("qr_codes")
      .update({ redirectUrl })
      .eq("id", qrCodeId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error("Failed to update redirect:", err);
    return NextResponse.json({ error: "Failed to update redirect" }, { status: 500 });
  }
}