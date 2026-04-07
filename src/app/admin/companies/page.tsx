"use client";

import { useCallback, useEffect, useState } from "react";
import { CompanyFilters } from "@/components/admin/company-filters";
import { CompanyTable } from "@/components/admin/company-table";
import { useCompanyStore } from "@/store/company-store";
import { Download, Tags, Plus, Minus } from "lucide-react";

interface Filters {
  sido: string;
  sigungu: string;
  search: string;
}

interface CompanyRow {
  name: string;
  ceo: string;
  contact_person: string;
  phone: string;
  sido: string;
  sigungu: string;
  address: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    sido: "",
    sigungu: "",
    search: "",
  });
  const { selectedIds } = useCompanyStore();
  const [allTags, setAllTags] = useState<
    { id: string; name: string; type: string; color: string }[]
  >([]);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [tagging, setTagging] = useState(false);

  // Fetch tags for bulk assign
  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setAllTags(d))
      .catch(() => {});
  }, []);

  async function handleBulkTag(tagId: string, action: "add" | "remove") {
    if (selectedIds.size === 0) return;
    setTagging(true);
    try {
      await fetch("/api/companies/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_ids: Array.from(selectedIds),
          tag_id: tagId,
          action,
        }),
      });
      fetchCompanies();
    } finally {
      setTagging(false);
      setShowTagMenu(false);
    }
  }

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "50");
    if (filters.sido) params.set("sido", filters.sido);
    if (filters.sigungu) params.set("sigungu", filters.sigungu);
    if (filters.search) params.set("search", filters.search);

    try {
      const res = await fetch(`/api/companies?${params}`);
      const json = await res.json();
      setCompanies(json.data || []);
      setTotal(json.total || 0);
    } catch {
      setCompanies([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleFilterChange = useCallback((f: Filters) => {
    setFilters(f);
    setPage(1);
  }, []);

  const [exporting, setExporting] = useState(false);

  async function handleExportCSV() {
    // 선택된 기업이 있으면 선택한 것만
    if (selectedIds.size > 0) {
      const selected = companies.filter((c: { id: string }) =>
        selectedIds.has(c.id)
      );
      downloadCSV(selected as CompanyRow[], `selected_${selectedIds.size}`);
      return;
    }

    // 선택 없으면 검색 조건에 맞는 전체 데이터 가져오기
    setExporting(true);
    try {
      const allRows: CompanyRow[] = [];
      let p = 1;
      const batchSize = 500;
      while (true) {
        const params = new URLSearchParams();
        params.set("page", String(p));
        params.set("limit", String(batchSize));
        if (filters.sido) params.set("sido", filters.sido);
        if (filters.sigungu) params.set("sigungu", filters.sigungu);
        if (filters.search) params.set("search", filters.search);

        const res = await fetch(`/api/companies?${params}`);
        const json = await res.json();
        const batch = json.data || [];
        allRows.push(...batch);
        if (batch.length < batchSize) break;
        p++;
      }
      downloadCSV(allRows, filters.sido || "all");
    } finally {
      setExporting(false);
    }
  }

  function downloadCSV(rows: CompanyRow[], label: string) {
    const csv =
      "\uFEFF기업명,대표자,담당자,연락처,시도,시군구,주소\n" +
      rows
        .map(
          (c) =>
            `"${c.name}","${c.ceo || ""}","${c.contact_person || ""}","${c.phone || ""}","${c.sido}","${c.sigungu}","${c.address || ""}"`
        )
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `companies_${label}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">기업 관리</h1>
        <div className="flex gap-2">
          {/* Bulk Tag */}
          <div className="relative">
            <button
              onClick={() =>
                selectedIds.size > 0 && setShowTagMenu(!showTagMenu)
              }
              disabled={selectedIds.size === 0 || tagging}
              className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-gray-300 transition hover:border-[var(--secondary)] hover:text-[var(--secondary)] disabled:opacity-30"
            >
              <Tags size={16} />
              태그 부여 ({selectedIds.size})
            </button>
            {showTagMenu && (
              <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-xl">
                <p className="mb-2 text-xs text-gray-500">
                  선택 {selectedIds.size}개 기업에 태그:
                </p>
                <div className="max-h-60 space-y-1 overflow-y-auto">
                  {allTags.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="text-sm text-white">{tag.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleBulkTag(tag.id, "add")}
                          className="rounded p-1 text-gray-500 hover:bg-green-500/10 hover:text-green-400"
                          title="태그 부여"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => handleBulkTag(tag.id, "remove")}
                          className="rounded p-1 text-gray-500 hover:bg-red-500/10 hover:text-red-400"
                          title="태그 제거"
                        >
                          <Minus size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowTagMenu(false)}
                  className="mt-2 w-full rounded-lg border border-[var(--border)] py-1 text-xs text-gray-500 hover:text-gray-300"
                >
                  닫기
                </button>
              </div>
            )}
          </div>
          {/* CSV Export */}
        <button
          onClick={handleExportCSV}
          disabled={exporting}
          className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-gray-300 transition hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:opacity-50"
        >
          <Download size={16} />
          {exporting
            ? "내보내는 중..."
            : selectedIds.size > 0
              ? `선택 ${selectedIds.size}개 내보내기`
              : `전체 ${total.toLocaleString()}개 내보내기`}
        </button>
        </div>
      </div>

      <div className="mb-4">
        <CompanyFilters onFilterChange={handleFilterChange} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        </div>
      ) : (
        <CompanyTable
          companies={companies}
          total={total}
          page={page}
          limit={50}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
