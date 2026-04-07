const STATS = [
  {
    num: "163,273",
    label: "공장 보유 중소·중견 기업",
    sub: "2024 스마트제조혁신 실태조사",
  },
  {
    num: "0.1%",
    label: "제조AI 도입률",
    sub: "AI 전담인력 보유 기업 0.8%",
  },
  {
    num: "80.5%",
    label: "스마트공장 미도입",
    sub: "131,491개사 = 잠재 시장",
  },
  {
    num: "44.2%",
    label: "최대 장벽: 비용",
    sub: "평균 도입 비용 7.5억원",
  },
];

export function StatsSection() {
  return (
    <section className="border-y border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">
          Market Data
        </p>
        <h2 className="mb-10 text-center text-2xl font-bold text-white md:text-3xl">
          중소 제조현장, 아직 AI가 도달하지 못했습니다
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6 text-center"
            >
              <div className="mb-1 text-3xl font-black text-[var(--primary)]">
                {s.num}
              </div>
              <div className="text-sm font-semibold text-white">{s.label}</div>
              <div className="mt-1 text-xs text-gray-500">{s.sub}</div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-gray-600">
          출처: 중소벤처기업부·스마트제조혁신추진단 「2024 스마트제조혁신
          실태조사」 (5,000개사 대면조사)
        </p>
      </div>
    </section>
  );
}
