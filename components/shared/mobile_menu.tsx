"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { navItems } from "@/lib/constants/nav";
import { cn } from "@/lib/utils";

import { SignOutButton } from "./sign_out_button";

/**
 * Hamburger menu di header untuk layar mobile (< md).
 * Dropdown di bawah header berisi navigasi utama + tombol Keluar.
 * Tertutup otomatis saat pindah halaman, klik di luar, atau tekan Escape.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);

  // Tutup saat pindah halaman.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Tutup saat Escape ditekan atau klik di luar menu.
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative md:hidden">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
        aria-expanded={open}
        aria-controls="mobile-nav-menu"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X /> : <Menu />}
      </Button>
      {open && (
        <div
          id="mobile-nav-menu"
          className="bg-card ring-border absolute top-full right-0 z-50 mt-2 w-60 origin-top-right rounded-xl p-2 shadow-lg ring-1 animate-in fade-in-0 zoom-in-95 duration-100"
        >
          <nav aria-label="Navigasi utama">
            <ul className="flex flex-col gap-0.5">
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
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className="size-4 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="border-border my-2 border-t" />
          <SignOutButton className="w-full" />
        </div>
      )}
    </div>
  );
}
