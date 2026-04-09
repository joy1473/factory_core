"use client";

import { useEffect, useRef, useState } from "react";
import * as GaussianSplats3D from "@mkkellogg/gaussian-splats-3d";
import * as THREE from "three";

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

export function SceneViewer({ splatUrl, devices, cameraPosition, cameraTarget, onDeviceClick }: SceneViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<InstanceType<typeof GaussianSplats3D.Viewer> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const labelsRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Gaussian Splat 뷰어 초기화
  useEffect(() => {
    if (!containerRef.current || !splatUrl) return;

    const container = containerRef.current;
    const camPos = cameraPosition || { x: 0, y: 5, z: 10 };
    const camTarget = cameraTarget || { x: 0, y: 0, z: 0 };

    let viewer: InstanceType<typeof GaussianSplats3D.Viewer> | null = null;

    async function init() {
      try {
        viewer = new GaussianSplats3D.Viewer({
          cameraUp: [0, 1, 0],
          initialCameraPosition: [camPos.x, camPos.y, camPos.z],
          initialCameraLookAt: [camTarget.x, camTarget.y, camTarget.z],
          rootElement: container,
          dynamicScene: false,
          sharedMemoryForWorkers: false,
        });

        viewerRef.current = viewer;

        await viewer.addSplatScene(splatUrl, {
          showLoadingUI: false,
        });

        // 내부 카메라/렌더러 참조 획득
        if (viewer.camera) cameraRef.current = viewer.camera;
        if (viewer.renderer) rendererRef.current = viewer.renderer;

        viewer.start();
        setLoading(false);
      } catch (e) {
        console.error("Splat load error:", e);
        setError("3D 씬을 로드할 수 없습니다");
        setLoading(false);
      }
    }

    init();

    return () => {
      if (viewer) {
        try { viewer.dispose(); } catch {}
      }
      viewerRef.current = null;
    };
  }, [splatUrl, cameraPosition, cameraTarget]);

  // 설비 라벨 위치 업데이트 (매 프레임)
  useEffect(() => {
    if (!viewerRef.current || devices.length === 0) return;

    let animId: number;
    const tempV = new THREE.Vector3();

    function updateLabels() {
      const viewer = viewerRef.current;
      if (!viewer || !labelsRef.current) {
        animId = requestAnimationFrame(updateLabels);
        return;
      }

      const camera = viewer.camera || cameraRef.current;
      const renderer = viewer.renderer || rendererRef.current;
      if (!camera || !renderer) {
        animId = requestAnimationFrame(updateLabels);
        return;
      }

      const canvas = renderer.domElement;
      const labels = labelsRef.current.children;

      devices.forEach((device, i) => {
        const label = labels[i] as HTMLElement;
        if (!label) return;

        const pos = device.position_3d;
        const offset = device.label_offset;
        tempV.set(pos.x + offset.x, pos.y + offset.y, pos.z + offset.z);
        tempV.project(camera);

        if (Math.abs(tempV.z) > 1) {
          label.style.display = "none";
          return;
        }

        label.style.display = "";
        const x = (tempV.x * 0.5 + 0.5) * canvas.clientWidth;
        const y = (tempV.y * -0.5 + 0.5) * canvas.clientHeight;
        label.style.transform = `translate(-50%, -100%) translate(${x}px,${y}px)`;
        label.style.zIndex = String(Math.round((-tempV.z * 0.5 + 0.5) * 100000));
      });

      animId = requestAnimationFrame(updateLabels);
    }

    animId = requestAnimationFrame(updateLabels);
    return () => cancelAnimationFrame(animId);
  }, [devices]);

  const alertColors = { normal: "var(--corebot-core)", warning: "var(--accent)", critical: "var(--danger)" };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-[var(--border)] bg-black">
      {/* 3D Viewer Container */}
      <div ref={containerRef} className="h-full w-full" />

      {/* Loading */}
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80">
          <div className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-[var(--corebot-core)] border-t-transparent" />
          <p className="text-sm text-gray-400">3D 씬 로딩 중...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
          <p className="text-sm text-[var(--danger)]">{error}</p>
        </div>
      )}

      {/* Device Labels (HTML overlay) */}
      <div ref={labelsRef} className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        {devices.map((device) => (
          <div
            key={device.id}
            className="pointer-events-auto absolute cursor-pointer"
            style={{ left: 0, top: 0 }}
            onClick={() => onDeviceClick?.(device.id)}
          >
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 backdrop-blur-md transition hover:scale-105"
              style={{ backgroundColor: "rgba(0,0,0,0.7)", border: `1px solid ${alertColors[device.alertLevel]}40` }}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: alertColors[device.alertLevel], boxShadow: `0 0 6px ${alertColors[device.alertLevel]}` }}
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
            {/* 하단 연결선 */}
            <div className="mx-auto h-3 w-px" style={{ backgroundColor: alertColors[device.alertLevel] + "60" }} />
          </div>
        ))}
      </div>

      {/* 조작 안내 */}
      {!loading && !error && (
        <div className="absolute bottom-3 left-3 z-20 rounded-lg bg-black/50 px-3 py-1.5 text-[9px] text-gray-500 backdrop-blur-sm">
          마우스 드래그: 회전 · 스크롤: 줌 · 설비 클릭: 상세
        </div>
      )}
    </div>
  );
}
