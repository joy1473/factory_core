"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface WorkerProps {
  scrollProgress: number;
  visible: boolean;
}

// Waypoints: walk path → end at kiosk
const WAYPOINTS: THREE.Vector3[] = [
  new THREE.Vector3(-6, 0, 5),   // start
  new THREE.Vector3(-3, 0, 3),   // near CNC
  new THREE.Vector3(0, 0, 2),    // center
  new THREE.Vector3(3, 0, 0),    // near press
  new THREE.Vector3(6, 0, -1),   // near kiosk
  new THREE.Vector3(5, 0, -2.5), // in front of kiosk (final position)
];

// Kiosk monitor position (to look at)
const KIOSK_LOOK = new THREE.Vector3(6, 1.5, -3);

export function Worker({ scrollProgress, visible }: WorkerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bobOffset = useRef(0);
  const armRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!groupRef.current || !visible) return;

    // Phase 1 (30~65%): Walk along waypoints
    // Phase 2 (65~100%): Stand at kiosk, look at monitor
    const isAtKiosk = scrollProgress > 0.65;

    if (!isAtKiosk) {
      // Walking phase
      const walkProgress = Math.max(0, Math.min(1, (scrollProgress - 0.3) / 0.35));
      const totalSegments = WAYPOINTS.length - 1;
      const segment = Math.min(Math.floor(walkProgress * totalSegments), totalSegments - 1);
      const t = (walkProgress * totalSegments) - segment;

      const from = WAYPOINTS[segment];
      const to = WAYPOINTS[Math.min(segment + 1, WAYPOINTS.length - 1)];
      const pos = new THREE.Vector3().lerpVectors(from, to, t);

      // Walking bob
      bobOffset.current += delta * 8;
      pos.y = Math.abs(Math.sin(bobOffset.current)) * 0.05;

      groupRef.current.position.lerp(pos, 0.1);

      // Face walk direction
      const dir = new THREE.Vector3().subVectors(to, from).normalize();
      if (dir.length() > 0.01) {
        const angle = Math.atan2(dir.x, dir.z);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          angle,
          0.1
        );
      }
    } else {
      // Standing at kiosk — looking at monitor
      const kioskFrontPos = new THREE.Vector3(5, 0, -2.5);
      groupRef.current.position.lerp(kioskFrontPos, 0.05);
      groupRef.current.position.y = 0;

      // Face kiosk monitor
      const lookDir = new THREE.Vector3()
        .subVectors(KIOSK_LOOK, kioskFrontPos)
        .normalize();
      const targetAngle = Math.atan2(lookDir.x, lookDir.z);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetAngle,
        0.05
      );

      // Arm pointing at kiosk (80%+)
      if (armRef.current && scrollProgress > 0.78) {
        const armAngle = THREE.MathUtils.lerp(0, -0.8, Math.min(1, (scrollProgress - 0.78) / 0.1));
        armRef.current.rotation.x = armAngle;
      }
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={[-6, 0, 5]}>
      {/* Body (capsule) */}
      <mesh position={[0, 0.9, 0]}>
        <capsuleGeometry args={[0.2, 0.6, 4, 8]} />
        <meshStandardMaterial color="#1a3a5c" />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#ddb892" />
      </mesh>

      {/* Helmet */}
      <mesh position={[0, 1.7, 0]}>
        <sphereGeometry args={[0.2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#ffaa00" />
      </mesh>

      {/* Smart Glasses — glow stronger when at kiosk */}
      <mesh position={[0, 1.55, 0.15]}>
        <boxGeometry args={[0.35, 0.06, 0.05]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00d4ff"
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>

      {/* Smart Watch (left wrist) */}
      <mesh position={[-0.3, 0.7, 0.1]}>
        <torusGeometry args={[0.06, 0.02, 8, 16]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00d4ff"
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[-0.3, 0.7, 0.13]}>
        <planeGeometry args={[0.06, 0.06]} />
        <meshBasicMaterial color="#00ff41" />
      </mesh>

      {/* Right arm (points at kiosk in final section) */}
      <mesh ref={armRef} position={[0.25, 0.9, 0.1]}>
        <capsuleGeometry args={[0.06, 0.4, 4, 8]} />
        <meshStandardMaterial color="#1a3a5c" />
      </mesh>

      {/* Pointing finger glow (visible when pointing) */}
      <pointLight
        color="#00ff41"
        intensity={scrollProgress > 0.78 ? 0.8 : 0}
        distance={2}
        position={[0.4, 0.9, 0.3]}
      />

      {/* Data emission light */}
      <pointLight
        color="#00d4ff"
        intensity={0.5}
        distance={3}
        position={[0, 1.2, 0]}
      />

      {/* Standing indicator ring (visible when at kiosk) */}
      {scrollProgress > 0.65 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[0.3, 0.35, 32]} />
          <meshBasicMaterial
            color="#00d4ff"
            transparent
            opacity={0.4 + Math.sin(Date.now() * 0.003) * 0.2}
          />
        </mesh>
      )}
    </group>
  );
}
