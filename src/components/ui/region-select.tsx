"use client";

import { useEffect, useState } from "react";

interface Region {
  name: string;
  count: number;
}

interface RegionSelectProps {
  sido: string;
  sigungu: string;
  onSidoChange: (sido: string) => void;
  onSigunguChange: (sigungu: string) => void;
  className?: string;
  size?: "sm" | "md";
}

export function RegionSelect({
  sido,
  sigungu,
  onSidoChange,
  onSigunguChange,
  className = "",
  size = "md",
}: RegionSelectProps) {
  const [sidos, setSidos] = useState<Region[]>([]);
  const [sigungus, setSigungus] = useState<Region[]>([]);

  // Fetch 시도 목록
  useEffect(() => {
    fetch("/api/companies/regions")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setSidos(d))
      .catch(() => {});
  }, []);

  // 시도 변경 시 시군구 목록
  useEffect(() => {
    if (!sido) {
      setSigungus([]);
      return;
    }
    fetch(`/api/companies/regions?sido=${encodeURIComponent(sido)}`)
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setSigungus(d))
      .catch(() => {});
  }, [sido]);

  const selectClass = size === "sm"
    ? "rounded border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
    : "rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none";

  return (
    <div className={`flex gap-2 ${className}`}>
      <select
        value={sido}
        onChange={(e) => {
          onSidoChange(e.target.value);
          onSigunguChange("");
        }}
        className={selectClass}
      >
        <option value="">전체 시도</option>
        {sidos.map((s) => (
          <option key={s.name} value={s.name}>
            {s.name} ({s.count})
          </option>
        ))}
      </select>
      <select
        value={sigungu}
        onChange={(e) => onSigunguChange(e.target.value)}
        disabled={!sido}
        className={`${selectClass} disabled:opacity-40`}
      >
        <option value="">전체 시군구</option>
        {sigungus.map((s) => (
          <option key={s.name} value={s.name}>
            {s.name} ({s.count})
          </option>
        ))}
      </select>
    </div>
  );
}
