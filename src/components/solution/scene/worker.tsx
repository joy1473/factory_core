"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface WorkerProps {
  scrollProgress: number;
  visible: boolean;
  primaryColor?: string;
  accentColor?: string;
}

// Waypoints: walk path → end at kiosk
const WAYPOINTS: THREE.Vector3[] = [
  new THREE.Vector3(-6, 0, 5),
  new THREE.Vector3(-3, 0, 3),
  new THREE.Vector3(0, 0, 2),
  new THREE.Vector3(3, 0, 0),
  new THREE.Vector3(6, 0, -1),
  new THREE.Vector3(5, 0, -2.5),
];

const KIOSK_LOOK = new THREE.Vector3(6, 1.5, -3);

export function Worker({ scrollProgress, visible, primaryColor = "#A8E6CF", accentColor = "#7FCDBB" }: WorkerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bobOffset = useRef(0);
  const armRef = useRef<THREE.Mesh>(null);
  const blinkRef = useRef(0);
  const antennaRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!groupRef.current || !visible) return;

    // Blink timer
    blinkRef.current += delta;

    // Antenna wobble
    if (antennaRef.current) {
      antennaRef.current.rotation.z = Math.sin(Date.now() * 0.003) * 0.15;
    }

    const isAtKiosk = scrollProgress > 0.65;

    if (!isAtKiosk) {
      const walkProgress = Math.max(0, Math.min(1, (scrollProgress - 0.3) / 0.35));
      const totalSegments = WAYPOINTS.length - 1;
      const segment = Math.min(Math.floor(walkProgress * totalSegments), totalSegments - 1);
      const t = (walkProgress * totalSegments) - segment;

      const from = WAYPOINTS[segment];
      const to = WAYPOINTS[Math.min(segment + 1, WAYPOINTS.length - 1)];
      const pos = new THREE.Vector3().lerpVectors(from, to, t);

      // Walking bob + body sway
      bobOffset.current += delta * 8;
      pos.y = Math.abs(Math.sin(bobOffset.current)) * 0.04;

      groupRef.current.position.lerp(pos, 0.1);

      // Body sway while walking
      groupRef.current.rotation.z = Math.sin(bobOffset.current * 0.5) * 0.05;

      // Face walk direction
      const dir = new THREE.Vector3().subVectors(to, from).normalize();
      if (dir.length() > 0.01) {
        const angle = Math.atan2(dir.x, dir.z);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          angle,
          0.1
        );
      }
    } else {
      const kioskFrontPos = new THREE.Vector3(5, 0, -2.5);
      groupRef.current.position.lerp(kioskFrontPos, 0.05);
      groupRef.current.position.y = 0;
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.05);

      const lookDir = new THREE.Vector3()
        .subVectors(KIOSK_LOOK, kioskFrontPos)
        .normalize();
      const targetAngle = Math.atan2(lookDir.x, lookDir.z);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetAngle,
        0.05
      );

      if (armRef.current && scrollProgress > 0.78) {
        const armAngle = THREE.MathUtils.lerp(0, -0.8, Math.min(1, (scrollProgress - 0.78) / 0.1));
        armRef.current.rotation.x = armAngle;
      }
    }
  });

  if (!visible) return null;

  // Eye blink: closed for 0.15s every 3s
  const blinkPhase = blinkRef.current % 3;
  const eyeScaleY = blinkPhase > 2.85 ? 0.2 : 1;

  return (
    <group ref={groupRef} position={[-6, 0, 5]}>
      {/* Body — rounded cylinder, wider at bottom (Gudetama proportions) */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.28, 0.35, 0.7, 16]} />
        <meshStandardMaterial
          color={primaryColor}
          emissive={primaryColor}
          emissiveIntensity={0.1}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>
      {/* Body edge glow */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.29, 0.36, 0.72, 16]} />
        <meshBasicMaterial color={primaryColor} wireframe transparent opacity={0.15} />
      </mesh>

      {/* Head — bigger than body (cute ratio) */}
      <mesh position={[0, 1.15, 0]}>
        <sphereGeometry args={[0.35, 20, 20]} />
        <meshStandardMaterial
          color="#f5f0e8"
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>

      {/* Left Eye — LED */}
      <mesh position={[-0.12, 1.2, 0.28]} scale={[1, eyeScaleY, 1]}>
        <sphereGeometry args={[0.055, 12, 12]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </mesh>
      {/* Right Eye — LED */}
      <mesh position={[0.12, 1.2, 0.28]} scale={[1, eyeScaleY, 1]}>
        <sphereGeometry args={[0.055, 12, 12]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </mesh>

      {/* Mouth — small happy curve (tiny torus arc) */}
      <mesh position={[0, 1.08, 0.3]} rotation={[0.3, 0, 0]}>
        <torusGeometry args={[0.06, 0.015, 8, 12, Math.PI]} />
        <meshStandardMaterial color={accentColor} />
      </mesh>

      {/* Antenna — wobbles */}
      <group ref={antennaRef} position={[0, 1.48, 0]}>
        <mesh>
          <cylinderGeometry args={[0.015, 0.015, 0.2, 6]} />
          <meshStandardMaterial color={primaryColor} />
        </mesh>
        {/* Antenna tip — glowing ball */}
        <mesh position={[0, 0.13, 0]}>
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshStandardMaterial
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={1.5}
            toneMapped={false}
          />
        </mesh>
        {/* Antenna glow */}
        <pointLight
          color={primaryColor}
          intensity={0.4}
          distance={1.5}
          position={[0, 0.15, 0]}
        />
      </group>

      {/* Left arm (small capsule) */}
      <mesh position={[-0.38, 0.6, 0]}>
        <capsuleGeometry args={[0.06, 0.25, 4, 8]} />
        <meshStandardMaterial color={primaryColor} metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Right arm — points at kiosk */}
      <mesh ref={armRef} position={[0.38, 0.6, 0]}>
        <capsuleGeometry args={[0.06, 0.25, 4, 8]} />
        <meshStandardMaterial color={primaryColor} metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Pointing finger glow */}
      <pointLight
        color={primaryColor}
        intensity={scrollProgress > 0.78 ? 0.8 : 0}
        distance={2}
        position={[0.5, 0.6, 0.3]}
      />

      {/* Data emission light from body */}
      <pointLight
        color={primaryColor}
        intensity={0.4}
        distance={3}
        position={[0, 0.8, 0]}
      />

      {/* Standing indicator ring */}
      {scrollProgress > 0.65 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[0.35, 0.4, 32]} />
          <meshBasicMaterial
            color={primaryColor}
            transparent
            opacity={0.4 + Math.sin(Date.now() * 0.003) * 0.2}
          />
        </mesh>
      )}
    </group>
  );
}
