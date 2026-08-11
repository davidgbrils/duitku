import Link from "next/link";

import { MotionProvider } from "@/components/animations/motion_provider";
import { MobileMenu } from "@/components/shared/mobile_menu";
import { MobileNav } from "@/components/shared/mobile_nav";
import { SignOutButton } from "@/components/shared/sign_out_button";
import { navItems } from "@/lib/constants/nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MotionProvider>
      <div className="bg-background flex min-h-svh flex-col">
        <header className="border-border bg-card border-b">
          <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
            <Link
              href="/dashboard"
              className="text-primary text-lg font-semibold tracking-tight"
            >
              DUITKU
            </Link>
            <nav
              className="hidden items-center gap-1 md:flex"
              aria-label="Navigasi utama"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-1">
              <SignOutButton className="hidden md:inline-flex" />
              <MobileMenu />
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>
      <MobileNav />
    </MotionProvider>
  );
}
