import { Check, X, Minus } from "lucide-react";

const FEATURES = [
  { name: "초기 비용", ours: "0원 (PoC 무료)", them1: "7.5억+", them2: "수천만원" },
  { name: "월 비용", ours: "월 구독형", them1: "유지보수비", them2: "구독료" },
  { name: "설치 기간", ours: "30분", them1: "3~6개월", them2: "2~4주" },
  { name: "센서", ours: "$1 스티커 or 기존기기", them1: "전용 센서 필수", them2: "진동 센서 필수" },
  { name: "AI 전문가", ours: "불필요", them1: "필수", them2: "필수" },
  { name: "보고서", ours: "대화형 자동 생성", them1: "수동", them2: "반자동" },
  { name: "대화형 AI", ours: true, them1: false, them2: false },
  { name: "웨어러블 연동", ours: true, them1: false, them2: false },
  { name: "대상 기업", ours: "중소기업", them1: "대기업", them2: "중견기업" },
];

function CellIcon({ value }: { value: string | boolean }) {
  if (value === true) return <Check size={16} className="text-[var(--secondary)]" />;
  if (value === false) return <X size={16} className="text-gray-600" />;
  return <span>{value}</span>;
}

export function ComparisonSection() {
  return (
    <section className="border-t border-[var(--border)] bg-[#050508]">
      <div className="mx-auto max-w-5xl px-5 py-20">
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">
          Comparison
        </p>
        <h2 className="mb-12 text-center text-2xl font-bold text-white md:text-3xl">
          왜 Factory Guardian인가?
        </h2>

        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                <th className="p-4 text-left text-xs text-gray-400">기능</th>
                <th className="p-4 text-center">
                  <span className="rounded-lg bg-[var(--primary)]/10 px-3 py-1 text-xs font-bold text-[var(--primary)]">
                    Factory Guardian
                  </span>
                </th>
                <th className="p-4 text-center text-xs text-gray-500">기존 MES</th>
                <th className="p-4 text-center text-xs text-gray-500">예측유지보수 솔루션</th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((f, i) => (
                <tr key={f.name} className={`border-b border-[var(--border)]/30 ${i % 2 === 0 ? "bg-[var(--background)]" : ""}`}>
                  <td className="p-4 text-sm font-semibold text-white">{f.name}</td>
                  <td className="p-4 text-center text-sm font-semibold text-[var(--secondary)]">
                    <CellIcon value={f.ours} />
                  </td>
                  <td className="p-4 text-center text-sm text-gray-500">
                    <CellIcon value={f.them1} />
                  </td>
                  <td className="p-4 text-center text-sm text-gray-500">
                    <CellIcon value={f.them2} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
