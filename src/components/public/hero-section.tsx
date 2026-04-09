import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(168,230,207,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(168,230,207,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(168,230,207,0.08),transparent_70%)]" />

      <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-24 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 text-xs text-gray-400">
          <span className="h-1.5 w-1.5 rounded-full bg-[#A8E6CF] animate-pulse" />
          스마트팩토리 Agentic AI 솔루션
        </div>

        <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight md:text-6xl">
          <span className="text-[var(--foreground)]">공장에 </span>
          <span className="bg-gradient-to-r from-[#A8E6CF] to-[#DDA0DD] bg-clip-text text-transparent">
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
            className="group flex items-center gap-2 rounded-xl bg-[#A8E6CF] px-8 py-3.5 text-base font-bold text-[#1a1a1a] transition hover:brightness-110"
          >
            무료 PoC 신청
            <ArrowRight
              size={18}
              className="transition group-hover:translate-x-1"
            />
          </Link>
          <Link
            href="/solution"
            className="rounded-xl border border-[var(--border)] px-8 py-3.5 text-base font-semibold text-gray-300 transition hover:border-[#A8E6CF] hover:text-[#A8E6CF]"
          >
            솔루션 자세히 보기
          </Link>
        </div>

        {/* CoreBot Family */}
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            {
              name: "Core",
              role: "AI 공장장",
              desc: "모든 데이터를 통합 분석하고 자동 보고서를 생성합니다.",
              video: "/video/Core.mp4",
              color: "#A8E6CF",
            },
            {
              name: "Eye",
              role: "시각 AI",
              desc: "스마트 글래스 + 카메라로 설비 상태를 자동 판별합니다.",
              video: "/video/Eye.mp4",
              color: "#DDA0DD",
            },
            {
              name: "Ear",
              role: "청각 AI",
              desc: "마이크로 설비 소리를 분석하여 이상 징후를 조기 감지합니다.",
              video: "/video/Ear.mp4",
              color: "#FFD3B6",
            },
            {
              name: "Touch",
              role: "촉각 IoT",
              desc: "$1 스티커 센서로 온도·습도·진동을 실시간 감지합니다.",
              video: "/video/Touch.mp4",
              color: "#FDFD96",
            },
          ].map((bot) => (
            <div
              key={bot.name}
              className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center transition hover:border-opacity-60"
              style={{ borderTopColor: bot.color, borderTopWidth: "3px" }}
            >
              <div
                className="mx-auto mb-3 h-16 w-16 overflow-hidden rounded-full transition group-hover:scale-110"
                style={{ boxShadow: `0 0 25px ${bot.color}25` }}
              >
                <video
                  src={bot.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="text-[10px] font-bold" style={{ color: bot.color }}>{bot.name}</p>
              <h3 className="mb-1 font-bold text-[var(--foreground)]">{bot.role}</h3>
              <p className="text-sm text-gray-500">{bot.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
