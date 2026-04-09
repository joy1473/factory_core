"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity, AlertTriangle, CheckCircle, Server, RefreshCw,
  Play, Square, Zap, Settings, Ear, Eye, Hand, Bot,
  Send, Loader2, Mic, MicOff, ChevronDown, ChevronUp,
} from "lucide-react";
import { DeviceCard } from "@/components/monitoring/device-card";
import { AlertBanner } from "@/components/monitoring/alert-banner";
import { ChatMessage } from "@/components/chat/chat-message";
import { QuickPrompts } from "@/components/chat/quick-prompts";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ─── Feature Flags ───
interface FeatureFlags {
  touch: boolean;
  ear: boolean;
  eye: boolean;
  core: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = { touch: true, ear: true, eye: false, core: true };

const FEATURE_META = [
  { key: "touch" as const, label: "Touch (IoT 센서)", icon: Hand, plan: "Basic", color: "var(--corebot-touch)" },
  { key: "ear" as const, label: "Ear (청각 AI)", icon: Ear, plan: "Standard", color: "var(--corebot-ear)" },
  { key: "eye" as const, label: "Eye (시각 AI)", icon: Eye, plan: "Premium", color: "var(--corebot-eye)" },
  { key: "core" as const, label: "Core (AI 공장장)", icon: Bot, plan: "Basic", color: "var(--corebot-core)" },
];

// ─── Types ───
interface Device {
  id: string; name: string; device_type: string; location: string; status: string;
  thresholds: Record<string, number>;
}
interface Alert {
  id: string; device_id: string; sensor_type: string; value: number; threshold: number;
  severity: string; message: string; status: string; created_at: string;
  devices: { name: string; device_type: string } | null;
}
interface AudioReading {
  id: string; device_id: string; frequency_peaks: { freq_hz: number; amplitude_db: number; label: string }[];
  rms_level: number; is_anomaly: boolean; anomaly_type: string | null; confidence: number;
  recorded_at: string; devices: { name: string } | null;
}
interface ChatMsg { role: "user" | "assistant"; content: string; }

export default function MonitoringPage() {
  // Feature flags
  const [flags, setFlags] = useState<FeatureFlags>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("fc-features");
      if (saved) return JSON.parse(saved);
    }
    return DEFAULT_FLAGS;
  });
  const [showSettings, setShowSettings] = useState(false);

  // Monitoring data
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Simulator
  const [simRunning, setSimRunning] = useState(false);
  const [simTick, setSimTick] = useState(0);
  const [showSim, setShowSim] = useState(false);
  const simTimerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // Ear
  const [audioReadings, setAudioReadings] = useState<AudioReading[]>([]);
  const [micActive, setMicActive] = useState(false);
  const [micData, setMicData] = useState<{ freq_hz: number; amplitude_db: number }[]>([]);
  const [micResult, setMicResult] = useState<{ is_anomaly: boolean; anomaly_type: string | null; confidence: number } | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const micAnalyzeRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const latestMicPeaksRef = useRef<{ freq_hz: number; amplitude_db: number; label: string }[]>([]);

  // Chat
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatStreaming, setChatStreaming] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // ─── Data Fetching ───
  const fetchData = useCallback(async () => {
    const [devRes, alertRes] = await Promise.all([
      fetch("/api/devices"),
      fetch("/api/alerts?status=active&limit=20"),
    ]);
    const [devData, alertData] = await Promise.all([devRes.json(), alertRes.json()]);
    setDevices(Array.isArray(devData) ? devData : []);
    setAlerts(Array.isArray(alertData) ? alertData : []);
    setRefreshKey((k) => k + 1);

    if (flags.ear) {
      const audioRes = await fetch("/api/audio/readings?limit=10");
      const audioData = await audioRes.json();
      setAudioReadings(Array.isArray(audioData) ? audioData : []);
    }
  }, [flags.ear]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(fetchData, 5000);
    return () => clearInterval(timer);
  }, [autoRefresh, fetchData]);

  // ─── Feature Flags ───
  function toggleFlag(key: keyof FeatureFlags) {
    setFlags((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem("fc-features", JSON.stringify(updated));
      return updated;
    });
  }

  // ─── Simulator ───
  async function simGenerate() {
    await Promise.all([
      fetch("/api/simulator/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ anomaly_chance: 0.05, tick: simTick }) }),
      flags.ear ? fetch("/api/audio/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ anomaly_chance: 0.1, tick: simTick }) }) : Promise.resolve(),
    ]);
    setSimTick((t) => t + 1);
    fetchData();
  }
  function simStart() { setSimRunning(true); simGenerate(); simTimerRef.current = setInterval(simGenerate, 5000); }
  function simStop() { setSimRunning(false); if (simTimerRef.current) clearInterval(simTimerRef.current); }
  function simInject() {
    Promise.all([
      fetch("/api/simulator/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ anomaly_chance: 1.0, tick: simTick }) }),
      flags.ear ? fetch("/api/audio/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ anomaly_chance: 1.0, tick: simTick }) }) : Promise.resolve(),
    ]).then(() => fetchData());
  }

  // ─── Ear Mic ───
  async function startMic() {
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
      const binSize = ctx.sampleRate / analyserRef.current.fftSize;
      const step = Math.floor(data.length / 40);
      const peaks: { freq_hz: number; amplitude_db: number; label: string }[] = [];
      for (let i = 0; i < 40; i++) {
        const idx = i * step;
        peaks.push({ freq_hz: Math.round(idx * binSize), amplitude_db: Math.round(data[idx] * 10) / 10, label: "" });
      }
      setMicData(peaks);
      latestMicPeaksRef.current = peaks;
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();

    const deviceId = devices[0]?.id;
    if (deviceId) {
      micAnalyzeRef.current = setInterval(async () => {
        const p = latestMicPeaksRef.current;
        if (p.length === 0) return;
        const rms = p.reduce((s, x) => s + x.amplitude_db, 0) / p.length;
        const res = await fetch("/api/audio/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ device_id: deviceId, peaks: p, rms_level: Math.round(rms * 10) / 10 }) });
        setMicResult(await res.json());
        fetchData();
      }, 5000);
    }
  }
  function stopMic() {
    setMicActive(false);
    cancelAnimationFrame(rafRef.current);
    if (micAnalyzeRef.current) clearInterval(micAnalyzeRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close();
    streamRef.current = null; audioCtxRef.current = null; analyserRef.current = null;
    setMicData([]); setMicResult(null);
  }

  // ─── Chat ───
  function scrollChat() { setTimeout(() => chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: "smooth" }), 50); }

  async function sendChat(text: string) {
    if (!text.trim() || chatLoading) return;
    setChatMsgs((p) => [...p, { role: "user", content: text.trim() }]);
    setChatInput(""); setChatLoading(true); setChatStreaming(true);
    setChatMsgs((p) => [...p, { role: "assistant", content: "" }]);
    scrollChat();

    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text.trim(), conversation_id: convId }) });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const ev = JSON.parse(line.slice(6));
            if (ev.type === "text") { full += ev.content; setChatMsgs((p) => { const u = [...p]; u[u.length - 1] = { role: "assistant", content: full }; return u; }); scrollChat(); }
            if (ev.type === "done") setConvId(ev.conversation_id);
          } catch {}
        }
      }
    } catch { setChatMsgs((p) => { const u = [...p]; u[u.length - 1] = { role: "assistant", content: "오류가 발생했습니다." }; return u; }); }
    finally { setChatLoading(false); setChatStreaming(false); }
  }

  // Voice input
  const [voiceRec, setVoiceRec] = useState(false);
  const [voiceProc, setVoiceProc] = useState(false);
  const voiceCtxRef = useRef<AudioContext | null>(null);
  const voiceProcRef = useRef<ScriptProcessorNode | null>(null);
  const voiceStreamRef = useRef<MediaStream | null>(null);
  const voiceChunksRef = useRef<Int16Array[]>([]);

  async function startVoice() {
    voiceChunksRef.current = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true } });
    voiceStreamRef.current = stream;
    const ctx = new AudioContext({ sampleRate: 16000 });
    voiceCtxRef.current = ctx;
    const src = ctx.createMediaStreamSource(stream);
    const proc = ctx.createScriptProcessor(4096, 1, 1);
    voiceProcRef.current = proc;
    proc.onaudioprocess = (e) => { const f = e.inputBuffer.getChannelData(0); const i = new Int16Array(f.length); for (let x = 0; x < f.length; x++) i[x] = Math.max(-32768, Math.min(32767, Math.round(f[x] * 32767))); voiceChunksRef.current.push(i); };
    src.connect(proc); proc.connect(ctx.destination);
    setVoiceRec(true);
  }
  async function stopVoice() {
    setVoiceRec(false);
    voiceProcRef.current?.disconnect(); voiceCtxRef.current?.close(); voiceStreamRef.current?.getTracks().forEach((t) => t.stop());
    const chunks = voiceChunksRef.current;
    if (chunks.length === 0) return;
    const total = chunks.reduce((s, c) => s + c.length, 0);
    const merged = new Int16Array(total); let off = 0;
    for (const c of chunks) { merged.set(c, off); off += c.length; }
    voiceChunksRef.current = [];
    setVoiceProc(true);
    try {
      const res = await fetch("/api/stt/proxy", { method: "POST", headers: { "Content-Type": "application/octet-stream" }, body: merged.buffer });
      const { text } = await res.json();
      if (text?.trim()) sendChat(text.trim());
    } catch {} finally { setVoiceProc(false); }
  }

  // ─── Alert Actions ───
  async function handleAlertAction(id: string, action: string) {
    await fetch(`/api/alerts/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    fetchData();
  }

  // Stats
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;

  // Cleanup
  useEffect(() => { return () => { if (simTimerRef.current) clearInterval(simTimerRef.current); cancelAnimationFrame(rafRef.current); if (micAnalyzeRef.current) clearInterval(micAnalyzeRef.current); }; }, []);

  return (
    <div className="flex h-[calc(100vh-48px)] gap-0 overflow-hidden">
      {/* ═══ Left: Dashboard ═══ */}
      <div className="flex-1 overflow-y-auto p-5">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[var(--foreground)]">Factory Guardian</h1>
            {autoRefresh && <span className="flex items-center gap-1 text-[10px] text-[var(--corebot-core)]"><Activity size={10} className="animate-pulse" /> LIVE</span>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSim(!showSim)} className={`rounded-lg border px-3 py-1.5 text-xs transition ${simRunning ? "border-[var(--corebot-core)]/50 text-[var(--corebot-core)]" : "border-[var(--border)] text-[var(--muted)]"}`}>
              {simRunning ? <><Activity size={10} className="animate-pulse" /> 시뮬 ON</> : "시뮬레이터"}
            </button>
            <button onClick={() => setShowSettings(!showSettings)} className="rounded-lg border border-[var(--border)] p-1.5 text-[var(--muted)] hover:text-[var(--foreground)]">
              <Settings size={14} />
            </button>
            <button onClick={() => setAutoRefresh(!autoRefresh)} className={`rounded-lg border px-2 py-1.5 text-[10px] ${autoRefresh ? "border-[var(--corebot-core)]/30 text-[var(--corebot-core)]" : "border-[var(--border)] text-[var(--muted)]"}`}>
              {autoRefresh ? "LIVE" : "OFF"}
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="mb-3 text-xs font-semibold text-[var(--foreground)]">기능 활성화 / 비활성화</p>
            <div className="flex flex-wrap gap-3">
              {FEATURE_META.map((f) => {
                const Icon = f.icon;
                const active = flags[f.key];
                return (
                  <button key={f.key} onClick={() => toggleFlag(f.key)} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${active ? "border-opacity-50 bg-opacity-10" : "border-[var(--border)] text-gray-500 opacity-50"}`} style={active ? { borderColor: f.color, backgroundColor: f.color + "10", color: f.color } : undefined}>
                    <Icon size={14} /> {f.label}
                    <span className="rounded bg-[var(--border)] px-1.5 py-0.5 text-[8px]">{f.plan}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Simulator Panel */}
        {showSim && (
          <div className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={simRunning ? simStop : simStart} className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold ${simRunning ? "bg-[var(--danger)] text-black" : "bg-[var(--corebot-core)] text-black"}`}>
                {simRunning ? <><Square size={12} /> 정지</> : <><Play size={12} /> 시작</>}
              </button>
              <button onClick={simInject} className="flex items-center gap-1 rounded-lg border border-[var(--danger)]/30 px-3 py-1.5 text-xs text-[var(--danger)]">
                <Zap size={12} /> 이상 주입
              </button>
              <span className="text-[10px] text-gray-500">Tick: {simTick} | Touch{flags.touch ? "✅" : "❌"} Ear{flags.ear ? "✅" : "❌"}</span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mb-4 grid gap-2 sm:grid-cols-4">
          {[
            { label: "설비", value: devices.length, icon: Server, color: "var(--primary)" },
            { label: "정상", value: Math.max(0, devices.length - criticalCount - warningCount), icon: CheckCircle, color: "var(--corebot-core)" },
            { label: "주의", value: warningCount, icon: AlertTriangle, color: "var(--accent)" },
            { label: "위험", value: criticalCount, icon: AlertTriangle, color: "var(--danger)" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
              <s.icon size={16} style={{ color: s.color }} />
              <div>
                <p className="text-lg font-bold text-[var(--foreground)]">{s.value}</p>
                <p className="text-[10px] text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-4">
            <AlertBanner alerts={alerts} onAcknowledge={(id) => handleAlertAction(id, "acknowledge")} onResolve={(id) => handleAlertAction(id, "resolve")} />
          </div>
        )}

        {/* Touch Section */}
        {flags.touch && (
          <div className="mb-4">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-[var(--corebot-touch)]">
              <Hand size={12} /> Touch — IoT 센서
            </p>
            <div className="grid gap-3 lg:grid-cols-2">
              {devices.map((d) => <DeviceCard key={d.id} device={d} refreshKey={refreshKey} />)}
            </div>
          </div>
        )}

        {/* Ear Section */}
        {flags.ear && (
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="flex items-center gap-2 text-xs font-semibold text-[var(--corebot-ear)]">
                <Ear size={12} /> Ear — 청각 AI
              </p>
              <div className="flex items-center gap-2">
                <button onClick={micActive ? stopMic : startMic} className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-semibold transition ${micActive ? "bg-[var(--danger)] text-black animate-pulse" : "border border-[var(--border)] text-[var(--muted)]"}`}>
                  {micActive ? <><MicOff size={10} /> 마이크 OFF</> : <><Mic size={10} /> 마이크 ON</>}
                </button>
                {micResult && (
                  micResult.is_anomaly
                    ? <span className="rounded-full bg-[var(--danger)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--danger)]">{micResult.anomaly_type} ({Math.round(micResult.confidence * 100)}%)</span>
                    : <span className="rounded-full bg-[var(--corebot-core)]/10 px-2 py-0.5 text-[10px] text-[var(--corebot-core)]">정상</span>
                )}
              </div>
            </div>

            {/* Mic Spectrum */}
            {micActive && micData.length > 0 && (
              <div className="mb-3 rounded-lg border border-[var(--corebot-ear)]/20 bg-[var(--surface)] p-3">
                <ResponsiveContainer width="100%" height={100}>
                  <BarChart data={micData}>
                    <XAxis dataKey="freq_hz" tick={{ fontSize: 7 }} interval={5} />
                    <YAxis tick={{ fontSize: 7 }} domain={[-100, 0]} />
                    <Bar dataKey="amplitude_db" radius={[1, 1, 0, 0]}>
                      {micData.map((d, i) => <Cell key={i} fill={d.amplitude_db > -20 ? "var(--danger)" : "var(--corebot-ear)"} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recent Audio */}
            <div className="space-y-1">
              {audioReadings.slice(0, 5).map((r) => (
                <div key={r.id} className={`flex items-center justify-between rounded-lg border px-3 py-1.5 text-[10px] ${r.is_anomaly ? "border-[var(--danger)]/30 bg-[var(--danger)]/5" : "border-[var(--border)]"}`}>
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${r.is_anomaly ? "bg-[var(--danger)]" : "bg-[var(--corebot-core)]"}`} />
                    <span className="text-[var(--foreground)]">{(r.devices as unknown as { name: string } | null)?.name}</span>
                    {r.is_anomaly && <span className="text-[var(--danger)]">{r.anomaly_type} ({Math.round(r.confidence * 100)}%)</span>}
                  </div>
                  <span className="text-gray-500">{new Date(r.recorded_at).toLocaleTimeString("ko-KR")}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Eye placeholder */}
        {flags.eye && (
          <div className="mb-4 rounded-xl border border-dashed border-[var(--corebot-eye)]/30 p-6 text-center">
            <Eye size={24} className="mx-auto mb-2 text-[var(--corebot-eye)]/50" />
            <p className="text-xs text-gray-500">Eye Agent (시각 AI) — 준비 중</p>
          </div>
        )}
      </div>

      {/* ═══ Right: Core Chat ═══ */}
      {flags.core && (
        <div className="flex w-96 shrink-0 flex-col border-l border-[var(--border)] bg-[var(--surface)]">
          {/* Chat Header */}
          <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
            <video src="/video/Core.mp4" autoPlay loop muted playsInline className="h-8 w-8 rounded-full object-cover" />
            <div>
              <p className="text-xs font-bold text-[var(--foreground)]">Core Agent</p>
              <p className="text-[9px] text-[var(--corebot-core)]">AI 공장장</p>
            </div>
          </div>

          {/* Messages */}
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {chatMsgs.length === 0 && (
              <div className="flex flex-col items-center gap-3 pt-10 text-center">
                <video src="/video/Core.mp4" autoPlay loop muted playsInline className="h-14 w-14 rounded-full object-cover" />
                <p className="text-xs text-gray-500">공장 현황을 물어보세요</p>
                <QuickPrompts onSelect={sendChat} disabled={chatLoading} />
              </div>
            )}
            {chatMsgs.map((m, i) => (
              <ChatMessage key={i} role={m.role} content={m.content} isStreaming={chatStreaming && i === chatMsgs.length - 1 && m.role === "assistant"} />
            ))}
          </div>

          {/* Quick Prompts */}
          {chatMsgs.length > 0 && (
            <div className="border-t border-[var(--border)] px-4 py-2">
              <QuickPrompts onSelect={sendChat} disabled={chatLoading} />
            </div>
          )}

          {/* Input */}
          <div className="border-t border-[var(--border)] px-4 py-3">
            <div className="flex items-center gap-2">
              <button type="button" onClick={voiceRec ? stopVoice : startVoice} disabled={chatLoading || voiceProc}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${voiceRec ? "bg-[var(--danger)] text-[var(--foreground)] animate-pulse" : voiceProc ? "border border-[var(--corebot-core)] text-[var(--corebot-core)]" : "border border-[var(--border)] text-[var(--muted)]"} disabled:opacity-50`}>
                {voiceProc ? <Loader2 size={14} className="animate-spin" /> : voiceRec ? <MicOff size={14} /> : <Mic size={14} />}
              </button>
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(chatInput); } }}
                placeholder="메시지..."
                disabled={chatLoading}
                className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs text-[var(--foreground)] placeholder-gray-500 focus:border-[var(--corebot-core)] focus:outline-none disabled:opacity-50"
              />
              <button onClick={() => sendChat(chatInput)} disabled={chatLoading || !chatInput.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--corebot-core)] text-black disabled:opacity-50">
                {chatLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
