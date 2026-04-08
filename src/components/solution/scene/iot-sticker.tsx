"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface IoTStickerProps {
  position: [number, number, number];
  active: boolean;
  alert?: boolean;
  attachProgress: number; // 0~1, controls sticker appearance
}

export function IoTSticker({ position, active, alert = false, attachProgress }: IoTStickerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  const baseColor = alert ? "#ff2222" : "#00ff41";

  useFrame(() => {
    if (!meshRef.current) return;

    // Scale in animation when attached
    const targetScale = active ? 1 : 0;
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.05
    );

    // Pulse glow
    if (active && glowRef.current) {
      const pulse = 0.5 + Math.sin(Date.now() * 0.005) * 0.3;
      glowRef.current.intensity = alert ? pulse * 3 : pulse;
    }

    // Alert ring pulse
    if (ringRef.current && alert) {
      const ringScale = 1 + Math.sin(Date.now() * 0.008) * 0.5;
      ringRef.current.scale.set(ringScale, ringScale, 1);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.5 - Math.sin(Date.now() * 0.008) * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* Sticker body */}
      <mesh ref={meshRef} scale={0}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={active ? 2.5 : 0}
          toneMapped={false}
        />
      </mesh>

      {/* Glow light */}
      <pointLight
        ref={glowRef}
        color={baseColor}
        intensity={0}
        distance={2}
        decay={2}
      />

      {/* Alert ring (only for alert state) */}
      {alert && (
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, 0.3, 32]} />
          <meshBasicMaterial
            color="#ff4444"
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Attach particle burst */}
      {attachProgress > 0 && attachProgress < 1 && (
        <AttachBurst progress={attachProgress} />
      )}
    </group>
  );
}

function AttachBurst({ progress }: { progress: number }) {
  const ref = useRef<THREE.Points>(null);

  const { positions } = useMemoParticles(20);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.scale.setScalar(progress * 2);
    (ref.current.material as THREE.PointsMaterial).opacity = 1 - progress;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#00d4ff"
        size={0.05}
        transparent
        opacity={1}
        sizeAttenuation
      />
    </points>
  );
}

function useMemoParticles(count: number) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 0.5;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
  }
  return { positions };
}
