"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, Save, Mail, Eye } from "lucide-react";

interface Template {
  id: string;
  name: string;
  type: string;
  content: string;
  match_rules: Record<string, string[]>;
  status: string;
  created_at: string;
}

const VARIABLES = [
  { key: "{기업명}", desc: "company.name" },
  { key: "{대표자}", desc: "company.ceo" },
  { key: "{담당자}", desc: "company.contact_person" },
  { key: "{지역}", desc: "sido + sigungu" },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", content: "", subject: "" });
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/templates");
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  async function handleCreate() {
    if (!form.name || !form.content) return;
    setSaving(true);
    try {
      await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          content: `제목: ${form.subject || form.name}\n\n${form.content}`,
          type: "email",
          match_rules: {},
          status: "draft",
        }),
      });
      setForm({ name: "", content: "", subject: "" });
      setShowCreate(false);
      fetchTemplates();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("삭제하시겠습니까?")) return;
    await fetch(`/api/admin/templates/${id}`, { method: "DELETE" });
    fetchTemplates();
  }

  function renderPreview(content: string) {
    return content
      .replace(/{기업명}/g, "(주)동우텍")
      .replace(/{대표자}/g, "전광규")
      .replace(/{담당자}/g, "김성준")
      .replace(/{지역}/g, "대전 유성구");
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">이메일 템플릿</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-black hover:brightness-110"
        >
          <Plus size={16} /> 새 템플릿
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="mb-6 rounded-xl border border-[var(--primary)]/30 bg-[var(--surface)] p-5">
          <h2 className="mb-4 text-sm font-semibold text-[var(--foreground)]">새 템플릿 작성</h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-gray-500">템플릿명</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="예: 스마트공장 설문 요청"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-gray-600 focus:border-[var(--primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">이메일 제목</label>
              <input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="예: [Factory Core] {기업명} 스마트공장 도입 안내"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-gray-600 focus:border-[var(--primary)] focus:outline-none"
              />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs text-gray-500">본문</label>
                <div className="flex gap-1">
                  {VARIABLES.map((v) => (
                    <button
                      key={v.key}
                      type="button"
                      onClick={() => setForm({ ...form, content: form.content + v.key })}
                      className="rounded border border-[var(--border)] px-2 py-0.5 text-[10px] text-gray-500 hover:text-[var(--primary)]"
                    >
                      {v.key}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={10}
                placeholder={`안녕하세요, {담당자}님.\n\nFactory Core에서 {기업명}의 스마트공장 도입을 지원하고자 연락드립니다.\n\n...`}
                className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-gray-600 focus:border-[var(--primary)] focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={saving || !form.name || !form.content}
                className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-50"
              >
                <Save size={14} /> {saving ? "저장 중..." : "저장"}
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-gray-400"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center text-gray-500">
          템플릿이 없습니다. 새 템플릿을 만들어보세요.
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-[var(--primary)]" />
                  <span className="text-sm font-semibold text-[var(--foreground)]">{t.name}</span>
                  <span className="rounded bg-[var(--primary)]/10 px-2 py-0.5 text-[10px] text-[var(--primary)]">
                    {t.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreview(preview === t.id ? null : t.id)}
                    className="rounded border border-[var(--border)] p-1.5 text-gray-500 hover:text-[var(--primary)]"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="rounded border border-[var(--border)] p-1.5 text-gray-500 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <pre className="max-h-32 overflow-hidden whitespace-pre-wrap text-xs text-gray-400">
                {t.content.substring(0, 200)}...
              </pre>

              {/* Preview */}
              {preview === t.id && (
                <div className="mt-3 rounded-lg border border-[var(--accent)]/20 bg-[var(--background)] p-4">
                  <p className="mb-2 text-xs font-semibold text-[var(--accent)]">미리보기 (샘플 데이터)</p>
                  <pre className="whitespace-pre-wrap text-sm text-gray-300">
                    {renderPreview(t.content)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
