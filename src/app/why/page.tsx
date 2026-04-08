import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { PainPointSection } from "@/components/solution/sections/pain-point-section";
import { BeforeAfterSection } from "@/components/solution/sections/before-after-section";
import { ComparisonSection } from "@/components/solution/sections/comparison-section";
import { CtaSection } from "@/components/public/cta-section";
import Link from "next/link";
import { Eye, Ear, Hand } from "lucide-react";

export const metadata = {
  title: "왜 Factory Guardian인가? | Factory Core",
  description:
    "중소 제조기업의 현실과 Factory Guardian Agent의 차별화. 시장 데이터 기반 분석.",
};

export default function WhyPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="border-b border-[var(--border)] bg-gradient-to-b from-[#0a0a0a] to-[#050508]">
          <div className="mx-auto max-w-4xl px-5 pb-16 pt-24 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">
              Why Factory Guardian?
            </p>
            <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              왜 Factory Guardian인가?
            </h1>
            <p className="mx-auto max-w-lg text-gray-400">
              중소 제조기업의 현실을 데이터로 진단하고,
              기존 솔루션과의 차별점을 보여드립니다.
            </p>
          </div>
        </section>

        <PainPointSection />

        {/* 3 Senses */}
        <section className="border-t border-[var(--border)]">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <h2 className="mb-12 text-center text-2xl font-bold text-white">
              세 가지 감각으로 설비를 감시합니다
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border border-[var(--primary)]/20 bg-[var(--surface)] p-8">
                <Eye className="mb-4 h-10 w-10 text-[var(--primary)]" />
                <h3 className="mb-3 text-lg font-bold text-white">시각 AI</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>스마트 글래스 / 폰 카메라</li>
                  <li>실시간 결함 감지 (균열, 누유, 변색)</li>
                  <li>AR 오버레이로 점검 가이드</li>
                  <li>점검일지 사진 자동 기록</li>
                </ul>
              </div>
              <div className="rounded-xl border border-[var(--secondary)]/20 bg-[var(--surface)] p-8">
                <Ear className="mb-4 h-10 w-10 text-[var(--secondary)]" />
                <h3 className="mb-3 text-lg font-bold text-white">청각 AI</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>마이크로 설비 소리 분석</li>
                  <li>베어링/모터 이상음 자동 판별</li>
                  <li>센서 비용 0원 (마이크만 사용)</li>
                  <li>시끄러운 환경에서도 AI 필터링</li>
                </ul>
              </div>
              <div className="rounded-xl border border-[var(--accent)]/20 bg-[var(--surface)] p-8">
                <Hand className="mb-4 h-10 w-10 text-[var(--accent)]" />
                <h3 className="mb-3 text-lg font-bold text-white">촉각 IoT</h3>
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

        <BeforeAfterSection />
        <ComparisonSection />

        {/* Link to demo + pricing */}
        <section className="border-t border-[var(--border)]">
          <div className="mx-auto max-w-4xl px-5 py-16">
            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href="/solution"
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 transition hover:border-[var(--primary)]/30"
              >
                <p className="text-base font-bold text-[var(--primary)]">
                  3D 인터랙티브 데모 →
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  스크롤로 체험하는 Factory Guardian Agent
                </p>
              </Link>
              <Link
                href="/pricing"
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 transition hover:border-[var(--secondary)]/30"
              >
                <p className="text-base font-bold text-[var(--secondary)]">
                  가격 및 도입 안내 →
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  PoC · SaaS · 정부 지원사업
                </p>
              </Link>
            </div>
          </div>
        </section>

        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
