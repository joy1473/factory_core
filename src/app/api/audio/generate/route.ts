import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { generateAudioReading } from "@/lib/audio-simulator";
import { sendAlertEmail } from "@/lib/alert-email";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { anomaly_chance = 0.05, tick = 0 } = body;

  const { data: devices } = await supabase
    .from("devices")
    .select("id, name, device_type")
    .eq("status", "active");

  if (!devices || devices.length === 0) {
    return NextResponse.json({ error: "No active devices" }, { status: 404 });
  }

  let inserted = 0;
  let anomalies = 0;

  for (const device of devices) {
    const reading = generateAudioReading(device.device_type, { anomalyChance: anomaly_chance, tick });

    await supabase.from("audio_readings").insert({
      device_id: device.id,
      source: "simulator",
      frequency_peaks: reading.frequency_peaks,
      rms_level: reading.rms_level,
      is_anomaly: reading.is_anomaly,
      anomaly_type: reading.anomaly_type,
      confidence: reading.confidence,
    });
    inserted++;

    if (reading.is_anomaly) {
      anomalies++;

      // 알림 생성
      const anomalyLabel = reading.anomaly_type === "bearing" ? "베어링 마모음" :
        reading.anomaly_type === "motor" ? "모터 불균형음" :
        reading.anomaly_type === "belt" ? "벨트 슬립음" :
        reading.anomaly_type === "impact" ? "충격 이상음" : "이상음";

      await supabase.from("alerts").insert({
        device_id: device.id,
        sensor_type: "audio",
        value: reading.confidence * 100,
        threshold: 70,
        severity: reading.confidence > 0.85 ? "critical" : "warning",
        message: `${device.name} ${anomalyLabel} 감지 (확신도 ${Math.round(reading.confidence * 100)}%)`,
      });

      // Critical이면 이메일
      if (reading.confidence > 0.85) {
        sendAlertEmail({
          deviceName: device.name,
          sensorType: "audio",
          value: Math.round(reading.confidence * 100),
          threshold: 70,
          unit: "%",
          severity: "critical",
          message: `${device.name}에서 ${anomalyLabel} 감지. 확신도 ${Math.round(reading.confidence * 100)}%. 즉시 점검 권고.`,
        }).catch(() => {});
      }
    }
  }

  return NextResponse.json({ devices: devices.length, inserted, anomalies });
}
