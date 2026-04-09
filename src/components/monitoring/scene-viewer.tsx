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
      semanticsMask?: number;
      position?: [number, number, number];
      scale?: number;
    };
  }
}

export interface DevicePosition {
  id: string;
  name: string;
  device_type: string;
  status: string;
  position_3d: { x: number; y: number; z: number };
  latestTemp?: number;
  latestVib?: number;
  latestRms?: number;
  alertLevel: "normal" | "warning" | "critical";
}

interface SceneViewerProps {
  splatSource: string;
  devices: DevicePosition[];
  editMode?: boolean;
  editTargetId?: string | null;
  selectedDeviceId?: string | null;
  onDeviceClick?: (deviceId: string) => void;
  onPlaceDevice?: (deviceId: string, position: { x: number; y: number; z: number }) => void;
  onRemoveDevice?: (deviceId: string) => void;
}

const ALERT_COLORS = { normal: "#4ade80", warning: "#fbbf24", critical: "#ef4444" };

// ─── 3D 마커 ───
function DeviceMarker3D({ device, selected, editMode, onClick, onRemove }: {
  device: DevicePosition; selected?: boolean; editMode?: boolean; onClick: () => void; onRemove?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const pos = device.position_3d;

  return (
    <group>
      <Html
        position={[pos.x, pos.y + 0.5, pos.z]}
        center
        distanceFactor={6}
        zIndexRange={[1000, 0]}
        style={{ pointerEvents: "auto", userSelect: "none", cursor: "pointer" }}
      >
        <div
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}
        >
          {/* 라벨 */}
          <div style={{
            background: selected ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.8)",
            backdropFilter: "blur(8px)",
            borderRadius: "6px",
            padding: "4px 8px",
            whiteSpace: "nowrap",
            marginBottom: "2px",
            boxShadow: selected ? "0 0 10px rgba(255,255,255,0.3)" : "none",
            position: "relative",
          }}>
            {/* 편집 모드 X 버튼 */}
            {editMode && hovered && (
              <button
                onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
                style={{
                  position: "absolute", top: "-6px", right: "-6px",
                  width: "16px", height: "16px", borderRadius: "50%",
                  backgroundColor: "#ef4444", color: "#fff", border: "none",
                  fontSize: "10px", fontWeight: "bold", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >×</button>
            )}
            <span style={{ fontSize: "10px", fontWeight: "bold", color: selected ? "#000" : "#fff" }}>{device.name}</span>
          </div>

          {/* 핀 이미지 */}
          <img
            src="/images/solution/25530.jpg"
            alt="pin"
            style={{
              width: hovered ? "28px" : "24px",
              height: hovered ? "36px" : "32px",
              objectFit: "contain",
              filter: selected ? "brightness(1.3) drop-shadow(0 0 4px white)" : "drop-shadow(0 2px 3px rgba(0,0,0,0.5))",
              transition: "all 0.15s ease",
            }}
          />
        </div>
      </Html>
    </group>
  );
}

// ─── 바닥 클릭 감지 (편집 모드) ───
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
    const intersection = new THREE.Vector3();
    const hit = ray.ray.intersectPlane(plane, intersection);
    if (hit) {
      onFloorClick({
        x: Math.round(intersection.x * 100) / 100,
        y: 0.5,
        z: Math.round(intersection.z * 100) / 100,
      });
    }
  }, [camera, gl, onFloorClick]);

  // Canvas 클릭 이벤트 등록
  useState(() => {
    gl.domElement.addEventListener("dblclick", handleClick);
    return () => gl.domElement.removeEventListener("dblclick", handleClick);
  });

  return null;
}

// ─── Main ───
export function SceneViewer({ splatSource, devices, editMode, editTargetId, selectedDeviceId, onDeviceClick, onPlaceDevice, onRemoveDevice }: SceneViewerProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative h-full w-full overflow-hidden bg-black" style={{ minHeight: "400px" }}>
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        onCreated={() => setTimeout(() => setLoaded(true), 2000)}
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

        {loaded && devices.map((device) => (
          <DeviceMarker3D
            key={device.id}
            device={device}
            selected={selectedDeviceId === device.id}
            editMode={editMode}
            onClick={() => onDeviceClick?.(device.id)}
            onRemove={() => onRemoveDevice?.(device.id)}
          />
        ))}

        {/* 편집 모드: 더블클릭으로 선택된 설비 이동 */}
        {editMode && editTargetId && loaded && (
          <FloorClickHandler onFloorClick={(pos) => onPlaceDevice?.(editTargetId, pos)} />
        )}
      </Canvas>

      {/* Loading */}
      {!loaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80">
          <div className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-[var(--corebot-core)] border-t-transparent" />
          <p className="text-sm text-gray-400">3D 씬 로딩 중...</p>
        </div>
      )}

      {/* Edit mode guide */}
      {editMode && loaded && (
        <div className="absolute top-3 left-1/2 z-20 -translate-x-1/2 rounded-lg bg-[var(--accent)]/90 px-4 py-2 text-center text-xs font-semibold text-black">
          {editTargetId
            ? `설비를 이동할 위치를 더블클릭하세요`
            : `이동할 설비 마커를 클릭하세요`}
        </div>
      )}

      {/* Controls */}
      {!editMode && loaded && (
        <div className="absolute bottom-3 left-3 z-20 rounded-lg bg-black/50 px-3 py-1.5 text-[9px] text-gray-500 backdrop-blur-sm">
          드래그: 회전 · 스크롤: 줌 · 설비 클릭: 상세
        </div>
      )}
    </div>
  );
}
