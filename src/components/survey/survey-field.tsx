"use client";

export interface Question {
  id: string;
  type: "radio" | "checkbox" | "text" | "textarea" | "scale" | "select";
  label: string;
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
  placeholder?: string;
}

interface SurveyFieldProps {
  question: Question;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  index: number;
}

export function SurveyField({ question, value, onChange, index }: SurveyFieldProps) {
  const q = question;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <label className="mb-3 block text-sm font-semibold text-[var(--foreground)]">
        <span className="mr-2 text-[var(--primary)]">Q{index + 1}.</span>
        {q.label}
        {q.required && <span className="ml-1 text-[var(--danger)]">*</span>}
      </label>

      {q.type === "radio" && q.options && (
        <div className="space-y-2">
          {q.options.map((opt) => (
            <label
              key={opt}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--border)] px-4 py-3 transition hover:border-[var(--primary)]/50"
              style={value === opt ? { borderColor: "var(--primary)", backgroundColor: "var(--primary-dim)" } : undefined}
            >
              <input
                type="radio"
                name={q.id}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
                className="accent-[var(--primary)]"
              />
              <span className="text-sm text-[var(--foreground)]">{opt}</span>
            </label>
          ))}
        </div>
      )}

      {q.type === "checkbox" && q.options && (
        <div className="space-y-2">
          {q.options.map((opt) => {
            const checked = Array.isArray(value) && value.includes(opt);
            return (
              <label
                key={opt}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--border)] px-4 py-3 transition hover:border-[var(--primary)]/50"
                style={checked ? { borderColor: "var(--primary)", backgroundColor: "var(--primary-dim)" } : undefined}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const arr = Array.isArray(value) ? [...value] : [];
                    if (checked) onChange(arr.filter((v) => v !== opt));
                    else onChange([...arr, opt]);
                  }}
                  className="accent-[var(--primary)]"
                />
                <span className="text-sm text-[var(--foreground)]">{opt}</span>
              </label>
            );
          })}
        </div>
      )}

      {q.type === "text" && (
        <input
          type="text"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={q.placeholder || "입력해주세요"}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder-gray-500 focus:border-[var(--primary)] focus:outline-none"
        />
      )}

      {q.type === "textarea" && (
        <textarea
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={q.placeholder || "자유롭게 작성해주세요"}
          rows={4}
          className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder-gray-500 focus:border-[var(--primary)] focus:outline-none"
        />
      )}

      {q.type === "scale" && (
        <div className="flex items-center gap-2">
          {Array.from({ length: (q.max || 5) - (q.min || 1) + 1 }, (_, i) => {
            const n = (q.min || 1) + i;
            const selected = value === String(n);
            return (
              <button
                key={n}
                type="button"
                onClick={() => onChange(String(n))}
                className="flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold transition"
                style={
                  selected
                    ? { borderColor: "var(--primary)", backgroundColor: "var(--primary)", color: "var(--background)" }
                    : { borderColor: "var(--border)", color: "var(--muted)" }
                }
              >
                {n}
              </button>
            );
          })}
          <span className="ml-2 text-xs text-gray-500">
            {q.min || 1}=낮음 {q.max || 5}=높음
          </span>
        </div>
      )}

      {q.type === "select" && q.options && (
        <select
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
        >
          <option value="">선택해주세요</option>
          {q.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}
    </div>
  );
}
