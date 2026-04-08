"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface KioskScreenProps {
  position: [number, number, number];
  showReport: boolean;
  scrollProgress: number;
}

export function KioskScreen({ position, showReport, scrollProgress }: KioskScreenProps) {
  const screenRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (screenRef.current) {
      const mat = screenRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = showReport ? 0.5 : 0.2;
    }
  });

  return (
    <group position={position}>
      {/* Stand */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 1, 8]} />
        <meshStandardMaterial color="#222" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Base */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.04, 16]} />
        <meshStandardMaterial color="#222" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Screen frame */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[1.6, 1.2, 0.08]} />
        <meshStandardMaterial color="#111" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Screen display */}
      <mesh ref={screenRef} position={[0, 1.5, 0.045]}>
        <planeGeometry args={[1.4, 1]} />
        <meshStandardMaterial
          color="#0a0a0a"
          emissive={showReport ? "#00ff41" : "#003311"}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* HTML overlay on screen */}
      {showReport && (
        <Html
          position={[0, 1.5, 0.06]}
          transform
          occlude
          style={{
            width: "280px",
            height: "200px",
            pointerEvents: "none",
          }}
          scale={0.005}
        >
          <KioskReport progress={scrollProgress} />
        </Html>
      )}

      {/* Screen glow */}
      <pointLight
        color={showReport ? "#00ff41" : "#003311"}
        intensity={showReport ? 1 : 0.2}
        distance={3}
        position={[0, 1.5, 0.3]}
      />
    </group>
  );
}

function KioskReport({ progress }: { progress: number }) {
  const reportProgress = Math.max(0, Math.min(1, (progress - 0.8) / 0.15));

  return (
    <div
      style={{
        background: "#0a0a0a",
        color: "#00ff41",
        fontFamily: "'Courier New', monospace",
        fontSize: "10px",
        padding: "12px",
        width: "280px",
        height: "200px",
        overflow: "hidden",
        border: "1px solid #00ff41",
        borderRadius: "4px",
      }}
    >
      <div style={{ color: "#00d4ff", fontWeight: "bold", marginBottom: "6px", fontSize: "11px" }}>
        FACTORY GUARDIAN REPORT
      </div>
      <div style={{ borderBottom: "1px solid #00ff4133", marginBottom: "6px", paddingBottom: "4px" }}>
        {new Date().toLocaleDateString("ko-KR")} 자동 생성
      </div>
      {reportProgress > 0.1 && (
        <div style={{ marginBottom: "4px" }}>
          <span style={{ color: "#888" }}>설비 상태: </span>
          <span style={{ color: "#ff4444" }}>사출기 #4 이상 감지</span>
        </div>
      )}
      {reportProgress > 0.3 && (
        <div style={{ marginBottom: "4px" }}>
          <span style={{ color: "#888" }}>이상 유형: </span>
          베어링 마모
        </div>
      )}
      {reportProgress > 0.5 && (
        <div style={{ marginBottom: "4px" }}>
          <span style={{ color: "#888" }}>위험도: </span>
          <span style={{ color: "#ff4444", fontWeight: "bold" }}>82%</span>
        </div>
      )}
      {reportProgress > 0.7 && (
        <div style={{ marginBottom: "4px" }}>
          <span style={{ color: "#888" }}>권고: </span>
          3일 내 점검 필요
        </div>
      )}
      {reportProgress > 0.9 && (
        <div style={{ marginTop: "8px", color: "#00d4ff", fontWeight: "bold" }}>
          ✅ 보고서 자동 생성 완료 (0.3초)
        </div>
      )}

      {/* Progress bars */}
      <div style={{ marginTop: "8px" }}>
        {["CNC-1: 정상", "CNC-2: 정상", "프레스: 정상", "사출기: ⚠ 이상"].map((label, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "2px" }}>
            <span style={{ fontSize: "8px", width: "80px" }}>{label}</span>
            <div style={{
              flex: 1,
              height: "4px",
              background: "#111",
              borderRadius: "2px",
              overflow: "hidden",
            }}>
              <div style={{
                width: i === 3 ? "82%" : "95%",
                height: "100%",
                background: i === 3 ? "#ff4444" : "#00ff41",
                borderRadius: "2px",
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
