"use client";

import { useCallback, useEffect, useState } from "react";
import { Save, Plus, Trash2, Building2, Tag, Monitor } from "lucide-react";

// ─── Company Info Editor ───
function CompanyInfoEditor() {
  const [data, setData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/content?table=company_info")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: "company_info", id: data.id, updates: {
          company_name: data.company_name,
          company_name_en: data.company_name_en,
          ceo_name: data.ceo_name,
          business_number: data.business_number,
          address: data.address,
          email: data.email,
          phone: data.phone,
          description: data.description,
        }}),
      });
    } finally {
      setSaving(false);
    }
  }

  const fields = [
    { key: "company_name", label: "회사명" },
    { key: "company_name_en", label: "회사명 (영문)" },
    { key: "ceo_name", label: "대표자" },
    { key: "business_number", label: "사업자등록번호" },
    { key: "address", label: "주소" },
    { key: "email", label: "이메일" },
    { key: "phone", label: "전화번호" },
    { key: "description", label: "설명" },
  ];

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
        <Building2 size={16} className="text-[var(--primary)]" /> 회사 정보
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="mb-1 block text-xs text-gray-500">{f.label}</label>
            <input
              value={data[f.key] || ""}
              onChange={(e) => setData({ ...data, [f.key]: e.target.value })}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-white focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
        ))}
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-4 flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-50"
      >
        <Save size={16} /> {saving ? "저장 중..." : "저장"}
      </button>
    </div>
  );
}

// ─── Tag Keywords Editor ───
function TagKeywordsEditor() {
  const [keywords, setKeywords] = useState<
    { id: string; tag_name: string; keyword_type: string; keywords: string[] }[]
  >([]);
  const [newTag, setNewTag] = useState("");
  const [newType, setNewType] = useState("industry");
  const [newKw, setNewKw] = useState("");

  const fetchData = useCallback(() => {
    fetch("/api/admin/content?table=tag_keywords")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setKeywords(d))
      .catch(() => {});
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleAdd() {
    if (!newTag || !newKw) return;
    await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        table: "tag_keywords",
        record: {
          tag_name: newTag,
          keyword_type: newType,
          keywords: newKw.split(",").map((k) => k.trim().toLowerCase()).filter(Boolean),
        },
      }),
    });
    setNewTag("");
    setNewKw("");
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm("삭제하시겠습니까?")) return;
    await fetch("/api/admin/content", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table: "tag_keywords", id }),
    });
    fetchData();
  }

  async function handleUpdateKeywords(id: string, keywords: string) {
    await fetch("/api/admin/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        table: "tag_keywords",
        id,
        updates: { keywords: keywords.split(",").map((k) => k.trim().toLowerCase()).filter(Boolean) },
      }),
    });
    fetchData();
  }

  const grouped = {
    industry: keywords.filter((k) => k.keyword_type === "industry"),
    size: keywords.filter((k) => k.keyword_type === "size"),
    business: keywords.filter((k) => k.keyword_type === "business"),
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
        <Tag size={16} className="text-[var(--accent)]" /> 태그 키워드 사전 ({keywords.length})
      </h2>

      {/* Add new */}
      <div className="mb-4 flex flex-wrap gap-2 rounded-lg border border-dashed border-[var(--border)] p-3">
        <select
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
          className="rounded border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-xs text-white"
        >
          <option value="industry">업종</option>
          <option value="size">규모</option>
          <option value="business">비즈니스</option>
        </select>
        <input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="태그명"
          className="rounded border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-xs text-white placeholder-gray-600"
        />
        <input
          value={newKw}
          onChange={(e) => setNewKw(e.target.value)}
          placeholder="키워드 (쉼표 구분)"
          className="flex-1 rounded border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-xs text-white placeholder-gray-600"
        />
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 rounded bg-[var(--accent)] px-3 py-1 text-xs font-bold text-black"
        >
          <Plus size={12} /> 추가
        </button>
      </div>

      {(["industry", "size", "business"] as const).map((type) => (
        <div key={type} className="mb-4">
          <p className="mb-2 text-xs font-semibold text-gray-400">
            {type === "industry" ? "업종" : type === "size" ? "규모" : "비즈니스"} ({grouped[type].length})
          </p>
          <div className="space-y-2">
            {grouped[type].map((kw) => (
              <div key={kw.id} className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2">
                <span className="shrink-0 text-xs font-semibold text-white" style={{ minWidth: "100px" }}>
                  {kw.tag_name}
                </span>
                <input
                  defaultValue={kw.keywords.join(", ")}
                  onBlur={(e) => handleUpdateKeywords(kw.id, e.target.value)}
                  className="flex-1 rounded border border-[var(--border)] bg-transparent px-2 py-1 text-xs text-gray-400 focus:border-[var(--primary)] focus:text-white focus:outline-none"
                />
                <button
                  onClick={() => handleDelete(kw.id)}
                  className="text-gray-600 hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Scene Presets Viewer ───
function ScenePresetsViewer() {
  const [presets, setPresets] = useState<
    { id: string; scene_id: string; label: string; icon: string; description: string; visible: boolean }[]
  >([]);

  useEffect(() => {
    fetch("/api/admin/content?table=scene_presets")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setPresets(d))
      .catch(() => {});
  }, []);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
        <Monitor size={16} className="text-[var(--secondary)]" /> 3D 씬 프리셋 ({presets.length})
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {presets.map((p) => (
          <div
            key={p.id}
            className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{p.icon}</span>
              <span className="text-sm font-bold text-white">{p.label}</span>
              <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] ${p.visible ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                {p.visible ? "활성" : "비활성"}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">{p.description}</p>
            <p className="mt-1 text-[10px] text-gray-600">ID: {p.scene_id}</p>
            <a
              href={`/solution?scene=${p.scene_id}`}
              target="_blank"
              className="mt-2 inline-block text-xs text-[var(--primary)] hover:underline"
            >
              미리보기 →
            </a>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-600">
        씬 상세 편집은 Supabase 대시보드에서 JSONB 직접 편집하세요.
      </p>
    </div>
  );
}

// ─── Main Page ───
export default function ContentPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">콘텐츠 관리</h1>
      <div className="space-y-6">
        <CompanyInfoEditor />
        <TagKeywordsEditor />
        <ScenePresetsViewer />
      </div>
    </div>
  );
}
