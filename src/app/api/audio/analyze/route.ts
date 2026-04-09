import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { analyzeFFT } from "@/lib/audio-simulator";
import { sendAlertEmail } from "@/lib/alert-email";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  const { device_id, peaks, rms_level } = await request.json();

  if (!device_id || !peaks) {
    return NextResponse.json({ error: "device_id and peaks required" }, { status: 400 });
  }

  // 설비 정보
  const { data: device } = await supabase
    .from("devices")
    .select("id, name")
    .eq("id", device_id)
    .single();

  if (!device) {
    return NextResponse.json({ error: "Device not found" }, { status: 404 });
  }

  // 이상 분석
  const result = analyzeFFT(peaks);

  // DB 저장
  await supabase.from("audio_readings").insert({
    device_id,
    source: "microphone",
    frequency_peaks: peaks,
    rms_level: rms_level || 0,
    is_anomaly: result.isAnomaly,
    anomaly_type: result.anomalyType,
    confidence: result.confidence,
  });

  // 이상 감지 시 알림
  if (result.isAnomaly) {
    const anomalyLabel = result.anomalyType === "bearing" ? "베어링 마모음" :
      result.anomalyType === "motor" ? "모터 불균형음" :
      result.anomalyType === "belt" ? "벨트 슬립음" :
      result.anomalyType === "impact" ? "충격 이상음" : "이상음";

    await supabase.from("alerts").insert({
      device_id,
      sensor_type: "audio",
      value: Math.round(result.confidence * 100),
      threshold: 70,
      severity: result.confidence > 0.85 ? "critical" : "warning",
      message: `${device.name} ${anomalyLabel} 감지 — 마이크 실시간 분석 (확신도 ${Math.round(result.confidence * 100)}%)`,
    });

    if (result.confidence > 0.85) {
      sendAlertEmail({
        deviceName: device.name,
        sensorType: "audio",
        value: Math.round(result.confidence * 100),
        threshold: 70,
        unit: "%",
        severity: "critical",
        message: `${device.name}에서 마이크로 ${anomalyLabel} 실시간 감지. 확신도 ${Math.round(result.confidence * 100)}%.`,
      }).catch(() => {});
    }
  }

  return NextResponse.json({
    is_anomaly: result.isAnomaly,
    anomaly_type: result.anomalyType,
    confidence: result.confidence,
  });
}
