"use client";

import { useEffect, useState } from "react";
import { X, Thermometer, Ear, Eye, Clock, Trash2 } from "lucide-react";
import { GaugeBar } from "./gauge-bar";

interface DeviceDetailProps {
  deviceId: string;
  editMode?: boolean;
  onClose: () => void;
  onRemove?: () => void;
}

interface Reading { sensor_type: string; value: number; unit: string; is_alert: boolean; recorded_at: string; }
interface AudioReading { is_anomaly: boolean; anomaly_type: string | null; confidence: number; rms_level: number; recorded_at: string; }
interface VisionReading { is_anomaly: boolean; anomaly_type: string | null; confidence: number; ai_description: string; recorded_at: string; }
interface DeviceInfo { id: string; name: string; device_type: string; location: string; thresholds: Record<string, number>; metadata: Record<string, string>; position_3d: { x: number; y: number; z: number } | null; }

export function DeviceDetailPanel({ deviceId, editMode, onClose, onRemove }: DeviceDetailProps) {
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [audio, setAudio] = useState<AudioReading[]>([]);
  const [vision, setVision] = useState<VisionReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [devRes, readRes, audioRes, visionRes] = await Promise.all([
        fetch("/api/devices"),
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
    load();
  }, [deviceId]);

  if (loading) return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
    </div>
  );

  if (!device) return null;

  const latestByType: Record<string, Reading> = {};
  for (const r of readings) {
    if (!latestByType[r.sensor_type]) latestByType[r.sensor_type] = r;
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <div>
          <p className="text-sm font-bold text-[var(--foreground)]">{device.name}</p>
          <p className="text-[10px] text-gray-500">{device.device_type} · {device.location}</p>
        </div>
        <button onClick={onClose} className="rounded-lg p-1 text-gray-500 hover:text-[var(--foreground)]">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-4">

        {/* 편집 모드 — 삭제 */}
        {editMode && device.position_3d && (
          <button
            onClick={onRemove}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--danger)]/30 py-2 text-xs text-[var(--danger)] hover:bg-[var(--danger)]/10"
          >
            <Trash2 size={12} /> 3D에서 마커 제거
          </button>
        )}

        {/* 위치 */}
        {device.position_3d && (
          <div className="rounded-lg border border-[var(--border)] px-3 py-2">
            <p className="text-[9px] text-gray-500">3D 위치</p>
            <p className="text-[10px] text-[var(--foreground)]">
              x: {device.position_3d.x} · y: {device.position_3d.y} · z: {device.position_3d.z}
            </p>
          </div>
        )}

        {/* Touch */}
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-[var(--corebot-touch)]">
            <Thermometer size={10} /> Touch
          </p>
          {Object.entries(latestByType).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(latestByType).map(([type, r]) => {
                const max = device.thresholds[`${type}_max`] || 100;
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

        {/* Ear */}
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-[var(--corebot-ear)]">
            <Ear size={10} /> Ear
          </p>
          {audio[0] ? (
            <div className={`rounded-lg border px-3 py-2 text-[10px] ${audio[0].is_anomaly ? "border-[var(--danger)]/30 bg-[var(--danger)]/5" : "border-[var(--border)]"}`}>
              <span className={audio[0].is_anomaly ? "font-semibold text-[var(--danger)]" : "text-[var(--foreground)]"}>
                {audio[0].is_anomaly ? `${audio[0].anomaly_type} (${Math.round(audio[0].confidence * 100)}%)` : "정상"}
              </span>
            </div>
          ) : (
            <p className="text-[10px] text-gray-500">데이터 없음</p>
          )}
        </div>

        {/* Eye */}
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-[var(--corebot-eye)]">
            <Eye size={10} /> Eye
          </p>
          {vision[0] ? (
            <div className={`rounded-lg border px-3 py-2 text-[10px] ${vision[0].is_anomaly ? "border-[var(--danger)]/30 bg-[var(--danger)]/5" : "border-[var(--border)]"}`}>
              <p className={vision[0].is_anomaly ? "font-semibold text-[var(--danger)]" : "text-[var(--foreground)]"}>
                {vision[0].is_anomaly ? `${vision[0].anomaly_type} (${Math.round(vision[0].confidence * 100)}%)` : "정상"}
              </p>
              {vision[0].ai_description && <p className="mt-1 text-[9px] text-gray-500">{vision[0].ai_description}</p>}
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
