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
}

const STATUS_OPTIONS = [
  { value: "new", label: "신규", color: "#00d4ff" },
  { value: "in_progress", label: "진행 중", color: "#ffaa00" },
  { value: "completed", label: "완료", color: "#00ff88" },
  { value: "cancelled", label: "취소", color: "#888888" },
];

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  general: { label: "일반문의", color: "#888" },
  poc: { label: "PoC", color: "#00d4ff" },
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

export default function InquiriesPage() {
  const [items, setItems] = useState<InquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
      <h1 className="mb-6 text-2xl font-bold text-white">문의 관리</h1>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
              filter === tab.value
                ? "bg-[var(--primary)] text-black"
                : "border border-[var(--border)] text-gray-400 hover:text-white"
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
            />
          ))}
        </div>
      )}
    </div>
  );
}

function InquiryCard({
  item,
  expanded,
  onToggle,
  onUpdate,
}: {
  item: InquiryItem;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: () => void;
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
          <span className="text-sm font-semibold text-white">
            {item.contact_name}
          </span>
          {item.company_name && (
            <span className="text-sm text-gray-400">
              ({item.company_name})
            </span>
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
              <span className="text-white">{item.bid_title}</span>
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
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-white focus:border-[var(--primary)] focus:outline-none"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 flex items-center gap-1 text-xs text-gray-500">
                <FileText size={12} /> 관리자 메모 (고객에게 노출됨)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="진행 상태나 메모를 입력하세요..."
                className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-[var(--primary)] focus:outline-none"
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
