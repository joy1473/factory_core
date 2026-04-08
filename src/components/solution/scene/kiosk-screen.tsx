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
          color="#ffffff"
          emissive={showReport ? "#aaccff" : "#111122"}
          emissiveIntensity={0.3}
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
            height: "210px",
            pointerEvents: "none",
          }}
          scale={0.005}
        >
          <KioskChat progress={scrollProgress} />
        </Html>
      )}

      {/* Screen glow */}
      <pointLight
        color={showReport ? "#4488ff" : "#111122"}
        intensity={showReport ? 1.2 : 0.2}
        distance={3}
        position={[0, 1.5, 0.3]}
      />
    </group>
  );
}

// ─── Chat-style Kiosk UI ───
const CHAT_MESSAGES = [
  {
    from: "user" as const,
    text: "오늘 생산 현황 알려줘",
    at: 0.0,
  },
  {
    from: "ai" as const,
    text: "CNC-1, CNC-2, 프레스 모두 정상 가동 중입니다. 사출기 #4에서 이상 징후가 감지되었습니다.",
    at: 0.15,
  },
  {
    from: "user" as const,
    text: "사출기 상태 자세히",
    at: 0.35,
  },
  {
    from: "ai" as const,
    text: "⚠ 사출기 #4 베어링 마모 감지\n위험도: 82%\n권고: 3일 내 점검 필요\n예상 다운타임: 4시간",
    alert: true,
    at: 0.5,
  },
  {
    from: "user" as const,
    text: "보고서 만들어줘",
    at: 0.7,
  },
  {
    from: "ai" as const,
    text: "✅ 일일 설비 점검 보고서가 생성되었습니다. (0.3초)",
    at: 0.85,
    actions: true,
  },
];

function KioskChat({ progress }: { progress: number }) {
  const chatProgress = Math.max(0, Math.min(1, (progress - 0.75) / 0.2));

  return (
    <div
      style={{
        background: "#f5f7fa",
        fontFamily: "-apple-system, 'Pretendard', sans-serif",
        fontSize: "9px",
        width: "280px",
        height: "210px",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#0066ff",
          color: "#fff",
          padding: "6px 10px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "10px",
          fontWeight: "bold",
        }}
      >
        <span style={{ fontSize: "12px" }}>🏭</span>
        Factory Guardian AI
        <span
          style={{
            marginLeft: "auto",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#00ff88",
          }}
        />
      </div>

      {/* Chat messages */}
      <div
        style={{
          flex: 1,
          padding: "6px 8px",
          overflowY: "hidden",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        {CHAT_MESSAGES.map((msg, i) => {
          if (chatProgress < msg.at) return null;
          const opacity = Math.min(1, (chatProgress - msg.at) / 0.1);

          if (msg.from === "user") {
            return (
              <div
                key={i}
                style={{
                  alignSelf: "flex-end",
                  background: "#0066ff",
                  color: "#fff",
                  padding: "4px 8px",
                  borderRadius: "8px 8px 2px 8px",
                  maxWidth: "70%",
                  opacity,
                  fontSize: "9px",
                }}
              >
                {msg.text}
              </div>
            );
          }

          return (
            <div
              key={i}
              style={{
                alignSelf: "flex-start",
                background: msg.alert ? "#fff0f0" : "#fff",
                border: msg.alert ? "1px solid #ffcccc" : "1px solid #e8e8e8",
                color: "#333",
                padding: "5px 8px",
                borderRadius: "8px 8px 8px 2px",
                maxWidth: "80%",
                opacity,
                fontSize: "9px",
                lineHeight: "1.4",
                whiteSpace: "pre-line",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "3px", marginBottom: "2px" }}>
                <span style={{ fontSize: "8px", background: "#0066ff", color: "#fff", borderRadius: "3px", padding: "1px 3px", fontWeight: "bold" }}>
                  AI
                </span>
              </div>
              {msg.text}

              {/* Action buttons for last message */}
              {msg.actions && chatProgress > 0.9 && (
                <div style={{ display: "flex", gap: "3px", marginTop: "4px" }}>
                  <div
                    style={{
                      padding: "3px 6px",
                      background: "#0066ff",
                      color: "#fff",
                      borderRadius: "4px",
                      fontSize: "7px",
                      fontWeight: "bold",
                    }}
                  >
                    📄 PDF
                  </div>
                  <div
                    style={{
                      padding: "3px 6px",
                      background: "#ff6600",
                      color: "#fff",
                      borderRadius: "4px",
                      fontSize: "7px",
                      fontWeight: "bold",
                    }}
                  >
                    🔧 정비요청
                  </div>
                  <div
                    style={{
                      padding: "3px 6px",
                      background: "#22cc66",
                      color: "#fff",
                      borderRadius: "4px",
                      fontSize: "7px",
                      fontWeight: "bold",
                    }}
                  >
                    📱 알림전송
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {chatProgress > 0.1 && chatProgress < 0.85 && (
          <div
            style={{
              alignSelf: "flex-start",
              background: "#fff",
              border: "1px solid #e8e8e8",
              padding: "4px 10px",
              borderRadius: "8px",
              fontSize: "10px",
              color: "#999",
              display: "flex",
              gap: "2px",
            }}
          >
            <span style={{ animation: "pulse 1s infinite" }}>●</span>
            <span style={{ animation: "pulse 1s infinite 0.2s" }}>●</span>
            <span style={{ animation: "pulse 1s infinite 0.4s" }}>●</span>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div
        style={{
          borderTop: "1px solid #e0e0e0",
          padding: "5px 8px",
          display: "flex",
          gap: "4px",
          background: "#fff",
        }}
      >
        <div
          style={{
            flex: 1,
            padding: "4px 8px",
            background: "#f0f0f0",
            borderRadius: "12px",
            fontSize: "8px",
            color: "#999",
          }}
        >
          메시지를 입력하세요...
        </div>
        <div
          style={{
            width: "20px",
            height: "20px",
            background: "#0066ff",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
          }}
        >
          ↑
        </div>
      </div>
    </div>
  );
}
