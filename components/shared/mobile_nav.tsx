"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navItems } from "@/lib/constants/nav";

/**
 * Bottom navigation untuk mobile (< md). Meniru pola aplikasi finansial:
 * tab bar tetap di bawah layar, ikon + label, safe-area inset untuk iPhone.
 * Di layar md+ navigasi atas (desktop) yang dipakai.
 */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi utama"
      className="bg-card border-border fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto flex h-16 w-full max-w-5xl items-stretch justify-around">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href} className="min-w-0 flex-1">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "text-primary flex h-full flex-col items-center justify-center gap-1 text-[11px] leading-none font-semibold"
                    : "text-muted-foreground hover:text-foreground flex h-full flex-col items-center justify-center gap-1 text-[11px] leading-none font-medium transition-colors"
                }
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
