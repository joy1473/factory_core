"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "센서를 꼭 설치해야 하나요?",
    a: "아닙니다. 기존 폰 카메라와 마이크만으로도 시작할 수 있습니다. Gen3 IoT 스티커($1~2)를 추가하면 온도·습도·움직임까지 감지합니다. 기존 설비에 배선 작업 없이 붙이기만 하면 됩니다.",
  },
  {
    q: "오래된 설비에서도 호환되나요?",
    a: "네. 설비의 종류나 연식에 관계없이 사용 가능합니다. PLC나 MES 연동 없이 독립적으로 동작하며, 소리·진동·온도 등 물리적 신호를 AI가 분석합니다.",
  },
  {
    q: "인터넷이 불안정한 현장에서도 되나요?",
    a: "Edge AI 모드를 지원하여 인터넷 없이도 기본 이상 감지가 가능합니다. 인터넷 연결 시 클라우드에 데이터가 동기화되어 원격 모니터링과 상세 분석이 가능합니다.",
  },
  {
    q: "데이터 보안은 어떻게 되나요?",
    a: "모든 데이터는 암호화되어 전송·저장됩니다. 국내 클라우드(AWS 서울 리전)를 사용하며, 고객사 온프레미스 배포도 가능합니다.",
  },
  {
    q: "PoC는 어떻게 진행되나요?",
    a: "1) 무료 현장 진단 → 2) 핵심 설비 3~5대 선정 → 3) 8주간 PoC 운영 → 4) 결과 보고서 제출. 다운타임 20% 이상 감소 시 PoC 비용의 50%를 본계약 계약금으로 전환합니다.",
  },
  {
    q: "정부 지원사업과 연계 가능한가요?",
    a: "네. '제조AI특화 스마트공장 구축지원', '중소제조 특화 Multi AI Agent R&D', 'AI 응용제품 신속 상용화' 등 다양한 정부 지원사업과 연계하여 최대 40% 추가 할인이 가능합니다.",
  },
  {
    q: "도입 후 교육이 필요한가요?",
    a: "대화형 AI이기 때문에 별도 교육이 필요 없습니다. 키오스크에 '오늘 생산 현황 알려줘'라고 말하면 됩니다. 필요 시 1시간 온보딩 교육을 제공합니다.",
  },
];

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="border-t border-[var(--border)] bg-[#050508]">
      <div className="mx-auto max-w-3xl px-5 py-20">
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">
          FAQ
        </p>
        <h2 className="mb-12 text-center text-2xl font-bold text-white md:text-3xl">
          자주 묻는 질문
        </h2>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden"
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="flex w-full items-center justify-between p-5 text-left"
              >
                <span className="text-sm font-semibold text-white pr-4">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-gray-500 transition-transform ${openIdx === i ? "rotate-180" : ""}`}
                />
              </button>
              {openIdx === i && (
                <div className="border-t border-[var(--border)] px-5 pb-5 pt-3">
                  <p className="text-sm leading-relaxed text-gray-400">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
