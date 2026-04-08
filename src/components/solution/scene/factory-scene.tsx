"use client";

import { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ScrollControls, Scroll } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { FactoryFloor } from "./factory-floor";
import { Equipment } from "./equipment";
import { IoTSticker } from "./iot-sticker";
import { Worker } from "./worker";
import { KioskScreen } from "./kiosk-screen";
import { DataParticles, DustParticles } from "./data-particles";
import { CameraController } from "./camera-controller";

const EQUIPMENT_CONFIG = [
  { pos: [-6, 0, -2] as [number, number, number], type: "cnc" as const },
  { pos: [-2, 0, -2] as [number, number, number], type: "cnc" as const },
  { pos: [2, 0, -2] as [number, number, number], type: "press" as const },
  { pos: [-5, 0, -5] as [number, number, number], type: "injection" as const, alert: true },
];

const STICKER_POSITIONS: [number, number, number][] = [
  [-6, 1.6, -1.2],
  [-2, 1.6, -1.2],
  [2, 1.8, -1.2],
  [-5, 1.6, -4.2],
];

const KIOSK_POS: [number, number, number] = [6, 0, -3];

export function FactoryScene() {
  const [progress, setProgress] = useState(0);

  return (
    <div className="h-screen w-full">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [12, 10, 12], fov: 50 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <ScrollControls pages={5} damping={0.2}>
            <CameraController onProgressChange={setProgress} />

            <Scroll>
              {/* Lighting */}
              <ambientLight intensity={0.08} />
              <hemisphereLight
                color="#001133"
                groundColor="#000000"
                intensity={0.3}
              />
              <directionalLight
                position={[10, 15, 5]}
                intensity={0.4}
                color="#aabbff"
              />

              {/* Factory */}
              <FactoryFloor />
              <DustParticles count={progress < 0.2 ? 200 : 50} />

              {/* Equipment */}
              {EQUIPMENT_CONFIG.map((eq, i) => (
                <Equipment
                  key={i}
                  position={eq.pos}
                  type={eq.type}
                  alert={eq.alert}
                  scrollProgress={progress}
                />
              ))}

              {/* IoT Stickers */}
              {STICKER_POSITIONS.map((pos, i) => (
                <IoTSticker
                  key={i}
                  position={pos}
                  active={progress > 0.2 + i * 0.04}
                  alert={i === 3 && progress > 0.6}
                  attachProgress={
                    Math.max(0, Math.min(1, (progress - (0.2 + i * 0.04)) / 0.05))
                  }
                />
              ))}

              {/* Worker */}
              <Worker
                scrollProgress={progress}
                visible={progress > 0.35}
              />

              {/* Data flow particles */}
              {STICKER_POSITIONS.map((stickerPos, i) => (
                <DataParticles
                  key={i}
                  from={stickerPos}
                  to={KIOSK_POS}
                  active={progress > 0.4 && progress < 0.85}
                  color={i === 3 && progress > 0.6 ? "#ff4444" : "#00d4ff"}
                  count={15}
                />
              ))}

              {/* Kiosk */}
              <KioskScreen
                position={KIOSK_POS}
                showReport={progress > 0.78}
                scrollProgress={progress}
              />

              {/* Post-processing */}
              <EffectComposer>
                <Bloom
                  intensity={1.5}
                  luminanceThreshold={0.3}
                  luminanceSmoothing={0.9}
                  mipmapBlur
                />
                <Vignette eskil={false} offset={0.1} darkness={0.7} />
              </EffectComposer>
            </Scroll>

            {/* DOM Overlay */}
            <Scroll html>
              <ScrollOverlay progress={progress} />
            </Scroll>
          </ScrollControls>
        </Suspense>
      </Canvas>
    </div>
  );
}

function ScrollOverlay({ progress }: { progress: number }) {
  const sections = [
    {
      top: "10vh",
      content: (
        <div className="max-w-lg">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#00d4ff]">
            Factory Guardian Agent
          </p>
          <h2 className="mb-3 text-4xl font-black text-white leading-tight">
            중소 제조기업의 현실
          </h2>
          <p className="text-lg text-gray-400">
            24시간 눈과 귀가 없어 불안한 현장.
            <br />
            AI 도입률 0.1%, 전문인력 보유 0.8%
          </p>
        </div>
      ),
    },
    {
      top: "120vh",
      content: (
        <div className="max-w-lg">
          <p className="mb-2 text-6xl font-black text-[#00ff41]">$1</p>
          <h2 className="mb-3 text-3xl font-bold text-white">
            스마트 스티커, 붙이면 끝
          </h2>
          <p className="text-gray-400">
            배터리 없는 Gen3 IoT Pixel.
            <br />
            설비에 붙이기만 하면 IoT 완성.
          </p>
        </div>
      ),
    },
    {
      top: "220vh",
      content: (
        <div className="max-w-lg text-right ml-auto">
          <h2 className="mb-3 text-3xl font-bold text-white">
            AI가 눈과 귀가 되어
            <br />
            <span className="text-[#00d4ff]">24시간 감시</span>합니다
          </h2>
          <p className="text-gray-400">
            작업자의 웨어러블이 데이터를 수집하고
            <br />
            AI가 실시간으로 분석합니다.
          </p>
        </div>
      ),
    },
    {
      top: "320vh",
      content: (
        <div className="max-w-lg">
          <p className="mb-2 text-sm font-bold text-[#ff4444] uppercase tracking-widest animate-pulse">
            ⚠ Alert
          </p>
          <h2 className="mb-3 text-3xl font-bold text-white">
            베어링 이상 감지!
          </h2>
          <p className="text-5xl font-black text-[#ff4444] mb-3">82%</p>
          <p className="text-gray-400">
            위험 확률 82% · 3일 내 점검 권고
            <br />
            자동 알림 → 즉각 대응
          </p>
        </div>
      ),
    },
    {
      top: "420vh",
      content: (
        <div className="max-w-lg text-center mx-auto">
          <h2 className="mb-3 text-3xl font-bold text-white">
            보고서 자동 생성
          </h2>
          <p className="mb-2 text-lg text-gray-400">
            작성 시간{" "}
            <span className="text-[#00ff41] font-black text-2xl">80%</span>{" "}
            단축
          </p>
          <p className="mb-6 text-gray-500">
            Excel 수작업 → AI가 0.3초 만에 자동 생성
          </p>
          <a
            href="/poc"
            className="pointer-events-auto inline-block rounded-xl bg-[#00d4ff] px-8 py-3.5 text-base font-bold text-black transition hover:brightness-110"
          >
            지금 바로 도입하기 →
          </a>
        </div>
      ),
    },
  ];

  return (
    <div className="pointer-events-none" style={{ width: "100vw" }}>
      {sections.map((section, i) => (
        <div
          key={i}
          className="absolute left-0 w-full px-8 md:px-16"
          style={{
            top: section.top,
            opacity: getOpacity(progress, i),
            transform: `translateY(${getTranslateY(progress, i)}px)`,
            transition: "opacity 0.3s, transform 0.3s",
          }}
        >
          {section.content}
        </div>
      ))}
    </div>
  );
}

function getOpacity(progress: number, sectionIdx: number): number {
  const sectionStart = sectionIdx * 0.2;
  const sectionEnd = sectionStart + 0.18;
  if (progress < sectionStart) return 0;
  if (progress > sectionEnd) return 0;
  const mid = (sectionStart + sectionEnd) / 2;
  if (progress < mid) return Math.min(1, (progress - sectionStart) / 0.05);
  return Math.max(0, 1 - (progress - mid) / 0.08);
}

function getTranslateY(progress: number, sectionIdx: number): number {
  const sectionStart = sectionIdx * 0.2;
  if (progress < sectionStart) return 30;
  return Math.max(0, 30 - (progress - sectionStart) / 0.05 * 30);
}
