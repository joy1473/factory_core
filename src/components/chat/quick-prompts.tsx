"use client";

import { BarChart3, AlertTriangle, FileText, TrendingUp, Cpu } from "lucide-react";

const PROMPTS = [
  { label: "현황", prompt: "현재 전체 설비 상태를 요약해줘", icon: BarChart3 },
  { label: "알림", prompt: "활성화된 알림을 모두 보여줘", icon: AlertTriangle },
  { label: "보고서", prompt: "일일 설비 점검 보고서를 생성해줘", icon: FileText },
  { label: "추세", prompt: "최근 센서 데이터 추세를 분석해줘", icon: TrendingUp },
  { label: "예측", prompt: "현재 데이터 기반으로 향후 이상 가능성을 예측해줘", icon: Cpu },
];

interface QuickPromptsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export function QuickPrompts({ onSelect, disabled }: QuickPromptsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PROMPTS.map((p) => {
        const Icon = p.icon;
        return (
          <button
            key={p.label}
            onClick={() => onSelect(p.prompt)}
            disabled={disabled}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] transition hover:border-[var(--corebot-core)]/50 hover:text-[var(--corebot-core)] disabled:opacity-50"
          >
            <Icon size={12} /> {p.label}
          </button>
        );
      })}
    </div>
  );
}
