"use client";

interface GaugeBarProps {
  label: string;
  value: number;
  max: number;
  unit: string;
}

export function GaugeBar({ label, value, max, unit }: GaugeBarProps) {
  const ratio = max > 0 ? value / max : 0;
  const pct = Math.min(ratio * 100, 120);

  const color =
    ratio >= 1.0 ? "var(--danger)" :
    ratio >= 0.85 ? "var(--accent)" :
    "var(--corebot-core)";

  return (
    <div className="flex items-center gap-3">
      <span className="w-12 text-[10px] text-gray-500">{label}</span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[var(--border)]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
        />
        {/* 임계치 마커 (85%) */}
        <div className="absolute top-0 h-full w-px bg-[var(--foreground)]/20" style={{ left: "85%" }} />
      </div>
      <span className="w-20 text-right text-xs font-semibold" style={{ color }}>
        {value}{unit} / {max}
      </span>
    </div>
  );
}
