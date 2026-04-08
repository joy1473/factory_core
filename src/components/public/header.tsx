"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV = [
  { href: "/", label: "홈" },
  { href: "/solution", label: "솔루션" },
  { href: "/about", label: "회사 소개" },
  { href: "/poc", label: "PoC 신청" },
  { href: "/contact", label: "문의" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[#0a0a0a]/90 backdrop-blur-md">
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

        <div className="hidden md:block">
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
        <nav className="flex flex-col gap-4 border-t border-[var(--border)] bg-[#0a0a0a] px-5 py-4 md:hidden">
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
          <Link
            href="/poc"
            className="rounded-lg bg-[var(--primary)] px-5 py-2 text-center text-sm font-semibold text-black"
            onClick={() => setOpen(false)}
          >
            무료 상담
          </Link>
        </nav>
      )}
    </header>
  );
}
