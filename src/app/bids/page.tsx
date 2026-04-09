"use client";

import { useEffect, useState, useRef } from "react";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import {
  Calendar,
  ExternalLink,
  Star,
  Clock,
  CheckCircle,
  Send,
  Search,
  FileText,
  Presentation,
  Briefcase,
  Package,
} from "lucide-react";

interface Bid {
  id: string;
  title: string;
  organization: string;
  field: string;
  apply_start: string;
  apply_end: string;
  status: string;
  detail_url: string;
  summary: string;
  is_featured: boolean;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: "접수중", color: "#00ff88" },
  upcoming: { label: "예정", color: "#00d4ff" },
  closed: { label: "마감", color: "#888888" },
};

const SERVICE_TYPES = [
  { value: "proposal", label: "제안서 작성 대행", icon: FileText },
  { value: "presentation", label: "발표 준비 지원", icon: Presentation },
  { value: "consulting", label: "사업 컨설팅", icon: Briefcase },
  { value: "full", label: "전체 대행 (제안서+발표+컨설팅)", icon: Package },
];

export default function BidsPage() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [inquiryForm, setInquiryForm] = useState({
    company_name: "",
    contact_name: "",
    phone: "",
    email: "",
    message: "",
    service_type: "proposal",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [companySuggestions, setCompanySuggestions] = useState<{id:string;name:string;contact_person:string|null;phone:string|null;email:string|null;sido:string;sigungu:string}[]>([]);
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);
  const [matchedBidCompany, setMatchedBidCompany] = useState<string | null>(null);
  const companyDebounce = useRef<ReturnType<typeof setTimeout>>(undefined);

  function handleBidCompanyInput(value: string) {
    // 매칭 후 다른 회사명 입력 시 초기화 (message, service_type 제외)
    if (matchedBidCompany && value !== matchedBidCompany) {
      setInquiryForm({ ...inquiryForm, company_name: value, contact_name: "", phone: "", email: "" });
      setMatchedBidCompany(null);
    } else {
      setInquiryForm({ ...inquiryForm, company_name: value });
    }
    if (companyDebounce.current) clearTimeout(companyDebounce.current);
    if (value.length < 2) { setCompanySuggestions([]); setShowCompanySuggestions(false); return; }
    companyDebounce.current = setTimeout(async () => {
      const res = await fetch(`/api/companies/search?q=${encodeURIComponent(value)}`);
      const data = await res.json();
      setCompanySuggestions(Array.isArray(data) ? data : []);
      setShowCompanySuggestions(data.length > 0);
    }, 300);
  }

  function selectBidCompany(c: typeof companySuggestions[0]) {
    setInquiryForm({
      ...inquiryForm,
      company_name: c.name,
      contact_name: c.contact_person || inquiryForm.contact_name || "",
      phone: c.phone || inquiryForm.phone || "",
      email: (c.email ? c.email.split("\n")[0] : "") || inquiryForm.email || "",
    });
    setMatchedBidCompany(c.name);
    setShowCompanySuggestions(false);
  }

  useEffect(() => {
    fetch("/api/bids")
      .then((r) => r.json())
      .then((d) => {
        setBids(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleInquiry(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/bids/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...inquiryForm,
          bid_id: selectedBid?.id,
          message: `[${selectedBid?.title}] ${inquiryForm.message}`,
        }),
      });
      const data = await res.json();
      setTrackingCode(data.tracking_code || "");
      setSent(true);
    } finally {
      setSending(false);
    }
  }

  function daysLeft(dateStr: string) {
    const diff = Math.ceil(
      (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return diff;
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-5 py-20">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
            Smart Factory Bids
          </p>
          <h1 className="mb-4 text-3xl font-bold text-[var(--foreground)]">
            스마트공장 지원사업 공고
          </h1>
          <p className="mx-auto mb-4 max-w-lg text-gray-400">
            정부 스마트공장 지원사업을 확인하고, 제안서 작성부터 발표까지
            전문 지원을 받으세요.
          </p>
          <a
            href="/bids/track"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-gray-400 transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            <Search size={14} />
            문의 진행 상태 조회
          </a>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-4">
            {bids.map((bid) => {
              const s = STATUS_MAP[bid.status] || STATUS_MAP.active;
              const days = daysLeft(bid.apply_end);
              return (
                <div
                  key={bid.id}
                  className={`rounded-xl border bg-[var(--surface)] p-6 transition ${
                    bid.is_featured
                      ? "border-[var(--accent)]/30"
                      : "border-[var(--border)]"
                  }`}
                >
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {bid.is_featured && (
                        <Star size={14} className="text-[var(--accent)]" fill="var(--accent)" />
                      )}
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{
                          backgroundColor: s.color + "15",
                          color: s.color,
                        }}
                      >
                        {s.label}
                      </span>
                      <span className="rounded bg-[var(--primary)]/10 px-2 py-0.5 text-xs text-[var(--primary)]">
                        {bid.field}
                      </span>
                      <span className="text-xs text-gray-500">
                        {bid.organization}
                      </span>
                    </div>
                    {bid.status === "active" && days > 0 && (
                      <span className="flex items-center gap-1 text-xs text-[var(--accent)]">
                        <Clock size={12} />
                        D-{days}
                      </span>
                    )}
                  </div>

                  <h3 className="mb-2 text-lg font-bold text-[var(--foreground)]">
                    {bid.title}
                  </h3>
                  <p className="mb-3 text-sm text-gray-400">{bid.summary}</p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {bid.apply_start} ~ {bid.apply_end}
                    </span>
                    {bid.detail_url && (
                      <a
                        href={bid.detail_url}
                        target="_blank"
                        className="flex items-center gap-1 text-[var(--primary)] hover:underline"
                      >
                        <ExternalLink size={12} />
                        원문 보기
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setSelectedBid(bid);
                        setSent(false);
                      }}
                      className="ml-auto flex items-center gap-1 rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-bold text-black transition hover:brightness-110"
                    >
                      <Send size={12} />
                      지원 문의
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Inquiry Modal */}
        {selectedBid && !sent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-lg rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <h3 className="mb-1 text-lg font-bold text-[var(--foreground)]">지원 문의</h3>
              <p className="mb-4 text-sm text-[var(--primary)]">
                {selectedBid.title}
              </p>

              <form onSubmit={handleInquiry} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    required
                    value={inquiryForm.contact_name}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, contact_name: e.target.value })}
                    placeholder="담당자명 *"
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-gray-600 focus:border-[var(--primary)] focus:outline-none"
                  />
                  <div className="relative">
                    <input
                      value={inquiryForm.company_name}
                      onChange={(e) => handleBidCompanyInput(e.target.value)}
                      onFocus={() => companySuggestions.length > 0 && setShowCompanySuggestions(true)}
                      placeholder="회사명 (자동 검색)"
                      autoComplete="off"
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-gray-600 focus:border-[var(--primary)] focus:outline-none"
                    />
                    {showCompanySuggestions && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-xl">
                        {companySuggestions.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => selectBidCompany(c)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition hover:bg-white/5"
                          >
                            <span className="font-semibold text-[var(--foreground)]">{c.name}</span>
                            <span className="text-gray-500">{c.sido}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    value={inquiryForm.phone}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                    placeholder="연락처"
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-gray-600 focus:border-[var(--primary)] focus:outline-none"
                  />
                  <input
                    value={inquiryForm.email}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                    placeholder="이메일"
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-gray-600 focus:border-[var(--primary)] focus:outline-none"
                  />
                </div>

                <div>
                  <p className="mb-2 text-xs text-gray-400">서비스 유형</p>
                  <div className="grid grid-cols-2 gap-2">
                    {SERVICE_TYPES.map((st) => (
                      <button
                        key={st.value}
                        type="button"
                        onClick={() => setInquiryForm({ ...inquiryForm, service_type: st.value })}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition ${
                          inquiryForm.service_type === st.value
                            ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                            : "border-[var(--border)] text-gray-400 hover:border-gray-500"
                        }`}
                      >
                        <st.icon size={14} />
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  required
                  rows={3}
                  value={inquiryForm.message}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                  placeholder="문의 내용 (업종, 규모, 희망사항 등)"
                  className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-gray-600 focus:border-[var(--primary)] focus:outline-none"
                />

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex-1 rounded-lg bg-[var(--primary)] py-2.5 text-sm font-bold text-black hover:brightness-110 disabled:opacity-50"
                  >
                    {sending ? "전송 중..." : "문의 보내기"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedBid(null)}
                    className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm text-gray-400 hover:text-[var(--foreground)]"
                  >
                    닫기
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sent confirmation */}
        {sent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-sm rounded-xl border border-[var(--secondary)]/30 bg-[var(--surface)] p-8 text-center">
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-[var(--secondary)]" />
              <h3 className="mb-2 text-xl font-bold text-[var(--foreground)]">접수 완료!</h3>
              {trackingCode && (
                <div className="mb-4 rounded-lg bg-[var(--primary)]/10 p-3">
                  <p className="text-xs text-gray-400">추적 코드</p>
                  <p className="font-mono text-lg font-bold text-[var(--primary)]">
                    {trackingCode}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    이 코드로 진행 상태를 조회할 수 있습니다
                  </p>
                </div>
              )}
              <p className="mb-4 text-sm text-gray-400">
                빠른 시일 내에 연락드리겠습니다.
              </p>
              <div className="flex gap-2">
                <a
                  href={`/bids/track?code=${trackingCode}`}
                  className="flex-1 rounded-lg bg-[var(--primary)] px-4 py-2 text-center text-sm font-bold text-black"
                >
                  진행 상태 조회
                </a>
                <button
                  onClick={() => {
                    setSelectedBid(null);
                    setSent(false);
                  }}
                  className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-gray-400"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
