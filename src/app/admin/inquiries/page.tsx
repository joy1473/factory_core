"use client";

import { useEffect, useState } from "react";

interface Inquiry {
  id: string;
  company_name: string | null;
  contact_name: string;
  phone: string | null;
  email: string | null;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/inquiries?admin=1")
      .then((r) => r.json())
      .then((d) => setInquiries(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">문의 접수</h1>
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center text-gray-500">
          접수된 문의가 없습니다
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((q) => (
            <div
              key={q.id}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{
                      backgroundColor:
                        q.type === "poc"
                          ? "rgba(0,212,255,0.15)"
                          : "rgba(255,170,0,0.15)",
                      color: q.type === "poc" ? "#00d4ff" : "#ffaa00",
                    }}
                  >
                    {q.type === "poc"
                      ? "PoC"
                      : q.type === "survey"
                        ? "설문"
                        : "일반"}
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {q.contact_name}
                  </span>
                  {q.company_name && (
                    <span className="text-sm text-gray-400">
                      ({q.company_name})
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-600">
                  {new Date(q.created_at).toLocaleString("ko-KR")}
                </span>
              </div>
              <p className="text-sm text-gray-300">{q.message}</p>
              {(q.phone || q.email) && (
                <div className="mt-2 flex gap-4 text-xs text-gray-500">
                  {q.phone && (
                    <a href={`tel:${q.phone}`} className="hover:text-[var(--primary)]">
                      📞 {q.phone}
                    </a>
                  )}
                  {q.email && (
                    <a href={`mailto:${q.email}`} className="hover:text-[var(--primary)]">
                      📧 {q.email}
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
