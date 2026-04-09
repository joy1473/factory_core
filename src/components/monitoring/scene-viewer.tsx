"use client";

import { useRef, useState } from "react";
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

// ─── Types ───
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
  selectedDeviceId?: string | null;
  onDeviceClick?: (deviceId: string) => void;
  onDeviceMove?: (deviceId: string, position: { x: number; y: number; z: number }) => void;
}

const ALERT_COLORS = { normal: "#A8E6CF", warning: "#FFD3B6", critical: "#FF9A9A" };

// ─── 3D Device Marker ───
function DeviceMarker3D({
  device, editMode, selected, onClick, onDragEnd,
}: {
  device: DevicePosition; editMode?: boolean; selected?: boolean;
  onClick: () => void; onDragEnd?: (pos: { x: number; y: number; z: number }) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const { camera, raycaster, gl } = useThree();
  const color = ALERT_COLORS[device.alertLevel];
  const pos = device.position_3d;

  // 드래그 핸들러 (editMode일 때만)
  function handlePointerDown(e: any) {
    if (!editMode) return;
    e.stopPropagation();
    setDragging(true);
    gl.domElement.style.cursor = "grabbing";
  }

  function handlePointerUp(e: any) {
    if (!dragging) return;
    e.stopPropagation();
    setDragging(false);
    gl.domElement.style.cursor = "auto";
    if (meshRef.current && onDragEnd) {
      const p = meshRef.current.position;
      onDragEnd({ x: Math.round(p.x * 100) / 100, y: Math.round(p.y * 100) / 100, z: Math.round(p.z * 100) / 100 });
    }
  }

  function handlePointerMove(e: any) {
    if (!dragging || !meshRef.current) return;
    e.stopPropagation();
    // 바닥 평면(y=pos.y)에 레이캐스트하여 XZ 이동
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -pos.y);
    const mouse = new THREE.Vector2(
      (e.clientX / gl.domElement.clientWidth) * 2 - 1,
      -(e.clientY / gl.domElement.clientHeight) * 2 + 1
    );
    const ray = new THREE.Raycaster();
    ray.setFromCamera(mouse, camera);
    const intersection = new THREE.Vector3();
    ray.ray.intersectPlane(plane, intersection);
    if (intersection) {
      meshRef.current.position.x = intersection.x;
      meshRef.current.position.z = intersection.z;
    }
  }

  return (
    <group>
      {/* 마커 구체 */}
      <mesh
        ref={meshRef}
        position={[pos.x, pos.y + 0.5, pos.z]}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={() => { setHovered(true); gl.domElement.style.cursor = editMode ? "grab" : "pointer"; }}
        onPointerOut={() => { setHovered(false); if (!dragging) gl.domElement.style.cursor = "auto"; }}
        onPointerDown={handlePointerDown as unknown as (e: any) => void}
        onPointerUp={handlePointerUp as unknown as (e: any) => void}
        onPointerMove={handlePointerMove as unknown as (e: any) => void}
      >
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={hovered || selected ? 1 : 0.8} />
      </mesh>

      {/* 글로우 */}
      <pointLight
        position={[pos.x, pos.y + 0.5, pos.z]}
        color={color}
        intensity={device.alertLevel === "critical" ? 2 : 0.5}
        distance={2}
      />

      {/* 바닥 연결선 */}
      <mesh position={[pos.x, pos.y + 0.25, pos.z]}>
        <cylinderGeometry args={[0.01, 0.01, 0.5, 4]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>

      {/* HTML 라벨 */}
      <Html
        position={[pos.x, pos.y + 1.0, pos.z]}
        center
        distanceFactor={8}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <div style={{
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(8px)",
          border: `1px solid ${color}40`,
          borderRadius: "8px",
          padding: "6px 10px",
          whiteSpace: "nowrap",
          transform: "translateY(-100%)",
          boxShadow: selected ? `0 0 12px ${color}40` : "none",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{
              width: "8px", height: "8px", borderRadius: "50%",
              backgroundColor: color, boxShadow: `0 0 6px ${color}`,
              display: "inline-block",
            }} />
            <span style={{ fontSize: "11px", fontWeight: "bold", color: "#fff" }}>{device.name}</span>
          </div>
          <div style={{ fontSize: "9px", color: "#aaa", marginTop: "2px" }}>
            {device.latestTemp !== undefined && `${device.latestTemp}°C`}
            {device.latestVib !== undefined && ` · ${device.latestVib}mm/s`}
            {device.latestRms !== undefined && ` · ${device.latestRms}dB`}
            {device.latestTemp === undefined && device.latestVib === undefined && device.latestRms === undefined && device.device_type}
          </div>
        </div>
      </Html>
    </group>
  );
}

// ─── Main Scene Viewer ───
export function SceneViewer({ splatSource, devices, editMode, selectedDeviceId, onDeviceClick, onDeviceMove }: SceneViewerProps) {
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
          enabled={!editMode}
        />

        {/* Gaussian Splat 3D Scene */}
        <lumaSplats source={splatSource} position={[0, 0, 0]} scale={1} />

        {/* 3D Device Markers */}
        {loaded && devices.map((device) => (
          <DeviceMarker3D
            key={device.id}
            device={device}
            editMode={editMode}
            selected={selectedDeviceId === device.id}
            onClick={() => onDeviceClick?.(device.id)}
            onDragEnd={(pos) => onDeviceMove?.(device.id, pos)}
          />
        ))}
      </Canvas>

      {/* Loading */}
      {!loaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80">
          <div className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-[var(--corebot-core)] border-t-transparent" />
          <p className="text-sm text-gray-400">3D 씬 로딩 중...</p>
        </div>
      )}

      {/* Edit mode indicator */}
      {editMode && loaded && (
        <div className="absolute top-3 left-1/2 z-20 -translate-x-1/2 rounded-lg bg-[var(--accent)]/90 px-4 py-1.5 text-xs font-semibold text-black">
          편집 모드 — 설비 마커를 드래그하여 위치 조정
        </div>
      )}

      {/* Controls hint */}
      {!editMode && loaded && (
        <div className="absolute bottom-3 left-3 z-20 rounded-lg bg-black/50 px-3 py-1.5 text-[9px] text-gray-500 backdrop-blur-sm">
          드래그: 회전 · 스크롤: 줌 · 설비 클릭: 상세
        </div>
      )}
    </div>
  );
}
