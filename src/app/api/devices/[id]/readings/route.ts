import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sp = request.nextUrl.searchParams;
  const sensorType = sp.get("sensor_type");
  const limit = Number(sp.get("limit") || "100");

  let query = supabase
    .from("sensor_readings")
    .select("id, sensor_type, value, unit, is_alert, recorded_at")
    .eq("device_id", id)
    .order("recorded_at", { ascending: false })
    .limit(limit);

  if (sensorType) {
    query = query.eq("sensor_type", sensorType);
  }

  const { data } = await query;
  return NextResponse.json(data || []);
}
