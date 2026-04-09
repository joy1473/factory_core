"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Square, Zap, RefreshCw, Activity } from "lucide-react";

interface Device {
  id: string;
  name: string;
  device_type: string;
  location: string;
  status: string;
}

interface GenerateResult {
  devices: number;
  inserted: number;
  alerts: number;
  timestamp: string;
}

export default function SimulatorPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [running, setRunning] = useState(false);
  const [interval, setIntervalMs] = useState(5000);
  const [anomalyChance, setAnomalyChance] = useState(0.05);
  const [degradation, setDegradation] = useState(0);
  const [tick, setTick] = useState(0);
  const [lastResult, setLastResult] = useState<GenerateResult | null>(null);
  const [totalGenerated, setTotalGenerated] = useState(0);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    fetch("/api/devices")
      .then((r) => r.json())
      .then((d) => setDevices(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  async function generate() {
    try {
      const res = await fetch("/api/simulator/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anomaly_chance: anomalyChance,
          degradation,
          tick,
        }),
      });
      const result: GenerateResult = await res.json();
      setLastResult(result);
      setTotalGenerated((p) => p + result.inserted);
      setTotalAlerts((p) => p + result.alerts);
      setTick((p) => p + 1);

      const time = new Date().toLocaleTimeString("ko-KR");
      const alertMsg = result.alerts > 0 ? ` ⚠ ${result.alerts}건 알림` : "";
      setLog((prev) => [`[${time}] ${result.inserted}건 생성${alertMsg}`, ...prev.slice(0, 49)]);
    } catch {
      setLog((prev) => [`[${new Date().toLocaleTimeString("ko-KR")}] 생성 실패`, ...prev.slice(0, 49)]);
    }
  }

  function start() {
    if (running) return;
    setRunning(true);
    generate();
    timerRef.current = setInterval(generate, interval);
  }

  function stop() {
    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function injectAnomaly() {
    fetch("/api/simulator/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anomaly_chance: 1.0, tick }),
    })
      .then((r) => r.json())
      .then((result: GenerateResult) => {
        setTotalGenerated((p) => p + result.inserted);
        setTotalAlerts((p) => p + result.alerts);
        setLog((prev) => [
          `[${new Date().toLocaleTimeString("ko-KR")}] ⚡ 이상 시나리오 주입 — ${result.alerts}건 알림`,
          ...prev.slice(0, 49),
        ]);
      });
  }

  function reset() {
    stop();
    setTick(0);
    setTotalGenerated(0);
    setTotalAlerts(0);
    setLastResult(null);
    setLog([]);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-[var(--foreground)]">센서 시뮬레이터</h1>

      {/* 제어 패널 */}
      <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button
            onClick={start}
            disabled={running}
            className="flex items-center gap-2 rounded-lg bg-[var(--corebot-core)] px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
          >
            <Play size={16} /> 시작
          </button>
          <button
            onClick={stop}
            disabled={!running}
            className="flex items-center gap-2 rounded-lg bg-[var(--danger)] px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
          >
            <Square size={16} /> 정지
          </button>
          <button
            onClick={injectAnomaly}
            className="flex items-center gap-2 rounded-lg border border-[var(--danger)]/30 px-4 py-2 text-sm font-semibold text-[var(--danger)] transition hover:bg-[var(--danger)]/10"
          >
            <Zap size={16} /> 이상 주입
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            <RefreshCw size={16} /> 초기화
          </button>

          {running && (
            <span className="flex items-center gap-1 text-xs text-[var(--corebot-core)]">
              <Activity size={12} className="animate-pulse" /> 실행 중
            </span>
          )}
        </div>

        {/* 설정 */}
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="mb-1 block text-[10px] text-gray-500">생성 간격</label>
            <select
              value={interval}
              onChange={(e) => setIntervalMs(Number(e.target.value))}
              disabled={running}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--foreground)]"
            >
              <option value={2000}>2초</option>
              <option value={5000}>5초</option>
              <option value={10000}>10초</option>
              <option value={30000}>30초</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] text-gray-500">이상 확률</label>
            <select
              value={anomalyChance}
              onChange={(e) => setAnomalyChance(Number(e.target.value))}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--foreground)]"
            >
              <option value={0}>0% (정상만)</option>
              <option value={0.05}>5% (기본)</option>
              <option value={0.15}>15% (잦은 이상)</option>
              <option value={0.3}>30% (스트레스)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] text-gray-500">점진 악화</label>
            <select
              value={degradation}
              onChange={(e) => setDegradation(Number(e.target.value))}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--foreground)]"
            >
              <option value={0}>없음</option>
              <option value={0.5}>느림</option>
              <option value={1}>보통</option>
              <option value={2}>빠름</option>
            </select>
          </div>
        </div>
      </div>

      {/* 통계 */}
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        {[
          { label: "설비", value: devices.length, color: "var(--primary)" },
          { label: "생성 데이터", value: totalGenerated, color: "var(--corebot-core)" },
          { label: "알림 발생", value: totalAlerts, color: "var(--danger)" },
          { label: "Tick", value: tick, color: "var(--muted)" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* 설비 목록 */}
      <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="mb-3 text-sm font-semibold text-[var(--foreground)]">등록 설비</h2>
        <div className="space-y-2">
          {devices.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-2">
              <div className="flex items-center gap-3">
                <span className={`h-2 w-2 rounded-full ${d.status === "active" ? "bg-[var(--corebot-core)]" : "bg-gray-500"}`} />
                <span className="text-sm font-semibold text-[var(--foreground)]">{d.name}</span>
                <span className="text-[10px] text-gray-500">{d.device_type} · {d.location}</span>
              </div>
              <span className="text-[10px] text-gray-500">{d.id.substring(0, 8)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 로그 */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="mb-3 text-sm font-semibold text-[var(--foreground)]">로그</h2>
        <div className="max-h-60 overflow-y-auto rounded-lg bg-[var(--background)] p-3 font-mono text-xs">
          {log.length === 0 ? (
            <p className="text-gray-500">시뮬레이터를 시작하세요</p>
          ) : (
            log.map((l, i) => (
              <p key={i} className={l.includes("⚠") || l.includes("⚡") ? "text-[var(--danger)]" : "text-gray-500"}>
                {l}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
