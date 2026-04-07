import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="border-y border-[var(--border)]">
      <div className="mx-auto max-w-6xl px-5 py-20 text-center">
        <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">
          지금 바로 시작하세요
        </h2>
        <p className="mx-auto mb-8 max-w-lg text-gray-400">
          무료 현장 진단 + PoC 제안까지. 부담 없이 상담받아 보세요.
          <br />
          다운타임 20% 이상 감소 시, PoC 비용의 50%를 본계약으로 전환해
          드립니다.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
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
            href="/contact"
            className="rounded-xl border border-[var(--border)] px-8 py-3.5 text-base font-semibold text-gray-300 transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            일반 문의
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <div>
            <div className="text-2xl font-black text-[var(--primary)]">
              8주
            </div>
            <div className="text-sm text-gray-500">PoC 기간</div>
          </div>
          <div>
            <div className="text-2xl font-black text-[var(--secondary)]">
              3~5대
            </div>
            <div className="text-sm text-gray-500">핵심 설비 대상</div>
          </div>
          <div>
            <div className="text-2xl font-black text-[var(--accent)]">
              50%
            </div>
            <div className="text-sm text-gray-500">성과 시 본계약 전환</div>
          </div>
        </div>
      </div>
    </section>
  );
}
