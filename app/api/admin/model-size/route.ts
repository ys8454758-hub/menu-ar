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

  const modelId = request.nextUrl.searchParams.get("modelId");

  if (!modelId) {
    return NextResponse.json({ error: "Model ID required" }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from("model_size_audit_logs")
      .select("*")
      .eq("modelId", modelId)
      .order("changedAt", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error("Failed to fetch audit logs:", err);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}