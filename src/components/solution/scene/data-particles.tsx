"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface DataParticlesProps {
  from: [number, number, number];
  to: [number, number, number];
  active: boolean;
  color?: string;
  count?: number;
}

export function DataParticles({
  from,
  to,
  active,
  color = "#00d4ff",
  count = 30,
}: DataParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const { offsets } = useMemo(() => {
    const offsets = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      offsets[i] = Math.random();
    }
    return { offsets };
  }, [count]);

  const positions = useMemo(() => new Float32Array(count * 3), [count]);

  useFrame(() => {
    if (!pointsRef.current || !active) {
      if (pointsRef.current) {
        (pointsRef.current.material as THREE.PointsMaterial).opacity = 0;
      }
      return;
    }

    const mat = pointsRef.current.material as THREE.PointsMaterial;
    mat.opacity = 0.8;

    const fromVec = new THREE.Vector3(...from);
    const toVec = new THREE.Vector3(...to);

    for (let i = 0; i < count; i++) {
      offsets[i] = (offsets[i] + 0.005 + Math.random() * 0.003) % 1;
      const t = offsets[i];

      const pos = new THREE.Vector3().lerpVectors(fromVec, toVec, t);
      // Add slight wave
      pos.x += Math.sin(t * Math.PI * 3 + Date.now() * 0.002) * 0.1;
      pos.y += Math.sin(t * Math.PI * 2 + Date.now() * 0.003) * 0.15 + 1;

      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.04}
        transparent
        opacity={0}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Dust particles (공장 먼지)
export function DustParticles({ count = 200 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 30;
      arr[i * 3 + 1] = Math.random() * 5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return arr;
  }, [count]);

  useFrame(() => {
    if (!pointsRef.current) return;
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] += 0.001;
      if (positions[i * 3 + 1] > 5) positions[i * 3 + 1] = 0;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#888888"
        size={0.02}
        transparent
        opacity={0.3}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
