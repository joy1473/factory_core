"use client";

import { useEffect, useState } from "react";
import { X, Thermometer, Activity, Ear, Eye, Clock } from "lucide-react";
import { GaugeBar } from "./gauge-bar";

interface DeviceDetailProps {
  deviceId: string;
  onClose: () => void;
}

interface Reading { sensor_type: string; value: number; unit: string; is_alert: boolean; recorded_at: string; }
interface AudioReading { is_anomaly: boolean; anomaly_type: string | null; confidence: number; rms_level: number; recorded_at: string; }
interface VisionReading { is_anomaly: boolean; anomaly_type: string | null; confidence: number; ai_description: string; recorded_at: string; }
interface DeviceInfo { id: string; name: string; device_type: string; location: string; thresholds: Record<string, number>; metadata: Record<string, string>; }

export function DeviceDetailPanel({ deviceId, onClose }: DeviceDetailProps) {
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [audio, setAudio] = useState<AudioReading[]>([]);
  const [vision, setVision] = useState<VisionReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch_data() {
      const [devRes, readRes, audioRes, visionRes] = await Promise.all([
        fetch(`/api/devices`),
        fetch(`/api/devices/${deviceId}/readings?limit=20`),
        fetch(`/api/audio/readings?device_id=${deviceId}&limit=5`),
        fetch(`/api/vision/readings?device_id=${deviceId}&limit=5`),
      ]);

      const devs = await devRes.json();
      setDevice(Array.isArray(devs) ? devs.find((d: DeviceInfo) => d.id === deviceId) || null : null);
      setReadings(await readRes.json().then((d: Reading[]) => Array.isArray(d) ? d : []));
      setAudio(await audioRes.json().then((d: AudioReading[]) => Array.isArray(d) ? d : []));
      setVision(await visionRes.json().then((d: VisionReading[]) => Array.isArray(d) ? d : []));
      setLoading(false);
    }
    fetch_data();
  }, [deviceId]);

  if (loading) return (
    <div className="flex h-full items-center justify-center bg-[var(--surface)] p-6">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
    </div>
  );

  if (!device) return null;

  // 센서별 최신값
  const latestByType: Record<string, Reading> = {};
  for (const r of readings) {
    if (!latestByType[r.sensor_type]) latestByType[r.sensor_type] = r;
  }

  const latestAudio = audio[0];
  const latestVision = vision[0];

  return (
    <div className="h-full bg-[var(--surface)] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <div>
          <p className="text-sm font-bold text-[var(--foreground)]">{device.name}</p>
          <p className="text-[10px] text-gray-500">{device.device_type} · {device.location}</p>
        </div>
        <button onClick={onClose} className="rounded-lg p-1 text-gray-500 hover:bg-[var(--border)] hover:text-[var(--foreground)]">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Touch — 센서 데이터 */}
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-[var(--corebot-touch)]">
            <Thermometer size={10} /> Touch — IoT 센서
          </p>
          {Object.entries(latestByType).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(latestByType).map(([type, r]) => {
                const maxKey = `${type}_max`;
                const max = device.thresholds[maxKey] || 100;
                const label = type === "temperature" ? "온도" : type === "vibration" ? "진동" : type === "humidity" ? "습도" : type;
                return <GaugeBar key={type} label={label} value={r.value} max={max} unit={r.unit} />;
              })}
              <p className="text-[9px] text-gray-600">
                <Clock size={8} className="mr-1 inline" />
                {new Date(Object.values(latestByType)[0]?.recorded_at).toLocaleString("ko-KR")}
              </p>
            </div>
          ) : (
            <p className="text-[10px] text-gray-500">데이터 없음</p>
          )}
        </div>

        {/* Ear — 오디오 */}
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-[var(--corebot-ear)]">
            <Ear size={10} /> Ear — 청각 AI
          </p>
          {latestAudio ? (
            <div className={`rounded-lg border px-3 py-2 text-[10px] ${latestAudio.is_anomaly ? "border-[var(--danger)]/30 bg-[var(--danger)]/5" : "border-[var(--border)]"}`}>
              <div className="flex items-center justify-between">
                <span className={latestAudio.is_anomaly ? "font-semibold text-[var(--danger)]" : "text-[var(--foreground)]"}>
                  {latestAudio.is_anomaly ? `${latestAudio.anomaly_type} (${Math.round(latestAudio.confidence * 100)}%)` : "정상"}
                </span>
                <span className="text-gray-500">RMS {latestAudio.rms_level}dB</span>
              </div>
              <p className="mt-1 text-[9px] text-gray-600">
                <Clock size={8} className="mr-1 inline" />
                {new Date(latestAudio.recorded_at).toLocaleString("ko-KR")}
              </p>
            </div>
          ) : (
            <p className="text-[10px] text-gray-500">데이터 없음</p>
          )}
        </div>

        {/* Eye — 비전 */}
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-[var(--corebot-eye)]">
            <Eye size={10} /> Eye — 시각 AI
          </p>
          {latestVision ? (
            <div className={`rounded-lg border px-3 py-2 text-[10px] ${latestVision.is_anomaly ? "border-[var(--danger)]/30 bg-[var(--danger)]/5" : "border-[var(--border)]"}`}>
              <p className={latestVision.is_anomaly ? "font-semibold text-[var(--danger)]" : "text-[var(--foreground)]"}>
                {latestVision.is_anomaly ? `${latestVision.anomaly_type} (${Math.round(latestVision.confidence * 100)}%)` : "정상"}
              </p>
              {latestVision.ai_description && (
                <p className="mt-1 text-[9px] text-gray-500">{latestVision.ai_description}</p>
              )}
              <p className="mt-1 text-[9px] text-gray-600">
                <Clock size={8} className="mr-1 inline" />
                {new Date(latestVision.recorded_at).toLocaleString("ko-KR")}
              </p>
            </div>
          ) : (
            <p className="text-[10px] text-gray-500">데이터 없음</p>
          )}
        </div>

        {/* 설비 정보 */}
        {device.metadata && Object.keys(device.metadata).length > 0 && (
          <div>
            <p className="mb-2 text-[10px] font-semibold text-[var(--muted)]">설비 정보</p>
            <div className="space-y-1">
              {Object.entries(device.metadata).map(([k, v]) => (
                <div key={k} className="flex justify-between text-[10px]">
                  <span className="text-gray-500">{k}</span>
                  <span className="text-[var(--foreground)]">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
