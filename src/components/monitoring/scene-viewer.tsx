"use client";

import { useState } from "react";
import { Canvas, extend } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { LumaSplatsThree } from "@lumaai/luma-web";

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

interface DevicePosition {
  id: string;
  name: string;
  device_type: string;
  status: string;
  position_3d: { x: number; y: number; z: number };
  label_offset: { x: number; y: number; z: number };
  latestTemp?: number;
  latestVib?: number;
  alertLevel: "normal" | "warning" | "critical";
}

interface SceneViewerProps {
  splatSource: string;
  devices: DevicePosition[];
  onDeviceClick?: (deviceId: string) => void;
}

const alertColors = { normal: "#A8E6CF", warning: "#FFD3B6", critical: "#FF9A9A" };

export function SceneViewer({ splatSource, devices, onDeviceClick }: SceneViewerProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative h-full w-full overflow-hidden bg-black" style={{ minHeight: "400px" }}>
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        onCreated={() => {
          // Canvas 준비 후 약간의 지연으로 loaded 처리
          setTimeout(() => setLoaded(true), 2000);
        }}
      >
        <OrbitControls
          maxPolarAngle={Math.PI * 0.85}
          minPolarAngle={Math.PI * 0.1}
          maxDistance={20}
          minDistance={1}
          enableDamping
          dampingFactor={0.05}
        />
        <lumaSplats
          source={splatSource}
          position={[0, 0, 0]}
          scale={1}
        />
      </Canvas>

      {/* Loading */}
      {!loaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80">
          <div className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-[var(--corebot-core)] border-t-transparent" />
          <p className="text-sm text-gray-400">3D 씬 로딩 중...</p>
        </div>
      )}

      {/* Device Labels */}
      {loaded && (
        <div className="pointer-events-none absolute inset-0 z-20">
          {devices.map((device, i) => {
            const xPct = 15 + (i % 4) * 20;
            const yPct = 25 + Math.floor(i / 4) * 30;
            return (
              <div
                key={device.id}
                className="pointer-events-auto absolute cursor-pointer"
                style={{ left: `${xPct}%`, top: `${yPct}%`, transform: "translate(-50%, -100%)" }}
                onClick={() => onDeviceClick?.(device.id)}
              >
                <div
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 backdrop-blur-md transition hover:scale-105"
                  style={{ backgroundColor: "rgba(0,0,0,0.75)", border: `1px solid ${alertColors[device.alertLevel]}40` }}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: alertColors[device.alertLevel], boxShadow: `0 0 8px ${alertColors[device.alertLevel]}` }}
                  />
                  <div>
                    <p className="text-[11px] font-bold text-white">{device.name}</p>
                    <p className="text-[9px] text-gray-400">
                      {device.latestTemp !== undefined ? `${device.latestTemp}°C` : ""}
                      {device.latestVib !== undefined ? ` · ${device.latestVib}mm/s` : ""}
                      {device.latestTemp === undefined && device.latestVib === undefined ? device.device_type : ""}
                    </p>
                  </div>
                </div>
                <div className="mx-auto h-4 w-px" style={{ backgroundColor: alertColors[device.alertLevel] + "60" }} />
                <div className="mx-auto h-2 w-2 rounded-full" style={{ backgroundColor: alertColors[device.alertLevel], boxShadow: `0 0 6px ${alertColors[device.alertLevel]}` }} />
              </div>
            );
          })}
        </div>
      )}

      {/* Controls hint */}
      {loaded && (
        <div className="absolute bottom-3 left-3 z-20 rounded-lg bg-black/50 px-3 py-1.5 text-[9px] text-gray-500 backdrop-blur-sm">
          드래그: 회전 · 스크롤: 줌 · 설비 클릭: 상세
        </div>
      )}
    </div>
  );
}
