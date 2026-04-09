"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Activity, AlertTriangle, CheckCircle, Server, RefreshCw } from "lucide-react";
import { DeviceCard } from "@/components/monitoring/device-card";
import { AlertBanner } from "@/components/monitoring/alert-banner";

interface Device {
  id: string;
  name: string;
  device_type: string;
  location: string;
  status: string;
  thresholds: Record<string, number>;
}

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

export default function MonitoringPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const fetchData = useCallback(async () => {
    const [devRes, alertRes] = await Promise.all([
      fetch("/api/devices"),
      fetch("/api/alerts?status=active&limit=20"),
    ]);
    const [devData, alertData] = await Promise.all([devRes.json(), alertRes.json()]);
    setDevices(Array.isArray(devData) ? devData : []);
    setAlerts(Array.isArray(alertData) ? alertData : []);
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 자동 새로고침 (5초)
  useEffect(() => {
    if (autoRefresh) {
      timerRef.current = setInterval(fetchData, 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoRefresh, fetchData]);

  async function handleAlertAction(id: string, action: string) {
    await fetch(`/api/alerts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    fetchData();
  }

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;

  const stats = [
    { label: "설비", value: devices.length, icon: Server, color: "var(--primary)" },
    { label: "정상", value: devices.length - criticalCount - warningCount, icon: CheckCircle, color: "var(--corebot-core)" },
    { label: "주의", value: warningCount, icon: AlertTriangle, color: "var(--accent)" },
    { label: "위험", value: criticalCount, icon: AlertTriangle, color: "var(--danger)" },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">실시간 모니터링</h1>
          {autoRefresh && (
            <span className="flex items-center gap-1 text-xs text-[var(--corebot-core)]">
              <Activity size={12} className="animate-pulse" /> 자동 갱신
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`rounded-lg border px-3 py-1.5 text-xs transition ${
              autoRefresh
                ? "border-[var(--corebot-core)]/30 text-[var(--corebot-core)]"
                : "border-[var(--border)] text-[var(--muted)]"
            }`}
          >
            {autoRefresh ? "자동 갱신 ON" : "자동 갱신 OFF"}
          </button>
          <button
            onClick={fetchData}
            className="flex items-center gap-1 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <RefreshCw size={12} /> 새로고침
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: s.color + "15" }}>
              <s.icon size={20} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--foreground)]">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 활성 알림 */}
      {alerts.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-[var(--danger)]">
            활성 알림 ({alerts.length})
          </h2>
          <AlertBanner
            alerts={alerts}
            onAcknowledge={(id) => handleAlertAction(id, "acknowledge")}
            onResolve={(id) => handleAlertAction(id, "resolve")}
          />
        </div>
      )}

      {/* 설비별 카드 */}
      <div className="grid gap-4 lg:grid-cols-2">
        {devices.map((d) => (
          <DeviceCard key={d.id} device={d} refreshKey={refreshKey} />
        ))}
      </div>

      {devices.length === 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center text-gray-500">
          등록된 설비가 없습니다
        </div>
      )}
    </div>
  );
}
