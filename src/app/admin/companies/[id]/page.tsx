"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Tag,
  Plus,
  Minus,
  Clock,
} from "lucide-react";
import Link from "next/link";

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
  sent: { text: "발송", color: "#00d4ff" },
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
    email: "",
    website: "",
    memo: "",
    phone: "",
    contact_person: "",
  });

  async function handleEnrich() {
    if (!company) return;
    setEnriching(true);
    setEnrichResult(null);

    const SKIP_DOMAINS = [
      "naver.com", "daum.net", "tistory.com", "wikipedia.org",
      "facebook.com", "youtube.com", "instagram.com", "linkedin.com",
      "twitter.com", "jobkorea.co.kr", "saramin.co.kr", "google.com",
      "duckduckgo.com", "kakao.com", "zillinks.com", "remember.co.kr",
    ];

    try {
      // Step 1: 브라우저에서 DuckDuckGo 검색 (CORS 우회를 위해 프록시 불필요 — API 사용)
      let website = edit.website || "";
      const searchResults: { title: string; url: string }[] = [];

      if (!website) {
        // DuckDuckGo Instant Answer API (CORS 허용)
        const ddgRes = await fetch(
          `https://api.duckduckgo.com/?q=${encodeURIComponent(company.name + " 홈페이지")}&format=json&no_html=1`
        );
        const ddgData = await ddgRes.json();

        // AbstractURL 또는 Results에서 URL 추출
        if (ddgData.AbstractURL) {
          website = ddgData.AbstractURL;
          searchResults.push({ title: ddgData.AbstractSource || "", url: ddgData.AbstractURL });
        }
        if (ddgData.Results) {
          for (const r of ddgData.Results) {
            if (r.FirstURL) searchResults.push({ title: r.Text || "", url: r.FirstURL });
          }
        }
        if (ddgData.RelatedTopics) {
          for (const r of ddgData.RelatedTopics.slice(0, 5)) {
            if (r.FirstURL) searchResults.push({ title: r.Text?.substring(0, 50) || "", url: r.FirstURL });
          }
        }

        // 포털 제외하고 첫 번째 결과
        if (!website) {
          for (const r of searchResults) {
            const isPortal = SKIP_DOMAINS.some((d) => r.url.includes(d));
            if (!isPortal && r.url.startsWith("http")) {
              website = r.url;
              break;
            }
          }
        }
      }

      // Step 2: 서버에 website 전달 → 이메일 추출 + 저장
      const res = await fetch(`/api/companies/${id}/enrich`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ website }),
      });
      const data = await res.json();

      setEnrichResult({
        website: data.website || website || null,
        emails: data.emails || [],
        searchResults,
      });

      if (data.website && !edit.website) {
        setEdit((prev) => ({ ...prev, website: data.website }));
      }
      if (data.emails?.length > 0 && !edit.email) {
        setEdit((prev) => ({ ...prev, email: data.emails[0] }));
      }
      fetchCompany();
    } catch (err) {
      console.error("Enrich error:", err);
      setEnrichResult(null);
    } finally {
      setEnriching(false);
    }
  }

  const fetchCompany = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/companies/${id}`);
      if (!res.ok) {
        router.push("/admin/companies");
        return;
      }
      const data = await res.json();
      setCompany(data);
      setEdit({
        email: data.email || "",
        website: data.website || "",
        memo: data.memo || "",
        phone: data.phone || "",
        contact_person: data.contact_person || "",
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
      fetchCompany();
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
    fetchCompany();
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
        <Link
          href="/admin/companies"
          className="rounded-lg border border-[var(--border)] p-2 text-gray-400 hover:text-white"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{company.name}</h1>
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
                <span className="text-white">{company.ceo || "-"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <User size={16} className="text-gray-500" />
                <span className="text-gray-400">담당자:</span>
                <input
                  value={edit.contact_person}
                  onChange={(e) =>
                    setEdit({ ...edit, contact_person: e.target.value })
                  }
                  className="flex-1 rounded border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-sm text-white focus:border-[var(--primary)] focus:outline-none"
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
                  className="flex-1 rounded border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-sm text-white focus:border-[var(--primary)] focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin size={16} className="text-gray-500" />
                <span className="text-gray-400">주소:</span>
                <span className="text-white text-xs">
                  {company.address || "-"}
                </span>
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
                <label className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                  <Mail size={12} /> 이메일
                </label>
                <input
                  value={edit.email}
                  onChange={(e) =>
                    setEdit({ ...edit, email: e.target.value })
                  }
                  placeholder="info@company.com"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-[var(--primary)] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                  <Globe size={12} /> 홈페이지
                </label>
                <input
                  value={edit.website}
                  onChange={(e) =>
                    setEdit({ ...edit, website: e.target.value })
                  }
                  placeholder="https://company.com"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-[var(--primary)] focus:outline-none"
                />
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
                  className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-[var(--primary)] focus:outline-none"
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
                        <span className="text-sm text-white">
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
                  검색 중...
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
