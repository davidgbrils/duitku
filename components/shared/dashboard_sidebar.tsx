"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navItems } from "@/lib/constants/nav";
import { cn } from "@/lib/utils";

/** Sidebar navigasi desktop (fixed kiri, tampil di lg ke atas).
 *  Mobile memakai MobileMenu (hamburger) + MobileNav (bottom) yang sudah ada.
 */
export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="bg-card border-border fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r lg:flex"
      aria-label="Navigasi utama"
    >
      <div className="flex h-full flex-col">
        <div className="border-border flex h-14 items-center border-b px-4">
          <Link
            href="/dashboard"
            className="focus-visible:ring-ring rounded-lg focus-visible:ring-2 focus-visible:outline-none flex items-center"
            aria-label="Duitku — Dashboard"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/brand/logo_light.png"
              alt="Duitku Logo"
              width={130}
              height={36}
              className="h-8 w-auto object-contain"
            />
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4" aria-label="Navigasi utama">
          <ul className="flex flex-col gap-1" role="list">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <item.icon className="size-5 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-border border-t p-4">
          <div className="bg-primary/10 text-primary rounded-xl p-3 text-xs font-medium text-center">
            Duitku — Kelola Keuanganmu
          </div>
        </div>
      </div>
    </aside>
  );
}