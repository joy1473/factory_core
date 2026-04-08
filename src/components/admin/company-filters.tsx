"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useFilterStore } from "@/store/filter-store";
import { RegionSelect } from "@/components/ui/region-select";

export function CompanyFilters() {
  const { sido, sigungu, search, setSido, setSigungu, setSearch } =
    useFilterStore();
  const [searchInput, setSearchInput] = useState(search);

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
          placeholder="기업명, 주소, 담당자, 이메일, 메모 검색..."
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2 pl-9 pr-4 text-sm text-white placeholder-gray-600 focus:border-[var(--primary)] focus:outline-none"
        />
      </div>
      <RegionSelect
        sido={sido}
        sigungu={sigungu}
        onSidoChange={setSido}
        onSigunguChange={setSigungu}
      />
    </div>
  );
}
