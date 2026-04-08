import { Check } from "lucide-react";
import Link from "next/link";

const PLANS = [
  {
    name: "무료 상담",
    price: "0원",
    desc: "현장 방문 + 진단",
    features: ["현장 설비 진단", "AI 적용 가능성 분석", "맞춤 제안서 제공"],
    cta: "상담 신청",
    href: "/contact",
    highlight: false,
  },
  {
    name: "PoC (8주)",
    price: "협의",
    desc: "핵심 설비 3~5대",
    features: [
      "Gen3 IoT 스티커 설치",
      "웨어러블 연동 세트",
      "키오스크 대시보드",
      "8주 운영 지원 + 교육",
      "성과 시 50% 본계약 전환",
    ],
    cta: "PoC 신청",
    href: "/poc",
    highlight: true,
  },
  {
    name: "SaaS 구독",
    price: "월 구독",
    desc: "설비 무제한",
    features: [
      "모든 설비 실시간 감시",
      "대화형 AI 보고서",
      "카카오 알림 연동",
      "월간/연간 구독 선택",
      "정부 지원사업 연계 할인",
    ],
    cta: "문의하기",
    href: "/contact",
    highlight: false,
  },
];

export function PricingSection() {
  return (
    <section className="border-t border-[var(--border)]">
      <div className="mx-auto max-w-5xl px-5 py-20">
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">
          Pricing
        </p>
        <h2 className="mb-4 text-center text-2xl font-bold text-white md:text-3xl">
          투명한 가격 구조
        </h2>
        <p className="mx-auto mb-12 max-w-md text-center text-sm text-gray-500">
          7.5억 초기 투자 없이, 효과를 먼저 확인하고 결정하세요
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-6 ${
                plan.highlight
                  ? "border-[var(--primary)] bg-[var(--primary)]/5"
                  : "border-[var(--border)] bg-[var(--surface)]"
              }`}
            >
              {plan.highlight && (
                <p className="mb-3 text-center text-xs font-bold text-[var(--primary)]">
                  추천
                </p>
              )}
              <h3 className="mb-1 text-lg font-bold text-white">{plan.name}</h3>
              <p className="mb-1 text-2xl font-black text-[var(--primary)]">
                {plan.price}
              </p>
              <p className="mb-4 text-xs text-gray-500">{plan.desc}</p>
              <ul className="mb-6 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check size={14} className="mt-0.5 shrink-0 text-[var(--secondary)]" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`block rounded-lg py-2.5 text-center text-sm font-bold transition ${
                  plan.highlight
                    ? "bg-[var(--primary)] text-black hover:brightness-110"
                    : "border border-[var(--border)] text-gray-300 hover:border-[var(--primary)] hover:text-[var(--primary)]"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
