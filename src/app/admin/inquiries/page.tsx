"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Phone,
  Mail,
  Clock,
  MessageSquare,
  FileText,
  Briefcase,
  ChevronDown,
  Save,
} from "lucide-react";

interface InquiryItem {
  id: string;
  source: "inquiry" | "bid";
  tracking_code: string | null;
  type?: string;
  service_type?: string;
  company_name: string | null;
  contact_name: string;
  phone: string | null;
  email: string | null;
  message: string;
  status: string;
  admin_note: string | null;
  created_at: string;
  updated_at: string | null;
  bid_title?: string;
  company_id?: string | null;
}

const STATUS_OPTIONS = [
  { value: "new", label: "신규", color: "var(--primary)" },
  { value: "in_progress", label: "진행 중", color: "#ffaa00" },
  { value: "completed", label: "완료", color: "#00ff88" },
  { value: "cancelled", label: "취소", color: "#888888" },
];

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  general: { label: "일반문의", color: "#888" },
  poc: { label: "PoC", color: "var(--primary)" },
  survey: { label: "설문", color: "#aa88ff" },
  bid_proposal: { label: "제안서 대행", color: "#ffaa00" },
  bid_presentation: { label: "발표 지원", color: "#ff6644" },
  bid_consulting: { label: "컨설팅", color: "#00ff88" },
  bid_full: { label: "전체 대행", color: "#ff88aa" },
};

const FILTER_TABS = [
  { value: "all", label: "전체" },
  { value: "new", label: "신규" },
  { value: "in_progress", label: "진행 중" },
  { value: "completed", label: "완료" },
];

// 상태 × 유형별 기본 메시지
const DEFAULT_MESSAGES: Record<string, Record<string, string>> = {
  in_progress: {
    general: "담당자가 배정되었습니다. 확인 후 1~2 영업일 내 연락드리겠습니다.",
    poc: "PoC 신청이 접수되었습니다. 현장 방문 일정 조율을 위해 곧 연락드리겠습니다. (예상 소요: 1주 내 현장 진단 → 2주 내 PoC 제안서 전달)",
    survey: "설문 요청이 확인되었습니다. 설문지 준비 후 발송 예정입니다.",
    bid_proposal: "제안서 작성을 시작합니다. 사업 공고 분석 및 귀사 맞춤 제안서 초안을 준비 중입니다. (예상 소요: 3~5 영업일)",
    bid_presentation: "발표 자료 준비를 시작합니다. 제안서 기반 발표 슬라이드 및 시연 시나리오를 작성 중입니다. (예상 소요: 2~3 영업일)",
    bid_consulting: "컨설팅 일정을 조율 중입니다. 귀사 현황 분석 후 최적의 지원사업 매칭 및 전략을 수립하겠습니다.",
    bid_full: "전체 대행 서비스를 시작합니다. 제안서 작성 → 발표 준비 → 현장 컨설팅까지 순차 진행합니다. 담당자가 곧 연락드리겠습니다.",
  },
  completed: {
    general: "문의 답변이 완료되었습니다. 추가 문의는 동일 추적코드로 새 문의를 접수해주세요.",
    poc: "PoC 제안서가 전달되었습니다. 검토 후 진행 여부를 알려주세요.",
    survey: "설문 결과가 정리되었습니다. 감사합니다.",
    bid_proposal: "제안서 최종본이 전달되었습니다. 수정 요청은 언제든 연락주세요.",
    bid_presentation: "발표 자료가 전달되었습니다. 리허설이 필요하시면 별도 일정 잡겠습니다.",
    bid_consulting: "컨설팅 보고서가 전달되었습니다. 지원사업 신청 대행이 필요하시면 알려주세요.",
    bid_full: "전체 대행이 완료되었습니다. 결과 및 후속 조치 사항은 별도 보고서를 참고해주세요.",
  },
  cancelled: {
    _default: "문의가 취소 처리되었습니다. 재문의가 필요하시면 언제든 연락주세요.",
  },
};

export default function InquiriesPage() {
  const [items, setItems] = useState<InquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [companyPanelId, setCompanyPanelId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [inqRes, bidRes] = await Promise.all([
        fetch("/api/inquiries?admin=1"),
        fetch("/api/admin/bid-inquiries"),
      ]);
      const inqData = await inqRes.json();
      const bidData = await bidRes.json();

      const merged: InquiryItem[] = [
        ...(Array.isArray(inqData)
          ? inqData.map((d: Record<string, unknown>) => ({
              id: d.id as string,
              source: "inquiry" as const,
              tracking_code: d.tracking_code as string | null,
              type: d.type as string,
              company_name: d.company_name as string | null,
              contact_name: d.contact_name as string,
              phone: d.phone as string | null,
              email: d.email as string | null,
              message: d.message as string,
              status: (d.status as string) || "new",
              admin_note: d.admin_note as string | null,
              created_at: d.created_at as string,
              updated_at: d.updated_at as string | null,
              company_id: d.company_id as string | null,
            }))
          : []),
        ...(Array.isArray(bidData)
          ? bidData.map((d: Record<string, unknown>) => ({
              id: d.id as string,
              source: "bid" as const,
              tracking_code: d.tracking_code as string | null,
              service_type: d.service_type as string,
              company_name: d.company_name as string | null,
              contact_name: d.contact_name as string,
              phone: d.phone as string | null,
              email: d.email as string | null,
              message: d.message as string,
              status: (d.status as string) || "new",
              admin_note: d.admin_note as string | null,
              created_at: d.created_at as string,
              updated_at: d.updated_at as string | null,
              bid_title: (d.bids as Record<string, string>)?.title,
              company_id: d.company_id as string | null,
            }))
          : []),
      ];

      merged.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setItems(merged);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filtered =
    filter === "all" ? items : items.filter((i) => i.status === filter);

  const counts = {
    all: items.length,
    new: items.filter((i) => i.status === "new").length,
    in_progress: items.filter((i) => i.status === "in_progress").length,
    completed: items.filter((i) => i.status === "completed").length,
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-[var(--foreground)]">문의 관리</h1>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
              filter === tab.value
                ? "bg-[var(--primary)] text-black"
                : "border border-[var(--border)] text-gray-400 hover:text-[var(--foreground)]"
            }`}
          >
            {tab.label} ({counts[tab.value as keyof typeof counts] || 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center text-gray-500">
          해당 상태의 문의가 없습니다
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <InquiryCard
              key={`${item.source}-${item.id}`}
              item={item}
              expanded={expandedId === item.id}
              onToggle={() =>
                setExpandedId(expandedId === item.id ? null : item.id)
              }
              onUpdate={fetchAll}
              onCompanyClick={(companyId) => setCompanyPanelId(companyId)}
            />
          ))}
        </div>
      )}

      {/* Company detail slide panel */}
      {companyPanelId && (
        <CompanySlidePanel
          companyId={companyPanelId}
          onClose={() => setCompanyPanelId(null)}
        />
      )}
    </div>
  );
}

function InquiryCard({
  item,
  expanded,
  onToggle,
  onUpdate,
  onCompanyClick,
}: {
  item: InquiryItem;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: () => void;
  onCompanyClick: (companyId: string) => void;
}) {
  const [status, setStatus] = useState(item.status);
  const [note, setNote] = useState(item.admin_note || "");
  const [saving, setSaving] = useState(false);

  const typeKey =
    item.source === "bid"
      ? `bid_${item.service_type}`
      : item.type || "general";
  const typeInfo = TYPE_LABELS[typeKey] || TYPE_LABELS.general;
  const statusInfo =
    STATUS_OPTIONS.find((s) => s.value === item.status) || STATUS_OPTIONS[0];

  function handleStatusChange(newStatus: string) {
    setStatus(newStatus);
    // 기본 메시지 제안
    const messages = DEFAULT_MESSAGES[newStatus];
    if (messages) {
      const msg = messages[typeKey] || messages._default || "";
      if (msg && !note) {
        setNote(msg);
      }
    }
  }

  function getAvailableTemplates(): { label: string; message: string }[] {
    const messages = DEFAULT_MESSAGES[status];
    if (!messages) return [];
    const templates: { label: string; message: string }[] = [];
    // 현재 유형에 맞는 메시지
    if (messages[typeKey]) {
      templates.push({ label: `${typeInfo.label} 기본`, message: messages[typeKey] });
    }
    // 기본 메시지
    if (messages._default) {
      templates.push({ label: "공통", message: messages._default });
    }
    // 다른 유형 메시지도 선택 가능
    for (const [key, msg] of Object.entries(messages)) {
      if (key !== typeKey && key !== "_default" && TYPE_LABELS[key]) {
        templates.push({ label: TYPE_LABELS[key].label, message: msg });
      }
    }
    return templates;
  }

  async function handleSave() {
    setSaving(true);
    try {
      const table =
        item.source === "bid" ? "bid_inquiries" : "inquiries";
      await fetch("/api/admin/inquiry-update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table,
          id: item.id,
          status,
          admin_note: note,
        }),
      });
      onUpdate();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{
              backgroundColor: typeInfo.color + "20",
              color: typeInfo.color,
            }}
          >
            {typeInfo.label}
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{
              backgroundColor: statusInfo.color + "20",
              color: statusInfo.color,
            }}
          >
            {statusInfo.label}
          </span>
          {item.tracking_code && (
            <span className="font-mono text-[10px] text-gray-600">
              {item.tracking_code}
            </span>
          )}
          <span className="text-sm font-semibold text-[var(--foreground)]">
            {item.contact_name}
          </span>
          {item.company_name && (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (item.company_id) {
                  onCompanyClick(item.company_id);
                } else {
                  // company_id 없으면 검색해서 연결 시도
                  try {
                    const res = await fetch(`/api/companies/search?q=${encodeURIComponent(item.company_name!)}`);
                    const companies = await res.json();
                    if (companies.length > 0) {
                      onCompanyClick(companies[0].id);
                    } else {
                      alert("등록된 기업 정보를 찾을 수 없습니다.");
                    }
                  } catch {
                    alert("검색 실패");
                  }
                }
              }}
              className="text-sm text-[var(--primary)] hover:underline"
            >
              ({item.company_name})
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600">
            {new Date(item.created_at).toLocaleDateString("ko-KR")}
          </span>
          <ChevronDown
            size={16}
            className={`text-gray-500 transition ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-[var(--border)] p-5">
          {/* Contact info */}
          <div className="mb-3 flex flex-wrap gap-4 text-xs">
            {item.phone && (
              <a
                href={`tel:${item.phone}`}
                className="flex items-center gap-1 text-gray-400 hover:text-[var(--primary)]"
              >
                <Phone size={12} /> {item.phone}
              </a>
            )}
            {item.email && (
              <a
                href={`mailto:${item.email}`}
                className="flex items-center gap-1 text-gray-400 hover:text-[var(--primary)]"
              >
                <Mail size={12} /> {item.email}
              </a>
            )}
          </div>

          {/* Bid info */}
          {item.bid_title && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-[var(--accent)]/20 bg-[var(--accent)]/5 px-3 py-2 text-xs">
              <Briefcase size={12} className="text-[var(--accent)]" />
              <span className="text-[var(--accent)]">지원사업:</span>
              <span className="text-[var(--foreground)]">{item.bid_title}</span>
            </div>
          )}

          {/* Message */}
          <div className="mb-4 rounded-lg bg-[var(--background)] p-3">
            <p className="mb-1 flex items-center gap-1 text-xs text-gray-500">
              <MessageSquare size={12} /> 문의 내용
            </p>
            <p className="whitespace-pre-wrap text-sm text-gray-300">
              {item.message}
            </p>
          </div>

          {/* Status change + admin note */}
          <div className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <div className="flex items-center gap-3">
              <label className="text-xs text-gray-500">상태:</label>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Template message buttons */}
            {getAvailableTemplates().length > 0 && (
              <div>
                <p className="mb-1.5 text-[10px] text-gray-600">기본 메시지 선택:</p>
                <div className="flex flex-wrap gap-1.5">
                  {getAvailableTemplates().map((t, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNote(t.message)}
                      className={`rounded-md border px-2.5 py-1 text-[10px] transition ${
                        note === t.message
                          ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                          : "border-[var(--border)] text-gray-500 hover:border-gray-500 hover:text-gray-300"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="mb-1 flex items-center gap-1 text-xs text-gray-500">
                <FileText size={12} /> 관리자 메모 (고객에게 노출됨)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="진행 상태나 메모를 입력하세요..."
                className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-gray-600 focus:border-[var(--primary)] focus:outline-none"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 self-end rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-bold text-black hover:brightness-110 disabled:opacity-50"
            >
              <Save size={14} />
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Company Slide Panel ───
interface CompanyDetail {
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
  created_at: string;
  updated_at: string;
  company_tags: { tag_id: string; tags: { name: string; color: string; type: string } | null }[];
}

function CompanySlidePanel({
  companyId,
  onClose,
}: {
  companyId: string;
  onClose: () => void;
}) {
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/companies/${companyId}`)
      .then((r) => r.json())
      .then((d) => d.name && setCompany(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [companyId]);

  const fields = company
    ? [
        { label: "기업명", value: company.name },
        { label: "대표자", value: company.ceo },
        { label: "담당자", value: company.contact_person },
        { label: "연락처", value: company.phone, href: company.phone ? `tel:${company.phone}` : undefined },
        { label: "이메일", value: company.email, href: company.email ? `mailto:${company.email.split("\n")[0]}` : undefined },
        { label: "홈페이지", value: company.website, href: company.website?.split("\n")[0] },
        { label: "시도", value: company.sido },
        { label: "시군구", value: company.sigungu },
        { label: "주소", value: company.address },
        { label: "메모", value: company.memo },
        { label: "등록일", value: company.created_at ? new Date(company.created_at).toLocaleDateString("ko-KR") : null },
        { label: "수정일", value: company.updated_at ? new Date(company.updated_at).toLocaleDateString("ko-KR") : null },
      ]
    : [];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-[var(--background)]/50" onClick={onClose} />
      <div className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-md overflow-y-auto border-l border-[var(--border)] bg-[var(--surface)] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-5 py-4">
          <h3 className="text-base font-bold text-[var(--foreground)]">기업 상세 정보</h3>
          <div className="flex gap-2">
            {company && (
              <a
                href={`/admin/companies/${companyId}`}
                className="rounded-lg border border-[var(--border)] px-3 py-1 text-xs text-gray-400 hover:text-[var(--primary)]"
              >
                전체 보기 →
              </a>
            )}
            <button
              onClick={onClose}
              className="rounded-lg border border-[var(--border)] px-3 py-1 text-xs text-gray-400 hover:text-[var(--foreground)]"
            >
              닫기
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
          </div>
        ) : !company ? (
          <div className="p-5 text-center text-gray-500">기업 정보를 찾을 수 없습니다</div>
        ) : (
          <div className="p-5">
            {company.company_tags?.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-1">
                {company.company_tags.map((ct) =>
                  ct.tags ? (
                    <span
                      key={ct.tag_id}
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ backgroundColor: ct.tags.color + "20", color: ct.tags.color }}
                    >
                      {ct.tags.name}
                    </span>
                  ) : null
                )}
              </div>
            )}
            <div className="space-y-3">
              {fields.map(
                (f) =>
                  f.value && (
                    <div key={f.label} className="border-b border-[var(--border)]/30 pb-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                        {f.label}
                      </p>
                      {f.href ? (
                        <a
                          href={f.href}
                          target={f.href.startsWith("http") ? "_blank" : undefined}
                          className="text-sm text-[var(--primary)] hover:underline"
                        >
                          {f.value}
                        </a>
                      ) : (
                        <p className="whitespace-pre-wrap text-sm text-[var(--foreground)]">{f.value}</p>
                      )}
                    </div>
                  )
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
