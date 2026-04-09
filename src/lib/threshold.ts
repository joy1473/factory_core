export type Severity = "normal" | "warning" | "critical";

export interface ThresholdResult {
  severity: Severity;
  isAlert: boolean;
  message: string;
}

const SENSOR_LABELS: Record<string, string> = {
  temperature: "온도",
  vibration: "진동",
  humidity: "습도",
};

const UNIT_LABELS: Record<string, string> = {
  "°C": "°C",
  "mm/s": "mm/s",
  "%": "%",
};

/**
 * 임계치 대비 심각도 판정
 * - 85% 이상: warning
 * - 100% 이상: critical
 */
export function checkThreshold(
  value: number,
  max: number,
  sensorType: string,
  deviceName: string,
  unit: string
): ThresholdResult {
  const ratio = value / max;
  const sensorLabel = SENSOR_LABELS[sensorType] || sensorType;
  const unitLabel = UNIT_LABELS[unit] || unit;

  if (ratio >= 1.0) {
    return {
      severity: "critical",
      isAlert: true,
      message: `${deviceName} ${sensorLabel} ${value}${unitLabel} — 기준 ${max}${unitLabel} 초과! 즉시 점검 필요`,
    };
  }

  if (ratio >= 0.85) {
    return {
      severity: "warning",
      isAlert: true,
      message: `${deviceName} ${sensorLabel} ${value}${unitLabel} — 기준 ${max}${unitLabel}의 ${Math.round(ratio * 100)}% (주의)`,
    };
  }

  return {
    severity: "normal",
    isAlert: false,
    message: "",
  };
}
