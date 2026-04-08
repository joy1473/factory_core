"use client";

import { PRESET_LIST } from "@/lib/constants/scene-presets";

interface SceneSelectorProps {
  current: string;
  onChange: (id: string) => void;
}

export function SceneSelector({ current, onChange }: SceneSelectorProps) {
  return (
    <div className="fixed left-1/2 top-20 z-40 -translate-x-1/2">
      <div className="flex gap-1 rounded-xl border border-[var(--border)] bg-[#0a0a0a]/90 p-1 backdrop-blur-md">
        {PRESET_LIST.map((p) => (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
              current === p.id
                ? "bg-[var(--primary)] text-black"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className="mr-1">{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
