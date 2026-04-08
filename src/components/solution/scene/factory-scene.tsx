"use client";

import { useRef, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { FactoryFloor } from "./factory-floor";
import { Equipment } from "./equipment";
import { IoTSticker } from "./iot-sticker";
import { Worker } from "./worker";
import { KioskScreen } from "./kiosk-screen";
import { DataParticles, DustParticles } from "./data-particles";
import { SCENE_PRESETS, type ScenePreset } from "@/lib/constants/scene-presets";

// ─── Shared scroll state ───
const scrollState = { progress: 0 };

// ─── Props ───
interface FactorySceneProps {
  sceneId?: string;
}

export function FactoryScene({ sceneId = "general" }: FactorySceneProps) {
  const [p, setP] = useState(0);
  const rafRef = useRef<number>(0);
  const preset = SCENE_PRESETS[sceneId] || SCENE_PRESETS.general;

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
    <div>
      {/* Canvas: fixed background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [12, 10, 12], fov: 50 }}
          gl={{ antialias: false, powerPreference: "high-performance" }}
          style={{ pointerEvents: "none" }}
        >
          <Suspense fallback={null}>
            <SceneContent preset={preset} />
            <EffectComposer>
              <Bloom intensity={1.2} luminanceThreshold={0.9} luminanceSmoothing={0.9} mipmapBlur />
              <Vignette eskil={false} offset={0.1} darkness={0.7} />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </div>

      {/* Scroll spacer + text overlay */}
      <div className="relative z-10" style={{ height: "500vh" }}>
        {preset.overlayTexts.map((text, i) => (
          <OverlaySection
            key={`${sceneId}-${i}`}
            top={`${25 + i * 100}vh`}
            align={i === 2 ? "right" : i === 4 ? "center" : "left"}
            progress={p}
            index={i}
          >
            {i === 3 ? (
              <>
                <p className="mb-2 animate-pulse text-sm font-bold uppercase tracking-widest text-[#ff4444]">
                  ⚠ Alert
                </p>
                <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
                  {text.title}
                </h2>
                <p className="text-gray-400">{text.subtitle}</p>
              </>
            ) : i === 0 ? (
              <>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#00d4ff]">
                  Factory Guardian Agent
                </p>
                <h2 className="mb-3 text-3xl font-black leading-tight text-white md:text-4xl">
                  {text.title}
                </h2>
                <p className="text-base text-gray-400 md:text-lg">{text.subtitle}</p>
              </>
            ) : i === 1 ? (
              <>
                <p className="mb-2 text-5xl font-black text-[#00ff41] md:text-6xl">$1</p>
                <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
                  {text.title}
                </h2>
                <p className="text-gray-400">{text.subtitle}</p>
              </>
            ) : i === 4 ? (
              <>
                <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
                  {text.title}
                </h2>
                <p className="mb-6 text-gray-400">{text.subtitle}</p>
                <a
                  href="/poc"
                  className="inline-block rounded-xl bg-[#00d4ff] px-8 py-3.5 text-base font-bold text-black transition hover:brightness-110"
                >
                  지금 바로 도입하기 →
                </a>
              </>
            ) : (
              <>
                <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
                  {text.title}
                </h2>
                <p className="text-gray-400">{text.subtitle}</p>
              </>
            )}
          </OverlaySection>
        ))}
      </div>
    </div>
  );
}

// ─── 3D Scene Content (reads preset) ───
function SceneContent({ preset }: { preset: ScenePreset }) {
  const currentLookAt = useRef(new THREE.Vector3());

  const cameraKeyframes = preset.cameraKeyframes.map((k) => ({
    pos: new THREE.Vector3(...k.pos),
    target: new THREE.Vector3(...k.target),
  }));

  useFrame((state) => {
    const p = scrollState.progress;
    const total = cameraKeyframes.length - 1;
    const rawIdx = p * total;
    const idx = Math.min(Math.floor(rawIdx), total - 1);
    const t = rawIdx - idx;
    const smoothT = t * t * (3 - 2 * t);

    const from = cameraKeyframes[idx];
    const to = cameraKeyframes[Math.min(idx + 1, cameraKeyframes.length - 1)];

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

      {preset.equipment.map((eq, i) => (
        <ScrollEquipment key={`${preset.id}-eq-${i}`} config={eq} alertIndex={preset.alertIndex} index={i} />
      ))}

      {preset.stickers.map((pos, i) => (
        <ScrollSticker key={`${preset.id}-st-${i}`} position={pos} index={i} alertIndex={preset.alertIndex} />
      ))}

      <ScrollWorker waypoints={preset.waypoints} />

      {preset.stickers.map((pos, i) => (
        <ScrollParticles key={`${preset.id}-pt-${i}`} from={pos} kioskPos={preset.kioskPos} index={i} alertIndex={preset.alertIndex} />
      ))}

      <ScrollKiosk kioskPos={preset.kioskPos} chatMessages={preset.chatMessages} />
    </>
  );
}

// ─── Scroll-aware wrappers ───
function ScrollEquipment({ config, alertIndex, index }: { config: ScenePreset["equipment"][0]; alertIndex: number; index: number }) {
  const ref = useRef(0);
  useFrame(() => { ref.current = scrollState.progress; });
  return <Equipment position={config.pos} type={config.type} alert={index === alertIndex} scrollProgress={ref.current} />;
}

function ScrollSticker({ position, index, alertIndex }: { position: [number, number, number]; index: number; alertIndex: number }) {
  const ref = useRef(0);
  useFrame(() => { ref.current = scrollState.progress; });
  return (
    <IoTSticker
      position={position}
      active={ref.current > 0.15 + index * 0.04}
      alert={index === alertIndex && ref.current > 0.6}
      attachProgress={Math.max(0, Math.min(1, (ref.current - (0.15 + index * 0.04)) / 0.05))}
    />
  );
}

function ScrollWorker({ waypoints }: { waypoints: [number, number, number][] }) {
  const ref = useRef(0);
  useFrame(() => { ref.current = scrollState.progress; });
  // Worker reads waypoints from preset
  return <Worker scrollProgress={ref.current} visible={ref.current > 0.3} />;
}

function ScrollParticles({ from, kioskPos, index, alertIndex }: { from: [number, number, number]; kioskPos: [number, number, number]; index: number; alertIndex: number }) {
  const ref = useRef(0);
  useFrame(() => { ref.current = scrollState.progress; });
  return (
    <DataParticles
      from={from}
      to={kioskPos}
      active={ref.current > 0.35 && ref.current < 0.85}
      color={index === alertIndex && ref.current > 0.6 ? "#ff4444" : "#00d4ff"}
      count={15}
    />
  );
}

function ScrollKiosk({ kioskPos, chatMessages }: { kioskPos: [number, number, number]; chatMessages: ScenePreset["chatMessages"] }) {
  const ref = useRef(0);
  useFrame(() => { ref.current = scrollState.progress; });
  return <KioskScreen position={kioskPos} showReport={ref.current > 0.65} scrollProgress={ref.current} chatMessages={chatMessages} />;
}

// ─── DOM Overlay ───
function OverlaySection({
  top, align, progress, index, children,
}: {
  top: string; align: "left" | "right" | "center"; progress: number; index: number; children: React.ReactNode;
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

  const translateY = progress < sectionStart ? 40 : Math.max(0, 40 - ((progress - sectionStart) / 0.04) * 40);

  const alignClass = align === "center" ? "flex justify-center text-center" : align === "right" ? "flex justify-end text-right" : "";

  return (
    <div
      className={`absolute w-full px-6 md:px-16 ${alignClass}`}
      style={{ top, opacity, transform: `translateY(${translateY}px)`, pointerEvents: opacity > 0.5 ? "auto" : "none" }}
    >
      <div className="max-w-lg rounded-xl bg-black/40 p-6 backdrop-blur-sm">{children}</div>
    </div>
  );
}
