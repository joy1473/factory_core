"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity, Settings, Play, Square, Zap,
  Send, Loader2, Mic, MicOff, ChevronDown,
  AlertTriangle, Move,
} from "lucide-react";
import dynamic from "next/dynamic";
import { DeviceDetailPanel } from "@/components/monitoring/device-detail-panel";

const SceneViewer = dynamic(
  () => import("@/components/monitoring/scene-viewer").then((m) => m.SceneViewer),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center bg-black"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--corebot-core)] border-t-transparent" /></div> }
);

// ─── Types ───
interface FeatureFlags { touch: boolean; ear: boolean; eye: boolean; core: boolean; }
interface Scene { id: string; name: string; splat_url: string; camera_position: { x: number; y: number; z: number }; camera_target: { x: number; y: number; z: number }; }
interface Device { id: string; name: string; device_type: string; location: string; status: string; thresholds: Record<string, number>; position_3d?: { x: number; y: number; z: number }; label_offset?: { x: number; y: number; z: number }; }
interface Alert { id: string; device_id: string; sensor_type: string; severity: string; message: string; status: string; created_at: string; }
interface ChatMsg { role: "user" | "assistant"; content: string; }

const DEFAULT_FLAGS: FeatureFlags = { touch: false, ear: false, eye: false, core: false };

const FEATURE_META = [
  { key: "core" as const, label: "AI 공장장", desc: "모든 데이터를 통합·분석하고 자동 보고서 생성", video: "/video/Core.mp4", color: "#A8E6CF" },
  { key: "eye" as const, label: "시각 AI", desc: "카메라·스마트글래스로 설비 상태를 자동 판별", video: "/video/Eye.mp4", color: "#DDA0DD" },
  { key: "ear" as const, label: "청각 AI", desc: "설비 소리를 분석하여 이상 징후 조기 감지", video: "/video/Ear.mp4", color: "#FFD3B6" },
  { key: "touch" as const, label: "IoT 촉각", desc: "$1 스티커 센서로 온도·습도·진동 실시간 감지", video: "/video/Touch.mp4", color: "#FDFD96" },
];

export default function MonitoringPage() {
  // ─── State ───
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FLAGS);
  const [hydrated, setHydrated] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [scene, setScene] = useState<Scene | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Simulator
  const [simRunning, setSimRunning] = useState(false);
  const [simTick, setSimTick] = useState(0);
  const [showSim, setShowSim] = useState(false);
  const simRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // Chat
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Voice
  const [voiceRec, setVoiceRec] = useState(false);
  const [voiceProc, setVoiceProc] = useState(false);
  const voiceCtxRef = useRef<AudioContext | null>(null);
  const voiceProcRef = useRef<ScriptProcessorNode | null>(null);
  const voiceStreamRef = useRef<MediaStream | null>(null);
  const voiceChunksRef = useRef<Int16Array[]>([]);

  const anyActive = flags.touch || flags.ear || flags.eye || flags.core;

  // ─── Hydrate localStorage ───
  useEffect(() => {
    const saved = localStorage.getItem("fc-features");
    if (saved) try { setFlags(JSON.parse(saved)); } catch {}
    setHydrated(true);
  }, []);

  // ─── Data Fetch ───
  const fetchData = useCallback(async () => {
    const [devRes, alertRes, sceneRes] = await Promise.all([
      fetch("/api/devices"),
      fetch("/api/alerts?status=active&limit=20"),
      fetch("/api/scenes"),
    ]);
    setDevices(await devRes.json().then((d: Device[]) => Array.isArray(d) ? d : []));
    setAlerts(await alertRes.json().then((d: Alert[]) => Array.isArray(d) ? d : []));
    const scenes = await sceneRes.json();
    if (Array.isArray(scenes) && scenes.length > 0 && !scene) setScene(scenes[0]);
  }, [scene]);

  useEffect(() => { if (hydrated) fetchData(); }, [hydrated, fetchData]);

  // Auto refresh 5s
  useEffect(() => {
    if (!anyActive) return;
    const t = setInterval(fetchData, 5000);
    return () => clearInterval(t);
  }, [anyActive, fetchData]);

  // ─── Feature Flags ───
  function toggleFlag(key: keyof FeatureFlags) {
    setFlags((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem("fc-features", JSON.stringify(updated));
      if (key === "core" && !updated.core) setChatOpen(false);
      return updated;
    });
  }

  // ─── Simulator ───
  async function simGenerate() {
    const calls = [];
    if (flags.touch) calls.push(fetch("/api/simulator/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ anomaly_chance: 0.05, tick: simTick }) }));
    if (flags.ear) calls.push(fetch("/api/audio/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ anomaly_chance: 0.1, tick: simTick }) }));
    if (flags.eye) calls.push(fetch("/api/vision/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ anomaly_chance: 0.1 }) }));
    await Promise.all(calls);
    setSimTick((t) => t + 1);
    fetchData();
  }
  function simStart() { setSimRunning(true); simGenerate(); simRef.current = setInterval(simGenerate, 5000); }
  function simStop() { setSimRunning(false); if (simRef.current) clearInterval(simRef.current); }
  function simInject() {
    const calls = [];
    if (flags.touch) calls.push(fetch("/api/simulator/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ anomaly_chance: 1.0, tick: simTick }) }));
    if (flags.ear) calls.push(fetch("/api/audio/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ anomaly_chance: 1.0, tick: simTick }) }));
    if (flags.eye) calls.push(fetch("/api/vision/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ anomaly_chance: 1.0 }) }));
    Promise.all(calls).then(() => fetchData());
  }

  // ─── Chat ───
  function scrollChat() { setTimeout(() => chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: "smooth" }), 50); }

  async function sendChat(text: string) {
    if (!text.trim() || chatLoading) return;
    setChatMsgs((p) => [...p, { role: "user", content: text.trim() }, { role: "assistant", content: "" }]);
    setChatInput(""); setChatLoading(true); scrollChat();
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
    finally { setChatLoading(false); }
  }

  // ─── Voice ───
  async function startVoice() {
    voiceChunksRef.current = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true } });
    voiceStreamRef.current = stream;
    const ctx = new AudioContext({ sampleRate: 16000 }); voiceCtxRef.current = ctx;
    const src = ctx.createMediaStreamSource(stream);
    const proc = ctx.createScriptProcessor(4096, 1, 1); voiceProcRef.current = proc;
    proc.onaudioprocess = (e) => { const f = e.inputBuffer.getChannelData(0); const i = new Int16Array(f.length); for (let x = 0; x < f.length; x++) i[x] = Math.max(-32768, Math.min(32767, Math.round(f[x] * 32767))); voiceChunksRef.current.push(i); };
    src.connect(proc); proc.connect(ctx.destination); setVoiceRec(true);
  }
  async function stopVoice() {
    setVoiceRec(false);
    voiceProcRef.current?.disconnect(); voiceCtxRef.current?.close(); voiceStreamRef.current?.getTracks().forEach((t) => t.stop());
    const chunks = voiceChunksRef.current; if (chunks.length === 0) return;
    const total = chunks.reduce((s, c) => s + c.length, 0); const merged = new Int16Array(total); let off = 0;
    for (const c of chunks) { merged.set(c, off); off += c.length; } voiceChunksRef.current = [];
    setVoiceProc(true);
    try { const res = await fetch("/api/stt/proxy", { method: "POST", headers: { "Content-Type": "application/octet-stream" }, body: merged.buffer }); const { text } = await res.json(); if (text?.trim()) sendChat(text.trim()); } catch {} finally { setVoiceProc(false); }
  }

  // ─── Cleanup ───
  useEffect(() => { return () => { if (simRef.current) clearInterval(simRef.current); }; }, []);

  // ─── Alert helpers ───
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;

  if (!hydrated) return null;

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════
  return (
    <div className="relative flex h-[calc(100vh-48px)] flex-col overflow-hidden">

      {/* ─── Header Bar ─── */}
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-5 py-2">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-[var(--foreground)]">Factory Guardian</h1>
          {simRunning && <span className="flex items-center gap-1 text-[10px] text-[var(--corebot-core)]"><Activity size={10} className="animate-pulse" /> LIVE</span>}
          {anyActive && alerts.length > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-[var(--danger)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--danger)]">
              <AlertTriangle size={10} /> {alerts.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {anyActive && scene && (
            <button onClick={() => { setEditMode(!editMode); if (editMode) setSelectedDevice(null); }} className={`flex items-center gap-1 rounded-lg border px-3 py-1 text-[10px] transition ${editMode ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--border)] text-[var(--muted)]"}`}>
              <Move size={10} /> {editMode ? "편집 완료" : "배치 편집"}
            </button>
          )}
          {anyActive && (
            <button onClick={() => setShowSim(!showSim)} className={`rounded-lg border px-3 py-1 text-[10px] transition ${simRunning ? "border-[var(--corebot-core)]/50 text-[var(--corebot-core)]" : "border-[var(--border)] text-[var(--muted)]"}`}>
              시뮬레이터
            </button>
          )}
          <button onClick={() => setShowSettings(!showSettings)} className="rounded-lg border border-[var(--border)] p-1.5 text-[var(--muted)] hover:text-[var(--foreground)]">
            <Settings size={14} />
          </button>
        </div>
      </div>

      {/* ─── Settings Panel ─── */}
      {showSettings && (
        <div className="shrink-0 border-b border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="mb-1 text-center">
            <p className="text-sm font-bold text-[var(--foreground)]">CoreBot Family</p>
            <p className="text-[10px] text-gray-500">개별 활성화/비활성화</p>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            {FEATURE_META.map((f) => {
              const active = flags[f.key];
              const name = f.key.charAt(0).toUpperCase() + f.key.slice(1);
              return (
                <button key={f.key} onClick={() => toggleFlag(f.key)}
                  className={`relative flex flex-col items-center rounded-xl border p-3 text-center transition ${active ? "" : "border-[var(--border)] opacity-40 grayscale"}`}
                  style={active ? { borderColor: f.color, borderTopWidth: "3px" } : { borderTopWidth: "3px", borderTopColor: "var(--border)" }}>
                  <div className={`absolute right-2 top-2 h-3.5 w-7 rounded-full transition ${active ? "" : "bg-gray-600"}`} style={active ? { backgroundColor: f.color } : undefined}>
                    <div className={`h-2.5 w-2.5 rounded-full bg-white shadow mt-0.5 transition-transform ${active ? "translate-x-3.5 ml-0.5" : "translate-x-0.5"}`} />
                  </div>
                  <div className="mb-1 h-12 w-12 overflow-hidden rounded-full" style={{ boxShadow: active ? `0 0 12px ${f.color}30` : "none" }}>
                    <video src={f.video} autoPlay loop muted playsInline className="h-full w-full object-cover" />
                  </div>
                  <p className="text-[9px] font-bold" style={{ color: active ? f.color : "var(--muted)" }}>{name}</p>
                  <p className="text-[10px] font-semibold text-[var(--foreground)]">{f.label}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Simulator Bar ─── */}
      {showSim && anyActive && (
        <div className="flex shrink-0 items-center gap-2 border-b border-[var(--border)] bg-[var(--surface)] px-5 py-2">
          <button onClick={simRunning ? simStop : simStart} className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold ${simRunning ? "bg-[var(--danger)] text-black" : "bg-[var(--corebot-core)] text-black"}`}>
            {simRunning ? <><Square size={10} /> 정지</> : <><Play size={10} /> 시작</>}
          </button>
          <button onClick={simInject} className="flex items-center gap-1 rounded-lg border border-[var(--danger)]/30 px-3 py-1 text-xs text-[var(--danger)]">
            <Zap size={10} /> 이상 주입
          </button>
          <span className="text-[10px] text-gray-500">Tick: {simTick}</span>
        </div>
      )}

      {/* ─── Main Content ─── */}
      <div className="flex-1 overflow-hidden">

        {/* 온보딩 (모두 비활성) */}
        {!anyActive && (
          <div className="flex h-full flex-col items-center justify-center gap-6 p-10">
            <div className="text-center">
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[var(--corebot-core)]">Factory Guardian Agent</p>
              <h2 className="mb-2 text-2xl font-bold text-[var(--foreground)]">CoreBot Family를 만나보세요</h2>
              <p className="text-sm text-gray-500">AI 요원들을 활성화하면 공장이 달라집니다</p>
            </div>
            <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-4">
              {FEATURE_META.map((f) => {
                const name = f.key.charAt(0).toUpperCase() + f.key.slice(1);
                return (
                  <button key={f.key} onClick={() => toggleFlag(f.key)} className="group flex flex-col items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:border-opacity-60" style={{ borderTopColor: f.color, borderTopWidth: "3px" }}>
                    <div className="mb-2 h-16 w-16 overflow-hidden rounded-full transition group-hover:scale-110" style={{ boxShadow: `0 0 20px ${f.color}20` }}>
                      <video src={f.video} autoPlay loop muted playsInline className="h-full w-full object-cover" />
                    </div>
                    <p className="text-[10px] font-bold" style={{ color: f.color }}>{name}</p>
                    <p className="text-xs font-semibold text-[var(--foreground)]">{f.label}</p>
                    <p className="mt-1 text-[9px] text-gray-500">{f.desc}</p>
                    <span className="mt-2 rounded-full border px-3 py-0.5 text-[10px] font-semibold" style={{ borderColor: f.color, color: f.color }}>활성화</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-gray-500">Core만으로도 시작 가능 — 센서 없이 DB 데이터 기반 AI 분석</p>
          </div>
        )}

        {/* 3D 뷰어 (에이전트 활성 + 씬 있을 때) */}
        {anyActive && scene && (
          <div className="h-full">
            <SceneViewer
              splatSource={scene.splat_url}
              editMode={editMode}
              selectedDeviceId={selectedDevice}
              devices={devices.map((d) => ({
                id: d.id,
                name: d.name,
                device_type: d.device_type,
                status: d.status,
                position_3d: (d as unknown as Record<string, unknown>).position_3d as { x: number; y: number; z: number } || { x: (devices.indexOf(d) - 1.5) * 2, y: 0, z: 0 },
                alertLevel: alerts.some((a) => a.device_id === d.id && a.severity === "critical") ? "critical" as const :
                  alerts.some((a) => a.device_id === d.id) ? "warning" as const : "normal" as const,
              }))}
              onDeviceClick={(id) => setSelectedDevice(id === selectedDevice ? null : id)}
              onDeviceMove={async (id, pos) => {
                await fetch(`/api/devices/${id}/position`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ position_3d: pos }),
                });
                fetchData();
              }}
            />

            {/* 설비 상세 팝업 */}
            {selectedDevice && !editMode && (
              <DeviceDetailPanel
                deviceId={selectedDevice}
                onClose={() => setSelectedDevice(null)}
              />
            )}
          </div>
        )}

        {/* 씬 없을 때 fallback */}
        {anyActive && !scene && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="mb-2 text-sm text-gray-500">3D 씬이 등록되지 않았습니다</p>
              <p className="text-[10px] text-gray-600">Luma AI에서 .splat 파일을 생성하여 업로드하세요</p>
            </div>
          </div>
        )}
      </div>

      {/* ─── Alerts Overlay (하단) ─── */}
      {anyActive && alerts.length > 0 && (
        <div className="absolute bottom-4 left-4 z-30 max-w-md space-y-1">
          {alerts.slice(0, 3).map((a) => (
            <div key={a.id} className="flex items-center gap-2 rounded-lg bg-black/80 px-3 py-2 text-xs backdrop-blur-md" style={{ borderLeft: `3px solid ${a.severity === "critical" ? "var(--danger)" : "var(--accent)"}` }}>
              <AlertTriangle size={12} style={{ color: a.severity === "critical" ? "var(--danger)" : "var(--accent)" }} />
              <span className="text-white">{a.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* ─── Core Chat Floating ─── */}
      {flags.core && !chatOpen && (
        <button onClick={() => setChatOpen(true)} className="absolute bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition hover:scale-110" style={{ backgroundColor: "var(--corebot-core)", boxShadow: "0 4px 20px rgba(168,230,207,0.3)" }}>
          <video src="/video/Core.mp4" autoPlay loop muted playsInline className="h-12 w-12 rounded-full object-cover" />
        </button>
      )}

      {flags.core && chatOpen && (
        <div className="absolute bottom-6 right-6 z-40 flex h-[480px] w-80 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2">
            <div className="flex items-center gap-2">
              <video src="/video/Core.mp4" autoPlay loop muted playsInline className="h-7 w-7 rounded-full object-cover" />
              <div>
                <p className="text-[11px] font-bold text-[var(--foreground)]">Core Agent</p>
                <p className="text-[8px] text-[var(--corebot-core)]">AI 공장장</p>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} className="rounded p-1 text-gray-500 hover:text-[var(--foreground)]"><ChevronDown size={14} /></button>
          </div>

          {/* Messages */}
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
            {chatMsgs.length === 0 && (
              <div className="flex flex-col items-center gap-2 pt-8 text-center">
                <video src="/video/Core.mp4" autoPlay loop muted playsInline className="h-10 w-10 rounded-full object-cover" />
                <p className="text-[10px] text-gray-500">공장 현황을 물어보세요</p>
                <div className="flex flex-wrap gap-1">
                  {["현황", "알림", "보고서"].map((q) => (
                    <button key={q} onClick={() => sendChat(q === "현황" ? "현재 전체 설비 상태를 요약해줘" : q === "알림" ? "활성화된 알림을 보여줘" : "일일 보고서를 생성해줘")}
                      className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[9px] text-[var(--muted)] hover:border-[var(--corebot-core)] hover:text-[var(--corebot-core)]">{q}</button>
                  ))}
                </div>
              </div>
            )}
            {chatMsgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex gap-2"}>
                {m.role === "assistant" && <video src="/video/Core.mp4" autoPlay loop muted playsInline className="h-6 w-6 shrink-0 rounded-full object-cover mt-0.5" />}
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-[11px] leading-relaxed ${m.role === "user" ? "bg-[var(--primary)] text-black rounded-br-sm" : "bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] rounded-bl-sm"}`}>
                  <span className="whitespace-pre-wrap">{m.content}</span>
                  {chatLoading && i === chatMsgs.length - 1 && m.role === "assistant" && <span className="inline-block h-3 w-0.5 animate-pulse bg-[var(--corebot-core)] ml-1" />}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-[var(--border)] px-3 py-2">
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={voiceRec ? stopVoice : startVoice} disabled={chatLoading || voiceProc}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${voiceRec ? "bg-[var(--danger)] text-white animate-pulse" : "border border-[var(--border)] text-[var(--muted)]"} disabled:opacity-50`}>
                {voiceProc ? <Loader2 size={12} className="animate-spin" /> : voiceRec ? <MicOff size={12} /> : <Mic size={12} />}
              </button>
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(chatInput); } }}
                placeholder="메시지..." disabled={chatLoading}
                className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-[11px] text-[var(--foreground)] placeholder-gray-500 focus:border-[var(--corebot-core)] focus:outline-none disabled:opacity-50" />
              <button onClick={() => sendChat(chatInput)} disabled={chatLoading || !chatInput.trim()}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--corebot-core)] text-black disabled:opacity-50">
                {chatLoading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
