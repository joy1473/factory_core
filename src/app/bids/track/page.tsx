"use client";

import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { Search, Clock, CheckCircle, Loader2, FileText, AlertCircle } from "lucide-react";

interface InquiryStatus {
  tracking_code: string;
  company_name: string | null;
  contact_name: string;
  service_type: string;
  status: string;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  bids: { title: string; organization: string; field: string } | null;
  type?: string;
  _source?: string;
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  new: { label: "접수 완료", color: "#DDA0DD", icon: Clock },
  in_progress: { label: "진행 중", color: "#FFD3B6", icon: Loader2 },
  completed: { label: "완료", color: "#A8E6CF", icon: CheckCircle },
  cancelled: { label: "취소", color: "#888888", icon: AlertCircle },
};

const SERVICE_LABELS: Record<string, string> = {
  proposal: "제안서 작성 대행",
  presentation: "발표 준비 지원",
  consulting: "사업 컨설팅",
  full: "전체 대행",
};

export default function TrackPage() {
  const [searchType, setSearchType] = useState<"code" | "phone">("code");
  const [searchValue, setSearchValue] = useState("");
  const [autoSearched, setAutoSearched] = useState(false);
  const [results, setResults] = useState<InquiryStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  // URL 파라미터에서 자동 검색
  useEffect(() => {
    if (autoSearched) return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const phone = params.get("phone");
    if (code) {
      setSearchType("code");
      setSearchValue(code);
      setAutoSearched(true);
      setTimeout(() => formRef.current?.requestSubmit(), 100);
    } else if (phone) {
      setSearchType("phone");
      setSearchValue(phone);
      setAutoSearched(true);
      setTimeout(() => formRef.current?.requestSubmit(), 100);
    }
  }, [autoSearched]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchValue.trim()) return;
    setLoading(true);
    setSearched(true);

    const param = searchType === "code" ? `code=${searchValue.trim()}` : `phone=${searchValue.trim()}`;
    try {
      // 두 테이블 동시 조회 (bid_inquiries + inquiries)
      const [bidRes, inqRes] = await Promise.all([
        fetch(`/api/bids/inquire?${param}`),
        fetch(`/api/inquiries?${param}`),
      ]);
      const bidData = await bidRes.json();
      const inqData = await inqRes.json();

      const allResults = [
        ...(Array.isArray(bidData) ? bidData.map((d: InquiryStatus) => ({ ...d, _source: "bid" })) : []),
        ...(Array.isArray(inqData) ? inqData.map((d: InquiryStatus) => ({ ...d, _source: "inquiry" })) : []),
      ];
      allResults.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setResults(allResults);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-5 py-20">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">
            Track Your Inquiry
          </p>
          <h1 className="mb-4 text-3xl font-bold text-[var(--foreground)]">
            문의 진행 상태 조회
          </h1>
          <p className="text-gray-400">
            추적 코드 또는 전화번호로 지원사업 문의 진행 상태를 확인하세요.
          </p>
        </div>

        {/* Search form */}
        <form ref={formRef} onSubmit={handleSearch} className="mb-8">
          <div className="mb-3 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setSearchType("code")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                searchType === "code"
                  ? "bg-[var(--primary)] text-black"
                  : "border border-[var(--border)] text-gray-400"
              }`}
            >
              추적 코드
            </button>
            <button
              type="button"
              onClick={() => setSearchType("phone")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                searchType === "phone"
                  ? "bg-[var(--primary)] text-black"
                  : "border border-[var(--border)] text-gray-400"
              }`}
            >
              전화번호
            </button>
          </div>
          <div className="flex gap-2">
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={searchType === "code" ? "FC-260409-a1b2" : "010-1234-5678"}
              className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] placeholder-gray-600 focus:border-[var(--primary)] focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 font-bold text-black hover:brightness-110 disabled:opacity-50"
            >
              <Search size={18} />
              조회
            </button>
          </div>
        </form>

        {/* Results */}
        {loading && (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
          </div>
        )}

        {searched && !loading && results.length === 0 && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center text-gray-500">
            조회 결과가 없습니다. 추적 코드 또는 전화번호를 확인해주세요.
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((r) => {
              const s = STATUS_MAP[r.status] || STATUS_MAP.new;
              const StatusIcon = s.icon;
              return (
                <div
                  key={r.tracking_code}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6"
                >
                  {/* Header */}
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="rounded-lg bg-[var(--primary)]/10 px-3 py-1 font-mono text-sm font-bold text-[var(--primary)]">
                        {r.tracking_code}
                      </span>
                      <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-gray-500">
                        {r._source === "bid" ? "지원사업" : r.type === "poc" ? "PoC" : "일반문의"}
                      </span>
                      <span
                        className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{ backgroundColor: s.color + "15", color: s.color }}
                      >
                        <StatusIcon size={12} />
                        {s.label}
                      </span>
                    </div>
                    <span className="text-xs text-gray-600">
                      {new Date(r.created_at).toLocaleDateString("ko-KR")}
                    </span>
                  </div>

                  {/* Bid info */}
                  {r.bids && (
                    <div className="mb-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                      <p className="text-sm font-semibold text-[var(--foreground)]">{r.bids.title}</p>
                      <p className="text-xs text-gray-500">
                        {r.bids.organization} · {r.bids.field}
                      </p>
                    </div>
                  )}

                  {/* Details */}
                  <div className="grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <span className="text-gray-500">담당자:</span>{" "}
                      <span className="text-[var(--foreground)]">{r.contact_name}</span>
                    </div>
                    {r.company_name && (
                      <div>
                        <span className="text-gray-500">회사:</span>{" "}
                        <span className="text-[var(--foreground)]">{r.company_name}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">서비스:</span>{" "}
                      <span className="text-[var(--accent)]">
                        {SERVICE_LABELS[r.service_type] || r.service_type}
                      </span>
                    </div>
                  </div>

                  {/* Admin note */}
                  {r.admin_note && (
                    <div className="mt-3 rounded-lg border border-[var(--secondary)]/20 bg-[var(--secondary)]/5 p-3">
                      <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-[var(--secondary)]">
                        <FileText size={12} /> 담당자 메모
                      </p>
                      <p className="text-sm text-[var(--muted)]">{r.admin_note}</p>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="mt-4 flex items-center gap-2 text-xs text-gray-600">
                    <span>접수: {new Date(r.created_at).toLocaleString("ko-KR")}</span>
                    {r.updated_at !== r.created_at && (
                      <span>· 업데이트: {new Date(r.updated_at).toLocaleString("ko-KR")}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
