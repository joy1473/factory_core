"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Square, Zap, Activity, Ear, AlertTriangle, Mic } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface AudioReading {
  id: string;
  device_id: string;
  source: string;
  frequency_peaks: { freq_hz: number; amplitude_db: number; label: string }[];
  rms_level: number;
  is_anomaly: boolean;
  anomaly_type: string | null;
  confidence: number;
  recorded_at: string;
  devices: { name: string; device_type: string } | null;
}

export default function EarPage() {
  const [readings, setReadings] = useState<AudioReading[]>([]);
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);
  const [anomalyChance, setAnomalyChance] = useState(0.1);
  const [micActive, setMicActive] = useState(false);
  const [micData, setMicData] = useState<{ freq_hz: number; amplitude_db: number }[]>([]);
  const [micResult, setMicResult] = useState<{ is_anomaly: boolean; anomaly_type: string | null; confidence: number } | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [devices, setDevices] = useState<{ id: string; name: string }[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const micAnalyzeRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const latestMicPeaksRef = useRef<{ freq_hz: number; amplitude_db: number; label: string }[]>([]);

  const fetchReadings = useCallback(async () => {
    const res = await fetch("/api/audio/readings?limit=20");
    const data = await res.json();
    setReadings(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    fetchReadings();
    fetch("/api/devices").then((r) => r.json()).then((d) => {
      const list = Array.isArray(d) ? d : [];
      setDevices(list.map((x: { id: string; name: string }) => ({ id: x.id, name: x.name })));
      if (list.length > 0 && !selectedDevice) setSelectedDevice(list[0].id);
    });
  }, [fetchReadings, selectedDevice]);

  // 시뮬레이터
  async function generate() {
    await fetch("/api/audio/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anomaly_chance: anomalyChance, tick }),
    });
    setTick((t) => t + 1);
    fetchReadings();
  }

  function startSim() {
    if (running) return;
    setRunning(true);
    generate();
    timerRef.current = setInterval(generate, 5000);
  }

  function stopSim() {
    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function injectAnomaly() {
    fetch("/api/audio/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anomaly_chance: 1.0, tick }),
    }).then(() => fetchReadings());
  }

  // 실제 마이크 FFT
  async function startMic() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;
      setMicActive(true);

      function draw() {
        if (!analyserRef.current) return;
        const data = new Float32Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getFloatFrequencyData(data);

        const sampleRate = ctx.sampleRate;
        const binSize = sampleRate / analyserRef.current.fftSize;

        // 주요 주파수 대역만 추출 (50개 빈)
        const step = Math.floor(data.length / 50);
        const peaks: { freq_hz: number; amplitude_db: number; label: string }[] = [];
        for (let i = 0; i < 50; i++) {
          const idx = i * step;
          const freq = Math.round(idx * binSize);
          const amp = Math.round(data[idx] * 10) / 10;
          peaks.push({ freq_hz: freq, amplitude_db: amp, label: `${freq}Hz` });
        }
        setMicData(peaks);
        latestMicPeaksRef.current = peaks;
        rafRef.current = requestAnimationFrame(draw);
      }
      draw();

      // 5초마다 서버로 분석 요청
      micAnalyzeRef.current = setInterval(async () => {
        const peaks = latestMicPeaksRef.current;
        if (peaks.length === 0 || !selectedDevice) return;

        // RMS 계산
        const rms = peaks.reduce((sum, p) => sum + p.amplitude_db, 0) / peaks.length;

        try {
          const res = await fetch("/api/audio/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ device_id: selectedDevice, peaks, rms_level: Math.round(rms * 10) / 10 }),
          });
          const result = await res.json();
          setMicResult(result);
          fetchReadings(); // 이력 갱신
        } catch {}
      }, 5000);
    } catch (err) {
      console.error("Mic error:", err);
    }
  }

  function stopMic() {
    setMicActive(false);
    cancelAnimationFrame(rafRef.current);
    if (micAnalyzeRef.current) clearInterval(micAnalyzeRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    setMicData([]);
    setMicResult(null);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (micAnalyzeRef.current) clearInterval(micAnalyzeRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // 최신 reading의 스펙트럼 데이터
  const latestReading = readings[0];
  const spectrumData = latestReading?.frequency_peaks?.map((p: { freq_hz: number; amplitude_db: number; label: string }) => ({
    ...p,
    amplitude: Math.abs(p.amplitude_db),
  })) || [];

  const anomalyCount = readings.filter((r) => r.is_anomaly).length;

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Ear size={24} className="text-[var(--corebot-ear)]" />
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Ear Agent — 청각 AI</h1>
      </div>

      {/* 통계 */}
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        {[
          { label: "분석 데이터", value: readings.length, color: "var(--primary)" },
          { label: "이상음 감지", value: anomalyCount, color: "var(--danger)" },
          { label: "정상", value: readings.length - anomalyCount, color: "var(--corebot-core)" },
          { label: "마이크", value: micActive ? "ON" : "OFF", color: micActive ? "var(--corebot-ear)" : "var(--muted)" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* 제어 */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button onClick={running ? stopSim : startSim} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${running ? "bg-[var(--danger)] text-black" : "bg-[var(--corebot-ear)] text-black"} hover:brightness-110`}>
          {running ? <><Square size={14} /> 시뮬 정지</> : <><Play size={14} /> 시뮬 시작</>}
        </button>
        <button onClick={injectAnomaly} className="flex items-center gap-2 rounded-lg border border-[var(--danger)]/30 px-4 py-2 text-sm text-[var(--danger)] hover:bg-[var(--danger)]/10">
          <Zap size={14} /> 이상음 주입
        </button>
        <select value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)} className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]">
          {devices.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <button onClick={micActive ? stopMic : startMic} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${micActive ? "bg-[var(--danger)] text-black animate-pulse" : "border border-[var(--border)] text-[var(--muted)] hover:text-[var(--corebot-ear)]"}`}>
          <Mic size={14} /> {micActive ? "마이크 정지" : "실제 마이크"}
        </button>
        <select value={anomalyChance} onChange={(e) => setAnomalyChance(Number(e.target.value))} className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]">
          <option value={0}>이상 0%</option>
          <option value={0.1}>이상 10%</option>
          <option value={0.3}>이상 30%</option>
        </select>
      </div>

      {/* 실제 마이크 FFT 스펙트럼 */}
      {micActive && micData.length > 0 && (
        <div className="mb-6 rounded-xl border border-[var(--corebot-ear)]/30 bg-[var(--surface)] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--corebot-ear)]">
              <Activity size={14} className="animate-pulse" /> 실시간 마이크 스펙트럼 — {devices.find((d) => d.id === selectedDevice)?.name}
            </h2>
            {micResult && (
              micResult.is_anomaly ? (
                <span className="flex items-center gap-1 rounded-full bg-[var(--danger)]/10 px-3 py-1 text-xs font-semibold text-[var(--danger)]">
                  <AlertTriangle size={12} /> {micResult.anomaly_type} ({Math.round(micResult.confidence * 100)}%)
                </span>
              ) : (
                <span className="rounded-full bg-[var(--corebot-core)]/10 px-3 py-1 text-xs font-semibold text-[var(--corebot-core)]">
                  정상 (5초마다 분석 중)
                </span>
              )
            )}
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={micData}>
              <XAxis dataKey="freq_hz" tick={{ fontSize: 8 }} interval={4} />
              <YAxis tick={{ fontSize: 8 }} domain={[-100, 0]} />
              <Bar dataKey="amplitude_db" radius={[2, 2, 0, 0]}>
                {micData.map((d, i) => (
                  <Cell key={i} fill={d.amplitude_db > -20 ? "var(--danger)" : "var(--corebot-ear)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 시뮬레이터 스펙트럼 */}
      {spectrumData.length > 0 && (
        <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              최근 주파수 스펙트럼 — {(latestReading.devices as unknown as { name: string } | null)?.name}
            </h2>
            {latestReading.is_anomaly && (
              <span className="flex items-center gap-1 rounded-full bg-[var(--danger)]/10 px-2.5 py-1 text-[10px] font-semibold text-[var(--danger)]">
                <AlertTriangle size={10} /> {latestReading.anomaly_type} ({Math.round(latestReading.confidence * 100)}%)
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={spectrumData}>
              <XAxis dataKey="freq_hz" tick={{ fontSize: 9 }} unit="Hz" />
              <YAxis tick={{ fontSize: 9 }} unit="dB" />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }}
                formatter={(v) => [`${v}dB`, ""]}
                labelFormatter={(l) => `${l}Hz`}
              />
              <Bar dataKey="amplitude" radius={[4, 4, 0, 0]}>
                {spectrumData.map((d: { label: string }, i: number) => (
                  <Cell key={i} fill={
                    ["베어링 마모", "모터 불균형", "벨트 슬립", "충격 이상음"].includes(d.label)
                      ? "var(--danger)"
                      : "var(--corebot-ear)"
                  } />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 이력 */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="mb-3 text-sm font-semibold text-[var(--foreground)]">분석 이력</h2>
        <div className="max-h-72 space-y-2 overflow-y-auto">
          {readings.map((r) => {
            const deviceName = (r.devices as unknown as { name: string } | null)?.name || "";
            return (
              <div key={r.id} className={`flex items-center justify-between rounded-lg border px-4 py-2 ${r.is_anomaly ? "border-[var(--danger)]/30 bg-[var(--danger)]/5" : "border-[var(--border)]"}`}>
                <div className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full ${r.is_anomaly ? "bg-[var(--danger)] animate-pulse" : "bg-[var(--corebot-core)]"}`} />
                  <span className="text-xs font-semibold text-[var(--foreground)]">{deviceName}</span>
                  <span className="text-[10px] text-gray-500">RMS {r.rms_level}dB</span>
                  {r.is_anomaly && (
                    <span className="rounded bg-[var(--danger)]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--danger)]">
                      {r.anomaly_type} ({Math.round(r.confidence * 100)}%)
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-gray-500">
                  {new Date(r.recorded_at).toLocaleTimeString("ko-KR")}
                </span>
              </div>
            );
          })}
          {readings.length === 0 && <p className="text-xs text-gray-500">데이터 없음 — 시뮬레이터를 시작하세요</p>}
        </div>
      </div>
    </div>
  );
}
