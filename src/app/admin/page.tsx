"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Tags, Send, MessageSquare } from "lucide-react";

interface Stats {
  companies: number;
  tags: number;
  sent: number;
  unreadInquiries: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    companies: 0,
    tags: 0,
    sent: 0,
    unreadInquiries: 0,
  });

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const cards = [
    {
      icon: Building2,
      label: "등록 기업",
      value: stats.companies.toLocaleString(),
      color: "var(--primary)",
      href: "/admin/companies",
    },
    {
      icon: Tags,
      label: "태그",
      value: stats.tags.toLocaleString(),
      color: "var(--secondary)",
      href: "/admin/tags",
    },
    {
      icon: Send,
      label: "발송 건수",
      value: stats.sent.toLocaleString(),
      color: "var(--accent)",
      href: "/admin/history",
    },
    {
      icon: MessageSquare,
      label: "미확인 문의",
      value: stats.unreadInquiries.toLocaleString(),
      color: "#ff4444",
      href: "/admin/inquiries",
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-[var(--foreground)]">대시보드</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:border-opacity-50"
          >
            <div className="mb-3 flex items-center gap-3">
              <c.icon size={20} style={{ color: c.color }} />
              <span className="text-sm text-gray-400">{c.label}</span>
            </div>
            <div className="text-3xl font-black" style={{ color: c.color }}>
              {c.value}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="mb-4 text-lg font-bold text-[var(--foreground)]">빠른 시작</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/admin/companies"
            className="rounded-lg border border-[var(--border)] p-4 transition hover:border-[var(--primary)]/30"
          >
            <p className="font-semibold text-[var(--foreground)]">기업 관리</p>
            <p className="text-sm text-gray-500">
              2,277개 스마트공장 공급기업 필터·검색·태그
            </p>
          </Link>
          <Link
            href="/admin/templates"
            className="rounded-lg border border-[var(--border)] p-4 transition hover:border-[var(--primary)]/30"
          >
            <p className="font-semibold text-[var(--foreground)]">메시지 템플릿</p>
            <p className="text-sm text-gray-500">
              업종별·규모별 알림톡 템플릿 작성
            </p>
          </Link>
          <Link
            href="/admin/send"
            className="rounded-lg border border-[var(--border)] p-4 transition hover:border-[var(--primary)]/30"
          >
            <p className="font-semibold text-[var(--foreground)]">설문 발송</p>
            <p className="text-sm text-gray-500">
              기업 선택 → 템플릿 매칭 → 카카오 알림톡 발송
            </p>
          </Link>
          <Link
            href="/admin/inquiries"
            className="rounded-lg border border-[var(--border)] p-4 transition hover:border-[var(--primary)]/30"
          >
            <p className="font-semibold text-[var(--foreground)]">문의 확인</p>
            <p className="text-sm text-gray-500">
              PoC 신청 및 일반 문의 접수 확인
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
