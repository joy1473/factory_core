"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Building2,
  Tags,
  FileText,
  Send,
  History,
  MessageSquare,
  LogOut,
  Settings,
  ClipboardList,
  Activity,
  Radio,
  Bot,
  Ear,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { href: "/admin", icon: LayoutDashboard, label: "대시보드" },
  { href: "/admin/companies", icon: Building2, label: "기업 관리" },
  { href: "/admin/tags", icon: Tags, label: "태그" },
  { href: "/admin/templates", icon: FileText, label: "템플릿" },
  { href: "/admin/send", icon: Send, label: "발송" },
  { href: "/admin/history", icon: History, label: "발송 이력" },
  { href: "/admin/inquiries", icon: MessageSquare, label: "문의" },
  { href: "/admin/surveys", icon: ClipboardList, label: "설문 응답" },
  { href: "/admin/monitoring", icon: Activity, label: "Factory Guardian" },
  { href: "/admin/content", icon: Settings, label: "콘텐츠 관리" },
];

export function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin-login");
    router.refresh();
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-[var(--border)] px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-[var(--corebot-core)] to-[var(--primary)] text-[10px] font-black text-[var(--background)]">
          FC
        </div>
        <span className="text-sm font-bold text-[var(--corebot-core)]">Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                active
                  ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "text-gray-400 hover:bg-[var(--foreground)]/5 hover:text-gray-200"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-[var(--border)] p-3">
        <p className="mb-2 truncate px-3 text-xs text-gray-500">
          {userEmail}
        </p>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 transition hover:bg-[var(--foreground)]/5 hover:text-red-400"
        >
          <LogOut size={18} />
          로그아웃
        </button>
      </div>
    </aside>
  );
}
