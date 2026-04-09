"use client";

import { useEffect, useState } from "react";
import { GaugeBar } from "./gauge-bar";
import { SensorChart } from "./sensor-chart";
import { ChevronDown } from "lucide-react";

interface Device {
  id: string;
  name: string;
  device_type: string;
  location: string;
  status: string;
  thresholds: Record<string, number>;
}

interface Reading {
  sensor_type: string;
  value: number;
  unit: string;
  is_alert: boolean;
  recorded_at: string;
}

interface DeviceCardProps {
  device: Device;
  refreshKey: number;
}

const SENSOR_LABELS: Record<string, string> = {
  temperature: "온도",
  vibration: "진동",
  humidity: "습도",
};

const SENSOR_COLORS: Record<string, string> = {
  temperature: "var(--corebot-ear)",
  vibration: "var(--corebot-eye)",
  humidity: "var(--corebot-core)",
};

export function DeviceCard({ device, refreshKey }: DeviceCardProps) {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch(`/api/devices/${device.id}/readings?limit=60`)
      .then((r) => r.json())
      .then((d) => setReadings(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [device.id, refreshKey]);

  // 센서 타입별 최신값 + 이력
  const sensorTypes = [...new Set(readings.map((r) => r.sensor_type))];
  const latestByType: Record<string, Reading> = {};
  const historyByType: Record<string, Reading[]> = {};

  for (const type of sensorTypes) {
    const typeReadings = readings.filter((r) => r.sensor_type === type);
    latestByType[type] = typeReadings[0];
    historyByType[type] = typeReadings;
  }

  // 전체 상태 판단
  const hasAlert = Object.values(latestByType).some((r) => r?.is_alert);
  const hasCritical = sensorTypes.some((type) => {
    const latest = latestByType[type];
    const maxKey = `${type}_max`;
    const max = device.thresholds[maxKey];
    return latest && max && latest.value >= max;
  });

  const statusColor = hasCritical ? "var(--danger)" : hasAlert ? "var(--accent)" : "var(--corebot-core)";
  const statusLabel = hasCritical ? "위험" : hasAlert ? "주의" : "정상";

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: statusColor }} />
          <div>
            <p className="text-sm font-bold text-[var(--foreground)]">{device.name}</p>
            <p className="text-[10px] text-gray-500">{device.device_type} · {device.location}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
            style={{ backgroundColor: statusColor + "15", color: statusColor }}
          >
            {statusLabel}
          </span>
          <ChevronDown size={16} className={`text-gray-500 transition ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {/* Gauge Bars (항상 표시) */}
      <div className="border-t border-[var(--border)] px-5 py-3 space-y-2">
        {sensorTypes.map((type) => {
          const latest = latestByType[type];
          const maxKey = `${type}_max`;
          const max = device.thresholds[maxKey] || 100;
          return (
            <GaugeBar
              key={type}
              label={SENSOR_LABELS[type] || type}
              value={latest?.value || 0}
              max={max}
              unit={latest?.unit || ""}
            />
          );
        })}
        {sensorTypes.length === 0 && (
          <p className="text-xs text-gray-500">데이터 없음 — 시뮬레이터를 시작하세요</p>
        )}
      </div>

      {/* Charts (펼쳤을 때) */}
      {expanded && sensorTypes.length > 0 && (
        <div className="border-t border-[var(--border)] px-5 py-4 space-y-4">
          {sensorTypes.map((type) => {
            const maxKey = `${type}_max`;
            const max = device.thresholds[maxKey];
            const latest = latestByType[type];
            return (
              <div key={type}>
                <p className="mb-1 text-[10px] font-semibold text-gray-500">
                  {SENSOR_LABELS[type] || type} ({latest?.unit})
                </p>
                <SensorChart
                  data={historyByType[type]}
                  max={max}
                  unit={latest?.unit || ""}
                  color={SENSOR_COLORS[type] || "var(--primary)"}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
