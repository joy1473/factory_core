"use client";

import { AlertTriangle, CheckCircle, X } from "lucide-react";

interface Alert {
  id: string;
  device_id: string;
  sensor_type: string;
  value: number;
  threshold: number;
  severity: string;
  message: string;
  status: string;
  created_at: string;
  devices: { name: string; device_type: string } | null;
}

interface AlertBannerProps {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}

export function AlertBanner({ alerts, onAcknowledge, onResolve }: AlertBannerProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((a) => {
        const isCritical = a.severity === "critical";
        const borderColor = isCritical ? "var(--danger)" : "var(--accent)";
        const deviceName = (a.devices as unknown as { name: string } | null)?.name || "알 수 없음";

        return (
          <div
            key={a.id}
            className={`flex items-center justify-between rounded-lg border px-4 py-3 ${isCritical ? "animate-pulse" : ""}`}
            style={{ borderColor: borderColor + "40", backgroundColor: borderColor + "08" }}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle size={16} style={{ color: borderColor }} />
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">{a.message}</p>
                <p className="text-[10px] text-gray-500">
                  {deviceName} · {new Date(a.created_at).toLocaleTimeString("ko-KR")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {a.status === "active" && (
                <button
                  onClick={() => onAcknowledge(a.id)}
                  className="flex items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1 text-[10px] text-gray-500 hover:text-[var(--accent)]"
                >
                  <CheckCircle size={10} /> 확인
                </button>
              )}
              {(a.status === "active" || a.status === "acknowledged") && (
                <button
                  onClick={() => onResolve(a.id)}
                  className="flex items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1 text-[10px] text-gray-500 hover:text-[var(--corebot-core)]"
                >
                  <X size={10} /> 해결
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
