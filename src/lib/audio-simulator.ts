// Ear Agent — 설비 소리 시뮬레이터
// 정상 소리 패턴 + 이상음 패턴 생성

export interface FrequencyPeak {
  freq_hz: number;
  amplitude_db: number;
  label: string;
}

export interface AudioReading {
  frequency_peaks: FrequencyPeak[];
  rms_level: number;
  is_anomaly: boolean;
  anomaly_type: string | null;
  confidence: number;
}

// 설비별 정상 주파수 프로파일
const NORMAL_PROFILES: Record<string, { peaks: FrequencyPeak[]; rms: number }> = {
  cnc: {
    peaks: [
      { freq_hz: 60, amplitude_db: -25, label: "전원 험" },
      { freq_hz: 500, amplitude_db: -35, label: "스핀들 회전" },
      { freq_hz: 1200, amplitude_db: -45, label: "절삭음" },
      { freq_hz: 3000, amplitude_db: -55, label: "냉각팬" },
    ],
    rms: -30,
  },
  press: {
    peaks: [
      { freq_hz: 30, amplitude_db: -20, label: "프레스 충격" },
      { freq_hz: 120, amplitude_db: -30, label: "유압 펌프" },
      { freq_hz: 800, amplitude_db: -40, label: "금속 충격" },
      { freq_hz: 2500, amplitude_db: -50, label: "밸브음" },
    ],
    rms: -25,
  },
  injection: {
    peaks: [
      { freq_hz: 50, amplitude_db: -22, label: "모터" },
      { freq_hz: 200, amplitude_db: -32, label: "스크류 회전" },
      { freq_hz: 700, amplitude_db: -42, label: "수지 흐름" },
      { freq_hz: 1500, amplitude_db: -52, label: "냉각" },
    ],
    rms: -28,
  },
  server: {
    peaks: [
      { freq_hz: 120, amplitude_db: -35, label: "팬 1" },
      { freq_hz: 240, amplitude_db: -40, label: "팬 2" },
      { freq_hz: 1000, amplitude_db: -55, label: "HDD" },
    ],
    rms: -40,
  },
};

// 이상음 패턴
const ANOMALY_PATTERNS: { type: string; label: string; freq_hz: number; amplitude_db: number; description: string }[] = [
  { type: "bearing", label: "베어링 마모", freq_hz: 152, amplitude_db: -15, description: "BPFO 152Hz 피크 — 외륜 결함 주파수" },
  { type: "motor", label: "모터 불균형", freq_hz: 25, amplitude_db: -12, description: "1X RPM 과대 진폭 — 로터 불균형" },
  { type: "belt", label: "벨트 슬립", freq_hz: 85, amplitude_db: -18, description: "벨트 주파수 고조파 — 장력 부족" },
  { type: "impact", label: "충격 이상음", freq_hz: 4500, amplitude_db: -10, description: "고주파 임펄스 — 기어 또는 부품 접촉 이상" },
];

/**
 * 설비 오디오 데이터 생성
 */
export function generateAudioReading(
  deviceType: string,
  options?: { anomalyChance?: number; tick?: number }
): AudioReading {
  const { anomalyChance = 0.05, tick = 0 } = options || {};
  const profile = NORMAL_PROFILES[deviceType] || NORMAL_PROFILES.cnc;

  // 정상 주파수 피크 + 랜덤 변동
  const peaks: FrequencyPeak[] = profile.peaks.map((p) => ({
    ...p,
    freq_hz: p.freq_hz + (Math.random() - 0.5) * 10,
    amplitude_db: p.amplitude_db + (Math.random() - 0.5) * 6 + Math.sin(tick * 0.05) * 2,
  }));

  let rms = profile.rms + (Math.random() - 0.5) * 4;
  let isAnomaly = false;
  let anomalyType: string | null = null;
  let confidence = 0;

  // 이상음 주입
  if (Math.random() < anomalyChance) {
    const anomaly = ANOMALY_PATTERNS[Math.floor(Math.random() * ANOMALY_PATTERNS.length)];
    peaks.push({
      freq_hz: anomaly.freq_hz + (Math.random() - 0.5) * 5,
      amplitude_db: anomaly.amplitude_db + (Math.random() - 0.5) * 3,
      label: anomaly.label,
    });
    isAnomaly = true;
    anomalyType = anomaly.type;
    confidence = 0.7 + Math.random() * 0.25; // 70~95%
    rms += 8; // 이상 시 전체 음량 증가
  }

  return {
    frequency_peaks: peaks.map((p) => ({
      ...p,
      freq_hz: Math.round(p.freq_hz * 10) / 10,
      amplitude_db: Math.round(p.amplitude_db * 10) / 10,
    })),
    rms_level: Math.round(rms * 10) / 10,
    is_anomaly: isAnomaly,
    anomaly_type: anomalyType,
    confidence: Math.round(confidence * 100) / 100,
  };
}

/**
 * 실제 FFT 데이터에서 이상 감지 (마이크 입력용)
 * 간단한 룰 기반: 특정 주파수 대역 에너지 급증 감지
 */
export function analyzeFFT(peaks: FrequencyPeak[]): { isAnomaly: boolean; anomalyType: string | null; confidence: number } {
  // 고에너지 피크 탐색 (-20dB 이상)
  const highPeaks = peaks.filter((p) => p.amplitude_db > -20);

  if (highPeaks.length === 0) {
    return { isAnomaly: false, anomalyType: null, confidence: 0 };
  }

  // 베어링 결함 주파수 대역 (100~200Hz)
  const bearingPeak = highPeaks.find((p) => p.freq_hz >= 100 && p.freq_hz <= 200);
  if (bearingPeak) {
    return { isAnomaly: true, anomalyType: "bearing", confidence: 0.8 };
  }

  // 고주파 임펄스 (>3000Hz)
  const impactPeak = highPeaks.find((p) => p.freq_hz > 3000);
  if (impactPeak) {
    return { isAnomaly: true, anomalyType: "impact", confidence: 0.7 };
  }

  // 저주파 불균형 (<50Hz)
  const motorPeak = highPeaks.find((p) => p.freq_hz < 50 && p.amplitude_db > -15);
  if (motorPeak) {
    return { isAnomaly: true, anomalyType: "motor", confidence: 0.75 };
  }

  return { isAnomaly: false, anomalyType: null, confidence: 0 };
}
