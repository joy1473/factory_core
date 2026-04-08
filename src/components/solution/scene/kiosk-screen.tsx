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
        background: "#ffffff",
        color: "#333",
        fontFamily: "-apple-system, sans-serif",
        fontSize: "10px",
        padding: "12px",
        width: "280px",
        height: "200px",
        overflow: "hidden",
        borderRadius: "6px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
        <span style={{ color: "#0066ff", fontWeight: "bold", fontSize: "11px" }}>
          Factory Guardian
        </span>
        <span style={{ color: "#999", fontSize: "8px" }}>
          {new Date().toLocaleDateString("ko-KR")}
        </span>
      </div>
      <div style={{ borderBottom: "1px solid #eee", marginBottom: "6px", paddingBottom: "4px", fontSize: "9px", color: "#666" }}>
        실시간 설비 모니터링 리포트
      </div>
      {/* Alert card */}
      {reportProgress > 0.1 && (
        <div style={{
          marginBottom: "6px",
          padding: "6px 8px",
          background: "#fff0f0",
          borderRadius: "4px",
          borderLeft: "3px solid #ff4444",
        }}>
          <div style={{ fontWeight: "bold", color: "#cc0000", fontSize: "9px", marginBottom: "2px" }}>
            ⚠ 사출기 #4 이상 감지
          </div>
          {reportProgress > 0.3 && (
            <div style={{ color: "#666", fontSize: "8px" }}>유형: 베어링 마모</div>
          )}
          {reportProgress > 0.5 && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
              <span style={{ fontSize: "8px", color: "#666" }}>위험도</span>
              <div style={{ flex: 1, height: "6px", background: "#ffe0e0", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: "82%", height: "100%", background: "#ff4444", borderRadius: "3px" }} />
              </div>
              <span style={{ fontSize: "9px", fontWeight: "bold", color: "#ff4444" }}>82%</span>
            </div>
          )}
          {reportProgress > 0.7 && (
            <div style={{ fontSize: "8px", color: "#ff6600", marginTop: "3px", fontWeight: "600" }}>
              → 3일 내 점검 권고
            </div>
          )}
        </div>
      )}

      {/* Status bars */}
      <div style={{ marginBottom: "6px" }}>
        {[
          { name: "CNC-1", value: 98, ok: true },
          { name: "CNC-2", value: 95, ok: true },
          { name: "프레스", value: 97, ok: true },
          { name: "사출기", value: 82, ok: false },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "3px" }}>
            <span style={{ fontSize: "8px", width: "40px", color: "#888" }}>{item.name}</span>
            <div style={{ flex: 1, height: "5px", background: "#f0f0f0", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{
                width: `${item.value}%`,
                height: "100%",
                background: item.ok ? "#22cc66" : "#ff4444",
                borderRadius: "3px",
              }} />
            </div>
            <span style={{
              fontSize: "8px",
              fontWeight: "bold",
              color: item.ok ? "#22cc66" : "#ff4444",
              width: "24px",
              textAlign: "right",
            }}>
              {item.value}%
            </span>
          </div>
        ))}
      </div>

      {/* Generated report confirmation */}
      {reportProgress > 0.9 && (
        <div style={{
          padding: "4px 8px",
          background: "#f0f8ff",
          borderRadius: "4px",
          fontSize: "9px",
          color: "#0066ff",
          fontWeight: "bold",
          marginBottom: "6px",
        }}>
          ✅ 보고서 자동 생성 완료 (0.3초)
        </div>
      )}

      {/* Action buttons */}
      {reportProgress > 0.9 && (
        <div style={{ display: "flex", gap: "4px" }}>
          <div style={{
            flex: 1,
            padding: "5px 6px",
            background: "#0066ff",
            color: "#fff",
            borderRadius: "4px",
            fontSize: "8px",
            fontWeight: "bold",
            textAlign: "center",
          }}>
            📄 PDF 다운로드
          </div>
          <div style={{
            flex: 1,
            padding: "5px 6px",
            background: "#ff6600",
            color: "#fff",
            borderRadius: "4px",
            fontSize: "8px",
            fontWeight: "bold",
            textAlign: "center",
          }}>
            🔧 정비 요청
          </div>
        </div>
      )}

      {/* Worker status */}
      {reportProgress > 0.5 && (
        <div style={{
          marginTop: "6px",
          padding: "4px 8px",
          background: "#f8f8f8",
          borderRadius: "4px",
          fontSize: "8px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}>
          <span style={{ fontSize: "10px" }}>👷</span>
          <span style={{ color: "#333", fontWeight: "600" }}>김반장</span>
          <span style={{ color: "#999" }}>· 키오스크 앞 확인 중</span>
        </div>
      )}
    </div>
  );
}
