import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import Link from "next/link";

const STATS = [
  { value: "19.5%", label: "스마트공장 도입률", sub: "163,273개 중소·중견 제조기업 중" },
  { value: "28.5%", label: "평균 생산성 향상", sub: "스마트팩토리 도입 기업 기준" },
  { value: "90.2%", label: "사업 만족도", sub: "2024 상생형 스마트공장 구축기업" },
  { value: "54.6%", label: "정부지원 참여 의향", sub: "미도입 기업 대상 조사" },
];

const EFFECTS = [
  { icon: "📈", value: "28.5%", label: "생산성 증가", desc: "산업연구원 스마트팩토리 도입 기업 성과분석 결과" },
  { icon: "🔧", value: "43.1%", label: "품질향상·불량률 감소", desc: "구축기업 응답 기준, 품질 관련 개선 체감률" },
  { icon: "💰", value: "47.6%", label: "매출 증가 응답", desc: "스마트공장 도입 후 매출 증가 체감 기업 비율" },
  { icon: "👷", value: "33.3%", label: "고용 증가", desc: "스마트공장 도입 후 고용이 증가했다고 응답한 기업" },
  { icon: "🛡️", value: "48.8%", label: "작업환경·안전 개선", desc: "가장 높은 체감 효과: 산업안전 향상" },
  { icon: "📦", value: "40.7%", label: "재고관리 효율화", desc: "공급망 및 재고 관리 효율성 향상 응답률" },
];

const CASES = [
  {
    company: "A 자동차부품 제조사",
    industry: "자동차부품",
    size: "50인",
    before: "수기 품질 기록, 설비 고장 시 2일 정지",
    after: "IoT 센서 + MES 도입",
    results: ["생산성 30% 향상", "불량률 0.5% → 0.1%", "설비 가동률 85% → 96%"],
    source: "대·중소 상생형 스마트공장 우수사례",
    sourceUrl: "https://www.kbmaeil.com/article/20251112500096",
  },
  {
    company: "B 금형 가공업체",
    industry: "금형/CNC",
    size: "30인",
    before: "엑셀 생산관리, 납기 지연 빈번",
    after: "스마트공장 기초 단계 도입 (바코드 + POP)",
    results: ["납기 준수율 70% → 95%", "재공재고 40% 감소", "야근 60% 감소"],
    source: "중소벤처기업부 스마트공장 사업성과 보고서",
    sourceUrl: "https://www.mss.go.kr/site/smba/foffice/ex/linkage/linkageList.do?target=R002",
  },
  {
    company: "C 전자부품 업체",
    industry: "전자/반도체",
    size: "80인",
    before: "AOI 검사 데이터 수작업 분석",
    after: "AI 비전검사 + 데이터 자동 수집",
    results: ["검사 시간 50% 단축", "불량 유출 90% 감소", "연간 2억원 품질비용 절감"],
    source: "스마트제조혁신 추진단 발표자료",
    sourceUrl: "https://www.smart-factory.kr/",
  },
  {
    company: "D 식품 제조사",
    industry: "식품",
    size: "120인",
    before: "온습도 수기 기록, HACCP 서류 작업 과다",
    after: "IoT 환경센서 + 자동 HACCP 기록",
    results: ["서류 작업 80% 감소", "식품안전 사고 0건", "에너지 비용 15% 절감"],
    source: "스마트공장 우수사례집",
    sourceUrl: "https://www.smart-factory.kr/",
  },
];

const PAIN_POINTS = [
  { value: "44.2%", label: "비용 부담", desc: "AI 도입 시 가장 큰 어려움" },
  { value: "43.8%", label: "전문인력 부족", desc: "운영 시 가장 큰 어려움" },
  { value: "25.9%", label: "유지비용", desc: "도입 후 운영 어려움 2위" },
  { value: "68.9%", label: "1억 이하 투자 의향", desc: "투자 가능 금액 응답" },
];

export default function CasesPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="border-b border-[var(--border)] bg-gradient-to-b from-[var(--background)] to-[var(--surface)]">
          <div className="mx-auto max-w-4xl px-5 pb-16 pt-24 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--corebot-core)]">
              Industry Data & Cases
            </p>
            <h1 className="mb-4 text-3xl font-bold text-[var(--foreground)] md:text-4xl">
              스마트공장, 숫자로 증명합니다
            </h1>
            <p className="mx-auto max-w-lg text-gray-500">
              2024년 스마트제조혁신 실태조사(5,000개사) 및 정부 공식 데이터 기반
            </p>
          </div>
        </section>

        {/* 핵심 통계 */}
        <section className="border-b border-[var(--border)]">
          <div className="mx-auto max-w-5xl px-5 py-16">
            <div className="grid gap-4 sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
                  <p className="text-3xl font-black text-[var(--corebot-core)]">{s.value}</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{s.label}</p>
                  <p className="mt-1 text-[10px] text-gray-500">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 도입 효과 6가지 */}
        <section className="border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto max-w-5xl px-5 py-16">
            <h2 className="mb-2 text-center text-2xl font-bold text-[var(--foreground)]">도입 효과</h2>
            <p className="mb-10 text-center text-sm text-gray-500">스마트공장 구축기업이 체감한 실제 성과</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {EFFECTS.map((e) => (
                <div key={e.label} className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="text-2xl">{e.icon}</span>
                    <span className="text-2xl font-black text-[var(--corebot-core)]">{e.value}</span>
                  </div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">{e.label}</p>
                  <p className="mt-1 text-xs text-gray-500">{e.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 업종별 사례 */}
        <section className="border-b border-[var(--border)]">
          <div className="mx-auto max-w-5xl px-5 py-16">
            <h2 className="mb-2 text-center text-2xl font-bold text-[var(--foreground)]">업종별 도입 사례</h2>
            <p className="mb-10 text-center text-sm text-gray-500">정부 지원사업 참여 기업의 실제 성과 (익명 처리)</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {CASES.map((c) => (
                <div key={c.company} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-[var(--foreground)]">{c.company}</p>
                      <p className="text-[10px] text-gray-500">{c.industry} · {c.size}</p>
                    </div>
                    <span className="rounded-full bg-[var(--corebot-core)]/10 px-2.5 py-1 text-[10px] font-semibold text-[var(--corebot-core)]">
                      {c.industry}
                    </span>
                  </div>
                  <div className="mb-3 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="mb-1 font-semibold text-[var(--danger)]">Before</p>
                      <p className="text-gray-500">{c.before}</p>
                    </div>
                    <div>
                      <p className="mb-1 font-semibold text-[var(--corebot-core)]">After</p>
                      <p className="text-gray-500">{c.after}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {c.results.map((r) => (
                      <p key={r} className="flex items-center gap-2 text-xs text-[var(--foreground)]">
                        <span className="text-[var(--corebot-core)]">✓</span> {r}
                      </p>
                    ))}
                  </div>
                  <p className="mt-3 text-[9px] text-gray-600">출처: <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">{c.source}</a></p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pain Points — Factory Core가 해결 */}
        <section className="border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto max-w-4xl px-5 py-16">
            <h2 className="mb-2 text-center text-2xl font-bold text-[var(--foreground)]">그래서 Factory Core</h2>
            <p className="mb-10 text-center text-sm text-gray-500">중소기업이 말하는 도입 장벽, Factory Core가 해결합니다</p>
            <div className="mb-10 grid gap-4 sm:grid-cols-4">
              {PAIN_POINTS.map((p) => (
                <div key={p.label} className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5 text-center">
                  <p className="text-2xl font-black text-[var(--danger)]">{p.value}</p>
                  <p className="mt-1 text-xs font-semibold text-[var(--foreground)]">{p.label}</p>
                  <p className="mt-1 text-[10px] text-gray-500">{p.desc}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border-2 border-[var(--corebot-core)]/30 bg-[var(--corebot-core)]/5 p-8 text-center">
              <p className="mb-2 text-lg font-bold text-[var(--foreground)]">Factory Core는 다릅니다</p>
              <div className="mx-auto max-w-lg space-y-2 text-sm text-gray-500">
                <p>✓ <strong>초기 비용 0원</strong> — $1 스티커 센서, 기존 설비에 붙이기만</p>
                <p>✓ <strong>전문인력 불필요</strong> — AI가 자동 분석·보고, 대화형 키오스크</p>
                <p>✓ <strong>유지비 월 10만원</strong> — SaaS 모델, 정부 지원금 활용 가능</p>
                <p>✓ <strong>30분 만에 시작</strong> — MES 없이, 센서 없이, 설치 없이</p>
              </div>
              <Link
                href="/poc"
                className="mt-6 inline-block rounded-xl bg-[var(--corebot-core)] px-8 py-3 text-sm font-bold text-black transition hover:brightness-110"
              >
                무료 PoC 신청하기
              </Link>
            </div>
          </div>
        </section>

        {/* 출처 */}
        <section>
          <div className="mx-auto max-w-4xl px-5 py-10">
            <p className="mb-3 text-xs font-semibold text-gray-500">데이터 출처</p>
            <ul className="space-y-1 text-[10px] text-gray-600">
              <li>• <a href="https://www.korea.kr/briefing/pressReleaseView.do?newsId=156686561" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">2024년 스마트제조혁신 실태조사 결과 발표 (중소벤처기업부, 2025.04)</a></li>
              <li>• <a href="https://www.kbmaeil.com/article/20251112500096" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">대·중소 상생형 스마트공장 구축사업 성과 보고 (중기부, 2025.11)</a></li>
              <li>• <a href="https://www.skax.co.kr/insight/trend/110" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">산업연구원 스마트팩토리 도입 기업 성과분석</a></li>
              <li>• <a href="https://www.smart-factory.kr/" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">스마트공장 추진단 우수사례집 (smart-factory.kr)</a></li>
              <li>• <a href="https://www.mss.go.kr/site/smba/foffice/ex/linkage/linkageList.do?target=R002" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">중기부 정책연구보고서</a></li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
