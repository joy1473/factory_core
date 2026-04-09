// Wiliot Gen3 IoT Pixel 시뮬레이터
// 설비 타입별 센서 프로파일 + 데이터 생성

export interface SensorProfile {
  base: number;
  range: number;
  unit: string;
  max: number;
}

export interface DeviceProfile {
  [sensorType: string]: SensorProfile;
}

export const DEVICE_PROFILES: Record<string, DeviceProfile> = {
  cnc: {
    temperature: { base: 45, range: 10, unit: "°C", max: 70 },
    vibration: { base: 2.0, range: 1.0, unit: "mm/s", max: 4.5 },
    humidity: { base: 55, range: 10, unit: "%", max: 80 },
  },
  press: {
    temperature: { base: 50, range: 15, unit: "°C", max: 75 },
    vibration: { base: 3.0, range: 1.5, unit: "mm/s", max: 5.0 },
  },
  injection: {
    temperature: { base: 180, range: 20, unit: "°C", max: 220 },
    vibration: { base: 2.5, range: 1.0, unit: "mm/s", max: 4.5 },
  },
  server: {
    temperature: { base: 24, range: 3, unit: "°C", max: 32 },
    humidity: { base: 45, range: 5, unit: "%", max: 60 },
  },
};

export interface GeneratedReading {
  sensor_type: string;
  value: number;
  unit: string;
}

/**
 * 단일 센서 값 생성
 * - 정상: base ± range + sin 드리프트
 * - 이상 (anomalyChance 확률): max 근처 스파이크
 * - 점진 악화 (degradation): 시간 경과에 따라 base 증가
 */
export function generateReading(
  profile: SensorProfile,
  options?: { anomalyChance?: number; degradation?: number; tick?: number }
): number {
  const { anomalyChance = 0.05, degradation = 0, tick = 0 } = options || {};

  // 기본 드리프트 (sin 패턴)
  const drift = Math.sin(tick * 0.1) * profile.range * 0.3;

  // 점진 악화
  const degrade = degradation * tick * 0.01;

  // 랜덤 노이즈
  const noise = (Math.random() - 0.5) * profile.range;

  // 이상치 주입
  if (Math.random() < anomalyChance) {
    // max의 90~110% 범위 스파이크
    return Math.round((profile.max * (0.9 + Math.random() * 0.2)) * 100) / 100;
  }

  const value = profile.base + drift + degrade + noise;
  return Math.round(Math.max(0, value) * 100) / 100;
}

/**
 * 설비 전체 센서 데이터 한 번에 생성
 */
export function generateDeviceReadings(
  deviceType: string,
  options?: { anomalyChance?: number; degradation?: number; tick?: number }
): GeneratedReading[] {
  const profile = DEVICE_PROFILES[deviceType];
  if (!profile) return [];

  return Object.entries(profile).map(([sensorType, sp]) => ({
    sensor_type: sensorType,
    value: generateReading(sp, options),
    unit: sp.unit,
  }));
}
