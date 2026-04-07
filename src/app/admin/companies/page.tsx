"use client";

import { useCallback, useEffect, useState } from "react";
import { CompanyFilters } from "@/components/admin/company-filters";
import { CompanyTable } from "@/components/admin/company-table";
import { useCompanyStore } from "@/store/company-store";
import { Download } from "lucide-react";

interface Filters {
  sido: string;
  sigungu: string;
  search: string;
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

  function handleExportCSV() {
    const selected = companies.filter((c: { id: string }) =>
      selectedIds.has(c.id)
    );
    const rows = (selected.length > 0 ? selected : companies) as Array<{
      name: string;
      ceo: string;
      contact_person: string;
      phone: string;
      sido: string;
      sigungu: string;
      address: string;
    }>;

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
    a.download = `companies_${filters.sido || "all"}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">기업 관리</h1>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-gray-300 transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
        >
          <Download size={16} />
          CSV 내보내기
          {selectedIds.size > 0 && ` (${selectedIds.size}개)`}
        </button>
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
