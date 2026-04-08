"use client";

import { useCompanyStore } from "@/store/company-store";
import { Building2, Globe, Mail, ExternalLink } from "lucide-react";
import Link from "next/link";

interface CompanyTag {
  tag_id: string;
  tags: { id: string; name: string; type: string; color: string } | null;
}

interface Company {
  id: string;
  name: string;
  ceo: string | null;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  sido: string;
  sigungu: string;
  address: string | null;
  company_tags: CompanyTag[];
}

interface CompanyTableProps {
  companies: Company[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function CompanyTable({
  companies,
  total,
  page,
  limit,
  onPageChange,
}: CompanyTableProps) {
  const { selectedIds, toggle, selectAll, deselectAll } = useCompanyStore();
  const allIds = companies.map((c) => c.id);
  const allSelected =
    companies.length > 0 && allIds.every((id) => selectedIds.has(id));
  const totalPages = Math.ceil(total / limit);

  function handleMasterToggle() {
    if (allSelected) deselectAll();
    else selectAll(allIds);
  }

  if (companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Building2 size={40} className="mb-3 opacity-30" />
        <p>검색 결과가 없습니다</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm text-gray-400">
        <span>
          총 <strong className="text-[var(--primary)]">{total.toLocaleString()}</strong>개 |
          선택 <strong className="text-[var(--secondary)]">{selectedIds.size}</strong>개
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => selectAll(allIds)}
            className="rounded border border-[var(--border)] px-3 py-1 text-xs hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            이 페이지 선택
          </button>
          <button
            onClick={deselectAll}
            className="rounded border border-[var(--border)] px-3 py-1 text-xs hover:border-red-500 hover:text-red-400"
          >
            선택 해제
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
              <th className="w-10 p-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleMasterToggle}
                  className="accent-[var(--primary)]"
                />
              </th>
              <th className="p-3 text-left text-xs font-semibold text-[var(--primary)]">
                기업명
              </th>
              <th className="p-3 text-left text-xs font-semibold text-[var(--primary)]">
                담당자
              </th>
              <th className="p-3 text-left text-xs font-semibold text-[var(--primary)]">
                연락처
              </th>
              <th className="p-3 text-left text-xs font-semibold text-[var(--primary)]">
                지역
              </th>
              <th className="p-3 text-left text-xs font-semibold text-[var(--primary)]">
                홈페이지 / 이메일
              </th>
              <th className="p-3 text-left text-xs font-semibold text-[var(--primary)]">
                태그
              </th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr
                key={c.id}
                className="border-b border-[var(--border)]/50 transition hover:bg-[var(--primary)]/5"
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(c.id)}
                    onChange={() => toggle(c.id)}
                    className="accent-[var(--primary)]"
                  />
                </td>
                <td className="p-3">
                  <Link
                    href={`/admin/companies/${c.id}`}
                    className="text-sm font-semibold text-white hover:text-[var(--primary)]"
                  >
                    {c.name}
                  </Link>
                </td>
                <td className="p-3 text-sm text-gray-400">
                  {c.contact_person || "-"}
                </td>
                <td className="p-3 text-sm text-gray-400">
                  {c.phone || "-"}
                </td>
                <td className="p-3">
                  <span className="inline-block rounded bg-[var(--primary)]/10 px-2 py-0.5 text-xs text-[var(--primary)]">
                    {c.sido}
                  </span>
                  <span className="ml-1 text-xs text-gray-500">
                    {c.sigungu}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex flex-col gap-1">
                    {c.website ? (
                      c.website.split(/[\n,;]+/).filter(Boolean).slice(0, 2).map((w, i) => (
                        <a
                          key={i}
                          href={w.trim().startsWith("http") ? w.trim() : `https://${w.trim()}`}
                          target="_blank"
                          className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline"
                          title={w.trim()}
                        >
                          <Globe size={12} />
                          <span className="max-w-[140px] truncate">
                            {w.trim().replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                          </span>
                          <ExternalLink size={10} className="shrink-0 opacity-50" />
                        </a>
                      ))
                    ) : (
                      <button
                        onClick={() =>
                          window.open(
                            `https://www.google.com/search?q=${encodeURIComponent(c.name + " 홈페이지")}`,
                            "_blank"
                          )
                        }
                        className="flex items-center gap-1 text-xs text-gray-600 hover:text-[var(--primary)]"
                      >
                        <Globe size={12} />
                        <span>검색</span>
                      </button>
                    )}
                    {c.email ? (
                      c.email.split(/[\n,;]+/).filter(Boolean).slice(0, 2).map((e, i) => (
                        <a
                          key={i}
                          href={`mailto:${e.trim()}`}
                          className="flex items-center gap-1 text-xs text-[var(--secondary)] hover:underline"
                        >
                          <Mail size={12} />
                          <span className="max-w-[140px] truncate">{e.trim()}</span>
                        </a>
                      ))
                    ) : (
                      <button
                        onClick={() =>
                          window.open(
                            `https://www.google.com/search?q=${encodeURIComponent(c.name + " 이메일")}`,
                            "_blank"
                          )
                        }
                        className="flex items-center gap-1 text-xs text-gray-600 hover:text-[var(--secondary)]"
                      >
                        <Mail size={12} />
                        <span>검색</span>
                      </button>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {c.company_tags?.map((ct) =>
                      ct.tags ? (
                        <span
                          key={ct.tag_id}
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{
                            backgroundColor: ct.tags.color + "20",
                            color: ct.tags.color,
                          }}
                        >
                          {ct.tags.name}
                        </span>
                      ) : null
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="rounded border border-[var(--border)] px-3 py-1 text-sm text-gray-400 disabled:opacity-30"
          >
            이전
          </button>
          <span className="text-sm text-gray-500">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="rounded border border-[var(--border)] px-3 py-1 text-sm text-gray-400 disabled:opacity-30"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
