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

/**
 * Navbar landing page — sticky, minimal. Hanya untuk visitor:
 * proxy.ts sudah mengarahkan user yang login dari "/" ke /dashboard.
 */
export function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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
    <header className="border-border bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md">
      <div
        ref={rootRef}
        className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4"
      >
        <Link
          href="/"
          className="text-primary text-lg font-semibold tracking-tight"
        >
          DUITKU
        </Link>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Navigasi halaman"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" render={<Link href="/login" />}>
            Login
          </Button>
          <Button render={<Link href="/register" />}>Mulai Gratis</Button>
        </div>

        {/* Hamburger — mobile saja */}
        <div className="relative md:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
            aria-expanded={open}
            aria-controls="landing-nav-menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X /> : <Menu />}
          </Button>
          {open && (
            <div
              id="landing-nav-menu"
              className="bg-card ring-border absolute top-full right-0 z-50 mt-2 w-56 origin-top-right rounded-xl p-2 shadow-lg ring-1 animate-in fade-in-0 zoom-in-95 duration-100"
            >
              <nav aria-label="Navigasi halaman">
                <ul className="flex flex-col gap-0.5">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="text-muted-foreground hover:bg-muted hover:text-foreground block rounded-lg px-2.5 py-2 text-sm font-medium transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="border-border my-2 border-t" />
              <div className="grid gap-1.5 p-1">
                <Button
                  variant="ghost"
                  render={<Link href="/login" onClick={() => setOpen(false)} />}
                  className="w-full justify-start"
                >
                  Login
                </Button>
                <Button
                  render={
                    <Link
                      href="/register"
                      onClick={() => setOpen(false)}
                    />
                  }
                  className="w-full"
                >
                  Mulai Gratis
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
