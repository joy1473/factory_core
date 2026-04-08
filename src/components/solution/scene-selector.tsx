"use client";

import { useEffect, useState } from "react";

interface SceneTab {
  id: string;
  label: string;
  icon: string;
}

interface SceneSelectorProps {
  current: string;
  onChange: (id: string) => void;
}

export function SceneSelector({ current, onChange }: SceneSelectorProps) {
  const [tabs, setTabs] = useState<SceneTab[]>([]);

  useEffect(() => {
    // DB에서 씬 프리셋 목록 가져오기
    fetch("/api/content/scene-presets")
      .then((r) => r.json())
      .then((presets) => {
        if (Array.isArray(presets) && presets.length > 0) {
          setTabs(
            presets.map((p: { scene_id: string; label: string; icon: string }) => ({
              id: p.scene_id,
              label: p.label,
              icon: p.icon,
            }))
          );
        } else {
          // DB에 프리셋 없으면 → 업종 태그에서 가져오기
          fetch("/api/tags")
            .then((r) => r.json())
            .then((tags) => {
              if (Array.isArray(tags)) {
                const industryTags = tags
                  .filter((t: { type: string }) => t.type === "industry")
                  .slice(0, 8)
                  .map((t: { name: string }, i: number) => ({
                    id: t.name.toLowerCase().replace(/[/\s]/g, "-"),
                    label: t.name,
                    icon: ["🏭", "⚙", "🚗", "⚡", "🍔", "🧪", "🤖", "💻"][i] || "🏭",
                  }));
                setTabs(industryTags);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  if (tabs.length === 0) return null;

  return (
    <div className="fixed left-1/2 top-20 z-40 -translate-x-1/2">
      <div className="flex max-w-[90vw] gap-1 overflow-x-auto rounded-xl border border-[var(--border)] bg-[#0a0a0a]/90 p-1 backdrop-blur-md">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition ${
              current === t.id
                ? "bg-[var(--primary)] text-black"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className="mr-1">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
