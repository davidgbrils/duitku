"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/#fitur", label: "Fitur" },
  { href: "/#cara-kerja", label: "Cara Kerja" },
  { href: "/#harga", label: "Harga" },
  { href: "/#faq", label: "FAQ" },
] as const;

export function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
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
    <header className="sticky top-0 z-50 w-full border-b border-white/60 bg-white/65 backdrop-blur-xl shadow-xs dark:border-slate-800/80 dark:bg-slate-900/65">
      <div
        ref={rootRef}
        className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6"
      >
        <Link
          href="/"
          className="focus-visible:ring-ring flex items-center gap-2.5 rounded-lg focus-visible:ring-2 focus-visible:outline-none"
        >
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md shadow-indigo-500/20 text-white font-extrabold text-lg">
            D
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            Duitku
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1.5 rounded-full border border-slate-200/60 bg-white/40 p-1 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/40 md:flex"
          aria-label="Navigasi halaman"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-1.5 text-sm font-medium text-slate-600 transition-all hover:bg-white/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 md:flex">
          <Link
            href="/login"
            className="rounded-full border border-slate-200/80 bg-white/50 px-4 py-1.5 text-sm font-medium text-slate-700 backdrop-blur-sm transition-all hover:bg-white hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:from-blue-700 hover:to-indigo-700"
          >
            Mulai Gratis
          </Link>
        </div>

        {/* Hamburger — mobile saja */}
        <div className="relative md:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/60 backdrop-blur-md"
            aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
            aria-expanded={open}
            aria-controls="landing-nav-menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
          {open && (
            <div
              id="landing-nav-menu"
              className="absolute top-full right-0 z-50 mt-2 w-64 origin-top-right rounded-3xl border border-white/60 bg-white/80 p-4 shadow-2xl backdrop-blur-2xl ring-1 ring-slate-900/5 animate-in fade-in-0 zoom-in-95 duration-150 dark:border-slate-800 dark:bg-slate-900/90"
            >
              <div className="grid gap-2 pb-3">
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="w-full rounded-full bg-indigo-600 py-2.5 text-center text-sm font-semibold text-white shadow-sm"
                >
                  Mulai Gratis
                </Link>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="w-full rounded-full border border-slate-200 bg-white/80 py-2 text-center text-sm font-medium text-slate-700"
                >
                  Login
                </Link>
              </div>

              <div className="border-t border-slate-200/60 my-2" />

              <nav aria-label="Navigasi halaman">
                <ul className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
