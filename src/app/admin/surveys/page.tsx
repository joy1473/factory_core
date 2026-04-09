"use client";

import { useEffect, useState } from "react";
import { BarChart3, FileCheck, Users, Clock, ChevronDown } from "lucide-react";

interface SurveyResponse {
  id: string;
  template_id: string;
  answers: Record<string, string | string[]>;
  completed_at: string;
  message_templates: { name: string; form_schema: { questions: { id: string; type: string; label: string; options?: string[] }[] } } | null;
  send_history: { company_id: string; phone: string; companies: { name: string } | null } | null;
}

export default function SurveysPage() {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/surveys")
      .then((r) => r.json())
      .then((d) => setResponses(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // 통계 계산
  const totalResponses = responses.length;
  const templates = [...new Set(responses.map((r) => r.template_id))];

  // 질문별 통계 (첫 번째 템플릿 기준)
  const firstTemplate = responses[0]?.message_templates;
  const questions = firstTemplate?.form_schema?.questions || [];

  function getOptionStats(questionId: string, options: string[]) {
    const answers = responses.map((r) => r.answers[questionId]).filter(Boolean);
    return options.map((opt) => ({
      option: opt,
      count: answers.filter((a) => (Array.isArray(a) ? a.includes(opt) : a === opt)).length,
      pct: answers.length > 0 ? Math.round((answers.filter((a) => (Array.isArray(a) ? a.includes(opt) : a === opt)).length / answers.length) * 100) : 0,
    }));
  }

  const stats = [
    { label: "총 응답", value: totalResponses, icon: FileCheck, color: "var(--corebot-core)" },
    { label: "템플릿", value: templates.length, icon: BarChart3, color: "var(--primary)" },
    { label: "최근 응답", value: responses[0] ? new Date(responses[0].completed_at).toLocaleDateString("ko-KR") : "-", icon: Clock, color: "var(--muted)" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-[var(--foreground)]">설문 응답</h1>

      {/* 통계 카드 */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: s.color + "15" }}>
              <s.icon size={20} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xl font-bold text-[var(--foreground)]">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 질문별 통계 */}
      {questions.length > 0 && totalResponses > 0 && (
        <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="mb-4 text-sm font-semibold text-[var(--foreground)]">질문별 통계</h2>
          <div className="space-y-4">
            {questions.map((q) => (
              <div key={q.id}>
                <p className="mb-2 text-xs font-semibold text-[var(--foreground)]">{q.label}</p>
                {q.options && (q.type === "radio" || q.type === "checkbox" || q.type === "select") ? (
                  <div className="space-y-1">
                    {getOptionStats(q.id, q.options).map((s) => (
                      <div key={s.option} className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--border)]">
                          <div className="h-full rounded-full bg-[var(--corebot-core)]" style={{ width: `${s.pct}%` }} />
                        </div>
                        <span className="w-20 text-right text-[10px] text-gray-500">{s.option}</span>
                        <span className="w-12 text-right text-[10px] font-semibold text-[var(--foreground)]">{s.pct}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-500">서술형 — 개별 응답 확인</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 개별 응답 목록 */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        </div>
      ) : responses.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center text-gray-500">
          설문 응답이 없습니다
        </div>
      ) : (
        <div className="space-y-2">
          {responses.map((r) => {
            const companyName = (r.send_history?.companies as unknown as { name: string } | null)?.name || r.send_history?.phone || "알 수 없음";
            const templateName = r.message_templates?.name || "템플릿 없음";
            const expanded = expandedId === r.id;

            return (
              <div key={r.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
                <button
                  onClick={() => setExpandedId(expanded ? null : r.id)}
                  className="flex w-full items-center justify-between px-5 py-3 text-left"
                >
                  <div className="flex items-center gap-3">
                    <Users size={14} className="text-gray-500" />
                    <span className="text-sm font-semibold text-[var(--foreground)]">{companyName}</span>
                    <span className="text-[10px] text-gray-500">{templateName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">{new Date(r.completed_at).toLocaleString("ko-KR")}</span>
                    <ChevronDown size={14} className={`text-gray-500 transition ${expanded ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {expanded && (
                  <div className="border-t border-[var(--border)] px-5 py-4">
                    <div className="space-y-3">
                      {Object.entries(r.answers).map(([qId, answer]) => {
                        const q = r.message_templates?.form_schema?.questions?.find((x) => x.id === qId);
                        return (
                          <div key={qId}>
                            <p className="text-[10px] text-gray-500">{q?.label || qId}</p>
                            <p className="text-sm text-[var(--foreground)]">
                              {Array.isArray(answer) ? answer.join(", ") : answer}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
