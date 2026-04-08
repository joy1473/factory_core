"use client";

import { useState, useEffect, useRef } from "react";
import { Send, CheckCircle, Building2 } from "lucide-react";

interface ContactFormProps {
  type?: "general" | "poc" | "survey";
  title?: string;
}

interface CompanyResult {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  sido: string;
  sigungu: string;
}

export function ContactForm({
  type = "general",
  title = "문의하기",
}: ContactFormProps) {
  const [form, setForm] = useState({
    company_name: "",
    contact_name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [trackingCode, setTrackingCode] = useState("");

  // Company autocomplete
  const [suggestions, setSuggestions] = useState<CompanyResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [matchedCompany, setMatchedCompany] = useState<CompanyResult | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleCompanyInput(value: string) {
    // 매칭된 회사가 있었는데 회사명을 변경하면 → 다른 필드 초기화 (문의 내용 제외)
    if (matchedCompany && value !== matchedCompany.name) {
      setForm({ ...form, company_name: value, contact_name: "", phone: "", email: "" });
    } else {
      setForm({ ...form, company_name: value });
    }
    setMatchedCompany(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/companies/search?q=${encodeURIComponent(value)}`);
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data : []);
        setShowSuggestions(data.length > 0);
      } catch {
        setSuggestions([]);
      }
    }, 300);
  }

  function selectCompany(company: CompanyResult) {
    setMatchedCompany(company);
    setForm({
      ...form,
      company_name: company.name,
      contact_name: form.contact_name || company.contact_person || "",
      phone: form.phone || company.phone || "",
      email: form.email || (company.email ? company.email.split("\n")[0] : ""),
    });
    setShowSuggestions(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type }),
      });
      if (!res.ok) throw new Error("전송 실패");
      const data = await res.json();
      setTrackingCode(data.tracking_code || "");
      setSent(true);
    } catch {
      setError("전송에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-[var(--secondary)]/30 bg-[var(--surface)] p-10 text-center">
        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-[var(--secondary)]" />
        <h3 className="mb-2 text-xl font-bold text-white">
          접수되었습니다!
        </h3>
        {trackingCode && (
          <div className="mx-auto mb-4 max-w-xs rounded-lg bg-[var(--primary)]/10 p-3">
            <p className="text-xs text-gray-400">추적 코드</p>
            <p className="font-mono text-lg font-bold text-[var(--primary)]">
              {trackingCode}
            </p>
          </div>
        )}
        <p className="mb-4 text-gray-400">
          빠른 시일 내에 연락드리겠습니다. 감사합니다.
        </p>
        <a
          href={`/bids/track${trackingCode ? `?code=${trackingCode}` : ""}`}
          className="inline-block rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-gray-400 transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
        >
          진행 상태 조회 →
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8"
    >
      <h3 className="mb-6 text-xl font-bold text-white">{title}</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Company name with autocomplete */}
        <div ref={wrapperRef} className="relative">
          <label className="mb-1 block text-sm text-gray-400">회사명</label>
          <input
            type="text"
            value={form.company_name}
            onChange={(e) => handleCompanyInput(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-[var(--primary)] focus:outline-none"
            placeholder="회사명 입력 (자동 검색)"
            autoComplete="off"
          />
          {matchedCompany && (
            <div className="mt-1 flex items-center gap-1 text-[10px] text-[var(--secondary)]">
              <Building2 size={10} />
              등록된 기업과 매칭됨 · {matchedCompany.sido} {matchedCompany.sigungu}
            </div>
          )}

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-xl">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => selectCompany(s)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-white/5"
                >
                  <Building2 size={14} className="mt-0.5 shrink-0 text-[var(--primary)]" />
                  <div>
                    <p className="text-sm font-semibold text-white">{s.name}</p>
                    <p className="text-xs text-gray-500">
                      {s.sido} {s.sigungu}
                      {s.contact_person && ` · ${s.contact_person}`}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-400">
            담당자명 <span className="text-[var(--danger)]">*</span>
          </label>
          <input
            type="text"
            required
            value={form.contact_name}
            onChange={(e) =>
              setForm({ ...form, contact_name: e.target.value })
            }
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-[var(--primary)] focus:outline-none"
            placeholder="홍길동"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-400">연락처</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-[var(--primary)] focus:outline-none"
            placeholder="010-1234-5678"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-400">이메일</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-[var(--primary)] focus:outline-none"
            placeholder="info@company.com"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-sm text-gray-400">
          문의 내용 <span className="text-[var(--danger)]">*</span>
        </label>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-[var(--primary)] focus:outline-none"
          placeholder={
            type === "poc"
              ? "설비 종류, 공장 규모, 희망 일정 등을 적어주세요."
              : "궁금한 점을 적어주세요."
          }
        />
      </div>

      {error && (
        <p className="mt-3 text-sm text-[var(--danger)]">{error}</p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-50"
      >
        {sending ? (
          "전송 중..."
        ) : (
          <>
            <Send size={16} />
            {type === "poc" ? "PoC 신청하기" : "문의 보내기"}
          </>
        )}
      </button>
    </form>
  );
}
