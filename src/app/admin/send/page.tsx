"use client";

import { useCallback, useEffect, useState } from "react";
import { useCompanyStore } from "@/store/company-store";
import { Send, Mail, Users, FileText, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";

interface Template {
  id: string;
  name: string;
  content: string;
}

interface SendResult {
  total: number;
  sent: number;
  failed: number;
  noEmail: number;
}

export default function SendPage() {
  const { selectedIds } = useCompanyStore();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [step, setStep] = useState(1); // 1: select, 2: preview, 3: result
  const [previewData, setPreviewData] = useState<{ name: string; email: string; preview: string }[]>([]);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/templates")
      .then((r) => r.json())
      .then((d) => setTemplates(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const template = templates.find((t) => t.id === selectedTemplate);

  async function handlePreview() {
    if (!selectedTemplate || selectedIds.size === 0) return;
    setLoading(true);

    try {
      const res = await fetch("/api/admin/send/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_ids: Array.from(selectedIds),
          template_id: selectedTemplate,
        }),
      });
      const data = await res.json();
      setPreviewData(data.previews || []);
      setStep(2);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    setSending(true);
    try {
      const res = await fetch("/api/admin/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_ids: Array.from(selectedIds),
          template_id: selectedTemplate,
        }),
      });
      const data = await res.json();
      setResult(data);
      setStep(3);
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">이메일 발송</h1>

      {/* Steps indicator */}
      <div className="mb-8 flex items-center gap-2 text-sm">
        {[
          { n: 1, label: "기업 선택 + 템플릿" },
          { n: 2, label: "미리보기" },
          { n: 3, label: "발송 결과" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                step >= s.n
                  ? "bg-[var(--primary)] text-black"
                  : "bg-[var(--border)] text-gray-500"
              }`}
            >
              {s.n}
            </span>
            <span className={step >= s.n ? "text-white" : "text-gray-600"}>
              {s.label}
            </span>
            {i < 2 && <ChevronRight size={14} className="text-gray-600" />}
          </div>
        ))}
      </div>

      {/* Step 1: Select */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <Users size={16} className="text-[var(--primary)]" /> 선택된 기업
            </h2>
            {selectedIds.size === 0 ? (
              <div className="text-sm text-gray-500">
                <a href="/admin/companies" className="text-[var(--primary)] hover:underline">
                  기업 관리
                </a>
                에서 기업을 먼저 선택해주세요.
              </div>
            ) : (
              <p className="text-sm text-gray-300">
                <span className="text-2xl font-black text-[var(--primary)]">{selectedIds.size}</span>개 기업 선택됨
              </p>
            )}
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <FileText size={16} className="text-[var(--accent)]" /> 템플릿 선택
            </h2>
            {templates.length === 0 ? (
              <div className="text-sm text-gray-500">
                <a href="/admin/templates" className="text-[var(--primary)] hover:underline">
                  템플릿 관리
                </a>
                에서 템플릿을 먼저 만들어주세요.
              </div>
            ) : (
              <div className="space-y-2">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${
                      selectedTemplate === t.id
                        ? "border-[var(--primary)] bg-[var(--primary)]/5"
                        : "border-[var(--border)] hover:border-gray-500"
                    }`}
                  >
                    <Mail size={16} className={selectedTemplate === t.id ? "text-[var(--primary)]" : "text-gray-500"} />
                    <div>
                      <p className="text-sm font-semibold text-white">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.content.substring(0, 60)}...</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handlePreview}
            disabled={selectedIds.size === 0 || !selectedTemplate}
            className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-bold text-black hover:brightness-110 disabled:opacity-30"
          >
            미리보기 <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="mb-3 text-sm font-semibold text-white">
              발송 미리보기 ({previewData.length}건)
            </h2>
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {previewData.map((p, i) => (
                <div key={i} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{p.name}</span>
                    <span className={`text-xs ${p.email ? "text-[var(--secondary)]" : "text-red-400"}`}>
                      {p.email || "이메일 없음"}
                    </span>
                  </div>
                  <pre className="whitespace-pre-wrap text-xs text-gray-400">{p.preview.substring(0, 150)}...</pre>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-gray-400"
            >
              이전
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-bold text-black hover:brightness-110 disabled:opacity-50"
            >
              <Send size={16} /> {sending ? "발송 중..." : `${previewData.filter((p) => p.email).length}건 발송하기`}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Result */}
      {step === 3 && result && (
        <div className="rounded-xl border border-[var(--secondary)]/30 bg-[var(--surface)] p-8 text-center">
          <CheckCircle className="mx-auto mb-4 h-12 w-12 text-[var(--secondary)]" />
          <h2 className="mb-4 text-xl font-bold text-white">발송 완료</h2>
          <div className="mx-auto grid max-w-sm gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-[var(--background)] p-3">
              <p className="text-2xl font-black text-[var(--secondary)]">{result.sent}</p>
              <p className="text-xs text-gray-500">발송 성공</p>
            </div>
            <div className="rounded-lg bg-[var(--background)] p-3">
              <p className="text-2xl font-black text-red-400">{result.failed}</p>
              <p className="text-xs text-gray-500">실패</p>
            </div>
            <div className="rounded-lg bg-[var(--background)] p-3">
              <p className="text-2xl font-black text-gray-500">{result.noEmail}</p>
              <p className="text-xs text-gray-500">이메일 없음</p>
            </div>
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <a
              href="/admin/history"
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-gray-400 hover:text-white"
            >
              발송 이력 보기
            </a>
            <button
              onClick={() => { setStep(1); setResult(null); }}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-bold text-black"
            >
              새로 발송하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
