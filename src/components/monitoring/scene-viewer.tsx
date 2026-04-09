"use client";

import { useEffect, useRef, useState } from "react";

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
  splatUrl: string;
  devices: DevicePosition[];
  cameraPosition?: { x: number; y: number; z: number };
  cameraTarget?: { x: number; y: number; z: number };
  onDeviceClick?: (deviceId: string) => void;
}

const alertColors = { normal: "var(--corebot-core)", warning: "var(--accent)", critical: "var(--danger)" };

export function SceneViewer({ splatUrl, devices, cameraPosition, cameraTarget, onDeviceClick }: SceneViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerInitialized = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // GaussianSplats3D — 한 번만 초기화, 절대 dispose 안 함
  useEffect(() => {
    if (!containerRef.current || !splatUrl || viewerInitialized.current) return;

    const container = containerRef.current;
    const camPos = cameraPosition || { x: 0, y: 5, z: 10 };
    const camTarget = cameraTarget || { x: 0, y: 0, z: 0 };

    async function init() {
      try {
        // dynamic import — SSR 방지
        const GS3D = await import("@mkkellogg/gaussian-splats-3d");

        const viewer = new GS3D.Viewer({
          cameraUp: [0, 1, 0],
          initialCameraPosition: [camPos.x, camPos.y, camPos.z],
          initialCameraLookAt: [camTarget.x, camTarget.y, camTarget.z],
          rootElement: container,
          dynamicScene: false,
          sharedMemoryForWorkers: false,
          selfDrivenMode: true,
        });

        await viewer.addSplatScene(splatUrl, {
          showLoadingUI: false,
        });

        viewer.start();
        viewerInitialized.current = true;
        setLoading(false);
      } catch (e) {
        console.error("Splat load error:", e);
        setError("3D 씬을 로드할 수 없습니다");
        setLoading(false);
      }
    }

    init();

    // cleanup 안 함 — GaussianSplats3D dispose 버그 회피
    // 페이지 이탈 시 자연스럽게 GC됨
  }, [splatUrl, cameraPosition, cameraTarget]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {/* 3D Viewer */}
      <div ref={containerRef} className="h-full w-full" />

      {/* Loading */}
      {loading && !error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80">
          <div className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-[var(--corebot-core)] border-t-transparent" />
          <p className="text-sm text-gray-400">3D 씬 로딩 중...</p>
          <p className="mt-1 text-[10px] text-gray-600">{splatUrl}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80">
          <p className="text-sm text-[var(--danger)]">{error}</p>
          <p className="mt-1 text-[10px] text-gray-600">{splatUrl}</p>
        </div>
      )}

      {/* Device Labels (HTML overlay) */}
      {!loading && !error && (
        <div className="pointer-events-none absolute inset-0 z-20">
          {devices.map((device, i) => {
            // 3D 위치 기반 대략적 배치 (정확한 projection은 Week 2에서)
            const xPct = 20 + (i % 4) * 20;
            const yPct = 30 + Math.floor(i / 4) * 25;
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
      {!loading && !error && (
        <div className="absolute bottom-3 left-3 z-20 rounded-lg bg-black/50 px-3 py-1.5 text-[9px] text-gray-500 backdrop-blur-sm">
          드래그: 회전 · 스크롤: 줌 · 설비 클릭: 상세
        </div>
      )}
    </div>
  );
}
