"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

const NAV = [
  { href: "/solution", label: "3D 데모" },
  { href: "/why", label: "왜 우리인가" },
  { href: "/cases", label: "도입 효과" },
  { href: "/pricing", label: "가격" },
  { href: "/bids", label: "지원사업" },
  { href: "/about", label: "회사 소개" },
  { href: "/contact", label: "문의" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-xs font-black text-black">
            FC
          </div>
          <span className="text-lg font-bold text-[var(--primary)]">
            Factory Core
          </span>
        </Link>

        <nav className="hidden gap-8 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm text-gray-400 transition hover:text-[var(--primary)]"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={toggle}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-gray-400 transition hover:text-[var(--foreground)]"
            aria-label="테마 전환"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link
            href="/poc"
            className="rounded-lg bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-black transition hover:brightness-110"
          >
            무료 상담
          </Link>
        </div>

        <button
          className="text-gray-400 md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-4 border-t border-[var(--border)] bg-[var(--background)] px-5 py-4 md:hidden">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm text-gray-400"
              onClick={() => setOpen(false)}
            >
              {n.label}
            </Link>
          ))}
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="flex h-9 items-center gap-2 rounded-lg border border-[var(--border)] px-3 text-sm text-gray-400"
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
              {theme === "dark" ? "라이트 모드" : "다크 모드"}
            </button>
            <Link
              href="/poc"
              className="flex-1 rounded-lg bg-[var(--primary)] px-5 py-2 text-center text-sm font-semibold text-black"
              onClick={() => setOpen(false)}
            >
              무료 상담
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
