"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import Image from "next/image";

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
          className="focus-visible:ring-ring rounded-lg focus-visible:ring-2 focus-visible:outline-none"
        >
          <Image
            src="/images/brand/logo_light.png"
            alt="Duitku Logo"
            width={140}
            height={40}
            className="h-8 w-auto object-contain"
            priority
          />
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
              className="bg-card ring-border absolute top-full right-0 z-50 mt-2 w-60 origin-top-right rounded-2xl p-2.5 shadow-xl ring-1 animate-in fade-in-0 zoom-in-95 duration-100"
            >
              {/* Tombol Login & Register di bagian paling atas mobile menu */}
              <div className="grid gap-2 p-1 pb-2">
                <Button
                  render={
                    <Link
                      href="/register"
                      onClick={() => setOpen(false)}
                    />
                  }
                  className="w-full font-semibold shadow-sm"
                >
                  Mulai Gratis
                </Button>
                <Button
                  variant="outline"
                  render={<Link href="/login" onClick={() => setOpen(false)} />}
                  className="w-full justify-center"
                >
                  Login
                </Button>
              </div>

              <div className="border-border my-1 border-t" />

              <nav aria-label="Navigasi halaman">
                <ul className="flex flex-col gap-0.5 pt-1">
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
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
