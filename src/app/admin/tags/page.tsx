"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, Tag } from "lucide-react";

interface TagItem {
  id: string;
  name: string;
  type: "industry" | "size" | "custom";
  color: string;
}

const TYPE_LABELS: Record<string, string> = {
  industry: "업종",
  size: "규모",
  custom: "커스텀",
};

const PRESET_COLORS = [
  "var(--primary)",
  "#00ff88",
  "#ffaa00",
  "#ff6644",
  "#aa88ff",
  "#ff88aa",
  "#44ddff",
  "#88ff88",
  "#ffffff",
  "#888888",
];

export default function TagsPage() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"industry" | "size" | "custom">(
    "custom"
  );
  const [newColor, setNewColor] = useState("var(--primary)");
  const [creating, setCreating] = useState(false);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tags");
      const data = await res.json();
      setTags(data);
    } catch {
      setTags([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          type: newType,
          color: newColor,
        }),
      });
      if (res.ok) {
        setNewName("");
        fetchTags();
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("이 태그를 삭제하시겠습니까?")) return;
    await fetch(`/api/tags/${id}`, { method: "DELETE" });
    fetchTags();
  }

  const grouped = {
    industry: tags.filter((t) => t.type === "industry"),
    size: tags.filter((t) => t.type === "size"),
    custom: tags.filter((t) => t.type === "custom"),
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-[var(--foreground)]">태그 관리</h1>

      {/* Create */}
      <div className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-300">
          새 태그 추가
        </h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-xs text-gray-500">태그명</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="예: 자동차부품, 50인 이상..."
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-gray-600 focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">유형</label>
            <select
              value={newType}
              onChange={(e) =>
                setNewType(e.target.value as "industry" | "size" | "custom")
              }
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
            >
              <option value="industry">업종</option>
              <option value="size">규모</option>
              <option value="custom">커스텀</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">색상</label>
            <div className="flex gap-1">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className="h-8 w-8 rounded-md border-2 transition"
                  style={{
                    backgroundColor: c,
                    borderColor: newColor === c ? "#fff" : "transparent",
                  }}
                />
              ))}
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
          >
            <Plus size={16} />
            추가
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-6">
          {(["industry", "size", "custom"] as const).map((type) => (
            <div key={type}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-300">
                <Tag size={14} />
                {TYPE_LABELS[type]} ({grouped[type].length})
              </h2>
              {grouped[type].length === 0 ? (
                <p className="text-sm text-gray-600">태그 없음</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {grouped[type].map((tag) => (
                    <div
                      key={tag.id}
                      className="group flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 transition hover:border-red-500/30"
                    >
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-sm text-[var(--foreground)]">{tag.name}</span>
                      <button
                        onClick={() => handleDelete(tag.id)}
                        className="ml-1 text-gray-600 opacity-0 transition group-hover:opacity-100 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
