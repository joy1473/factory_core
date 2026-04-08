"use client";

import dynamic from "next/dynamic";

const FactoryScene = dynamic(
  () =>
    import("@/components/solution/scene/factory-scene").then(
      (m) => m.FactoryScene
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#00ff41] border-t-transparent" />
          <p className="text-sm text-gray-500">3D 씬 로딩 중...</p>
        </div>
      </div>
    ),
  }
);

export default function SolutionPage() {
  return <FactoryScene />;
}
