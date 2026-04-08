"use client";

interface SmartFactoryDiagramProps {
  onLayerClick: (layer: string) => void;
}

export function SmartFactoryDiagram({ onLayerClick }: SmartFactoryDiagramProps) {
  return (
    <div className="mx-auto max-w-5xl px-5">
      <p className="mb-6 text-center text-xs text-gray-500">
        각 레이어를 클릭하면 해당 영역의 3D 데모를 체험할 수 있습니다
      </p>

      <div className="relative">
        {/* 좌측: 레이어 라벨 */}
        {/* 메인 구조도 */}
        <div className="space-y-3">

          {/* Layer 1: 응용시스템 S/W */}
          <button
            onClick={() => onLayerClick("office")}
            className="group w-full rounded-xl border border-[#2a4a8a]/30 bg-gradient-to-r from-[#0a1628] to-[#0d1f3d] p-5 text-left transition hover:border-[#4488ff]/50 hover:shadow-[0_0_20px_rgba(68,136,255,0.1)]"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded bg-[#4488ff]/20 px-2 py-0.5 text-[10px] font-bold text-[#4488ff]">응용시스템 S/W</span>
                <span className="text-[10px] text-gray-600">LEVEL 3~4</span>
              </div>
              <span className="text-xs text-gray-600 opacity-0 transition group-hover:opacity-100">클릭하여 데모 →</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-5">
              <DiagramBox label="협력사" sub="SCM" color="#4488ff" />
              <DiagramBox label="공급사슬관리" sub="Supply Chain" color="#4488ff" highlight />
              <DiagramBox label="공장운영" sub="MES/MOM" color="#4488ff" highlight />
              <DiagramBox label="기업경영" sub="ERP" color="#4488ff" highlight />
              <DiagramBox label="CLOUD" sub="클라우드" color="#4488ff" icon="☁️" />
            </div>
            <div className="mt-2 flex items-center justify-center gap-1">
              <Arrow /><Arrow /><Arrow /><Arrow />
            </div>
          </button>

          {/* 데이터 흐름 표시 */}
          <div className="flex items-center justify-center gap-2 py-1">
            <span className="text-[10px] text-gray-600">설계정보</span>
            <FlowLine />
            <span className="text-[10px] text-gray-600">제어/밸브, 설비·가동정보</span>
          </div>

          {/* Layer 2: 제어 자동화 */}
          <button
            onClick={() => onLayerClick("electronics")}
            className="group w-full rounded-xl border border-[#00aa66]/30 bg-gradient-to-r from-[#0a1a10] to-[#0d2a18] p-5 text-left transition hover:border-[#00ff88]/50 hover:shadow-[0_0_20px_rgba(0,255,136,0.1)]"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded bg-[#00ff88]/20 px-2 py-0.5 text-[10px] font-bold text-[#00ff88]">제어 자동화</span>
                <span className="text-[10px] text-gray-600">LEVEL 2~3</span>
              </div>
              <span className="text-xs text-gray-600 opacity-0 transition group-hover:opacity-100">클릭하여 데모 →</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-4">
              <DiagramBox label="공정제어" sub="PLC" color="#00ff88" />
              <DiagramBox label="인터페이스" sub="데이터 수집" color="#00ff88" />
              <DiagramBox label="컴퓨터수치제어" sub="CNC" color="#00ff88" />
              <DiagramBox label="산업용 통신" sub="OPC-UA/MQTT" color="#00ff88" />
            </div>
          </button>

          {/* 데이터 흐름 */}
          <div className="flex items-center justify-center gap-2 py-1">
            <span className="text-[10px] text-gray-600">센서데이터, 설비·가동데이터</span>
            <FlowLine />
          </div>

          {/* Layer 3: 현장 자동화 */}
          <button
            onClick={() => onLayerClick("general")}
            className="group w-full rounded-xl border border-[#aa6600]/30 bg-gradient-to-r from-[#1a1408] to-[#2a1f0d] p-5 text-left transition hover:border-[#ffaa00]/50 hover:shadow-[0_0_20px_rgba(255,170,0,0.1)]"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded bg-[#ffaa00]/20 px-2 py-0.5 text-[10px] font-bold text-[#ffaa00]">현장 자동화</span>
                <span className="text-[10px] text-gray-600">LEVEL 1~2</span>
              </div>
              <span className="text-xs text-gray-600 opacity-0 transition group-hover:opacity-100">클릭하여 데모 →</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-4">
              <DiagramBox label="센서/IoT" sub="Gen3 스티커" color="#ffaa00" />
              <DiagramBox label="로봇" sub="자동화 설비" color="#ffaa00" />
              <DiagramBox label="물리 설비" sub="CNC, 프레스" color="#ffaa00" />
              <DiagramBox label="계측기" sub="온도, 진동" color="#ffaa00" />
            </div>
          </button>

          {/* Factory Guardian Agent — 우리의 포지션 */}
          <div className="relative">
            <div className="absolute -top-2 left-1/2 h-8 w-px -translate-x-1/2 bg-gradient-to-b from-transparent to-[#ff4444]" />
            <button
              onClick={() => onLayerClick("metal")}
              className="group w-full rounded-xl border-2 border-[#ff4444]/50 bg-gradient-to-r from-[#1a0808] via-[#2a0d0d] to-[#1a0808] p-5 text-center transition hover:border-[#ff4444] hover:shadow-[0_0_30px_rgba(255,68,68,0.15)]"
            >
              <div className="mb-2 flex items-center justify-center gap-2">
                <span className="animate-pulse text-lg">🤖</span>
                <span className="text-base font-black text-[#ff4444]">지능형 기술</span>
                <span className="animate-pulse text-lg">🤖</span>
              </div>
              <p className="text-sm font-bold text-white">Factory Guardian Agent</p>
              <p className="mt-1 text-xs text-gray-400">
                AI 예측 · 자율 최적화 · 디지털 트윈 · 대화형 보고서
              </p>
              <p className="mt-2 text-[10px] text-[#ff4444]">
                "스마트 시스템과의 연결" — 모든 레이어를 AI로 통합
              </p>
              <div className="mt-3 flex items-center justify-center gap-4 text-[10px]">
                <span className="rounded-full bg-[#ff4444]/10 px-3 py-1 text-[#ff4444]">👁️ 시각 AI</span>
                <span className="rounded-full bg-[#ff4444]/10 px-3 py-1 text-[#ff4444]">👂 청각 AI</span>
                <span className="rounded-full bg-[#ff4444]/10 px-3 py-1 text-[#ff4444]">🖐️ IoT 촉각</span>
              </div>
              <p className="mt-3 text-xs text-gray-600 opacity-0 transition group-hover:opacity-100">
                클릭하여 3D 데모 체험 →
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DiagramBox({
  label,
  sub,
  color,
  highlight,
  icon,
}: {
  label: string;
  sub: string;
  color: string;
  highlight?: boolean;
  icon?: string;
}) {
  return (
    <div
      className="rounded-lg border px-3 py-2 text-center transition"
      style={{
        borderColor: highlight ? color + "40" : "var(--border)",
        backgroundColor: highlight ? color + "08" : "transparent",
      }}
    >
      {icon && <span className="text-lg">{icon}</span>}
      <p className="text-xs font-semibold text-white">{label}</p>
      <p className="text-[10px] text-gray-500">{sub}</p>
    </div>
  );
}

function Arrow() {
  return (
    <span className="text-[10px] text-gray-600">↔</span>
  );
}

function FlowLine() {
  return (
    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
  );
}
