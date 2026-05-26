"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Coffee,
  ClipboardList,
  CalendarDays,
  QrCode,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutUser } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "ダッシュボード", icon: LayoutDashboard, exact: true },
  { href: "/admin/members", label: "会員管理", icon: Users },
  { href: "/admin/menus", label: "メニュー管理", icon: Coffee },
  { href: "/admin/orders", label: "注文管理", icon: ClipboardList },
  { href: "/admin/events", label: "イベント管理", icon: CalendarDays },
  { href: "/admin/qr-codes", label: "QR管理", icon: QrCode },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logoutUser();
    router.push("/login");
  }

  return (
    <aside className="w-60 min-h-screen bg-bar-dark border-r border-bar-border flex flex-col">
      <div className="px-6 py-6 border-b border-bar-border">
        <div className="text-gold-500 font-serif text-xl tracking-widest">SASABar</div>
        <div className="text-xs text-bar-muted mt-1 tracking-wider">Admin Console</div>
      </div>
      <nav className="flex-1 py-4 px-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-colors",
                isActive
                  ? "bg-gold-500/10 text-gold-400 border border-gold-500/20"
                  : "text-gray-500 hover:text-gray-300 hover:bg-bar-black"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pb-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sm text-gray-500 hover:text-red-400 hover:bg-red-900/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          ログアウト
        </button>
      </div>
    </aside>
  );
}
