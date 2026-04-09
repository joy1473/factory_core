import { ArrowRight } from "lucide-react";

const COMPARISONS = [
  { item: "설비 감시", before: "사람이 순회 점검", after: "AI 24시간 자동 감시" },
  { item: "이상 감지", before: "고장 후 발견", after: "고장 전 예측" },
  { item: "보고서", before: "Excel 수작업 (주 8시간)", after: "자동 생성 (0.3초)" },
  { item: "초기 비용", before: "7.5억원 (MES)", after: "0원 (월 구독)" },
  { item: "설치 기간", before: "3~6개월", after: "30분" },
  { item: "전문인력", before: "필수 (0.8%만 보유)", after: "불필요" },
  { item: "센서 비용", before: "수백만원", after: "$1 스티커" },
];

export function BeforeAfterSection() {
  return (
    <section className="border-t border-[var(--border)]">
      <div className="mx-auto max-w-4xl px-5 py-20">
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">
          Before → After
        </p>
        <h2 className="mb-12 text-center text-2xl font-bold text-white md:text-3xl">
          Factory Guardian이 바꿔드립니다
        </h2>

        <div className="overflow-hidden rounded-xl border border-[var(--border)]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                <th className="p-4 text-left text-xs font-semibold text-gray-400">항목</th>
                <th className="p-4 text-left text-xs font-semibold text-[#ff4444]">현재</th>
                <th className="p-4 text-center text-xs text-gray-600"><ArrowRight size={14} /></th>
                <th className="p-4 text-left text-xs font-semibold text-[var(--secondary)]">도입 후</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISONS.map((c, i) => (
                <tr key={c.item} className={`border-b border-[var(--border)]/30 ${i % 2 === 0 ? "bg-[var(--background)]" : ""}`}>
                  <td className="p-4 text-sm font-semibold text-white">{c.item}</td>
                  <td className="p-4 text-sm text-gray-400">{c.before}</td>
                  <td className="p-4 text-center text-gray-600">→</td>
                  <td className="p-4 text-sm font-semibold text-[var(--secondary)]">{c.after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
