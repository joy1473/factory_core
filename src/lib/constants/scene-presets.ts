export interface EquipmentConfig {
  pos: [number, number, number];
  type: string;
  alert?: boolean;
  label?: string;
}

export interface ChatMessage {
  from: "user" | "ai";
  text: string;
  at: number;
  alert?: boolean;
  actions?: boolean;
}

export interface CameraKeyframe {
  pos: [number, number, number];
  target: [number, number, number];
}

export interface ScenePreset {
  id: string;
  label: string;
  icon: string;
  description: string;
  equipment: EquipmentConfig[];
  stickers: [number, number, number][];
  alertIndex: number;
  waypoints: [number, number, number][];
  kioskPos: [number, number, number];
  cameraKeyframes: CameraKeyframe[];
  chatMessages: ChatMessage[];
  overlayTexts: { title: string; subtitle: string }[];
}

// ─── General Factory ───
const GENERAL: ScenePreset = {
  id: "general",
  label: "기본 공장",
  icon: "🏭",
  description: "CNC, 프레스, 사출기",
  equipment: [
    { pos: [-6, 0, -2], type: "cnc", label: "CNC-1" },
    { pos: [-2, 0, -2], type: "cnc", label: "CNC-2" },
    { pos: [2, 0, -2], type: "press", label: "프레스" },
    { pos: [-5, 0, -5], type: "injection", alert: true, label: "사출기" },
  ],
  stickers: [[-6, 1.6, -1.2], [-2, 1.6, -1.2], [2, 1.8, -1.2], [-5, 1.6, -4.2]],
  alertIndex: 3,
  waypoints: [[-6, 0, 5], [-3, 0, 3], [0, 0, 2], [3, 0, 0], [6, 0, -1], [5, 0, -2.5]],
  kioskPos: [6, 0, -3],
  cameraKeyframes: [
    { pos: [12, 10, 12], target: [0, 0, 0] },
    { pos: [2, 2.5, 3], target: [-2, 1, 0] },
    { pos: [5, 3, 6], target: [0, 1, 0] },
    { pos: [1, 2.5, -2], target: [-5, 1, -3] },
    { pos: [8, 2, 0], target: [6, 1.5, -3] },
  ],
  chatMessages: [
    { from: "user", text: "오늘 생산 현황 알려줘", at: 0.0 },
    { from: "ai", text: "CNC-1, CNC-2, 프레스 정상 가동 중입니다.\n사출기 #4에서 이상 징후가 감지되었습니다.", at: 0.15 },
    { from: "user", text: "사출기 상태 자세히", at: 0.35 },
    { from: "ai", text: "⚠ 사출기 #4 베어링 마모 감지\n진동: 5.2mm/s RMS (ISO 10816 Zone C)\n온도: 78°C (경고 기준 70°C 초과)\n위험도: 82%\n권고: 72시간 내 점검 필요", alert: true, at: 0.5 },
    { from: "user", text: "보고서 만들어줘", at: 0.7 },
    { from: "ai", text: "✅ 일일 설비 점검 보고서 생성 완료 (0.3초)", at: 0.85, actions: true },
  ],
  overlayTexts: [
    { title: "중소 제조기업의 현실", subtitle: "24시간 눈과 귀가 없어 불안한 현장" },
    { title: "$1 스마트 스티커, 붙이면 끝", subtitle: "배터리 없는 Gen3 IoT Pixel" },
    { title: "AI가 24시간 감시합니다", subtitle: "작업자 웨어러블이 데이터를 수집" },
    { title: "베어링 이상 감지! 82%", subtitle: "위험 확률 82% · 3일 내 점검 권고" },
    { title: "대화 한 마디로 공장이 달라집니다", subtitle: "보고서 작성 시간 80% 단축" },
  ],
};

// ─── Electronics ───
const ELECTRONICS: ScenePreset = {
  id: "electronics",
  label: "전자/반도체",
  icon: "⚡",
  description: "SMT라인, 리플로우, AOI",
  equipment: [
    { pos: [-7, 0, -2], type: "smt", label: "SMT라인" },
    { pos: [-2, 0, -2], type: "reflow", label: "리플로우" },
    { pos: [3, 0, -2], type: "aoi", alert: true, label: "AOI검사기" },
    { pos: [-4, 0, -6], type: "cnc", label: "정밀가공기" },
  ],
  stickers: [[-7, 1.4, -1.2], [-2, 1.6, -1.2], [3, 1.8, -1.2], [-4, 1.6, -5.2]],
  alertIndex: 2,
  waypoints: [[-8, 0, 4], [-5, 0, 2], [-1, 0, 1], [3, 0, 0], [6, 0, -1], [5, 0, -2.5]],
  kioskPos: [6, 0, -3],
  cameraKeyframes: [
    { pos: [12, 10, 12], target: [0, 0, 0] },
    { pos: [-4, 2, 3], target: [-5, 1, -2] },
    { pos: [3, 3, 6], target: [0, 1, 0] },
    { pos: [5, 2.5, 0], target: [3, 1, -2] },
    { pos: [8, 2, 0], target: [6, 1.5, -3] },
  ],
  chatMessages: [
    { from: "user", text: "오늘 불량률 현황", at: 0.0 },
    { from: "ai", text: "SMT라인 정상, 리플로우 정상.\nAOI 검사기에서 불량률 급증 감지.", at: 0.15 },
    { from: "user", text: "AOI 상세 상태", at: 0.35 },
    { from: "ai", text: "⚠ AOI 불량률: 1.2% (기준 0.5%)\n주요 불량: 솔더 브릿지 24%, 솔더 부족 28%, 툼스톤 15%\n원인 추정: 리플로우 Zone3 피크온도 +8°C 편차 (248°C→256°C)", alert: true, at: 0.5 },
    { from: "user", text: "품질 보고서 생성", at: 0.7 },
    { from: "ai", text: "✅ 품질 분석 보고서 생성 완료 (0.5초)\n리플로우 온도 프로파일 조정 권고", at: 0.85, actions: true },
  ],
  overlayTexts: [
    { title: "전자부품 생산라인의 현실", subtitle: "미세 불량을 사람 눈으로 잡을 수 있나요?" },
    { title: "$1 센서로 실시간 모니터링", subtitle: "온도, 습도, 진동을 24시간 감시" },
    { title: "AI가 불량 원인을 추적합니다", subtitle: "패턴 분석으로 근본 원인 파악" },
    { title: "AOI 불량률 급증! 1.2%", subtitle: "솔더 브릿지 24% · 리플로우 피크온도 256°C" },
    { title: "품질 보고서, AI가 만듭니다", subtitle: "불량 분석부터 개선 권고까지 자동" },
  ],
};

// ─── Metal/CNC ───
const METAL: ScenePreset = {
  id: "metal",
  label: "금형/CNC",
  icon: "⚙",
  description: "CNC, 와이어컷, 연마기",
  equipment: [
    { pos: [-7, 0, -2], type: "cnc", label: "CNC-1" },
    { pos: [-3, 0, -2], type: "cnc", label: "CNC-2" },
    { pos: [1, 0, -2], type: "cnc", alert: true, label: "CNC-3" },
    { pos: [5, 0, -2], type: "wirecut", label: "와이어컷" },
    { pos: [-5, 0, -6], type: "grinder", label: "연마기" },
  ],
  stickers: [[-7, 1.6, -1.2], [-3, 1.6, -1.2], [1, 1.6, -1.2], [5, 1.6, -1.2], [-5, 1.4, -5.2]],
  alertIndex: 2,
  waypoints: [[-8, 0, 5], [-5, 0, 3], [-1, 0, 2], [3, 0, 0], [7, 0, -1], [6, 0, -4]],
  kioskPos: [7, 0, -5],
  cameraKeyframes: [
    { pos: [14, 10, 14], target: [0, 0, -2] },
    { pos: [0, 2.5, 3], target: [-3, 1, -2] },
    { pos: [4, 3, 6], target: [0, 1, 0] },
    { pos: [3, 2, 0], target: [1, 1, -2] },
    { pos: [9, 2, -2], target: [7, 1.5, -5] },
  ],
  chatMessages: [
    { from: "user", text: "가공 정밀도 현황", at: 0.0 },
    { from: "ai", text: "CNC-1, CNC-2, 와이어컷, 연마기 정상.\nCNC-3에서 진동 이상 감지.", at: 0.15 },
    { from: "user", text: "CNC-3 상세", at: 0.35 },
    { from: "ai", text: "⚠ CNC-3 스핀들 진동: 3.5mm/s (ISO 10816 Zone B 초과)\n주파수 분석: BPFO 152Hz 피크 감지\n베어링 마모 확률: 76%\n가공 정밀도 0.02mm 이탈", alert: true, at: 0.5 },
    { from: "user", text: "정비 보고서 생성", at: 0.7 },
    { from: "ai", text: "✅ 정비 보고서 생성 완료 (0.3초)\n스핀들 베어링 교체 권고", at: 0.85, actions: true },
  ],
  overlayTexts: [
    { title: "금형 가공의 현실", subtitle: "미크론 단위 정밀도, 사람이 매번 확인?" },
    { title: "진동 센서 $1로 정밀도 감시", subtitle: "스핀들 상태를 실시간 모니터링" },
    { title: "AI가 가공 품질을 지킵니다", subtitle: "진동 패턴 분석으로 이상 조기 감지" },
    { title: "스핀들 진동 이상! 3.5mm/s", subtitle: "ISO 10816 Zone B 초과 · 베어링 마모 76%" },
    { title: "정비 일정, AI가 잡아드립니다", subtitle: "예측 정비로 다운타임 최소화" },
  ],
};

// ─── Office/IT ───
const OFFICE: ScenePreset = {
  id: "office",
  label: "사무실/IT",
  icon: "🖥",
  description: "서버, 데스크, 회의실",
  equipment: [
    { pos: [-6, 0, -3], type: "server", alert: true, label: "서버랙-1" },
    { pos: [-3, 0, -3], type: "server", label: "서버랙-2" },
    { pos: [2, 0, -1], type: "desk", label: "업무 공간" },
    { pos: [5, 0, -5], type: "meeting", label: "회의실" },
  ],
  stickers: [[-6, 2, -2.2], [-3, 2, -2.2], [2, 1.2, -0.2], [5, 1.5, -4.2]],
  alertIndex: 0,
  waypoints: [[-8, 0, 4], [-5, 0, 2], [-1, 0, 1], [3, 0, 0], [7, 0, -2], [6, 0, -3.5]],
  kioskPos: [7, 0, -4],
  cameraKeyframes: [
    { pos: [12, 8, 12], target: [0, 0, -2] },
    { pos: [-4, 2.5, 1], target: [-5, 1.5, -3] },
    { pos: [4, 3, 5], target: [0, 1, 0] },
    { pos: [-3, 2.5, 0], target: [-6, 1.5, -3] },
    { pos: [9, 2, -1], target: [7, 1.5, -4] },
  ],
  chatMessages: [
    { from: "user", text: "서버 상태 확인", at: 0.0 },
    { from: "ai", text: "서버랙-2 정상, 업무 공간 정상.\n서버랙-1 온도 급상승 감지.", at: 0.15 },
    { from: "user", text: "서버랙-1 상세", at: 0.35 },
    { from: "ai", text: "⚠ 서버랙-1 흡기 온도: 32°C (ASHRAE A1 상한 27°C 초과)\n배기 온도: 48°C\nCPU 사용률: 94%\n냉각 팬 #3 RPM: 1,200 (정상 4,500)", alert: true, at: 0.5 },
    { from: "user", text: "장애 보고서 생성", at: 0.7 },
    { from: "ai", text: "✅ 장애 보고서 생성 완료 (0.3초)\n냉각 팬 점검 + 부하 분산 권고", at: 0.85, actions: true },
  ],
  overlayTexts: [
    { title: "IT 인프라의 현실", subtitle: "서버 다운은 곧 비즈니스 중단" },
    { title: "센서로 서버실 24시간 감시", subtitle: "온도, 습도, 전력 실시간 모니터링" },
    { title: "AI가 장애를 예측합니다", subtitle: "패턴 분석으로 장애 전 조치" },
    { title: "서버 흡기 온도 32°C!", subtitle: "ASHRAE A1 초과 · 냉각 팬 #3 RPM 73% 저하" },
    { title: "장애 보고서, 즉시 생성", subtitle: "원인 분석부터 조치 권고까지" },
  ],
};

export const SCENE_PRESETS: Record<string, ScenePreset> = {
  general: GENERAL,
  electronics: ELECTRONICS,
  metal: METAL,
  office: OFFICE,
};

export const PRESET_LIST = [GENERAL, ELECTRONICS, METAL, OFFICE];
