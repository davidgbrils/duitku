"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { navItems } from "@/lib/constants/nav";
import { cn } from "@/lib/utils";

import { MobileMenu } from "./mobile_menu";
import { SignOutButton } from "./sign_out_button";

/** Top navbar desktop (layout utama dashboard).
 *  Logo kiri, menu navigasi horizontal tengah, quick search & tombol Keluar kanan.
 *  Mobile memakai MobileMenu (hamburger) + MobileNav (bottom) yang sudah ada.
 */
export function DashboardTopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [quickSearch, setQuickSearch] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      router.push(`/transactions?q=${encodeURIComponent(quickSearch.trim())}`);
      setQuickSearch("");
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/dashboard"
          className="focus-visible:ring-ring flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:ring-2 focus-visible:outline-none"
          aria-label="Duitku — Dashboard"
        >
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-sm shadow-blue-500/20 text-white font-extrabold text-lg">
            D
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            Duitku
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1.5 md:flex"
          aria-label="Navigasi utama"
        >
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#1E293B] text-white shadow-sm dark:bg-indigo-600"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2.5">
          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="hidden xl:block relative w-44">
            <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-full bg-slate-100 border border-slate-200/80 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </form>

          <SignOutButton className="hidden md:inline-flex" />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}