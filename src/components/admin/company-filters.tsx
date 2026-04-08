"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useFilterStore } from "@/store/filter-store";

interface Region {
  name: string;
  count: number;
}

export function CompanyFilters() {
  const { sido, sigungu, search, setSido, setSigungu, setSearch } =
    useFilterStore();
  const [sidos, setSidos] = useState<Region[]>([]);
  const [sigungus, setSigungus] = useState<Region[]>([]);
  const [searchInput, setSearchInput] = useState(search);

  // Fetch 시도 목록
  useEffect(() => {
    fetch("/api/companies/regions")
      .then((r) => r.json())
      .then(setSidos)
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
      .then(setSigungus)
      .catch(() => {});
  }, [sido]);

  // 검색어 디바운스
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput, setSearch]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[200px] flex-1">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
        />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="기업명, 주소, 담당자 검색..."
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2 pl-9 pr-4 text-sm text-white placeholder-gray-600 focus:border-[var(--primary)] focus:outline-none"
        />
      </div>
      <select
        value={sido}
        onChange={(e) => setSido(e.target.value)}
        className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-white focus:border-[var(--primary)] focus:outline-none"
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
        onChange={(e) => setSigungu(e.target.value)}
        disabled={!sido}
        className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-white focus:border-[var(--primary)] focus:outline-none disabled:opacity-40"
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
