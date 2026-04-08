"use client";

import dynamic from "next/dynamic";
import { Header } from "@/components/public/header";
import Link from "next/link";

const FactoryScene = dynamic(
  () =>
    import("@/components/solution/scene/factory-scene").then(
      (m) => m.FactoryScene
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#00ff41] border-t-transparent" />
          <p className="text-sm text-gray-500">3D 씬 로딩 중...</p>
        </div>
      </div>
    ),
  }
);

export default function SolutionPage() {
  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-50">
        <Header />
      </div>

      <FactoryScene />

      {/* Bottom nav — after 3D scroll */}
      <div className="relative z-20 bg-[#0a0a0a]">
        <div className="h-16 bg-gradient-to-b from-transparent to-[#0a0a0a]" />
        <div className="mx-auto max-w-4xl px-5 py-16 text-center">
          <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">
            더 알아보기
          </h2>
          <p className="mb-8 text-gray-500">
            Factory Guardian Agent에 대해 더 자세히 알아보세요
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/why"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-8 py-5 text-left transition hover:border-[var(--primary)]/30 sm:w-auto"
            >
              <p className="text-sm font-bold text-[var(--primary)]">왜 Factory Guardian인가?</p>
              <p className="mt-1 text-xs text-gray-500">시장 현실 · 비교 분석 · 차별화</p>
            </Link>
            <Link
              href="/pricing"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-8 py-5 text-left transition hover:border-[var(--secondary)]/30 sm:w-auto"
            >
              <p className="text-sm font-bold text-[var(--secondary)]">가격 및 도입 안내</p>
              <p className="mt-1 text-xs text-gray-500">PoC · SaaS · 정부 지원</p>
            </Link>
            <Link
              href="/poc"
              className="w-full rounded-xl bg-[var(--primary)] px-8 py-5 text-left transition hover:brightness-110 sm:w-auto"
            >
              <p className="text-sm font-bold text-black">무료 PoC 신청</p>
              <p className="mt-1 text-xs text-black/60">8주 체험 · 성과 기반</p>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
