import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { Building2, MapPin, Mail, Phone, FileText } from "lucide-react";

export const metadata = {
  title: "회사 소개 | Factory Core - 조이텍",
  description: "조이텍(JOYTEC) 회사 소개. 스마트팩토리 Agentic AI 솔루션 Factory Core를 개발합니다.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-5 py-20">
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">
          About Us
        </p>
        <h1 className="mb-10 text-center text-3xl font-bold text-white">
          회사 소개
        </h1>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]">
              <Building2 className="h-6 w-6 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">조이텍 (JOYTEC)</h2>
              <p className="text-sm text-gray-400">
                스마트팩토리 Agentic AI 솔루션
              </p>
            </div>
          </div>

          <div className="mb-8 text-sm leading-relaxed text-gray-300">
            <p className="mb-4">
              조이텍은 2005년 설립 이래 IT 기술 기반의 솔루션을 개발해온
              기업입니다. 현재는 중소 제조기업을 위한 AI 기반 설비관리 솔루션
              &quot;Factory Core&quot;를 개발하고 있습니다.
            </p>
            <p>
              Factory Core는 Gen3 IoT 센서와 웨어러블 디바이스를 활용하여
              제조 현장의 설비 상태를 실시간으로 감시하고, Agentic AI가
              이상 감지부터 보고서 생성까지 자동으로 처리하는 솔루션입니다.
            </p>
          </div>

          <h3 className="mb-4 text-base font-semibold text-white">
            사업자 정보
          </h3>
          <div className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-5">
            <div className="flex items-center gap-3 text-sm">
              <Building2 size={16} className="shrink-0 text-[var(--primary)]" />
              <span className="text-gray-400">상호:</span>
              <span className="text-white">조이텍 (JOYTEC)</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <FileText size={16} className="shrink-0 text-[var(--primary)]" />
              <span className="text-gray-400">대표:</span>
              <span className="text-white">조은아</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <FileText size={16} className="shrink-0 text-[var(--primary)]" />
              <span className="text-gray-400">사업자등록번호:</span>
              <span className="text-white">110-11-23776</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin size={16} className="shrink-0 text-[var(--primary)]" />
              <span className="text-gray-400">주소:</span>
              <span className="text-white">
                서울특별시 강서구 양천로49길 39-59, 203호
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail size={16} className="shrink-0 text-[var(--primary)]" />
              <span className="text-gray-400">이메일:</span>
              <a
                href="mailto:joytec@naver.com"
                className="text-[var(--primary)] hover:underline"
              >
                joytec@naver.com
              </a>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone size={16} className="shrink-0 text-[var(--primary)]" />
              <span className="text-gray-400">전화:</span>
              <a
                href="tel:010-2648-6726"
                className="text-[var(--primary)] hover:underline"
              >
                010-2648-6726
              </a>
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-600">
            <p>설립일: 2005년 4월 27일</p>
            <p>
              홈페이지:{" "}
              <a
                href="https://joy.it.kr"
                className="text-[var(--primary)] hover:underline"
              >
                https://joy.it.kr
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
