import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { generateVisionReading } from "@/lib/vision-simulator";
import { sendAlertEmail } from "@/lib/alert-email";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { anomaly_chance = 0.05 } = body;

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
    const reading = generateVisionReading({ anomalyChance: anomaly_chance });

    await supabase.from("vision_readings").insert({
      device_id: device.id,
      source: "simulator",
      analysis: { detections: reading.detections },
      is_anomaly: reading.is_anomaly,
      anomaly_type: reading.anomaly_type,
      confidence: reading.confidence,
      ai_description: reading.ai_description,
    });
    inserted++;

    if (reading.is_anomaly) {
      anomalies++;
      const anomalyLabel = reading.anomaly_type === "crack" ? "균열" :
        reading.anomaly_type === "leak" ? "누유" :
        reading.anomaly_type === "discolor" ? "변색" :
        reading.anomaly_type === "wear" ? "마모" :
        reading.anomaly_type === "safety" ? "안전위반" : "이상";

      await supabase.from("alerts").insert({
        device_id: device.id,
        sensor_type: "vision",
        value: Math.round(reading.confidence * 100),
        threshold: 70,
        severity: reading.confidence > 0.85 ? "critical" : "warning",
        message: `${device.name} ${anomalyLabel} 감지 — Eye Agent (확신도 ${Math.round(reading.confidence * 100)}%)`,
      });

      if (reading.confidence > 0.85) {
        sendAlertEmail({
          deviceName: device.name,
          sensorType: "vision",
          value: Math.round(reading.confidence * 100),
          threshold: 70,
          unit: "%",
          severity: "critical",
          message: reading.ai_description,
        }).catch(() => {});
      }
    }
  }

  return NextResponse.json({ devices: devices.length, inserted, anomalies });
}
