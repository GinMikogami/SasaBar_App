"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Coffee, QrCode, CalendarDays, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "ホーム", icon: Home },
  { href: "/menu", label: "メニュー", icon: Coffee },
  { href: "/qr-scan", label: "QRスキャン", icon: QrCode },
  { href: "/events", label: "イベント", icon: CalendarDays },
  { href: "/mypage", label: "マイページ", icon: User },
];

export function MemberNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bar-dark border-t border-bar-border">
      <div className="max-w-screen-sm mx-auto flex items-center justify-around">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center py-3 px-4 min-w-0 flex-1 transition-colors",
                isActive ? "text-gold-400" : "text-gray-600 hover:text-gray-400"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 mb-1",
                  isActive && "drop-shadow-[0_0_8px_rgba(201,168,76,0.6)]"
                )}
              />
              <span className="text-[10px] tracking-wider">{label}</span>
              {isActive && (
                <div className="absolute bottom-0 h-0.5 w-8 gold-gradient rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
