"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/public/header";
import { SceneSelector } from "@/components/solution/scene-selector";
import { SmartFactoryDiagram } from "@/components/solution/smart-factory-diagram";
import Link from "next/link";

const FactoryScene = dynamic(
  () =>
    import("@/components/solution/scene/factory-scene").then(
      (m) => m.FactoryScene
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#A8E6CF] border-t-transparent" />
          <p className="text-sm text-gray-500">3D 씬 로딩 중...</p>
        </div>
      </div>
    ),
  }
);

export default function SolutionPage() {
  const [sceneId, setSceneId] = useState("general");
  const demoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const scene = params.get("scene");
    if (scene) setSceneId(scene);
  }, []);

  function handleSceneChange(id: string) {
    setSceneId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Update URL without reload
    window.history.replaceState(null, "", `/solution?scene=${id}`);
  }

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-50">
        <Header />
      </div>

      {/* Smart Factory Level Guide — 첫 화면 */}
      <div className="relative z-20 bg-[var(--background)] pt-20">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">
            Smart Factory Levels
          </p>
          <h2 className="mb-4 text-center text-2xl font-bold text-[var(--foreground)] md:text-3xl">
            스마트공장, 어디서부터 시작할까요?
          </h2>
          <p className="mx-auto mb-10 max-w-lg text-center text-sm text-gray-500">
            기업의 사정에 따라 적절한 수준을 선택하세요. 기초 단계라도 확실히 다릅니다.
          </p>

          {/* 5 Level Cards */}
          <div className="mb-8 grid gap-3 sm:grid-cols-5">
            {[
              { level: "ICT 미적용", desc: "수작업, 전화/이메일", color: "#B0B0B0", items: ["수기 기록", "엑셀 관리", "전화 협업"] },
              { level: "기초", desc: "실적집계 자동화", color: "#A8E6CF", items: ["바코드/QR", "POP 시스템", "실시간 집계"] },
              { level: "중간1", desc: "설비데이터 자동집계", color: "#DDA0DD", items: ["설비 모니터링", "ERP 연동", "자동 리포트"] },
              { level: "중간2", desc: "설비제어 자동화", color: "#FFD3B6", items: ["MES 통합", "실시간 제어", "시뮬레이션"] },
              { level: "고도", desc: "IoT/AI 기반 CPS", color: "#FFB347", items: ["AI 예측", "자율 최적화", "디지털 트윈"] },
            ].map((l, i) => (
              <div
                key={l.level}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center transition hover:border-opacity-50"
                style={{ borderTopColor: l.color, borderTopWidth: "3px" }}
              >
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: l.color }}>
                  LEVEL {i}
                </p>
                <p className="mb-1 text-sm font-bold text-[var(--foreground)]">{l.level}</p>
                <p className="mb-3 text-[10px] text-gray-500">{l.desc}</p>
                <ul className="space-y-1 text-[10px] text-gray-400">
                  {l.items.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* CoreBot Family — AI 기능 소개 */}
          <div className="mb-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <h3 className="mb-2 text-center text-sm font-bold text-[var(--foreground)]">CoreBot Family</h3>
            <p className="mb-5 text-center text-[10px] text-gray-500">Factory Guardian Agent를 구성하는 AI 요원들</p>
            <div className="grid gap-4 sm:grid-cols-4">
              {[
                { name: "Core", role: "AI 공장장", desc: "모든 데이터를 통합·분석하고 자동 보고서 생성", video: "/video/Core.mp4", color: "#A8E6CF" },
                { name: "Eye", role: "시각 AI", desc: "카메라·스마트글래스로 설비 상태를 자동 판별", video: "/video/Eye.mp4", color: "#DDA0DD" },
                { name: "Ear", role: "청각 AI", desc: "설비 소리를 분석하여 이상 징후 조기 감지", video: "/video/Ear.mp4", color: "#FFD3B6" },
                { name: "Touch", role: "IoT 촉각", desc: "$1 스티커 센서로 온도·습도·진동 실시간 감지", video: "/video/Touch.mp4", color: "#FDFD96" },
              ].map((bot) => (
                <div key={bot.name} className="flex flex-col items-center rounded-lg border border-[var(--border)] bg-black/20 p-4 text-center transition hover:border-opacity-60" style={{ borderTopColor: bot.color, borderTopWidth: "2px" }}>
                  <div className="mb-3 h-16 w-16 overflow-hidden rounded-full" style={{ boxShadow: `0 0 20px ${bot.color}20` }}>
                    <video src={bot.video} autoPlay loop muted playsInline className="h-full w-full object-cover" />
                  </div>
                  <p className="text-xs font-bold" style={{ color: bot.color }}>{bot.name}</p>
                  <p className="text-[11px] font-semibold text-[var(--foreground)]">{bot.role}</p>
                  <p className="mt-1 text-[10px] text-gray-500">{bot.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive System Diagram */}
          <div className="mb-10">
            <h3 className="mb-6 text-center text-lg font-bold text-[var(--foreground)]">
              스마트공장 시스템 구조
            </h3>
            <SmartFactoryDiagram
              onLayerClick={(layer) => {
                setSceneId(layer);
                window.history.replaceState(null, "", `/solution?scene=${layer}`);
                demoRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
            />
          </div>
        </div>
      </div>

      <div ref={demoRef}>
        <SceneSelector current={sceneId} onChange={handleSceneChange} />
        <FactoryScene key={sceneId} sceneId={sceneId} />
      </div>

      {/* Bottom nav */}
      <div className="relative z-20 bg-[var(--background)]">
        <div className="h-16 bg-gradient-to-b from-transparent to-[#0a0a0a]" />
        <div className="mx-auto max-w-4xl px-5 py-16 text-center">
          <h2 className="mb-4 text-2xl font-bold text-[var(--foreground)] md:text-3xl">
            더 알아보기
          </h2>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/why"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-8 py-5 text-left transition hover:border-[var(--primary)]/30 sm:w-auto"
            >
              <p className="text-sm font-bold text-[var(--primary)]">왜 Factory Guardian인가?</p>
              <p className="mt-1 text-xs text-gray-500">시장 현실 · 비교 분석</p>
            </Link>
            <Link
              href="/pricing"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-8 py-5 text-left transition hover:border-[var(--secondary)]/30 sm:w-auto"
            >
              <p className="text-sm font-bold text-[var(--secondary)]">가격 및 도입 안내</p>
              <p className="mt-1 text-xs text-gray-500">PoC · SaaS · 정부 지원</p>
            </Link>
            <Link
              href="/poc"
              className="w-full rounded-xl bg-[var(--primary)] px-8 py-5 text-left transition hover:brightness-110 sm:w-auto"
            >
              <p className="text-sm font-bold text-black">무료 PoC 신청</p>
              <p className="mt-1 text-xs text-black/60">8주 체험</p>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
