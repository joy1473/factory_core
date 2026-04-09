"use client";

import { useState } from "react";
import { SurveyField, type Question } from "./survey-field";
import { Send, CheckCircle, Loader2 } from "lucide-react";

interface SurveyFormProps {
  templateId: string;
  templateName: string;
  questions: Question[];
  token: string;
}

export function SurveyForm({ templateId, templateName, questions, token }: SurveyFormProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function handleChange(questionId: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // 필수 항목 체크
    for (const q of questions) {
      if (q.required) {
        const val = answers[q.id];
        if (!val || (Array.isArray(val) && val.length === 0)) {
          setError(`Q. "${q.label}" 항목을 입력해주세요.`);
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/survey/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_id: templateId, token, answers }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "제출에 실패했습니다.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-[var(--corebot-core)]/30 bg-[var(--surface)] p-10 text-center">
        <CheckCircle size={48} className="text-[var(--corebot-core)]" />
        <h2 className="text-xl font-bold text-[var(--foreground)]">응답이 저장되었습니다!</h2>
        <p className="text-sm text-gray-500">소중한 의견 감사합니다. 빠른 시일 내에 연락드리겠습니다.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--foreground)]">{templateName}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {questions.length}개 질문 · 소요시간 약 {Math.max(2, Math.ceil(questions.length * 0.5))}분
        </p>
      </div>

      <div className="space-y-4">
        {questions.map((q, i) => (
          <SurveyField
            key={q.id}
            question={q}
            value={answers[q.id] || (q.type === "checkbox" ? [] : "")}
            onChange={(val) => handleChange(q.id, val)}
            index={i}
          />
        ))}
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/5 px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-3.5 text-base font-bold text-black transition hover:brightness-110 disabled:opacity-50"
      >
        {submitting ? (
          <><Loader2 size={18} className="animate-spin" /> 제출 중...</>
        ) : (
          <><Send size={18} /> 제출하기</>
        )}
      </button>
    </form>
  );
}
