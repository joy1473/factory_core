"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RegionSelect } from "@/components/ui/region-select";
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  User,
  Save,
  Sparkles,
  Loader2,
  Send,
  Wand2,
  CheckCircle,
  Tag,
  Plus,
  Minus,
  Clock,
} from "lucide-react";

interface CompanyTag {
  tag_id: string;
  tags: { id: string; name: string; type: string; color: string } | null;
}

interface HistoryItem {
  id: string;
  sent_at: string;
  status: string;
  rendered_content: string | null;
  message_templates: { name: string } | null;
}

interface Company {
  id: string;
  name: string;
  ceo: string | null;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  sido: string;
  sigungu: string;
  memo: string | null;
  source_id: number | null;
  company_tags: CompanyTag[];
  send_history: HistoryItem[];
  created_at: string;
  updated_at: string;
}

interface TagItem {
  id: string;
  name: string;
  type: string;
  color: string;
}

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  pending: { text: "대기", color: "#888" },
  sent: { text: "발송", color: "var(--primary)" },
  delivered: { text: "전달", color: "#00ff88" },
  failed: { text: "실패", color: "#ff4444" },
  read: { text: "읽음", color: "#ffaa00" },
};

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [allTags, setAllTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [enrichResult, setEnrichResult] = useState<{
    website: string | null;
    emails: string[];
    searchResults: { title: string; url: string }[];
  } | null>(null);
  const [edit, setEdit] = useState({
    ceo: "",
    contact_person: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    sido: "",
    sigungu: "",
    memo: "",
  });

  async function handleEnrich() {
    if (!company) return;
    setEnriching(true);
    setEnrichResult(null);

    try {
      // Serper로 자동 검색 + 이메일 추출 (원클릭)
      const res = await fetch(`/api/companies/${id}/enrich`, {
        method: "POST",
      });
      const data = await res.json();

      setEnrichResult({
        website: data.website || null,
        emails: data.emails || [],
        searchResults: data.searchResults || [],
      });

      if (data.website && !edit.website) {
        setEdit((prev) => ({ ...prev, website: data.website }));
      }
      if (data.emails?.length > 0 && !edit.email) {
        setEdit((prev) => ({ ...prev, email: data.emails[0] }));
      }
      fetchCompany(true);
    } catch (err) {
      console.error("Enrich error:", err);
      setEnrichResult(null);
    } finally {
      setEnriching(false);
    }
  }

  const fetchCompany = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/companies/${id}`);
      if (!res.ok) {
        router.push("/admin/companies");
        return;
      }
      const data = await res.json();
      setCompany(data);
      setEdit({
        ceo: data.ceo || "",
        contact_person: data.contact_person || "",
        phone: data.phone || "",
        email: data.email || "",
        website: data.website || "",
        address: data.address || "",
        sido: data.sido || "",
        sigungu: data.sigungu || "",
        memo: data.memo || "",
      });
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchCompany();
    fetch("/api/tags")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setAllTags(d))
      .catch(() => {});
  }, [fetchCompany]);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/companies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(edit),
      });
      fetchCompany(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleTagToggle(tagId: string, hasTag: boolean) {
    await fetch("/api/companies/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_ids: [id],
        tag_id: tagId,
        action: hasTag ? "remove" : "add",
      }),
    });
    fetchCompany(true);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  if (!company) return null;

  const currentTagIds = new Set(
    company.company_tags?.map((ct) => ct.tag_id) || []
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-lg border border-[var(--border)] p-2 text-gray-400 hover:text-[var(--foreground)]"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{company.name}</h1>
          <p className="text-sm text-gray-500">
            {company.sido} {company.sigungu}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Info + Edit */}
        <div className="space-y-5 lg:col-span-2">
          {/* Basic Info */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="mb-4 text-sm font-semibold text-gray-300">
              기본 정보
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 text-sm">
                <Building2 size={16} className="text-gray-500" />
                <span className="text-gray-400">대표자:</span>
                <input
                  value={edit.ceo}
                  onChange={(e) =>
                    setEdit({ ...edit, ceo: e.target.value })
                  }
                  className="flex-1 rounded border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-3 text-sm">
                <User size={16} className="text-gray-500" />
                <span className="text-gray-400">담당자:</span>
                <input
                  value={edit.contact_person}
                  onChange={(e) =>
                    setEdit({ ...edit, contact_person: e.target.value })
                  }
                  className="flex-1 rounded border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone size={16} className="text-gray-500" />
                <span className="text-gray-400">연락처:</span>
                <input
                  value={edit.phone}
                  onChange={(e) =>
                    setEdit({ ...edit, phone: e.target.value })
                  }
                  className="flex-1 rounded border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-3 text-sm sm:col-span-2">
                <MapPin size={16} className="shrink-0 text-gray-500" />
                <span className="shrink-0 text-gray-400">지역:</span>
                <RegionSelect
                  sido={edit.sido}
                  sigungu={edit.sigungu}
                  onSidoChange={(v) => setEdit((prev) => ({ ...prev, sido: v, sigungu: "" }))}
                  onSigunguChange={(v) => setEdit((prev) => ({ ...prev, sigungu: v }))}
                  size="sm"
                />
              </div>
              <div className="flex items-center gap-3 text-sm sm:col-span-2">
                <MapPin size={16} className="shrink-0 text-gray-500" />
                <span className="shrink-0 text-gray-400">주소:</span>
                <input
                  value={edit.address}
                  onChange={(e) => setEdit({ ...edit, address: e.target.value })}
                  className="flex-1 rounded border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="mb-4 text-sm font-semibold text-gray-300">
              추가 정보 (편집 가능)
            </h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-2"><Mail size={12} /> 이메일</span>
                  <span className="text-[10px] text-gray-600">줄바꿈으로 여러 개 입력</span>
                </label>
                <textarea
                  value={edit.email}
                  onChange={(e) =>
                    setEdit({ ...edit, email: e.target.value })
                  }
                  rows={Math.max(1, (edit.email || "").split("\n").length)}
                  placeholder="info@company.com"
                  className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-gray-600 focus:border-[var(--primary)] focus:outline-none"
                />
                {/* Email links */}
                {edit.email && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {edit.email.split(/[\n,;]+/).filter(Boolean).map((e, i) => (
                      <a
                        key={i}
                        href={`mailto:${e.trim()}`}
                        className="rounded bg-[var(--primary)]/10 px-2 py-0.5 text-[10px] text-[var(--primary)] hover:underline"
                      >
                        {e.trim()}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="mb-1 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-2"><Globe size={12} /> 홈페이지</span>
                  <span className="text-[10px] text-gray-600">줄바꿈으로 여러 개 입력</span>
                </label>
                <textarea
                  value={edit.website}
                  onChange={(e) =>
                    setEdit({ ...edit, website: e.target.value })
                  }
                  rows={Math.max(1, (edit.website || "").split("\n").length)}
                  placeholder="https://company.com"
                  className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-gray-600 focus:border-[var(--primary)] focus:outline-none"
                />
                {/* Website links */}
                {edit.website && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {edit.website.split(/[\n,;]+/).filter(Boolean).map((w, i) => (
                      <a
                        key={i}
                        href={w.trim().startsWith("http") ? w.trim() : `https://${w.trim()}`}
                        target="_blank"
                        className="rounded bg-[var(--secondary)]/10 px-2 py-0.5 text-[10px] text-[var(--secondary)] hover:underline"
                      >
                        {w.trim().replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="mb-1 text-xs text-gray-500">메모</label>
                <textarea
                  value={edit.memo}
                  onChange={(e) =>
                    setEdit({ ...edit, memo: e.target.value })
                  }
                  rows={3}
                  placeholder="이 기업에 대한 메모..."
                  className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-gray-600 focus:border-[var(--primary)] focus:outline-none"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>

          {/* Send History */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-300">
              <Send size={14} /> 발송 이력
            </h2>
            {company.send_history?.length === 0 ? (
              <p className="text-sm text-gray-600">발송 이력 없음</p>
            ) : (
              <div className="space-y-2">
                {company.send_history?.map((h) => {
                  const s = STATUS_LABELS[h.status] || STATUS_LABELS.pending;
                  return (
                    <div
                      key={h.id}
                      className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <Clock size={14} className="text-gray-500" />
                        <span className="text-xs text-gray-400">
                          {new Date(h.sent_at).toLocaleString("ko-KR")}
                        </span>
                        <span className="text-sm text-[var(--foreground)]">
                          {h.message_templates?.name || "템플릿 없음"}
                        </span>
                      </div>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{
                          backgroundColor: s.color + "20",
                          color: s.color,
                        }}
                      >
                        {s.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Tags + Quick Actions */}
        <div className="space-y-5">
          {/* Tags */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-300">
              <Tag size={14} /> 태그
            </h2>
            <div className="space-y-2">
              {allTags.map((tag) => {
                const has = currentTagIds.has(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.id, has)}
                    className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition"
                    style={{
                      borderColor: has ? tag.color + "50" : "var(--border)",
                      backgroundColor: has ? tag.color + "10" : "transparent",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span style={{ color: has ? tag.color : "#888" }}>
                        {tag.name}
                      </span>
                    </div>
                    {has ? (
                      <Minus size={14} className="text-red-400" />
                    ) : (
                      <Plus size={14} className="text-gray-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Auto Enrich */}
          <div className="rounded-xl border border-[var(--primary)]/20 bg-[var(--surface)] p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
              <Sparkles size={14} /> 자동 찾기
            </h2>
            <p className="mb-3 text-xs text-gray-500">
              Google 검색 → 홈페이지 찾기 → 이메일 자동 추출
            </p>
            <button
              onClick={handleEnrich}
              disabled={enriching}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
            >
              {enriching ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  검색 + 추출 중...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  홈페이지 + 이메일 자동 찾기
                </>
              )}
            </button>
            {enrichResult && (
              <div className="mt-3 space-y-2 text-xs">
                {enrichResult.website && (
                  <div className="flex items-center gap-2 text-[var(--secondary)]">
                    <Globe size={12} />
                    <a
                      href={enrichResult.website}
                      target="_blank"
                      className="underline"
                    >
                      {enrichResult.website}
                    </a>
                  </div>
                )}
                {enrichResult.emails?.length > 0 && (
                  <div className="space-y-1">
                    {enrichResult.emails.map((e) => (
                      <div
                        key={e}
                        className="flex items-center gap-2 text-[var(--accent)]"
                      >
                        <Mail size={12} />
                        {e}
                      </div>
                    ))}
                  </div>
                )}
                {enrichResult.emails?.length === 0 &&
                  enrichResult.website && (
                    <p className="text-gray-500">
                      홈페이지에서 이메일을 찾지 못했습니다
                    </p>
                  )}
                {!enrichResult.website && (
                  <div className="space-y-1">
                    <p className="text-gray-500">
                      홈페이지를 자동으로 찾지 못했습니다
                    </p>
                    <button
                      onClick={() =>
                        window.open(
                          `https://www.google.com/search?q=${encodeURIComponent(company.name + " 공식 홈페이지")}`,
                          "_blank"
                        )
                      }
                      className="text-xs text-[var(--primary)] underline"
                    >
                      → 구글에서 직접 검색하기
                    </button>
                  </div>
                )}
                {enrichResult.searchResults?.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-gray-500 hover:text-gray-300">
                      검색 결과 {enrichResult.searchResults.length}건
                    </summary>
                    <div className="mt-1 space-y-1">
                      {enrichResult.searchResults.map((r, i) => (
                        <a
                          key={i}
                          href={r.url}
                          target="_blank"
                          className="block truncate text-gray-400 hover:text-[var(--primary)]"
                        >
                          {r.title}
                        </a>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>

          {/* AI Tag Extraction */}
          <AiTagExtractor
            companyId={id}
            allTags={allTags}
            currentTagIds={currentTagIds}
            onTagApplied={() => fetchCompany(true)}
          />

          {/* Quick Actions */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="mb-4 text-sm font-semibold text-gray-300">
              빠른 작업
            </h2>
            <div className="space-y-2">
              <button
                onClick={() =>
                  window.open(
                    `https://www.google.com/search?q=${encodeURIComponent(company.name + " 스마트공장 홈페이지")}`,
                    "_blank"
                  )
                }
                className="flex w-full items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-gray-400 transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                <Globe size={16} /> 웹 검색
              </button>
              <button
                onClick={() =>
                  window.open(
                    `https://www.google.com/search?q=${encodeURIComponent(company.name + " 이메일 연락처")}`,
                    "_blank"
                  )
                }
                className="flex w-full items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-gray-400 transition hover:border-[var(--secondary)] hover:text-[var(--secondary)]"
              >
                <Mail size={16} /> 이메일 찾기
              </button>
              {company.phone && (
                <a
                  href={`tel:${company.phone}`}
                  className="flex w-full items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-gray-400 transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  <Phone size={16} /> 전화 걸기
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AI Tag Extractor Component ───
function AiTagExtractor({
  companyId,
  allTags,
  currentTagIds,
  onTagApplied,
}: {
  companyId: string;
  allTags: TagItem[];
  currentTagIds: Set<string>;
  onTagApplied: () => void;
}) {
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState<{
    matched: { tagName: string; tagId: string; type: string; confidence: number; alreadyApplied: boolean }[];
    suggested: { tagName: string; keywords: string[] }[];
    sources?: { name: boolean; memo: boolean; website: boolean; websiteLength: number };
  } | null>(null);
  const [applying, setApplying] = useState<string | null>(null);
  const [creating, setCreating] = useState<string | null>(null);

  async function handleExtract() {
    setExtracting(true);
    setResult(null);
    try {
      const res = await fetch(`/api/companies/${companyId}/extract-tags`, {
        method: "POST",
      });
      const data = await res.json();
      setResult(data);
    } finally {
      setExtracting(false);
    }
  }

  async function handleApplyTag(tagId: string) {
    setApplying(tagId);
    try {
      await fetch("/api/companies/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_ids: [companyId],
          tag_id: tagId,
          action: "add",
        }),
      });
      onTagApplied();
      if (result) {
        setResult({
          ...result,
          matched: result.matched.map((m) =>
            m.tagId === tagId ? { ...m, alreadyApplied: true } : m
          ),
        });
      }
    } finally {
      setApplying(null);
    }
  }

  async function handleCreateAndApply(tagName: string) {
    setCreating(tagName);
    try {
      // 태그 생성
      const createRes = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tagName, type: "industry", color: "#44ddff" }),
      });
      const newTag = await createRes.json();

      // 기업에 부여
      await fetch("/api/companies/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_ids: [companyId],
          tag_id: newTag.id,
          action: "add",
        }),
      });

      onTagApplied();
      // suggested에서 제거
      if (result) {
        setResult({
          ...result,
          suggested: result.suggested.filter((s) => s.tagName !== tagName),
        });
      }
    } finally {
      setCreating(null);
    }
  }

  return (
    <div className="rounded-xl border border-[var(--accent)]/20 bg-[var(--surface)] p-5">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
        <Wand2 size={14} /> AI 태그 추출
      </h2>
      <p className="mb-3 text-xs text-gray-500">
        메모 + 기업명에서 업종/규모 태그를 자동 추출합니다
      </p>
      <button
        onClick={handleExtract}
        disabled={extracting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
      >
        {extracting ? (
          <>
            <Loader2 size={16} className="animate-spin" /> 분석 중...
          </>
        ) : (
          <>
            <Wand2 size={16} /> 태그 자동 추출
          </>
        )}
      </button>

      {result && (
        <div className="mt-4 space-y-3">
          {/* Matched tags */}
          {result.matched.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-gray-400">
                매칭된 태그 ({result.matched.length})
              </p>
              <div className="space-y-1.5">
                {result.matched.map((m) => (
                  <div
                    key={m.tagId}
                    className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[var(--foreground)]">{m.tagName}</span>
                      <span className="rounded bg-[var(--accent)]/10 px-1.5 py-0.5 text-[10px] text-[var(--accent)]">
                        {Math.round(m.confidence * 100)}%
                      </span>
                    </div>
                    {m.alreadyApplied ? (
                      <CheckCircle size={16} className="text-[var(--secondary)]" />
                    ) : (
                      <button
                        onClick={() => handleApplyTag(m.tagId)}
                        disabled={applying === m.tagId}
                        className="rounded bg-[var(--primary)] px-2 py-1 text-[10px] font-bold text-black hover:brightness-110 disabled:opacity-50"
                      >
                        {applying === m.tagId ? "..." : "+ 부여"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested new tags */}
          {result.suggested.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-gray-400">
                새 태그 제안 ({result.suggested.length})
              </p>
              <div className="space-y-1.5">
                {result.suggested.map((s) => (
                  <div
                    key={s.tagName}
                    className="flex items-center justify-between rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] px-3 py-2"
                  >
                    <div>
                      <span className="text-sm text-[var(--foreground)]">{s.tagName}</span>
                      <span className="ml-2 text-[10px] text-gray-600">
                        ({s.keywords.join(", ")})
                      </span>
                    </div>
                    <button
                      onClick={() => handleCreateAndApply(s.tagName)}
                      disabled={creating === s.tagName}
                      className="rounded border border-[var(--accent)] px-2 py-1 text-[10px] font-bold text-[var(--accent)] hover:bg-[var(--accent)]/10 disabled:opacity-50"
                    >
                      {creating === s.tagName ? "..." : "+ 생성 & 부여"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sources info */}
          {result.sources && (
            <div className="flex flex-wrap gap-2 text-[10px]">
              <span className={result.sources.name ? "text-[var(--secondary)]" : "text-gray-600"}>
                {result.sources.name ? "✅" : "⬜"} 기업명
              </span>
              <span className={result.sources.memo ? "text-[var(--secondary)]" : "text-gray-600"}>
                {result.sources.memo ? "✅" : "⬜"} 메모
              </span>
              <span className={result.sources.website ? "text-[var(--secondary)]" : "text-gray-600"}>
                {result.sources.website ? `✅ 홈페이지 (${result.sources.websiteLength}자)` : "⬜ 홈페이지"}
              </span>
            </div>
          )}

          {result.matched.length === 0 && result.suggested.length === 0 && (
            <p className="text-xs text-gray-500">
              태그를 추출할 수 없습니다. 메모를 추가하거나 홈페이지를 먼저 등록해주세요.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
