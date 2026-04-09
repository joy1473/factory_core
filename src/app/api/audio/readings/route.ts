import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const deviceId = sp.get("device_id");
  const limit = Number(sp.get("limit") || "30");

  let query = supabase
    .from("audio_readings")
    .select("*, devices(name, device_type)")
    .order("recorded_at", { ascending: false })
    .limit(limit);

  if (deviceId) query = query.eq("device_id", deviceId);

  const { data } = await query;
  return NextResponse.json(data || []);
}
