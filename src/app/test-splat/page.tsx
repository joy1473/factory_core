"use client";

import { Canvas, extend } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { LumaSplatsThree } from "@lumaai/luma-web";

// R3F에 LumaSplats 컴포넌트 등록
extend({ LumaSplats: LumaSplatsThree });

// TypeScript 지원
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

export default function TestSplatPage() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000" }}>
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }} gl={{ antialias: false }}>
        <OrbitControls />
        <lumaSplats
          source="https://lumalabs.ai/capture/33aad979-c28e-41a5-b38b-7af0cce22302"
          position={[0, 0, 0]}
          scale={1}
        />
      </Canvas>
    </div>
  );
}
