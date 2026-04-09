"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, GripVertical } from "lucide-react";

interface Question {
  id: string;
  type: "radio" | "checkbox" | "text" | "textarea" | "scale" | "select";
  label: string;
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
  placeholder?: string;
}

interface FormSchemaEditorProps {
  value: { questions: Question[] };
  onChange: (schema: { questions: Question[] }) => void;
}

const TYPE_LABELS: Record<string, string> = {
  radio: "단일 선택",
  checkbox: "복수 선택",
  text: "단답형",
  textarea: "서술형",
  scale: "척도 (1~5)",
  select: "드롭다운",
};

export function FormSchemaEditor({ value, onChange }: FormSchemaEditorProps) {
  const questions = value.questions || [];

  function update(newQuestions: Question[]) {
    onChange({ questions: newQuestions });
  }

  function addQuestion() {
    update([
      ...questions,
      {
        id: `q${Date.now()}`,
        type: "radio",
        label: "",
        required: false,
        options: ["옵션 1", "옵션 2"],
      },
    ]);
  }

  function removeQuestion(idx: number) {
    update(questions.filter((_, i) => i !== idx));
  }

  function updateQuestion(idx: number, patch: Partial<Question>) {
    update(questions.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  }

  function moveQuestion(idx: number, dir: -1 | 1) {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= questions.length) return;
    const arr = [...questions];
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    update(arr);
  }

  function addOption(qIdx: number) {
    const q = questions[qIdx];
    updateQuestion(qIdx, { options: [...(q.options || []), `옵션 ${(q.options?.length || 0) + 1}`] });
  }

  function updateOption(qIdx: number, optIdx: number, val: string) {
    const q = questions[qIdx];
    const opts = [...(q.options || [])];
    opts[optIdx] = val;
    updateQuestion(qIdx, { options: opts });
  }

  function removeOption(qIdx: number, optIdx: number) {
    const q = questions[qIdx];
    updateQuestion(qIdx, { options: (q.options || []).filter((_, i) => i !== optIdx) });
  }

  const needsOptions = (type: string) => ["radio", "checkbox", "select"].includes(type);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500">설문 항목 ({questions.length})</p>
        <button
          type="button"
          onClick={addQuestion}
          className="flex items-center gap-1 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--primary)] hover:bg-[var(--primary)]/5"
        >
          <Plus size={12} /> 질문 추가
        </button>
      </div>

      {questions.length === 0 && (
        <p className="rounded-lg border border-dashed border-[var(--border)] p-6 text-center text-xs text-gray-500">
          질문을 추가하면 이메일에 설문 링크가 자동 포함됩니다
        </p>
      )}

      {questions.map((q, idx) => (
        <div key={q.id} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
          {/* Header */}
          <div className="mb-3 flex items-center gap-2">
            <GripVertical size={14} className="text-gray-600" />
            <span className="text-xs font-bold text-[var(--primary)]">Q{idx + 1}</span>
            <input
              value={q.label}
              onChange={(e) => updateQuestion(idx, { label: e.target.value })}
              placeholder="질문 내용을 입력하세요"
              className="flex-1 border-b border-[var(--border)] bg-transparent px-2 py-1 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
            />
            <select
              value={q.type}
              onChange={(e) => {
                const type = e.target.value as Question["type"];
                const patch: Partial<Question> = { type };
                if (needsOptions(type) && !q.options?.length) {
                  patch.options = ["옵션 1", "옵션 2"];
                }
                if (type === "scale") {
                  patch.min = 1;
                  patch.max = 5;
                }
                updateQuestion(idx, patch);
              }}
              className="rounded border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[10px] text-[var(--foreground)]"
            >
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <label className="flex items-center gap-1 text-[10px] text-gray-500">
              <input
                type="checkbox"
                checked={q.required || false}
                onChange={(e) => updateQuestion(idx, { required: e.target.checked })}
                className="accent-[var(--primary)]"
              />
              필수
            </label>
          </div>

          {/* Options (radio, checkbox, select) */}
          {needsOptions(q.type) && (
            <div className="ml-6 space-y-1">
              {(q.options || []).map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-600">
                    {q.type === "checkbox" ? "☐" : "○"}
                  </span>
                  <input
                    value={opt}
                    onChange={(e) => updateOption(idx, optIdx, e.target.value)}
                    className="flex-1 rounded border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(idx, optIdx)}
                    className="text-gray-600 hover:text-[var(--danger)]"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addOption(idx)}
                className="ml-4 text-[10px] text-[var(--primary)] hover:underline"
              >
                + 선택지 추가
              </button>
            </div>
          )}

          {/* Scale config */}
          {q.type === "scale" && (
            <div className="ml-6 flex items-center gap-2 text-[10px] text-gray-500">
              <span>최소</span>
              <input
                type="number"
                value={q.min || 1}
                onChange={(e) => updateQuestion(idx, { min: Number(e.target.value) })}
                className="w-12 rounded border border-[var(--border)] bg-[var(--surface)] px-1 py-0.5 text-center text-[10px] text-[var(--foreground)]"
              />
              <span>~ 최대</span>
              <input
                type="number"
                value={q.max || 5}
                onChange={(e) => updateQuestion(idx, { max: Number(e.target.value) })}
                className="w-12 rounded border border-[var(--border)] bg-[var(--surface)] px-1 py-0.5 text-center text-[10px] text-[var(--foreground)]"
              />
            </div>
          )}

          {/* Actions */}
          <div className="mt-2 flex justify-end gap-1">
            <button type="button" onClick={() => moveQuestion(idx, -1)} className="rounded p-1 text-gray-600 hover:bg-[var(--surface)]" disabled={idx === 0}>
              <ChevronUp size={14} />
            </button>
            <button type="button" onClick={() => moveQuestion(idx, 1)} className="rounded p-1 text-gray-600 hover:bg-[var(--surface)]" disabled={idx === questions.length - 1}>
              <ChevronDown size={14} />
            </button>
            <button type="button" onClick={() => removeQuestion(idx)} className="rounded p-1 text-gray-600 hover:text-[var(--danger)]">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
