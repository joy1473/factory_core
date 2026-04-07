import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { SolutionOverview } from "@/components/public/solution-overview";
import { CtaSection } from "@/components/public/cta-section";
import { Eye, Ear, Hand, Cpu, BarChart3, Shield } from "lucide-react";

export const metadata = {
  title: "솔루션 | Factory Guardian Agent | Factory Core",
  description:
    "멀티모달 AI 기반 Agentic AI 솔루션. 시각·청각·IoT 센서로 설비를 24시간 감시하고 자동 보고서를 생성합니다.",
};

const FLOW = [
  {
    icon: Eye,
    step: "01",
    title: "데이터 수집",
    desc: "스마트 글래스 카메라, 마이크, Gen3 IoT 스티커가 설비 상태를 실시간 수집합니다.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI 분석",
    desc: "멀티모달 AI가 시각·청각·IoT 데이터를 통합 분석하여 이상 징후를 판별합니다.",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "알림 + 보고",
    desc: "이상 발생 시 즉각 알림, 자동 보고서 생성, 예측 유지보수 일정을 제안합니다.",
  },
  {
    icon: Shield,
    step: "04",
    title: "사후 학습",
    desc: "처리 결과를 학습하여 예측 정확도가 지속적으로 향상됩니다.",
  },
];

export default function SolutionPage() {
  return (
    <>
      <Header />
      <main>
        <section className="mx-auto max-w-6xl px-5 py-20">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">
            How It Works
          </p>
          <h1 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
            Factory Guardian Agent
          </h1>
          <p className="mx-auto mb-16 max-w-xl text-center text-gray-400">
            작업자가 안전장비만 착용하면, AI가 자동으로 눈과 귀가 되어 설비를
            24시간 감시합니다.
          </p>

          <div className="grid gap-8 md:grid-cols-4">
            {FLOW.map((f, i) => (
              <div key={f.step} className="relative text-center">
                {i < FLOW.length - 1 && (
                  <div className="pointer-events-none absolute right-0 top-8 hidden h-px w-full translate-x-1/2 bg-gradient-to-r from-[var(--primary)]/30 to-transparent md:block" />
                )}
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                  <f.icon className="h-7 w-7 text-[var(--primary)]" />
                </div>
                <div className="mb-2 text-xs font-bold text-[var(--primary)]">
                  STEP {f.step}
                </div>
                <h3 className="mb-2 text-base font-bold text-white">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3 Senses Detail */}
        <section className="border-y border-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <h2 className="mb-12 text-center text-2xl font-bold text-white">
              멀티모달 AI — 세 가지 감각
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-xl border border-[var(--primary)]/20 bg-[var(--background)] p-8">
                <Eye className="mb-4 h-10 w-10 text-[var(--primary)]" />
                <h3 className="mb-3 text-lg font-bold text-white">
                  시각 AI (눈)
                </h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>스마트 글래스 / 폰 카메라</li>
                  <li>실시간 결함 감지 (균열, 누유, 변색)</li>
                  <li>AR 오버레이로 점검 가이드</li>
                  <li>점검일지 사진 자동 기록</li>
                </ul>
              </div>
              <div className="rounded-xl border border-[var(--secondary)]/20 bg-[var(--background)] p-8">
                <Ear className="mb-4 h-10 w-10 text-[var(--secondary)]" />
                <h3 className="mb-3 text-lg font-bold text-white">
                  청각 AI (귀)
                </h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>마이크로 설비 소리 분석</li>
                  <li>베어링/모터 이상음 자동 판별</li>
                  <li>센서 비용 0원 (마이크만 사용)</li>
                  <li>시끄러운 환경에서도 AI 필터링</li>
                </ul>
              </div>
              <div className="rounded-xl border border-[var(--accent)]/20 bg-[var(--background)] p-8">
                <Hand className="mb-4 h-10 w-10 text-[var(--accent)]" />
                <h3 className="mb-3 text-lg font-bold text-white">
                  촉각 IoT (감각)
                </h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>Gen3 IoT Pixel 스티커 센서</li>
                  <li>배터리 없음 — 붙이기만 하면 끝</li>
                  <li>온도·습도·움직임·체류시간</li>
                  <li>개당 $1~2 — 극저비용</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <SolutionOverview />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
