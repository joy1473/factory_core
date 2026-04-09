// Eye Agent — 설비 외관 이상 시뮬레이터

export interface VisionDetection {
  type: string;
  confidence: number;
  description: string;
}

export interface VisionReading {
  detections: VisionDetection[];
  is_anomaly: boolean;
  anomaly_type: string | null;
  confidence: number;
  ai_description: string;
}

const NORMAL_DESCRIPTIONS = [
  "설비 외관 정상. 균열, 누유, 변색 없음.",
  "게이지 판독값 정상 범위. 설비 표면 깨끗.",
  "배관 연결부 양호. 볼트 체결 상태 정상.",
  "냉각수 레벨 적정. 오일 누유 흔적 없음.",
  "안전 커버 정상 장착. 경고 라벨 부착 상태 양호.",
];

const ANOMALY_PATTERNS = [
  { type: "crack", description: "설비 하우징에 미세 균열(약 3cm) 발견. 좌측 베어링 커버 부근. 진행성 파단 가능성 — 즉시 점검 권고.", confidence: 0.88 },
  { type: "leak", description: "유압 라인 연결부에서 오일 누유 감지. 바닥에 직경 약 10cm 오일 흔적. 실링 교체 필요.", confidence: 0.92 },
  { type: "discolor", description: "모터 하우징 표면 변색(갈색→흑색) 감지. 과열 흔적 추정. 내부 온도 점검 필요.", confidence: 0.78 },
  { type: "wear", description: "벨트 표면 마모 감지. 홈 깊이 50% 이상 감소. 2주 내 교체 권고.", confidence: 0.85 },
  { type: "safety", description: "작업자 안전모 미착용 감지. 안전 규정 위반. 즉시 시정 필요.", confidence: 0.95 },
];

export function generateVisionReading(options?: { anomalyChance?: number }): VisionReading {
  const { anomalyChance = 0.05 } = options || {};

  if (Math.random() < anomalyChance) {
    const anomaly = ANOMALY_PATTERNS[Math.floor(Math.random() * ANOMALY_PATTERNS.length)];
    const conf = anomaly.confidence + (Math.random() - 0.5) * 0.1;
    return {
      detections: [{ type: anomaly.type, confidence: Math.round(conf * 100) / 100, description: anomaly.description }],
      is_anomaly: true,
      anomaly_type: anomaly.type,
      confidence: Math.round(conf * 100) / 100,
      ai_description: anomaly.description,
    };
  }

  return {
    detections: [],
    is_anomaly: false,
    anomaly_type: null,
    confidence: 0,
    ai_description: NORMAL_DESCRIPTIONS[Math.floor(Math.random() * NORMAL_DESCRIPTIONS.length)],
  };
}
