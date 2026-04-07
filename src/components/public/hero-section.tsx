import Link from "next/link";
import { ArrowRight, Eye, Ear, Hand } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(0,212,255,0.08),transparent_70%)]" />

      <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-24 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 text-xs text-gray-400">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--secondary)] animate-pulse" />
          스마트팩토리 Agentic AI 솔루션
        </div>

        <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight md:text-6xl">
          <span className="text-[var(--foreground)]">공장에 </span>
          <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
            AI 공장장
          </span>
          <span className="text-[var(--foreground)]">을</span>
          <br />
          <span className="text-[var(--foreground)]">고용하세요</span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-400">
          센서 없이, MES 없이, 30분 만에 시작.
          <br />
          작업자가 안전장비만 착용하면, AI가 자동으로 눈과 귀가 되어
          <br className="hidden md:block" />
          설비를 24시간 감시하고, 보고서까지 자동으로 만들어드립니다.
        </p>

        <div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/poc"
            className="group flex items-center gap-2 rounded-xl bg-[var(--primary)] px-8 py-3.5 text-base font-bold text-black transition hover:brightness-110"
          >
            무료 PoC 신청
            <ArrowRight
              size={18}
              className="transition group-hover:translate-x-1"
            />
          </Link>
          <Link
            href="/solution"
            className="rounded-xl border border-[var(--border)] px-8 py-3.5 text-base font-semibold text-gray-300 transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            솔루션 자세히 보기
          </Link>
        </div>

        {/* 3 Senses */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-left transition hover:border-[var(--primary)]/30">
            <Eye className="mb-3 h-8 w-8 text-[var(--primary)]" />
            <h3 className="mb-1 font-bold text-white">시각 AI</h3>
            <p className="text-sm text-gray-500">
              스마트 글래스 + 카메라로 설비 상태를 자동 판별. 균열, 누유, 변색을
              즉시 감지합니다.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-left transition hover:border-[var(--secondary)]/30">
            <Ear className="mb-3 h-8 w-8 text-[var(--secondary)]" />
            <h3 className="mb-1 font-bold text-white">청각 AI</h3>
            <p className="text-sm text-gray-500">
              마이크로 설비 소리를 분석. &quot;이 소리면 베어링 교체
              시기&quot;를 AI가 판별합니다.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-left transition hover:border-[var(--accent)]/30">
            <Hand className="mb-3 h-8 w-8 text-[var(--accent)]" />
            <h3 className="mb-1 font-bold text-white">촉각 IoT</h3>
            <p className="text-sm text-gray-500">
              $1 스티커 센서로 온도·습도·진동을 감지. 배터리 없이 붙이기만 하면
              됩니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
