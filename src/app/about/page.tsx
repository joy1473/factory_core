"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { Building2, MapPin, Mail, Phone, FileText } from "lucide-react";

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

export default function AboutPage() {
  const [info, setInfo] = useState<CompanyInfo | null>(null);

  useEffect(() => {
    fetch("/api/content/company-info")
      .then((r) => r.json())
      .then((d) => d.company_name && setInfo(d))
      .catch(() => {});
  }, []);

  const co = info || {
    company_name: "조이텍",
    company_name_en: "JOYTEC",
    ceo_name: "조은아",
    business_number: "110-11-23776",
    address: "서울특별시 강서구 양천로49길 39-59, 203호",
    email: "joytec@naver.com",
    phone: "010-2648-6726",
    description: "스마트팩토리 Agentic AI 솔루션",
  };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-5 py-20">
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">
          About Us
        </p>
        <h1 className="mb-10 text-center text-3xl font-bold text-[var(--foreground)]">
          회사 소개
        </h1>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]">
              <Building2 className="h-6 w-6 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--foreground)]">
                {co.company_name} ({co.company_name_en})
              </h2>
              <p className="text-sm text-gray-400">{co.description}</p>
            </div>
          </div>

          <div className="mb-8 text-sm leading-relaxed text-[var(--muted)]">
            <p className="mb-4">
              {co.company_name}은 2005년 설립 이래 IT 기술 기반의 솔루션을 개발해온
              기업입니다. 현재는 중소 제조기업을 위한 AI 기반 설비관리 솔루션
              &quot;Factory Core&quot;를 개발하고 있습니다.
            </p>
            <p>
              Factory Core는 Gen3 IoT 센서와 웨어러블 디바이스를 활용하여
              제조 현장의 설비 상태를 실시간으로 감시하고, Agentic AI가
              이상 감지부터 보고서 생성까지 자동으로 처리하는 솔루션입니다.
            </p>
          </div>

          <h3 className="mb-4 text-base font-semibold text-[var(--foreground)]">
            사업자 정보
          </h3>
          <div className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-5">
            <InfoRow icon={Building2} label="상호" value={`${co.company_name} (${co.company_name_en})`} />
            <InfoRow icon={FileText} label="대표" value={co.ceo_name} />
            <InfoRow icon={FileText} label="사업자등록번호" value={co.business_number} />
            <InfoRow icon={MapPin} label="주소" value={co.address} />
            <InfoRow icon={Mail} label="이메일" value={co.email} href={`mailto:${co.email}`} />
            <InfoRow icon={Phone} label="전화" value={co.phone} href={`tel:${co.phone}`} />
          </div>

          <div className="mt-6 text-xs text-gray-600">
            <p>설립일: 2005년 4월 27일</p>
            <p>
              홈페이지:{" "}
              <a href="https://joy.it.kr" className="text-[var(--primary)] hover:underline">
                https://joy.it.kr
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 text-sm">
      <Icon size={16} className="shrink-0 text-[var(--primary)]" />
      <span className="text-gray-400">{label}:</span>
      {href ? (
        <a href={href} className="text-[var(--primary)] hover:underline">
          {value}
        </a>
      ) : (
        <span className="text-[var(--foreground)]">{value}</span>
      )}
    </div>
  );
}
