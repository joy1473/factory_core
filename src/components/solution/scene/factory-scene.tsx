"use client";

import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ScrollControls, Scroll, useScroll } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { FactoryFloor } from "./factory-floor";
import { Equipment } from "./equipment";
import { IoTSticker } from "./iot-sticker";
import { Worker } from "./worker";
import { KioskScreen } from "./kiosk-screen";
import { DataParticles, DustParticles } from "./data-particles";

// ─── Config ───
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

const CAMERA_KEYFRAMES = [
  { pos: new THREE.Vector3(12, 10, 12), target: new THREE.Vector3(0, 0, 0) },
  { pos: new THREE.Vector3(2, 2.5, 3), target: new THREE.Vector3(-2, 1, 0) },
  { pos: new THREE.Vector3(5, 3, 6), target: new THREE.Vector3(0, 1, 0) },
  { pos: new THREE.Vector3(1, 2.5, -2), target: new THREE.Vector3(-5, 1, -3) },
  { pos: new THREE.Vector3(6, 2, 2), target: new THREE.Vector3(6, 1.5, -3) },
];

// ─── Main ───
export function FactoryScene() {
  return (
    <div className="h-screen w-full">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [12, 10, 12], fov: 50 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <ScrollControls pages={5} damping={0.2}>
            {/* 3D Scene */}
            <Scroll>
              <SceneContent />
            </Scroll>

            {/* DOM Overlay inside Scroll html */}
            <Scroll html style={{ width: "100%" }}>
              <OverlaySection
                top="10vh"
                align="left"
              >
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#00d4ff]">
                  Factory Guardian Agent
                </p>
                <h2 className="mb-3 text-3xl font-black leading-tight text-white md:text-4xl">
                  중소 제조기업의 현실
                </h2>
                <p className="text-base text-gray-400 md:text-lg">
                  24시간 눈과 귀가 없어 불안한 현장.
                  <br />
                  AI 도입률 0.1%, 전문인력 보유 0.8%
                </p>
              </OverlaySection>

              <OverlaySection
                top="120vh"
                align="left"
              >
                <p className="mb-2 text-5xl font-black text-[#00ff41] md:text-6xl">$1</p>
                <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
                  스마트 스티커, 붙이면 끝
                </h2>
                <p className="text-gray-400">
                  배터리 없는 Gen3 IoT Pixel.
                  <br />
                  설비에 붙이기만 하면 IoT 완성.
                </p>
              </OverlaySection>

              <OverlaySection
                top="220vh"
                align="right"
              >
                <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
                  AI가 눈과 귀가 되어
                  <br />
                  <span className="text-[#00d4ff]">24시간 감시</span>합니다
                </h2>
                <p className="text-gray-400">
                  작업자의 웨어러블이 데이터를 수집하고
                  <br />
                  AI가 실시간으로 분석합니다.
                </p>
              </OverlaySection>

              <OverlaySection
                top="320vh"
                align="left"
              >
                <p className="mb-2 animate-pulse text-sm font-bold uppercase tracking-widest text-[#ff4444]">
                  ⚠ Alert
                </p>
                <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
                  베어링 이상 감지!
                </h2>
                <p className="mb-3 text-4xl font-black text-[#ff4444] md:text-5xl">82%</p>
                <p className="text-gray-400">
                  위험 확률 82% · 3일 내 점검 권고
                </p>
              </OverlaySection>

              <OverlaySection
                top="420vh"
                align="center"
              >
                <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
                  보고서 자동 생성
                </h2>
                <p className="mb-2 text-base text-gray-400 md:text-lg">
                  작성 시간{" "}
                  <span className="text-2xl font-black text-[#00ff41]">80%</span>{" "}
                  단축
                </p>
                <p className="mb-6 text-gray-500">
                  Excel 수작업 → AI가 0.3초 만에 자동 생성
                </p>
                <a
                  href="/poc"
                  className="inline-block rounded-xl bg-[#00d4ff] px-8 py-3.5 text-base font-bold text-black transition hover:brightness-110"
                >
                  지금 바로 도입하기 →
                </a>
              </OverlaySection>
            </Scroll>
          </ScrollControls>
        </Suspense>
      </Canvas>
    </div>
  );
}

// ─── 3D Content (reads scroll inside useFrame) ───
function SceneContent() {
  const scroll = useScroll();
  const progressRef = useRef(0);
  const currentLookAt = useRef(new THREE.Vector3());

  useFrame((state) => {
    const p = scroll.offset;
    progressRef.current = p;

    // Camera
    const totalSegments = CAMERA_KEYFRAMES.length - 1;
    const rawIdx = p * totalSegments;
    const idx = Math.min(Math.floor(rawIdx), totalSegments - 1);
    const t = rawIdx - idx;
    const smoothT = t * t * (3 - 2 * t);

    const from = CAMERA_KEYFRAMES[idx];
    const to = CAMERA_KEYFRAMES[Math.min(idx + 1, CAMERA_KEYFRAMES.length - 1)];

    const targetPos = new THREE.Vector3().lerpVectors(from.pos, to.pos, smoothT);
    const targetLook = new THREE.Vector3().lerpVectors(from.target, to.target, smoothT);

    state.camera.position.lerp(targetPos, 0.08);
    currentLookAt.current.lerp(targetLook, 0.08);
    state.camera.lookAt(currentLookAt.current);
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.08} />
      <hemisphereLight color="#001133" groundColor="#000000" intensity={0.3} />
      <directionalLight position={[10, 15, 5]} intensity={0.4} color="#aabbff" />

      {/* Factory */}
      <FactoryFloor />
      <DustParticles />

      {/* Equipment */}
      {EQUIPMENT_CONFIG.map((eq, i) => (
        <EquipmentWithScroll key={i} config={eq} />
      ))}

      {/* IoT Stickers */}
      {STICKER_POSITIONS.map((pos, i) => (
        <StickerWithScroll key={i} position={pos} index={i} />
      ))}

      {/* Worker */}
      <WorkerWithScroll />

      {/* Data Particles */}
      {STICKER_POSITIONS.map((stickerPos, i) => (
        <ParticlesWithScroll key={i} from={stickerPos} index={i} />
      ))}

      {/* Kiosk */}
      <KioskWithScroll />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom intensity={1.5} luminanceThreshold={0.3} luminanceSmoothing={0.9} mipmapBlur />
        <Vignette eskil={false} offset={0.1} darkness={0.7} />
      </EffectComposer>
    </>
  );
}

// ─── Scroll-aware wrappers (read scroll in useFrame, no re-renders) ───
function EquipmentWithScroll({ config }: { config: typeof EQUIPMENT_CONFIG[0] }) {
  const scroll = useScroll();
  const ref = useRef(0);
  useFrame(() => { ref.current = scroll.offset; });
  return (
    <Equipment
      position={config.pos}
      type={config.type}
      alert={config.alert}
      scrollProgress={ref.current}
    />
  );
}

function StickerWithScroll({ position, index }: { position: [number, number, number]; index: number }) {
  const scroll = useScroll();
  const ref = useRef(0);
  useFrame(() => { ref.current = scroll.offset; });
  const p = ref.current;
  return (
    <IoTSticker
      position={position}
      active={p > 0.15 + index * 0.04}
      alert={index === 3 && p > 0.6}
      attachProgress={Math.max(0, Math.min(1, (p - (0.15 + index * 0.04)) / 0.05))}
    />
  );
}

function WorkerWithScroll() {
  const scroll = useScroll();
  const ref = useRef(0);
  useFrame(() => { ref.current = scroll.offset; });
  return <Worker scrollProgress={ref.current} visible={ref.current > 0.3} />;
}

function ParticlesWithScroll({ from, index }: { from: [number, number, number]; index: number }) {
  const scroll = useScroll();
  const ref = useRef(0);
  useFrame(() => { ref.current = scroll.offset; });
  return (
    <DataParticles
      from={from}
      to={KIOSK_POS}
      active={ref.current > 0.35 && ref.current < 0.85}
      color={index === 3 && ref.current > 0.6 ? "#ff4444" : "#00d4ff"}
      count={15}
    />
  );
}

function KioskWithScroll() {
  const scroll = useScroll();
  const ref = useRef(0);
  useFrame(() => { ref.current = scroll.offset; });
  return (
    <KioskScreen
      position={KIOSK_POS}
      showReport={ref.current > 0.75}
      scrollProgress={ref.current}
    />
  );
}

// ─── DOM Overlay Helper ───
function OverlaySection({
  top,
  align,
  children,
}: {
  top: string;
  align: "left" | "right" | "center";
  children: React.ReactNode;
}) {
  const alignClass =
    align === "center"
      ? "flex justify-center text-center"
      : align === "right"
        ? "flex justify-end text-right"
        : "";

  return (
    <div
      className={`absolute w-full px-6 md:px-16 ${alignClass}`}
      style={{ top }}
    >
      <div className="max-w-lg">{children}</div>
    </div>
  );
}
