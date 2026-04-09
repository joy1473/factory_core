"use client";

import { useRef, useState, useCallback } from "react";
import { Canvas, extend, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { LumaSplatsThree } from "@lumaai/luma-web";
import * as THREE from "three";

extend({ LumaSplats: LumaSplatsThree });

declare module "@react-three/fiber" {
  interface ThreeElements {
    lumaSplats: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      source: string;
      position?: [number, number, number];
      scale?: number;
    };
  }
}

export interface DevicePosition {
  id: string;
  name: string;
  device_type: string;
  position_3d: { x: number; y: number; z: number };
}

interface SceneViewerProps {
  splatSource: string;
  devices: DevicePosition[];
  selectedDeviceId?: string | null;
  editMode?: boolean;
  editTargetId?: string | null;
  onDeviceClick?: (deviceId: string) => void;
  onPlaceDevice?: (deviceId: string, position: { x: number; y: number; z: number }) => void;
}

// ─── Pin Marker ───
function PinMarker({ device, selected, onClick }: {
  device: DevicePosition; selected?: boolean; onClick: () => void;
}) {
  return (
    <Html
      position={[device.position_3d.x, device.position_3d.y + 0.3, device.position_3d.z]}
      center
      distanceFactor={5}
      zIndexRange={[1000, 0]}
      style={{ pointerEvents: "auto", cursor: "pointer" }}
    >
      <img
        src="/images/solution/25530.jpg"
        alt={device.name}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        style={{
          width: selected ? "32px" : "24px",
          height: selected ? "40px" : "30px",
          objectFit: "contain",
          filter: selected
            ? "drop-shadow(0 0 8px rgba(255,255,255,0.8))"
            : "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
          transition: "all 0.15s ease",
        }}
      />
    </Html>
  );
}

// ─── Floor Click (편집 모드) ───
function FloorClickHandler({ onFloorClick }: { onFloorClick: (pos: { x: number; y: number; z: number }) => void }) {
  const { camera, gl } = useThree();

  const handleClick = useCallback((e: MouseEvent) => {
    const rect = gl.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    const ray = new THREE.Raycaster();
    ray.setFromCamera(mouse, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3();
    ray.ray.intersectPlane(plane, hit);
    if (hit) {
      onFloorClick({
        x: Math.round(hit.x * 100) / 100,
        y: 0.5,
        z: Math.round(hit.z * 100) / 100,
      });
    }
  }, [camera, gl, onFloorClick]);

  useState(() => {
    gl.domElement.addEventListener("dblclick", handleClick);
    return () => gl.domElement.removeEventListener("dblclick", handleClick);
  });

  return null;
}

// ─── Main ───
export function SceneViewer({ splatSource, devices, selectedDeviceId, editMode, editTargetId, onDeviceClick, onPlaceDevice }: SceneViewerProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative h-full w-full bg-black">
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        onCreated={() => setTimeout(() => setLoaded(true), 2500)}
      >
        <OrbitControls
          maxPolarAngle={Math.PI * 0.85}
          minPolarAngle={Math.PI * 0.1}
          maxDistance={20}
          minDistance={1}
          enableDamping
          dampingFactor={0.05}
        />
        <lumaSplats source={splatSource} position={[0, 0, 0]} scale={1} />

        {loaded && devices.map((d) => (
          <PinMarker
            key={d.id}
            device={d}
            selected={selectedDeviceId === d.id}
            onClick={() => onDeviceClick?.(d.id)}
          />
        ))}

        {editMode && editTargetId && loaded && (
          <FloorClickHandler onFloorClick={(pos) => onPlaceDevice?.(editTargetId, pos)} />
        )}
      </Canvas>

      {!loaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80">
          <div className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-[var(--corebot-core)] border-t-transparent" />
          <p className="text-sm text-gray-400">3D 로딩 중...</p>
        </div>
      )}

      {editMode && loaded && (
        <div className="absolute top-3 left-1/2 z-20 -translate-x-1/2 rounded-lg bg-[var(--accent)]/90 px-4 py-2 text-xs font-semibold text-black">
          {editTargetId ? "마커를 배치할 위치를 더블클릭" : "상단에서 설비를 선택하세요"}
        </div>
      )}
    </div>
  );
}
