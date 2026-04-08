"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface WorkerProps {
  scrollProgress: number;
  visible: boolean;
}

const WAYPOINTS: THREE.Vector3[] = [
  new THREE.Vector3(-6, 0, 5),
  new THREE.Vector3(-3, 0, 3),
  new THREE.Vector3(0, 0, 2),
  new THREE.Vector3(3, 0, 0),
  new THREE.Vector3(6, 0, -2),
  new THREE.Vector3(3, 0, -4),
];

export function Worker({ scrollProgress, visible }: WorkerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bobOffset = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current || !visible) return;

    // Walk along waypoints based on scroll 40~60% mapped to 0~1
    const walkProgress = Math.max(0, Math.min(1, (scrollProgress - 0.35) / 0.3));
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

    // Face direction
    const dir = new THREE.Vector3().subVectors(to, from).normalize();
    if (dir.length() > 0.01) {
      const angle = Math.atan2(dir.x, dir.z);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        angle,
        0.1
      );
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

      {/* Smart Glasses */}
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
      {/* Watch screen */}
      <mesh position={[-0.3, 0.7, 0.13]}>
        <planeGeometry args={[0.06, 0.06]} />
        <meshBasicMaterial color="#00ff41" />
      </mesh>

      {/* Data emission light */}
      <pointLight
        color="#00d4ff"
        intensity={0.5}
        distance={3}
        position={[0, 1.2, 0]}
      />
    </group>
  );
}
