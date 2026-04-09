import {
  Monitor,
  FileText,
  Bell,
  Brain,
  Clock,
  DollarSign,
} from "lucide-react";

const FEATURES = [
  {
    icon: Monitor,
    title: "실시간 이상감지",
    desc: "시각·청각·IoT 센서 데이터를 멀티모달 AI가 통합 분석. 이상 징후를 즉시 발견합니다.",
    color: "var(--primary)",
  },
  {
    icon: Bell,
    title: "즉각 알림",
    desc: "이상 발생 시 스마트워치 진동, 글래스 AR 표시, 키오스크 경고까지 동시에 알립니다.",
    color: "var(--secondary)",
  },
  {
    icon: FileText,
    title: "자동 보고서",
    desc: "일보·주보·월보를 AI가 자동 생성. 보고서 작성 시간을 80% 이상 단축합니다.",
    color: "var(--accent)",
  },
  {
    icon: Brain,
    title: "사후 학습",
    desc: "동일 사건이 반복되면 예측 정확도가 향상됩니다. 쓸수록 똑똑해지는 AI입니다.",
    color: "var(--primary)",
  },
  {
    icon: Clock,
    title: "30분 설치",
    desc: "복잡한 배선 없이 스티커 센서를 붙이고, 앱을 설치하면 바로 시작합니다.",
    color: "var(--secondary)",
  },
  {
    icon: DollarSign,
    title: "월 구독형",
    desc: "수억원의 초기 투자 없이 월 구독료로 시작. 효과 없으면 언제든 해지 가능합니다.",
    color: "var(--accent)",
  },
];

export function SolutionOverview() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">
        Solution
      </p>
      <h2 className="mb-4 text-center text-2xl font-bold text-[var(--foreground)] md:text-3xl">
        Factory Guardian Agent
      </h2>
      <p className="mx-auto mb-12 max-w-xl text-center text-gray-400">
        AI 전문가 없이도, 센서 없이도 시작할 수 있는
        <br />
        중소 제조기업 맞춤형 Agentic AI 솔루션
      </p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 transition hover:border-opacity-50"
            style={
              { "--hover-color": f.color } as React.CSSProperties
            }
          >
            <f.icon
              className="mb-3 h-7 w-7"
              style={{ color: f.color }}
            />
            <h3 className="mb-2 text-base font-bold text-[var(--foreground)]">
              {f.title}
            </h3>
            <p className="text-sm leading-relaxed text-gray-500">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
