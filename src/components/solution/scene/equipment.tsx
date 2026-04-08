"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface EquipmentProps {
  position: [number, number, number];
  type: string;
  alert?: boolean;
  scrollProgress: number;
}

export function Equipment({ position, type, alert = false, scrollProgress }: EquipmentProps) {
  const groupRef = useRef<THREE.Group>(null);
  const alertProgress = useRef(0);

  const color = alert && scrollProgress > 0.6
    ? new THREE.Color("#ff2222")
    : new THREE.Color("#1a1a2e");

  const edgeColor = alert && scrollProgress > 0.6
    ? "#ff4444"
    : "#00d4ff";

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    // 미세 진동 (가동 중 느낌)
    groupRef.current.position.y = position[1] + Math.sin(Date.now() * 0.01) * 0.003;

    // 경고 시 진동 강화
    if (alert && scrollProgress > 0.6) {
      alertProgress.current = Math.min(1, alertProgress.current + delta * 0.5);
      const shake = Math.sin(Date.now() * 0.05) * 0.02 * alertProgress.current;
      groupRef.current.position.x = position[0] + shake;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {type === "cnc" && <CNCMachine color={color} edgeColor={edgeColor} />}
      {type === "press" && <PressMachine color={color} edgeColor={edgeColor} scrollProgress={scrollProgress} />}
      {type === "injection" && <InjectionMachine color={color} edgeColor={edgeColor} />}
      {type === "smt" && <SMTLine color={color} edgeColor={edgeColor} />}
      {type === "reflow" && <ReflowOven color={color} edgeColor={edgeColor} />}
      {type === "aoi" && <AOIInspector color={color} edgeColor={edgeColor} />}
      {type === "wirecut" && <WireCut color={color} edgeColor={edgeColor} />}
      {type === "grinder" && <GrinderMachine color={color} edgeColor={edgeColor} />}
      {type === "server" && <ServerRack color={color} edgeColor={edgeColor} />}
      {type === "desk" && <DeskCluster color={color} edgeColor={edgeColor} />}
      {type === "meeting" && <MeetingRoom color={color} edgeColor={edgeColor} />}

      {/* 설비 이름 라벨 */}
      <mesh position={[0, 2.5, 0]}>
        <planeGeometry args={[1.5, 0.3]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function CNCMachine({ color, edgeColor }: { color: THREE.Color; edgeColor: string }) {
  return (
    <group>
      {/* 본체 */}
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[2, 1.5, 1.5]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} />
      </mesh>
      {/* 와이어프레임 엣지 */}
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[2.02, 1.52, 1.52]} />
        <meshBasicMaterial color={edgeColor} wireframe transparent opacity={0.3} />
      </mesh>
      {/* 스핀들 */}
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 8]} />
        <meshStandardMaterial color="#333" metalness={0.9} roughness={0.1} emissive={edgeColor} emissiveIntensity={0.2} />
      </mesh>
      {/* 컨트롤 패널 */}
      <mesh position={[1.05, 1, 0]}>
        <boxGeometry args={[0.1, 0.6, 0.4]} />
        <meshStandardMaterial color="#111" emissive="#00ff41" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function PressMachine({ color, edgeColor, scrollProgress }: { color: THREE.Color; edgeColor: string; scrollProgress: number }) {
  const pistonRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (pistonRef.current) {
      pistonRef.current.position.y = 2.2 + Math.sin(Date.now() * 0.003) * 0.15;
    }
  });

  return (
    <group>
      {/* 하부 베이스 */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[2.5, 0.8, 2]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[2.52, 0.82, 2.02]} />
        <meshBasicMaterial color={edgeColor} wireframe transparent opacity={0.3} />
      </mesh>
      {/* 기둥 */}
      {[-0.9, 0.9].map((x, i) => (
        <mesh key={i} position={[x, 1.5, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 2.2, 8]} />
          <meshStandardMaterial color="#333" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
      {/* 피스톤 (상하 이동) */}
      <mesh ref={pistonRef} position={[0, 2.2, 0]}>
        <boxGeometry args={[2, 0.5, 1.8]} />
        <meshStandardMaterial color="#222" metalness={0.9} roughness={0.2} emissive={edgeColor} emissiveIntensity={0.1} />
      </mesh>
    </group>
  );
}

function InjectionMachine({ color, edgeColor }: { color: THREE.Color; edgeColor: string }) {
  return (
    <group>
      {/* 메인 바디 (긴 박스) */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[3.5, 1.6, 1.2]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[3.52, 1.62, 1.22]} />
        <meshBasicMaterial color={edgeColor} wireframe transparent opacity={0.3} />
      </mesh>
      {/* 호퍼 (삼각뿔) */}
      <mesh position={[-1.2, 2.2, 0]}>
        <coneGeometry args={[0.4, 0.8, 4]} />
        <meshStandardMaterial color="#333" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* 노즐 */}
      <mesh position={[2, 0.8, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.15, 0.6, 8]} />
        <meshStandardMaterial color="#444" metalness={0.9} roughness={0.1} emissive={edgeColor} emissiveIntensity={0.15} />
      </mesh>
    </group>
  );
}

// ─── Electronics Equipment ───
function SMTLine({ color, edgeColor }: { color: THREE.Color; edgeColor: string }) {
  return (
    <group>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[4, 1, 1]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[4.02, 1.02, 1.02]} />
        <meshBasicMaterial color={edgeColor} wireframe transparent opacity={0.3} />
      </mesh>
      {[-1.5, -0.5, 0.5, 1.5].map((x, i) => (
        <mesh key={i} position={[x, 1.1, 0]}>
          <boxGeometry args={[0.3, 0.2, 0.3]} />
          <meshStandardMaterial color="#333" emissive="#00ff41" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function ReflowOven({ color, edgeColor }: { color: THREE.Color; edgeColor: string }) {
  return (
    <group>
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[2.5, 1.6, 1.5]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[2.52, 1.62, 1.52]} />
        <meshBasicMaterial color={edgeColor} wireframe transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, 1.7, 0.76]}>
        <planeGeometry args={[1.5, 0.3]} />
        <meshStandardMaterial color="#111" emissive="#ff6600" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

function AOIInspector({ color, edgeColor }: { color: THREE.Color; edgeColor: string }) {
  return (
    <group>
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.5, 1.2, 1]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.52, 1.22, 1.02]} />
        <meshBasicMaterial color={edgeColor} wireframe transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.4, 8]} />
        <meshStandardMaterial color="#222" emissive="#00d4ff" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.8, 1, 0.1]}>
        <boxGeometry args={[0.6, 0.5, 0.05]} />
        <meshStandardMaterial color="#111" emissive="#00ff41" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

// ─── Metal Equipment ───
function WireCut({ color, edgeColor }: { color: THREE.Color; edgeColor: string }) {
  return (
    <group>
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[1.8, 1.4, 1.2]} />
        <meshStandardMaterial color={color} metalness={0.85} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[1.82, 1.42, 1.22]} />
        <meshBasicMaterial color={edgeColor} wireframe transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.6, 4]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={1.5} toneMapped={false} />
      </mesh>
    </group>
  );
}

function GrinderMachine({ color, edgeColor }: { color: THREE.Color; edgeColor: string }) {
  return (
    <group>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.5, 0.8, 1.5]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.15, 32]} />
        <meshStandardMaterial color="#555" metalness={0.9} roughness={0.1} emissive={edgeColor} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.52, 0.82, 1.52]} />
        <meshBasicMaterial color={edgeColor} wireframe transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

// ─── Office Equipment ───
function ServerRack({ color, edgeColor }: { color: THREE.Color; edgeColor: string }) {
  return (
    <group>
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[0.8, 2.4, 0.8]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[0.82, 2.42, 0.82]} />
        <meshBasicMaterial color={edgeColor} wireframe transparent opacity={0.3} />
      </mesh>
      {[0.4, 0.8, 1.2, 1.6, 2.0].map((y, i) => (
        <mesh key={i} position={[0, y, 0.42]}>
          <boxGeometry args={[0.6, 0.08, 0.02]} />
          <meshStandardMaterial color="#111" emissive={i === 0 ? "#ff4444" : "#00ff41"} emissiveIntensity={1.5} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function DeskCluster({ color, edgeColor }: { color: THREE.Color; edgeColor: string }) {
  return (
    <group>
      {[[-0.8, 0], [0.8, 0], [-0.8, -1.2], [0.8, -1.2]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[1.2, 0.05, 0.6]} />
            <meshStandardMaterial color="#8B7355" />
          </mesh>
          <mesh position={[0, 0.7, -0.1]}>
            <boxGeometry args={[0.5, 0.35, 0.03]} />
            <meshStandardMaterial color="#111" emissive={edgeColor} emissiveIntensity={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function MeetingRoom({ color, edgeColor }: { color: THREE.Color; edgeColor: string }) {
  return (
    <group>
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[2.5, 0.05, 1.2]} />
        <meshStandardMaterial color="#5C4033" />
      </mesh>
      {[[-0.8, 0.6], [0.8, 0.6], [-0.8, -0.6], [0.8, -0.6]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.3, z]}>
          <boxGeometry args={[0.3, 0.5, 0.3]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      ))}
      <mesh position={[0, 1.2, -0.65]}>
        <boxGeometry args={[2.5, 1.5, 0.05]} />
        <meshStandardMaterial color="#88ccff" transparent opacity={0.15} />
      </mesh>
      <mesh position={[0, 1.2, -0.65]}>
        <boxGeometry args={[2.52, 1.52, 0.06]} />
        <meshBasicMaterial color={edgeColor} wireframe transparent opacity={0.2} />
      </mesh>
    </group>
  );
}
