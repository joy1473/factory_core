"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { SurveyForm } from "@/components/survey/survey-form";
import type { Question } from "@/components/survey/survey-field";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

interface SurveyData {
  template: { id: string; name: string; type: string };
  formSchema: { questions: Question[] };
  alreadyResponded: boolean;
}

export default function SurveyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const templateId = params.id as string;
  const token = searchParams.get("token") || "";

  const [data, setData] = useState<SurveyData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError("잘못된 링크입니다. 이메일의 설문 링크를 다시 확인해주세요.");
      setLoading(false);
      return;
    }

    fetch(`/api/survey/${templateId}?token=${token}`)
      .then((r) => {
        if (!r.ok) throw new Error("invalid");
        return r.json();
      })
      .then((d) => setData(d))
      .catch(() => setError("유효하지 않은 링크입니다."))
      .finally(() => setLoading(false));
  }, [templateId, token]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-2 px-5">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-[var(--corebot-core)] to-[var(--primary)] text-[10px] font-black text-[var(--background)]">
              FC
            </div>
            <span className="text-sm font-bold text-[var(--primary)]">Factory Core</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-2xl px-5 py-10">
        {loading && (
          <div className="flex flex-col items-center gap-3 py-20">
            <Loader2 size={32} className="animate-spin text-[var(--primary)]" />
            <p className="text-sm text-gray-500">설문을 불러오는 중...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-[var(--danger)]/30 bg-[var(--surface)] p-10 text-center">
            <AlertCircle size={48} className="text-[var(--danger)]" />
            <h2 className="text-lg font-bold text-[var(--foreground)]">접근할 수 없습니다</h2>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        )}

        {data?.alreadyResponded && (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-[var(--corebot-core)]/30 bg-[var(--surface)] p-10 text-center">
            <CheckCircle size={48} className="text-[var(--corebot-core)]" />
            <h2 className="text-lg font-bold text-[var(--foreground)]">이미 응답하셨습니다</h2>
            <p className="text-sm text-gray-500">소중한 의견 감사합니다. 빠른 시일 내에 연락드리겠습니다.</p>
          </div>
        )}

        {data && !data.alreadyResponded && data.formSchema.questions.length > 0 && (
          <SurveyForm
            templateId={templateId}
            templateName={data.template.name}
            questions={data.formSchema.questions}
            token={token}
          />
        )}

        {data && !data.alreadyResponded && data.formSchema.questions.length === 0 && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center text-gray-500">
            설문 항목이 없습니다.
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-gray-500">
        © Factory Core · joy.it.kr · joytec@naver.com
      </footer>
    </div>
  );
}
