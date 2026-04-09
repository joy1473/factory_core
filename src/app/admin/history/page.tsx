"use client";

import { useEffect, useState } from "react";
import { Clock, CheckCircle, XCircle, Mail, RefreshCw, Send, BarChart3, Eye, MousePointerClick, FileCheck } from "lucide-react";

interface HistoryItem {
  id: string;
  company_id: string;
  phone: string;
  rendered_content: string;
  sent_at: string;
  status: string;
  open_at: string | null;
  click_at: string | null;
  responded_at: string | null;
  companies: { name: string } | null;
  message_templates: { name: string } | null;
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  sent: { label: "발송", color: "var(--corebot-core)", icon: CheckCircle },
  delivered: { label: "전달", color: "var(--secondary)", icon: CheckCircle },
  failed: { label: "실패", color: "var(--danger)", icon: XCircle },
  pending: { label: "대기", color: "var(--muted)", icon: Clock },
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState<Set<string>>(new Set());
  const [resendingAll, setResendingAll] = useState(false);

  function fetchHistory() {
    setLoading(true);
    fetch("/api/admin/history")
      .then((r) => r.json())
      .then((d) => setHistory(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchHistory(); }, []);

  // 통계 계산
  const total = history.length;
  const sent = history.filter((h) => h.status === "sent" || h.status === "delivered").length;
  const failed = history.filter((h) => h.status === "failed").length;
  const pending = history.filter((h) => h.status === "pending").length;
  const failedItems = history.filter((h) => h.status === "failed");

  async function handleResend(ids: string[]) {
    if (ids.length === 0) return;

    if (ids.length === 1) {
      setResending((prev) => new Set([...prev, ids[0]]));
    } else {
      setResendingAll(true);
    }

    try {
      const res = await fetch("/api/admin/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history_ids: ids }),
      });
      const result = await res.json();
      alert(`재발송 완료: 성공 ${result.sent}건, 실패 ${result.failed}건`);
      fetchHistory();
    } catch {
      alert("재발송 중 오류가 발생했습니다");
    } finally {
      setResending(new Set());
      setResendingAll(false);
    }
  }

  const stats = [
    { label: "총 발송", value: total, icon: Send, color: "var(--primary)" },
    { label: "성공", value: sent, icon: CheckCircle, color: "var(--corebot-core)" },
    { label: "실패", value: failed, icon: XCircle, color: "var(--danger)" },
    { label: "대기", value: pending, icon: Clock, color: "var(--muted)" },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">발송 이력</h1>
        <button
          onClick={fetchHistory}
          className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
        >
          <RefreshCw size={14} /> 새로고침
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: s.color + "15" }}
            >
              <s.icon size={20} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--foreground)]">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 성공률 바 */}
      {total > 0 && (
        <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
              <BarChart3 size={14} /> 발송 성공률
            </span>
            <span className="text-sm font-bold" style={{ color: "var(--corebot-core)" }}>
              {total > 0 ? Math.round((sent / total) * 100) : 0}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--border)]">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${total > 0 ? (sent / total) * 100 : 0}%`,
                backgroundColor: "var(--corebot-core)",
              }}
            />
          </div>
        </div>
      )}

      {/* 실패 건 재발송 */}
      {failedItems.length > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-[var(--danger)]/20 bg-[var(--danger)]/5 px-4 py-3">
          <span className="text-sm text-[var(--danger)]">
            실패 {failedItems.length}건
          </span>
          <button
            onClick={() => handleResend(failedItems.map((h) => h.id))}
            disabled={resendingAll}
            className="flex items-center gap-1 rounded-lg bg-[var(--danger)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] transition hover:brightness-110 disabled:opacity-50"
          >
            <RefreshCw size={12} className={resendingAll ? "animate-spin" : ""} />
            {resendingAll ? "재발송 중..." : "전체 재발송"}
          </button>
        </div>
      )}

      {/* 이력 리스트 */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        </div>
      ) : history.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center text-gray-500">
          발송 이력이 없습니다
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((h) => {
            const s = STATUS_MAP[h.status] || STATUS_MAP.pending;
            const StatusIcon = s.icon;
            const isResending = resending.has(h.id);
            return (
              <div
                key={h.id}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3"
              >
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-gray-500" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {h.companies?.name || "알 수 없음"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {h.message_templates?.name || "템플릿 없음"} · {h.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* 추적 아이콘 */}
                  <div className="flex items-center gap-1">
                    <span className={`flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] ${h.open_at ? "bg-[var(--corebot-eye)]/15 text-[var(--corebot-eye)]" : "bg-[var(--border)]/50 text-gray-600"}`} title={h.open_at ? `열람: ${new Date(h.open_at).toLocaleString("ko-KR")}` : "미열람"}>
                      <Eye size={10} />
                    </span>
                    <span className={`flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] ${h.click_at ? "bg-[var(--corebot-ear)]/15 text-[var(--corebot-ear)]" : "bg-[var(--border)]/50 text-gray-600"}`} title={h.click_at ? `클릭: ${new Date(h.click_at).toLocaleString("ko-KR")}` : "미클릭"}>
                      <MousePointerClick size={10} />
                    </span>
                    <span className={`flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] ${h.responded_at ? "bg-[var(--corebot-core)]/15 text-[var(--corebot-core)]" : "bg-[var(--border)]/50 text-gray-600"}`} title={h.responded_at ? `응답: ${new Date(h.responded_at).toLocaleString("ko-KR")}` : "미응답"}>
                      <FileCheck size={10} />
                    </span>
                  </div>
                  <span className="text-xs text-gray-600">
                    {new Date(h.sent_at).toLocaleString("ko-KR")}
                  </span>
                  <span
                    className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{ backgroundColor: s.color + "15", color: s.color }}
                  >
                    <StatusIcon size={12} /> {s.label}
                  </span>
                  {h.status === "failed" && (
                    <button
                      onClick={() => handleResend([h.id])}
                      disabled={isResending}
                      className="flex items-center gap-1 rounded-lg border border-[var(--border)] px-2 py-1 text-[10px] text-gray-500 transition hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:opacity-50"
                    >
                      <RefreshCw size={10} className={isResending ? "animate-spin" : ""} />
                      재발송
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
