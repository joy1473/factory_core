"use client";

interface SmartFactoryDiagramProps {
  onLayerClick: (layer: string) => void;
}

export function SmartFactoryDiagram({ onLayerClick }: SmartFactoryDiagramProps) {
  return (
    <div className="mx-auto max-w-5xl px-5">
      <p className="mb-8 text-center text-xs text-gray-500">
        각 레이어를 클릭하면 해당 영역의 3D 데모를 체험할 수 있습니다
      </p>

      <div className="overflow-x-auto">
        <div className="min-w-[700px]">

          {/* ═══ Layer 1: 응용시스템 S/W ═══ */}
          <button
            onClick={() => onLayerClick("office")}
            className="group relative mb-1 flex w-full items-stretch rounded-lg border border-[#3366aa]/40 transition hover:border-[#4488ff] hover:shadow-[0_0_15px_rgba(68,136,255,0.08)]"
          >
            <div className="flex w-24 shrink-0 items-center justify-center rounded-l-lg bg-[#1a2a4a] px-2">
              <span className="text-[10px] font-bold leading-tight text-[#6699dd] [writing-mode:vertical-lr]">응용시스템 S/W</span>
            </div>

            <div className="flex-1 bg-[#0d1520] p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <Box label="협력사" color="#6699dd" small />
                <Arr />
                <Box label="공급사슬관리" sub="SCM" color="#4488ff" />
                <Arr />
                <Box label="기업경영" sub="ERP" color="#4488ff" />
                <Arr />
                <Box label="협력사" color="#6699dd" small />
              </div>
              <div className="flex items-center justify-center gap-2">
                <Box label="제품 및 공정개발" sub="PLM/CAD" color="#4488ff" />
                <Arr />
                <Box label="공장운영" sub="MES/MOM" color="#4488ff" hl />
                <Arr d />
                <Box label="기업자원관리" sub="ERP" color="#4488ff" />
              </div>
            </div>

            <div className="flex w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-r-lg bg-[#0d1520] pr-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4488ff]/10 text-lg">☁️</div>
              <span className="text-[9px] text-[#6699dd]">CLOUD</span>
            </div>
            <div className="absolute right-2 top-2 text-[10px] text-gray-600 opacity-0 transition group-hover:opacity-100">데모 →</div>
          </button>

          {/* Data flow */}
          <DataFlow texts={["설계정보", "제어/밸브, 설비·가동정보"]} />

          {/* ═══ Layer 2: 제어 자동화 ═══ */}
          <button
            onClick={() => onLayerClick("electronics")}
            className="group relative mb-1 flex w-full items-stretch rounded-lg border border-[#336644]/40 transition hover:border-[#00ff88]/60 hover:shadow-[0_0_15px_rgba(0,255,136,0.08)]"
          >
            <div className="flex w-24 shrink-0 items-center justify-center rounded-l-lg bg-[#0a1a10] px-2">
              <span className="text-[10px] font-bold leading-tight text-[#44aa66] [writing-mode:vertical-lr]">제어 자동화</span>
            </div>
            <div className="flex flex-1 items-center gap-2 bg-[#0a1210] p-4">
              <Box label="공정제어" sub="PLC" color="#00cc66" />
              <Arr />
              <Box label="인터페이스" sub="수집/변환" color="#00cc66" />
              <Arr />
              <Box label="컴퓨터수치제어" sub="CNC" color="#00cc66" />
              <Arr />
              <Box label="산업용 통신" sub="OPC-UA" color="#00cc66" />
            </div>
            <div className="flex w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-r-lg bg-[#0a1210] pr-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00cc66]/10 text-lg">📡</div>
              <span className="text-[9px] text-[#44aa66]">PPS</span>
            </div>
            <div className="absolute right-2 top-2 text-[10px] text-gray-600 opacity-0 transition group-hover:opacity-100">데모 →</div>
          </button>

          <DataFlow texts={["센서데이터, 설비·가동데이터"]} />

          {/* ═══ Layer 3: 현장 자동화 ═══ */}
          <button
            onClick={() => onLayerClick("general")}
            className="group relative mb-3 flex w-full items-stretch rounded-lg border border-[#665522]/40 transition hover:border-[#ffaa00]/60 hover:shadow-[0_0_15px_rgba(255,170,0,0.08)]"
          >
            <div className="flex w-24 shrink-0 items-center justify-center rounded-l-lg bg-[#1a1408] px-2">
              <span className="text-[10px] font-bold leading-tight text-[#aa8844] [writing-mode:vertical-lr]">현장 자동화</span>
            </div>
            <div className="flex flex-1 items-center gap-2 bg-[#100e08] p-4">
              <Box label="센서/태그" sub="IoT Pixel" color="#ddaa44" />
              <Arr />
              <Box label="로봇" sub="협동로봇" color="#ddaa44" />
              <Arr />
              <Box label="물리 설비" sub="모터/프레스" color="#ddaa44" />
              <Arr />
              <Box label="계측/검사" sub="비전/진동" color="#ddaa44" />
            </div>
            <div className="flex w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-r-lg bg-[#100e08] pr-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ddaa44]/10 text-lg">⚙️</div>
              <span className="text-[9px] text-[#aa8844]">설비</span>
            </div>
            <div className="absolute right-2 top-2 text-[10px] text-gray-600 opacity-0 transition group-hover:opacity-100">데모 →</div>
          </button>

          {/* Connector line */}
          <div className="flex justify-center py-1">
            <div className="h-6 w-px bg-gradient-to-b from-[#333] to-[#ff4444]/50" />
          </div>

          {/* ═══ 지능형 기술 — Factory Guardian Agent ═══ */}
          <button
            onClick={() => onLayerClick("metal")}
            className="group relative flex w-full items-stretch overflow-hidden rounded-xl border-2 border-dashed border-[#ff4444]/30 transition hover:border-[#ff4444]/70 hover:shadow-[0_0_25px_rgba(255,68,68,0.1)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a0505] via-[#200808] to-[#1a0505]" />
            <div className="relative flex w-full items-center gap-6 p-5">
              <div className="flex shrink-0 flex-col items-center gap-1">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ff4444]/10 text-2xl">🤖</div>
                <span className="text-[9px] font-bold text-[#ff4444]">AI Agent</span>
              </div>
              <div className="flex-1 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-[#ff6666]">지능형 기술</p>
                <p className="mt-1 text-base font-black text-white">Factory Guardian Agent</p>
                <p className="mt-1 text-[11px] text-gray-400">모든 레이어의 데이터를 AI로 통합 · 예측 · 자동 보고</p>
                <div className="mt-3 flex items-center justify-center gap-3">
                  {["👁️ 시각 AI", "👂 청각 AI", "🖐️ IoT 촉각", "💬 대화형"].map((c) => (
                    <span key={c} className="rounded-full bg-[#ff4444]/10 px-2.5 py-1 text-[10px] font-semibold text-[#ff8888]">{c}</span>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-center gap-1">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#ff4444]/20 bg-[#ff4444]/5 text-xs font-bold text-[#ff4444] transition group-hover:bg-[#ff4444]/20">
                  3D<br />데모
                </div>
                <span className="text-[9px] text-gray-600 opacity-0 transition group-hover:opacity-100">클릭 →</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function Box({ label, sub, color, hl, small }: { label: string; sub?: string; color: string; hl?: boolean; small?: boolean }) {
  return (
    <div
      className={`rounded-md border text-center ${small ? "px-2 py-1.5" : "px-3 py-2"}`}
      style={{ borderColor: color + (hl ? "60" : "30"), backgroundColor: hl ? color + "0a" : "transparent", minWidth: small ? "60px" : "auto" }}
    >
      <p className={`font-semibold text-white ${small ? "text-[10px]" : "text-[11px]"}`}>{label}</p>
      {sub && <p className="text-[9px]" style={{ color: color + "99" }}>{sub}</p>}
    </div>
  );
}

function Arr({ d }: { d?: boolean }) {
  return (
    <div className="flex shrink-0 items-center text-gray-600">
      <div className="h-px w-2 bg-gray-600" />
      <svg width="8" height="8" viewBox="0 0 8 8" className="text-gray-500">
        {d ? (
          <>
            <path d="M1 4 L4 1.5 L4 6.5 Z" fill="currentColor" />
            <path d="M7 4 L4 1.5 L4 6.5 Z" fill="currentColor" />
          </>
        ) : (
          <path d="M1 4 L6 1.5 L6 6.5 Z" fill="currentColor" />
        )}
      </svg>
      <div className="h-px w-2 bg-gray-600" />
    </div>
  );
}

function DataFlow({ texts }: { texts: string[] }) {
  return (
    <div className="relative my-2 flex items-center justify-center">
      <div className="absolute left-24 right-20 h-px bg-[#333]" />
      <div className="relative z-10 flex gap-4 bg-[#0a0a0a] px-3">
        {texts.map((t, i) => (
          <span key={i} className="flex items-center gap-1 text-[9px] text-gray-500">
            {i > 0 && <span className="text-gray-600">↕</span>}
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
