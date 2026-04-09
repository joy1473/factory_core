import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { sendAlertEmail } from "@/lib/alert-email";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * 실제 카메라 이미지를 Claude Vision으로 분석
 * Body: { device_id, image_base64, source: "webcam"|"mobile_rear"|"glasses" }
 */
export async function POST(request: NextRequest) {
  const { device_id, image_base64, source = "webcam" } = await request.json();

  if (!device_id || !image_base64) {
    return NextResponse.json({ error: "device_id and image_base64 required" }, { status: 400 });
  }

  const { data: device } = await supabase
    .from("devices")
    .select("id, name, device_type")
    .eq("id", device_id)
    .single();

  if (!device) {
    return NextResponse.json({ error: "Device not found" }, { status: 404 });
  }

  // Claude Vision 분석
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: "image/jpeg", data: image_base64 },
          },
          {
            type: "text",
            text: `당신은 스마트팩토리 설비 점검 AI (Eye Agent)입니다.
이 이미지는 "${device.name}" (${device.device_type}) 설비를 촬영한 것입니다.

다음을 분석해주세요:
1. 설비 외관 이상 여부 (균열, 누유, 변색, 마모, 부식)
2. 안전 문제 (안전장비 미착용, 위험 상황)
3. 게이지/미터 판독값 (보이는 경우)

JSON으로 응답:
{
  "is_anomaly": true/false,
  "anomaly_type": "crack"|"leak"|"discolor"|"wear"|"safety"|null,
  "confidence": 0.0~1.0,
  "description": "한국어 분석 결과 1~2문장"
}`,
          },
        ],
      },
    ],
  });

  // 응답 파싱
  const text = response.content[0].type === "text" ? response.content[0].text : "";
  let analysis = { is_anomaly: false, anomaly_type: null as string | null, confidence: 0, description: "분석 결과 없음" };

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) analysis = JSON.parse(jsonMatch[0]);
  } catch {
    analysis.description = text.substring(0, 200);
  }

  // DB 저장
  await supabase.from("vision_readings").insert({
    device_id,
    source,
    analysis: { detections: analysis.is_anomaly ? [{ type: analysis.anomaly_type, confidence: analysis.confidence, description: analysis.description }] : [] },
    is_anomaly: analysis.is_anomaly,
    anomaly_type: analysis.anomaly_type,
    confidence: analysis.confidence,
    ai_description: analysis.description,
  });

  // 이상 시 알림
  if (analysis.is_anomaly && analysis.confidence > 0.7) {
    await supabase.from("alerts").insert({
      device_id,
      sensor_type: "vision",
      value: Math.round(analysis.confidence * 100),
      threshold: 70,
      severity: analysis.confidence > 0.85 ? "critical" : "warning",
      message: `${device.name} Eye Agent: ${analysis.description}`,
    });

    if (analysis.confidence > 0.85) {
      sendAlertEmail({
        deviceName: device.name,
        sensorType: "vision",
        value: Math.round(analysis.confidence * 100),
        threshold: 70,
        unit: "%",
        severity: "critical",
        message: analysis.description,
      }).catch(() => {});
    }
  }

  return NextResponse.json(analysis);
}
