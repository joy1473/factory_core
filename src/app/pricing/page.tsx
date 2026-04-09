import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { PricingSection } from "@/components/solution/sections/pricing-section";
import { FaqSection } from "@/components/solution/sections/faq-section";
import { CtaSection } from "@/components/public/cta-section";
import { Shield, Award, Building2 } from "lucide-react";

export const metadata = {
  title: "가격 안내 | Factory Core",
  description: "Factory Guardian Agent 가격 구조. 무료 상담, PoC, SaaS 구독.",
};

const GOV_PROGRAMS = [
  {
    name: "제조AI특화 스마트공장 (자율형공장 AI트랙)",
    desc: "AI에이전트, 예측유지보수 구축비 지원",
    match: "정확히 매칭",
  },
  {
    name: "중소제조 특화 Multi AI Agent R&D",
    desc: "컨소시엄 기반 R&D 비용 지원",
    match: "매칭 가능",
  },
  {
    name: "AI 응용제품 신속 상용화",
    desc: "AI 제품 상용화 비용 지원",
    match: "매칭 가능",
  },
  {
    name: "도약(Jump-Up) 프로그램",
    desc: "스마트공장 구축 지원",
    match: "연계 가능",
  },
];

export default function PricingPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="border-b border-[var(--border)] bg-gradient-to-b from-[var(--background)] to-[var(--surface)]">
          <div className="mx-auto max-w-4xl px-5 pb-16 pt-24 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--secondary)]">
              Pricing
            </p>
            <h1 className="mb-4 text-3xl font-bold text-[var(--foreground)] md:text-4xl">
              가격 및 도입 안내
            </h1>
            <p className="mx-auto max-w-lg text-gray-400">
              7.5억 초기 투자 없이, 효과를 먼저 확인하고 결정하세요.
              정부 지원사업으로 추가 할인 가능합니다.
            </p>
          </div>
        </section>

        <PricingSection />

        {/* Government Support */}
        <section className="border-t border-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto max-w-4xl px-5 py-20">
            <div className="mb-10 text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
                Government Support
              </p>
              <h2 className="mb-4 text-2xl font-bold text-[var(--foreground)]">
                정부가 비용을 줄여드립니다
              </h2>
              <p className="text-sm text-gray-500">
                최대 40% 추가 할인 가능한 정부 지원사업
              </p>
            </div>

            <div className="space-y-3">
              {GOV_PROGRAMS.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
                >
                  <div className="flex items-start gap-3">
                    <Building2 size={18} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.desc}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-[var(--accent)]/10 px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                    {p.match}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 text-center">
                <Shield size={24} className="mx-auto mb-2 text-[var(--primary)]" />
                <p className="text-sm font-semibold text-[var(--foreground)]">성과 보장</p>
                <p className="mt-1 text-xs text-gray-500">
                  다운타임 20%+ 감소 시<br />PoC 비용 50% 본계약 전환
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 text-center">
                <Award size={24} className="mx-auto mb-2 text-[var(--secondary)]" />
                <p className="text-sm font-semibold text-[var(--foreground)]">정부 연계 할인</p>
                <p className="mt-1 text-xs text-gray-500">
                  지원사업 매칭 시<br />최대 40% 추가 할인
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 text-center">
                <Building2 size={24} className="mx-auto mb-2 text-[var(--accent)]" />
                <p className="text-sm font-semibold text-[var(--foreground)]">유연한 계약</p>
                <p className="mt-1 text-xs text-gray-500">
                  월/연 구독 선택<br />언제든 해지 가능
                </p>
              </div>
            </div>
          </div>
        </section>

        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
