import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const status = sp.get("status");
  const deviceId = sp.get("device_id");
  const limit = Number(sp.get("limit") || "50");

  let query = supabase
    .from("alerts")
    .select("*, devices(name, device_type)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status) query = query.eq("status", status);
  if (deviceId) query = query.eq("device_id", deviceId);

  const { data } = await query;
  return NextResponse.json(data || []);
}
