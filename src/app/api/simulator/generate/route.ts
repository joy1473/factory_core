import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { generateDeviceReadings, DEVICE_PROFILES } from "@/lib/simulator";
import { checkThreshold } from "@/lib/threshold";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { device_id, anomaly_chance = 0.05, degradation = 0, tick = 0 } = body;

  // 설비 조회
  let query = supabase.from("devices").select("id, name, device_type, thresholds").eq("status", "active");
  if (device_id) query = query.eq("id", device_id);
  const { data: devices } = await query;

  if (!devices || devices.length === 0) {
    return NextResponse.json({ error: "No active devices found" }, { status: 404 });
  }

  let totalInserted = 0;
  let totalAlerts = 0;
  const now = new Date().toISOString();

  for (const device of devices) {
    if (!DEVICE_PROFILES[device.device_type]) continue;

    const readings = generateDeviceReadings(device.device_type, {
      anomalyChance: anomaly_chance,
      degradation,
      tick,
    });

    const thresholds = (device.thresholds || {}) as Record<string, number>;

    for (const reading of readings) {
      const maxKey = `${reading.sensor_type}_max`;
      const max = thresholds[maxKey];

      const isAlert = max ? reading.value >= max * 0.85 : false;

      // sensor_readings INSERT
      await supabase.from("sensor_readings").insert({
        device_id: device.id,
        sensor_type: reading.sensor_type,
        value: reading.value,
        unit: reading.unit,
        is_alert: isAlert,
        recorded_at: now,
      });
      totalInserted++;

      // 임계치 체크 → 알림 생성
      if (max) {
        const result = checkThreshold(reading.value, max, reading.sensor_type, device.name, reading.unit);
        if (result.isAlert) {
          await supabase.from("alerts").insert({
            device_id: device.id,
            sensor_type: reading.sensor_type,
            value: reading.value,
            threshold: max,
            severity: result.severity,
            message: result.message,
          });
          totalAlerts++;
        }
      }
    }
  }

  return NextResponse.json({
    devices: devices.length,
    inserted: totalInserted,
    alerts: totalAlerts,
    timestamp: now,
  });
}
