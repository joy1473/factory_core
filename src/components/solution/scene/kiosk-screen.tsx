"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface ChatMsg {
  from: "user" | "ai";
  text: string;
  at: number;
  alert?: boolean;
  actions?: boolean;
}

interface KioskScreenProps {
  position: [number, number, number];
  showReport: boolean;
  scrollProgress: number;
  chatMessages?: ChatMsg[];
}

export function KioskScreen({ position, showReport, scrollProgress, chatMessages }: KioskScreenProps) {
  const screenRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (screenRef.current) {
      const mat = screenRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0; // No emissive = no bloom on screen
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
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[2.8, 2, 0.08]} />
        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Screen surface — completely dark, emissive 0 to avoid bloom */}
      <mesh ref={screenRef} position={[0, 1.8, 0.045]}>
        <planeGeometry args={[2.6, 1.8]} />
        <meshStandardMaterial
          color="#000000"
          emissive="#000000"
          emissiveIntensity={0}
          toneMapped={false}
        />
      </mesh>

      {/* Html chat UI on screen */}
      {showReport && (
        <Html
          position={[0, 1.8, 0.05]}
          transform
          distanceFactor={2.5}
          zIndexRange={[100, 0]}
          style={{ pointerEvents: "none" }}
        >
          <KioskChat progress={scrollProgress} messages={chatMessages} />
        </Html>
      )}
    </group>
  );
}

// Re-export for DOM fallback if needed
export function KioskChatOverlay({ progress }: { progress: number }) {
  const chatProgress = Math.max(0, Math.min(1, (progress - 0.65) / 0.3));
  if (chatProgress <= 0) return null;
  return (
    <div style={{ opacity: Math.min(1, chatProgress * 3) }}>
      <KioskChat progress={progress} />
    </div>
  );
}

// ─── Chat Messages ───
const CHAT_MESSAGES = [
  { from: "user" as const, text: "오늘 생산 현황 알려줘", at: 0.0 },
  {
    from: "ai" as const,
    text: "CNC-1, CNC-2, 프레스 정상 가동 중입니다.\n사출기 #4에서 이상 징후가 감지되었습니다.",
    at: 0.15,
  },
  { from: "user" as const, text: "사출기 상태 자세히", at: 0.35 },
  {
    from: "ai" as const,
    text: "⚠ 사출기 #4 베어링 마모 감지\n위험도: 82%\n권고: 3일 내 점검 필요",
    alert: true,
    at: 0.5,
  },
  { from: "user" as const, text: "보고서 만들어줘", at: 0.7 },
  {
    from: "ai" as const,
    text: "✅ 일일 설비 점검 보고서 생성 완료 (0.3초)",
    at: 0.85,
    actions: true,
  },
];

function KioskChat({ progress, messages }: { progress: number; messages?: ChatMsg[] }) {
  const MSGS = messages || CHAT_MESSAGES;
  const chatProgress = Math.max(0, Math.min(1, (progress - 0.65) / 0.3));

  return (
    <div
      style={{
        background: "#f5f7fa",
        fontFamily: "-apple-system, 'Pretendard', sans-serif",
        fontSize: "12px",
        width: "380px",
        height: "270px",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #0d1f18 0%, #1a2f24 100%)",
          color: "#fff",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "12px",
          fontWeight: "bold",
        }}
      >
        <video
          src="/video/Core.mp4"
          autoPlay
          loop
          muted
          playsInline
          style={{ width: "22px", height: "22px", borderRadius: "50%", objectFit: "cover" }}
        />
        <span style={{ color: "#A8E6CF" }}>Factory Guardian AI</span>
        <span
          style={{
            marginLeft: "auto",
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: "#A8E6CF",
          }}
        />
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          padding: "8px 10px",
          overflowY: "hidden",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
        }}
      >
        {MSGS.map((msg, i) => {
          if (chatProgress < msg.at) return null;
          const opacity = Math.min(1, (chatProgress - msg.at) / 0.08);

          if (msg.from === "user") {
            return (
              <div
                key={i}
                style={{
                  alignSelf: "flex-end",
                  background: "#2a3a30",
                  color: "#e8e8e8",
                  padding: "5px 10px",
                  borderRadius: "10px 10px 2px 10px",
                  maxWidth: "65%",
                  opacity,
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
                display: "flex",
                gap: "6px",
                maxWidth: "85%",
                opacity,
              }}
            >
              {/* Core 캐릭터 아바타 */}
              <video
                src="/video/Core.mp4"
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  flexShrink: 0,
                  marginTop: "2px",
                }}
              />
              <div
                style={{
                  background: msg.alert ? "#fff5f5" : "#f0faf5",
                  border: msg.alert ? "1px solid #FF9A9A" : "1px solid #A8E6CF40",
                  color: "#333",
                  padding: "6px 10px",
                  borderRadius: "10px 10px 10px 2px",
                  lineHeight: "1.5",
                  whiteSpace: "pre-line",
                  flex: 1,
                }}
              >
              <div style={{ display: "flex", gap: "4px", marginBottom: "3px" }}>
                <span
                  style={{
                    fontSize: "9px",
                    background: "#A8E6CF",
                    color: "#0d1f18",
                    borderRadius: "3px",
                    padding: "1px 4px",
                    fontWeight: "bold",
                  }}
                >
                  Core
                </span>
              </div>
              {msg.text}
              {msg.actions && chatProgress > 0.9 && (
                <div style={{ display: "flex", gap: "4px", marginTop: "5px" }}>
                  {[
                    { label: "📄 PDF", bg: "#A8E6CF" },
                    { label: "🔧 정비요청", bg: "#FFD3B6" },
                    { label: "📱 알림", bg: "#DDA0DD" },
                  ].map((btn) => (
                    <div
                      key={btn.label}
                      style={{
                        padding: "3px 8px",
                        background: btn.bg,
                        color: "#1a1a1a",
                        borderRadius: "4px",
                        fontSize: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      {btn.label}
                    </div>
                  ))}
                </div>
              )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div
        style={{
          borderTop: "1px solid #e0e0e0",
          padding: "6px 10px",
          display: "flex",
          gap: "6px",
          background: "#fff",
        }}
      >
        <div
          style={{
            flex: 1,
            padding: "5px 10px",
            background: "#f0f0f0",
            borderRadius: "14px",
            fontSize: "11px",
            color: "#999",
          }}
        >
          메시지를 입력하세요...
        </div>
        <div
          style={{
            width: "24px",
            height: "24px",
            background: "#A8E6CF",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#1a1a1a",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          ↑
        </div>
      </div>
    </div>
  );
}
