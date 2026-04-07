import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { ContactForm } from "@/components/public/contact-form";
import { CheckCircle } from "lucide-react";

export const metadata = {
  title: "PoC 신청 | Factory Core",
  description:
    "Factory Guardian Agent 무료 PoC를 신청하세요. 8주간 핵심 설비 3~5대를 대상으로 AI 설비관리를 체험합니다.",
};

const BENEFITS = [
  "핵심 설비 3~5대 대상 8주 PoC",
  "Gen3 IoT 스티커 + 웨어러블 연동",
  "실시간 이상감지 + 자동 보고서",
  "다운타임 20%+ 감소 시 본계약 50% 전환",
  "정부 지원사업 연계 시 추가 할인",
];

export default function PocPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-5 py-20">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">
            Proof of Concept
          </p>
          <h1 className="mb-4 text-3xl font-bold text-white">
            무료 PoC 신청
          </h1>
          <p className="text-gray-400">
            부담 없이 시작하세요. 효과를 먼저 확인하고 결정하실 수 있습니다.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <h3 className="mb-4 text-base font-bold text-white">
                PoC 포함 사항
              </h3>
              <ul className="space-y-3">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex gap-2 text-sm text-gray-400">
                    <CheckCircle
                      size={16}
                      className="mt-0.5 shrink-0 text-[var(--secondary)]"
                    />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="md:col-span-3">
            <ContactForm type="poc" title="PoC 신청서" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
