"use client";

interface SmartFactoryDiagramProps {
  onLayerClick: (layer: string) => void;
}

export function SmartFactoryDiagram({ onLayerClick }: SmartFactoryDiagramProps) {
  return (
    <div className="mx-auto max-w-5xl px-5">
      <p className="mb-8 text-center text-xs text-gray-500">
        각 레이어를 클릭하면 해당 영역의 3D 데모를 체험할 수 있습니다
        <span className="ml-1 md:hidden">(좌우 스크롤)</span>
      </p>

      <div className="overflow-x-auto">
        <div className="min-w-[700px]">

          {/* ═══ Layer 1: 응용시스템 S/W (라벤더) ═══ */}
          <button
            onClick={() => onLayerClick("office")}
            className="group relative mb-1 flex w-full items-stretch rounded-lg border border-[#DDA0DD]/30 transition hover:border-[#DDA0DD]/70 hover:shadow-[0_0_15px_rgba(221,160,221,0.08)]"
          >
            <div className="flex w-24 shrink-0 items-center justify-center rounded-l-lg bg-[#1a0d1a] px-2">
              <span className="text-[10px] font-bold leading-tight text-[#DDA0DD] [writing-mode:vertical-lr]">응용시스템 S/W</span>
            </div>

            <div className="flex-1 bg-[#120d14] p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <Box label="협력사" color="#DDA0DD" small />
                <Arr />
                <Box label="공급사슬관리" sub="SCM" color="#C89BD9" />
                <Arr />
                <Box label="기업경영" sub="ERP" color="#C89BD9" />
                <Arr />
                <Box label="협력사" color="#DDA0DD" small />
              </div>
              <div className="flex items-center justify-center gap-2">
                <Box label="제품 및 공정개발" sub="PLM/CAD" color="#C89BD9" />
                <Arr />
                <Box label="공장운영" sub="MES/MOM" color="#C89BD9" hl />
                <Arr d />
                <Box label="기업자원관리" sub="ERP" color="#C89BD9" />
              </div>
            </div>

            <div className="flex w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-r-lg bg-[#120d14] pr-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#DDA0DD]/15 text-lg">☁️</div>
              <span className="text-[9px] text-[#DDA0DD]">CLOUD</span>
            </div>
            <div className="absolute right-2 top-2 text-[10px] text-gray-600 opacity-0 transition group-hover:opacity-100">데모 →</div>
          </button>

          {/* Data flow */}
          <DataFlow texts={["설계정보", "제어/밸브, 설비·가동정보"]} />

          {/* ═══ Layer 2: 제어 자동화 (피치) ═══ */}
          <button
            onClick={() => onLayerClick("electronics")}
            className="group relative mb-1 flex w-full items-stretch rounded-lg border border-[#FFD3B6]/30 transition hover:border-[#FFD3B6]/70 hover:shadow-[0_0_15px_rgba(255,211,182,0.08)]"
          >
            <div className="flex w-24 shrink-0 items-center justify-center rounded-l-lg bg-[#1a140d] px-2">
              <span className="text-[10px] font-bold leading-tight text-[#FFD3B6] [writing-mode:vertical-lr]">제어 자동화</span>
            </div>
            <div className="flex flex-1 items-center gap-2 bg-[#14100d] p-4">
              <Box label="공정제어" sub="PLC" color="#FFB89A" />
              <Arr />
              <Box label="인터페이스" sub="수집/변환" color="#FFB89A" />
              <Arr />
              <Box label="컴퓨터수치제어" sub="CNC" color="#FFB89A" />
              <Arr />
              <Box label="산업용 통신" sub="OPC-UA" color="#FFB89A" />
            </div>
            <div className="flex w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-r-lg bg-[#14100d] pr-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFD3B6]/15 text-lg">📡</div>
              <span className="text-[9px] text-[#FFD3B6]">PPS</span>
            </div>
            <div className="absolute right-2 top-2 text-[10px] text-gray-600 opacity-0 transition group-hover:opacity-100">데모 →</div>
          </button>

          <DataFlow texts={["센서데이터, 설비·가동데이터"]} />

          {/* ═══ Layer 3: 현장 자동화 (웜옐로우) ═══ */}
          <button
            onClick={() => onLayerClick("general")}
            className="group relative mb-3 flex w-full items-stretch rounded-lg border border-[#FDFD96]/25 transition hover:border-[#FDFD96]/60 hover:shadow-[0_0_15px_rgba(253,253,150,0.08)]"
          >
            <div className="flex w-24 shrink-0 items-center justify-center rounded-l-lg bg-[#1a1a0d] px-2">
              <span className="text-[10px] font-bold leading-tight text-[#FDFD96] [writing-mode:vertical-lr]">현장 자동화</span>
            </div>
            <div className="flex flex-1 items-center gap-2 bg-[#12120d] p-4">
              <Box label="센서/태그" sub="IoT Pixel" color="#F0E68C" />
              <Arr />
              <Box label="로봇" sub="협동로봇" color="#F0E68C" />
              <Arr />
              <Box label="물리 설비" sub="모터/프레스" color="#F0E68C" />
              <Arr />
              <Box label="계측/검사" sub="비전/진동" color="#F0E68C" />
            </div>
            <div className="flex w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-r-lg bg-[#12120d] pr-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FDFD96]/15 text-lg">⚙️</div>
              <span className="text-[9px] text-[#FDFD96]">설비</span>
            </div>
            <div className="absolute right-2 top-2 text-[10px] text-gray-600 opacity-0 transition group-hover:opacity-100">데모 →</div>
          </button>

          {/* Connector line */}
          <div className="flex justify-center py-1">
            <div className="h-6 w-px bg-gradient-to-b from-[#444] to-[#A8E6CF]/50" />
          </div>

          {/* ═══ 지능형 기술 — Factory Guardian Agent ═══ */}
          <button
            onClick={() => onLayerClick("metal")}
            className="group relative flex w-full items-stretch overflow-hidden rounded-xl border-2 border-dashed border-[#A8E6CF]/30 transition hover:border-[#A8E6CF]/70 hover:shadow-[0_0_25px_rgba(168,230,207,0.12)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1a14] via-[#0d1f18] to-[#0a1a14]" />
            <div className="relative flex w-full items-center gap-6 p-5">
              {/* Core 캐릭터 영상 */}
              <div className="flex shrink-0 flex-col items-center gap-1">
                <div className="h-16 w-16 overflow-hidden rounded-2xl bg-[#A8E6CF]/10">
                  <video
                    src="/video/Core.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="text-[9px] font-bold text-[#A8E6CF]">AI Agent</span>
              </div>
              <div className="flex-1 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-[#A8E6CF]">지능형 기술</p>
                <p className="mt-1 text-base font-black text-[var(--foreground)]">Factory Guardian Agent</p>
                <p className="mt-1 text-[11px] text-gray-400">모든 레이어의 데이터를 AI로 통합 · 예측 · 자동 보고</p>
                <div className="mt-3 flex items-center justify-center gap-3">
                  {[
                    { label: "시각 AI", video: "/video/Eye.mp4" },
                    { label: "청각 AI", video: "/video/Ear.mp4" },
                    { label: "IoT 촉각", video: "/video/Touch.mp4" },
                    { label: "대화형", video: "/video/Core.mp4" },
                  ].map((c) => (
                    <span key={c.label} className="flex items-center gap-1.5 rounded-full bg-[#A8E6CF]/10 px-2.5 py-1 text-[10px] font-semibold text-[#A8E6CF]">
                      <video src={c.video} autoPlay loop muted playsInline className="h-4 w-4 rounded-full object-cover" />
                      {c.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-center gap-1">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#A8E6CF]/20 bg-[#A8E6CF]/5 text-xs font-bold text-[#A8E6CF] transition group-hover:bg-[#A8E6CF]/20">
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
      <p className={`font-semibold text-[var(--foreground)] ${small ? "text-[10px]" : "text-[11px]"}`}>{label}</p>
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
      <div className="absolute left-24 right-20 h-px bg-[#444]" />
      <div className="relative z-10 flex gap-4 bg-[var(--background)] px-3">
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
