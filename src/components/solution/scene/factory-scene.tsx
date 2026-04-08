"use client";

import { useRef, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { FactoryFloor } from "./factory-floor";
import { Equipment } from "./equipment";
import { IoTSticker } from "./iot-sticker";
import { Worker } from "./worker";
import { KioskScreen, KioskChatOverlay } from "./kiosk-screen";
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
  { pos: new THREE.Vector3(12, 10, 12), target: new THREE.Vector3(0, 0, 0) },    // 0~20%: 전경
  { pos: new THREE.Vector3(2, 2.5, 3), target: new THREE.Vector3(-2, 1, 0) },   // 20~40%: 스티커
  { pos: new THREE.Vector3(5, 3, 6), target: new THREE.Vector3(0, 1, 0) },      // 40~60%: 작업자
  { pos: new THREE.Vector3(1, 2.5, -2), target: new THREE.Vector3(-5, 1, -3) }, // 60~80%: 이상감지
  { pos: new THREE.Vector3(8, 2, 0), target: new THREE.Vector3(6, 1.5, -3) },   // 80~100%: 키오스크 정면
];

// ─── Shared scroll progress ───
const scrollState = { progress: 0 };

// ─── Main Component ───
export function FactoryScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    function handleScroll() {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
        scrollState.progress = progress;
        setP(progress);
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div ref={containerRef}>
      {/* Canvas: fixed background, no pointer events (scroll goes to DOM) */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [12, 10, 12], fov: 50 }}
          gl={{ antialias: false, powerPreference: "high-performance" }}
          style={{ pointerEvents: "none" }}
        >
          <Suspense fallback={null}>
            <SceneContent />
            <EffectComposer>
              <Bloom
                intensity={1.5}
                luminanceThreshold={0.3}
                luminanceSmoothing={0.9}
                mipmapBlur
              />
              <Vignette eskil={false} offset={0.1} darkness={0.7} />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </div>

      {/* Scroll spacer + DOM overlay */}
      <div className="relative z-10" style={{ height: "500vh" }}>
        <OverlaySection top="10vh" align="left" progress={p} index={0}>
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

        <OverlaySection top="110vh" align="left" progress={p} index={1}>
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

        <OverlaySection top="210vh" align="right" progress={p} index={2}>
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

        <OverlaySection top="310vh" align="left" progress={p} index={3}>
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

        {/* Kiosk Chat UI — DOM overlay at bottom right */}
        <div
          className="fixed bottom-6 right-6 z-20 md:bottom-10 md:right-10"
          style={{
            opacity: p > 0.65 ? Math.min(1, (p - 0.65) / 0.1) : 0,
            transform: p > 0.65 ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.5s, transform 0.5s",
            pointerEvents: p > 0.7 ? "auto" : "none",
          }}
        >
          <KioskChatOverlay progress={p} />
        </div>

        {/* CTA at very end */}
        <OverlaySection top="420vh" align="center" progress={p} index={4}>
          <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
            대화 한 마디로<br />
            <span className="text-[#00d4ff]">공장이 달라집니다</span>
          </h2>
          <p className="mb-2 text-base text-gray-400 md:text-lg">
            보고서 작성 시간{" "}
            <span className="text-2xl font-black text-[#00ff41]">80%</span> 단축
          </p>
          <p className="mb-6 text-gray-500">
            AI 공장장에게 물어보세요. 바로 답합니다.
          </p>
          <a
            href="/poc"
            className="inline-block rounded-xl bg-[#00d4ff] px-8 py-3.5 text-base font-bold text-black transition hover:brightness-110"
          >
            지금 바로 도입하기 →
          </a>
        </OverlaySection>
      </div>
    </div>
  );
}

// ─── 3D Scene Content ───
function SceneContent() {
  const currentLookAt = useRef(new THREE.Vector3());
  const progressRef = useRef(0);

  useFrame((state) => {
    const p = scrollState.progress;
    progressRef.current = p;

    // Camera keyframe interpolation
    const totalSegments = CAMERA_KEYFRAMES.length - 1;
    const rawIdx = p * totalSegments;
    const idx = Math.min(Math.floor(rawIdx), totalSegments - 1);
    const t = rawIdx - idx;
    const smoothT = t * t * (3 - 2 * t);

    const from = CAMERA_KEYFRAMES[idx];
    const to = CAMERA_KEYFRAMES[Math.min(idx + 1, CAMERA_KEYFRAMES.length - 1)];

    const targetPos = new THREE.Vector3().lerpVectors(from.pos, to.pos, smoothT);
    const targetLook = new THREE.Vector3().lerpVectors(from.target, to.target, smoothT);

    state.camera.position.lerp(targetPos, 0.06);
    currentLookAt.current.lerp(targetLook, 0.06);
    state.camera.lookAt(currentLookAt.current);
  });

  return (
    <>
      <ambientLight intensity={0.08} />
      <hemisphereLight color="#001133" groundColor="#000000" intensity={0.3} />
      <directionalLight position={[10, 15, 5]} intensity={0.4} color="#aabbff" />

      <FactoryFloor />
      <DustParticles />

      {EQUIPMENT_CONFIG.map((eq, i) => (
        <ScrollEquipment key={i} config={eq} />
      ))}

      {STICKER_POSITIONS.map((pos, i) => (
        <ScrollSticker key={i} position={pos} index={i} />
      ))}

      <ScrollWorker />

      {STICKER_POSITIONS.map((pos, i) => (
        <ScrollParticles key={i} from={pos} index={i} />
      ))}

      <ScrollKiosk />
    </>
  );
}

// ─── Scroll-aware wrappers (read shared state in useFrame) ───
function ScrollEquipment({ config }: { config: (typeof EQUIPMENT_CONFIG)[0] }) {
  const ref = useRef(0);
  useFrame(() => { ref.current = scrollState.progress; });
  return <Equipment position={config.pos} type={config.type} alert={config.alert} scrollProgress={ref.current} />;
}

function ScrollSticker({ position, index }: { position: [number, number, number]; index: number }) {
  const ref = useRef(0);
  useFrame(() => { ref.current = scrollState.progress; });
  return (
    <IoTSticker
      position={position}
      active={ref.current > 0.15 + index * 0.04}
      alert={index === 3 && ref.current > 0.6}
      attachProgress={Math.max(0, Math.min(1, (ref.current - (0.15 + index * 0.04)) / 0.05))}
    />
  );
}

function ScrollWorker() {
  const ref = useRef(0);
  useFrame(() => { ref.current = scrollState.progress; });
  return <Worker scrollProgress={ref.current} visible={ref.current > 0.3} />;
}

function ScrollParticles({ from, index }: { from: [number, number, number]; index: number }) {
  const ref = useRef(0);
  useFrame(() => { ref.current = scrollState.progress; });
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

function ScrollKiosk() {
  const ref = useRef(0);
  useFrame(() => { ref.current = scrollState.progress; });
  return <KioskScreen position={KIOSK_POS} showReport={ref.current > 0.65} scrollProgress={ref.current} />;
}

// ─── Overlay Section ───
function OverlaySection({
  top,
  align,
  progress,
  index,
  children,
}: {
  top: string;
  align: "left" | "right" | "center";
  progress: number;
  index: number;
  children: React.ReactNode;
}) {
  const sectionStart = index * 0.2;
  const sectionEnd = sectionStart + 0.18;
  const mid = (sectionStart + sectionEnd) / 2;

  let opacity = 0;
  if (progress >= sectionStart && progress <= sectionEnd) {
    opacity = progress < mid
      ? Math.min(1, (progress - sectionStart) / 0.04)
      : Math.max(0, 1 - (progress - mid) / 0.06);
  }

  const translateY = progress < sectionStart
    ? 40
    : Math.max(0, 40 - ((progress - sectionStart) / 0.04) * 40);

  const alignClass =
    align === "center" ? "flex justify-center text-center"
    : align === "right" ? "flex justify-end text-right"
    : "";

  return (
    <div
      className={`absolute w-full px-6 md:px-16 ${alignClass}`}
      style={{
        top,
        opacity,
        transform: `translateY(${translateY}px)`,
        pointerEvents: opacity > 0.5 ? "auto" : "none",
      }}
    >
      <div className="max-w-lg rounded-xl bg-black/40 p-6 backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
}
