import { AlertTriangle, Users, DollarSign, Database, Brain, Clock } from "lucide-react";

const PAIN_POINTS = [
  { icon: Users, value: "50.4%", label: "전문인력 부족", desc: "데이터 수집·분석 담당자 없음", color: "#ff4444" },
  { icon: DollarSign, value: "44.2%", label: "초기 비용 부담", desc: "스마트공장 평균 도입 비용 7.5억원", color: "#ffaa00" },
  { icon: AlertTriangle, value: "43.8%", label: "운영 인력 부족", desc: "전담 부서 보유 기업 19.5%뿐", color: "#ff6644" },
  { icon: Database, value: "60.8%", label: "데이터는 수집하지만", desc: "AI로 활용하는 기업은 0.1%", color: "#00d4ff" },
  { icon: Brain, value: "0.8%", label: "AI 전담인력 보유", desc: "162개사 중 1개사만 AI 인력 보유", color: "#aa88ff" },
  { icon: Clock, value: "주 8시간", label: "보고서 수작업", desc: "엑셀로 끙끙 앓는 시간", color: "#ff88aa" },
];

export function PainPointSection() {
  return (
    <section className="border-t border-[var(--border)] bg-[#050508]">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-[#ff4444]">
          Pain Points
        </p>
        <h2 className="mb-4 text-center text-2xl font-bold text-white md:text-3xl">
          중소 제조기업이 겪고 있는 현실
        </h2>
        <p className="mx-auto mb-12 max-w-lg text-center text-sm text-gray-500">
          2024 스마트제조혁신 실태조사 | 5,000개사 대면조사 기반
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PAIN_POINTS.map((p) => (
            <div
              key={p.label}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 transition hover:border-opacity-50"
            >
              <div className="mb-3 flex items-center gap-3">
                <p.icon size={20} style={{ color: p.color }} />
                <span className="text-2xl font-black" style={{ color: p.color }}>
                  {p.value}
                </span>
              </div>
              <h3 className="mb-1 text-sm font-bold text-white">{p.label}</h3>
              <p className="text-xs text-gray-500">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
