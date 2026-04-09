import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const SYSTEM_PROMPT = `당신은 Factory Guardian — 중소 제조기업의 AI 공장장입니다.

역할:
- 센서 데이터를 분석하여 설비 상태를 한국어로 보고
- 이상 감지 시 원인 추정 + 조치 권고
- 일일/주간 보고서 생성 요청 시 구조화된 마크다운 형식으로 작성
- ISO 10816 (진동), ASHRAE (서버 온도) 등 산업 표준 기반 판단

규칙:
- 항상 한국어로 답변
- 수치는 정확하게, 단위 포함
- 심각한 이상은 ⚠️ 또는 🔴로 강조
- 보고서 요청 시 제목, 날짜, 설비별 상태, 알림 요약, 조치 권고 포함
- 모르는 것은 모른다고 솔직히 답변
- 간결하고 실용적인 답변 (공장 사장님이 바로 이해할 수 있도록)

당신의 이름은 "Core"이고, Factory Guardian Agent 팀의 리더입니다.
팀원: Eye(시각 AI), Ear(청각 AI), Touch(IoT 센서)`;

interface DeviceReading {
  name: string;
  device_type: string;
  location: string;
  sensors: { type: string; value: number; unit: string; is_alert: boolean }[];
}

export async function buildContext(): Promise<string> {
  const now = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });

  // 1. 설비 목록
  const { data: devices } = await supabase
    .from("devices")
    .select("id, name, device_type, location, thresholds, status")
    .eq("status", "active");

  if (!devices || devices.length === 0) {
    return `## 현재 공장 현황 (${now})\n\n등록된 설비가 없습니다.`;
  }

  // 2. 각 설비의 최신 센서 데이터
  const deviceReadings: DeviceReading[] = [];

  for (const device of devices) {
    const { data: readings } = await supabase
      .from("sensor_readings")
      .select("sensor_type, value, unit, is_alert, recorded_at")
      .eq("device_id", device.id)
      .order("recorded_at", { ascending: false })
      .limit(10);

    // 센서 타입별 최신값
    const latest: Record<string, { type: string; value: number; unit: string; is_alert: boolean }> = {};
    for (const r of readings || []) {
      if (!latest[r.sensor_type]) {
        latest[r.sensor_type] = {
          type: r.sensor_type,
          value: r.value,
          unit: r.unit,
          is_alert: r.is_alert,
        };
      }
    }

    deviceReadings.push({
      name: device.name,
      device_type: device.device_type,
      location: device.location,
      sensors: Object.values(latest),
    });
  }

  // 3. 활성 알림
  const { data: alerts } = await supabase
    .from("alerts")
    .select("severity, message, created_at, devices(name)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(10);

  // 3.5 최근 오디오 이상 감지 (Ear Agent)
  const { data: audioAnomalies } = await supabase
    .from("audio_readings")
    .select("device_id, anomaly_type, confidence, recorded_at, devices(name)")
    .eq("is_anomaly", true)
    .order("recorded_at", { ascending: false })
    .limit(5);

  // 4. 컨텍스트 조립
  const deviceLines = deviceReadings.map((d) => {
    const sensorStr = d.sensors.length > 0
      ? d.sensors.map((s) => `${s.type}: ${s.value}${s.unit}${s.is_alert ? " ⚠️" : ""}`).join(", ")
      : "데이터 없음";
    return `- **${d.name}** (${d.device_type}, ${d.location}): ${sensorStr}`;
  }).join("\n");

  const alertLines = (alerts || []).map((a) => {
    const deviceName = (a.devices as unknown as { name: string } | null)?.name || "";
    return `- [${a.severity}] ${a.message} (${deviceName})`;
  }).join("\n") || "없음";

  return `## 현재 공장 현황 (${now})

### 설비 상태 (${devices.length}대)
${deviceLines}

### 활성 알림 (${(alerts || []).length}건)
${alertLines}

### 시각 AI (Eye Agent) 최근 이상 감지
${await (async () => {
    const { data: visionAnomalies } = await supabase
      .from("vision_readings")
      .select("device_id, anomaly_type, confidence, ai_description, recorded_at, devices(name)")
      .eq("is_anomaly", true)
      .order("recorded_at", { ascending: false })
      .limit(5);
    return (visionAnomalies || []).length > 0
      ? (visionAnomalies || []).map((v) => {
          const name = (v.devices as unknown as { name: string } | null)?.name || "";
          return `- ${name}: ${v.anomaly_type} (${Math.round((v.confidence as number) * 100)}%) — ${v.ai_description}`;
        }).join("\n")
      : "시각 이상 없음";
  })()}

### 청각 AI (Ear Agent) 최근 이상음 감지
${(audioAnomalies || []).length > 0 ? (audioAnomalies || []).map((a) => {
    const name = (a.devices as unknown as { name: string } | null)?.name || "";
    return `- ${name}: ${a.anomaly_type} (확신도 ${Math.round((a.confidence as number) * 100)}%) — ${new Date(a.recorded_at as string).toLocaleTimeString("ko-KR")}`;
  }).join("\n") : "이상음 없음"}

### 참고 기준
- 진동: ISO 10816 Zone A(정상) < 2.8mm/s, Zone B < 7.1mm/s, Zone C < 18mm/s
- 서버 온도: ASHRAE A1 권장 18~27°C`;
}
