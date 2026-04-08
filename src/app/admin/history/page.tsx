"use client";

import { useEffect, useState } from "react";
import { Clock, CheckCircle, XCircle, Mail } from "lucide-react";

interface HistoryItem {
  id: string;
  company_id: string;
  phone: string;
  rendered_content: string;
  sent_at: string;
  status: string;
  companies: { name: string } | null;
  message_templates: { name: string } | null;
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  sent: { label: "발송", color: "#00d4ff", icon: CheckCircle },
  delivered: { label: "전달", color: "#00ff88", icon: CheckCircle },
  failed: { label: "실패", color: "#ff4444", icon: XCircle },
  pending: { label: "대기", color: "#888", icon: Clock },
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/history")
      .then((r) => r.json())
      .then((d) => setHistory(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">발송 이력</h1>

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
            return (
              <div
                key={h.id}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3"
              >
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-gray-500" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {h.companies?.name || "알 수 없음"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {h.message_templates?.name || "템플릿 없음"} · {h.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600">
                    {new Date(h.sent_at).toLocaleString("ko-KR")}
                  </span>
                  <span
                    className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{ backgroundColor: s.color + "15", color: s.color }}
                  >
                    <StatusIcon size={12} /> {s.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
