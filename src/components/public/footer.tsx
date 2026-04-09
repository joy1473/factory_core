"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface CompanyInfo {
  company_name: string;
  company_name_en: string;
  ceo_name: string;
  business_number: string;
  address: string;
  email: string;
  phone: string;
  description: string;
}

export function Footer() {
  const [info, setInfo] = useState<CompanyInfo | null>(null);

  useEffect(() => {
    fetch("/api/content/company-info")
      .then((r) => r.json())
      .then((d) => d.company_name && setInfo(d))
      .catch(() => {});
  }, []);

  // Fallback while loading
  const co = info || {
    company_name: "조이텍",
    company_name_en: "JOYTEC",
    ceo_name: "",
    business_number: "",
    address: "",
    email: "",
    phone: "",
    description: "중소 제조기업을 위한 Agentic AI 설비관리 솔루션",
  };

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-[10px] font-black text-black">
                FC
              </div>
              <span className="text-base font-bold text-[var(--primary)]">
                Factory Core
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-500">
              {co.description}
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="mb-3 font-semibold text-[var(--muted)]">솔루션</p>
              <div className="flex flex-col gap-2 text-gray-500">
                <Link href="/solution" className="hover:text-[var(--primary)]">
                  Factory Guardian Agent
                </Link>
                <Link href="/poc" className="hover:text-[var(--primary)]">
                  PoC 신청
                </Link>
              </div>
            </div>
            <div>
              <p className="mb-3 font-semibold text-[var(--muted)]">지원</p>
              <div className="flex flex-col gap-2 text-gray-500">
                <Link href="/contact" className="hover:text-[var(--primary)]">
                  문의하기
                </Link>
                <Link href="/privacy" className="hover:text-[var(--primary)]">
                  개인정보처리방침
                </Link>
              </div>
            </div>
          </div>

          {/* Company Info from DB */}
          <div className="text-sm text-gray-500">
            <p className="mb-3 font-semibold text-[var(--muted)]">회사 정보</p>
            <p className="font-semibold">
              {co.company_name} ({co.company_name_en})
            </p>
            {co.ceo_name && <p>대표: {co.ceo_name}</p>}
            {co.business_number && <p>사업자등록번호: {co.business_number}</p>}
            {co.address && <p>주소: {co.address}</p>}
            {co.email && <p>이메일: {co.email}</p>}
            {co.phone && <p>전화: {co.phone}</p>}
          </div>
        </div>

        <div className="mt-10 border-t border-[var(--border)] pt-6 text-center text-xs text-gray-600">
          &copy; {new Date().getFullYear()} Factory Core by {co.company_name_en}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
