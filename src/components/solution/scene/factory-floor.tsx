"use client";

import { useRef } from "react";
import { GridHelper } from "three";
import { useFrame } from "@react-three/fiber";

interface FactoryFloorProps {
  gridColor?: string;
}

export function FactoryFloor({ gridColor = "#A8E6CF" }: FactoryFloorProps) {
  const gridRef = useRef<GridHelper>(null);

  useFrame(() => {
    if (gridRef.current) {
      gridRef.current.material.opacity = 0.15 + Math.sin(Date.now() * 0.001) * 0.05;
    }
  });

  return (
    <group>
      {/* Main floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#050505" />
      </mesh>

      {/* Grid */}
      <gridHelper
        ref={gridRef}
        args={[40, 40, gridColor, gridColor]}
        position={[0, 0, 0]}
        material-transparent
        material-opacity={0.15}
      />

      {/* Walls (transparent wireframe) */}
      {[
        { pos: [0, 3, -20] as const, size: [40, 6, 0.1] as const },
        { pos: [-20, 3, 0] as const, size: [0.1, 6, 40] as const },
        { pos: [20, 3, 0] as const, size: [0.1, 6, 40] as const },
      ].map((wall, i) => (
        <mesh key={i} position={wall.pos}>
          <boxGeometry args={wall.size} />
          <meshStandardMaterial
            color={gridColor}
            wireframe
            transparent
            opacity={0.05}
          />
        </mesh>
      ))}
    </group>
  );
}
