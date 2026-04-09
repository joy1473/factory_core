"use client";

import { useEffect, useState } from "react";
import { SCENE_PRESETS } from "@/lib/constants/scene-presets";

interface SceneTab {
  id: string;
  label: string;
  icon: string;
  color: string;
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
              color: SCENE_PRESETS[p.scene_id]?.colors.primary || "#A8E6CF",
            }))
          );
        } else {
          // DB에 프리셋 없으면 → 하드코딩 프리셋에서
          setTabs(
            Object.values(SCENE_PRESETS).map((p) => ({
              id: p.id,
              label: p.label,
              icon: p.icon,
              color: p.colors.primary,
            }))
          );
        }
      })
      .catch(() => {
        // 네트워크 실패 → 하드코딩 fallback
        setTabs(
          Object.values(SCENE_PRESETS).map((p) => ({
            id: p.id,
            label: p.label,
            icon: p.icon,
            color: p.colors.primary,
          }))
        );
      });
  }, []);

  if (tabs.length === 0) return null;

  const currentColor = tabs.find((t) => t.id === current)?.color || "#A8E6CF";

  return (
    <div className="fixed left-1/2 top-20 z-40 -translate-x-1/2">
      <div className="flex max-w-[90vw] gap-1 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--background)]/90 p-1 backdrop-blur-md">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition ${
              current === t.id
                ? "text-[#1a1a1a]"
                : "text-gray-400 hover:bg-white/5"
            }`}
            style={
              current === t.id
                ? { backgroundColor: t.color }
                : undefined
            }
          >
            <span className="mr-1">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
