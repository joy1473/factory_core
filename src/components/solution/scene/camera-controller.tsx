"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import * as THREE from "three";

const KEYFRAMES = [
  { pos: new THREE.Vector3(12, 10, 12), target: new THREE.Vector3(0, 0, 0) },
  { pos: new THREE.Vector3(2, 2.5, 3), target: new THREE.Vector3(-2, 1, 0) },
  { pos: new THREE.Vector3(5, 3, 6), target: new THREE.Vector3(0, 1, 0) },
  { pos: new THREE.Vector3(1, 2.5, -2), target: new THREE.Vector3(-5, 1, -3) },
  { pos: new THREE.Vector3(6, 2, 2), target: new THREE.Vector3(6, 1.5, -3) },
];

interface CameraControllerProps {
  onProgressChange: (progress: number) => void;
}

export function CameraController({ onProgressChange }: CameraControllerProps) {
  const scroll = useScroll();
  const targetPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const currentLookAt = useRef(new THREE.Vector3());

  useFrame((state) => {
    const progress = scroll.offset;
    onProgressChange(progress);

    const totalSegments = KEYFRAMES.length - 1;
    const rawIdx = progress * totalSegments;
    const idx = Math.min(Math.floor(rawIdx), totalSegments - 1);
    const t = rawIdx - idx;

    // Smooth interpolation between keyframes
    const from = KEYFRAMES[idx];
    const to = KEYFRAMES[Math.min(idx + 1, KEYFRAMES.length - 1)];

    // Smooth step for cinematic feel
    const smoothT = t * t * (3 - 2 * t);

    targetPos.current.lerpVectors(from.pos, to.pos, smoothT);
    targetLookAt.current.lerpVectors(from.target, to.target, smoothT);

    state.camera.position.lerp(targetPos.current, 0.08);
    currentLookAt.current.lerp(targetLookAt.current, 0.08);
    state.camera.lookAt(currentLookAt.current);
  });

  return null;
}
