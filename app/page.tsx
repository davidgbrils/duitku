import type { Metadata } from "next";

import { DashboardPreview } from "@/components/landing/dashboard_preview";
import { FaqSection } from "@/components/landing/faq_section";
import { FeaturesSection } from "@/components/landing/features_section";
import { FinalCta } from "@/components/landing/final_cta";
import { HeroSection } from "@/components/landing/hero_section";
import { HowItWorks } from "@/components/landing/how_it_works";
import { LandingFooter } from "@/components/landing/landing_footer";
import { LandingNavbar } from "@/components/landing/landing_navbar";
import { PricingSection } from "@/components/landing/pricing_section";
import { ReceiptScannerSection } from "@/components/landing/receipt_scanner_section";
import { ValueProposition } from "@/components/landing/value_proposition";

export const metadata: Metadata = {
  title: "Duitku — Kelola Keuanganmu Lebih Sederhana",
  description:
    "Catat pemasukan dan pengeluaran, pahami pola keuangan, dan kelola keuangan pribadi dalam satu aplikasi. Gratis untuk mulai.",
  openGraph: {
    title: "Duitku — Kelola Keuanganmu Lebih Sederhana",
    description:
      "Catat pemasukan dan pengeluaran, pahami pola keuangan, dan kelola keuangan pribadi dalam satu aplikasi.",
    type: "website",
    siteName: "Duitku",
  },
};

/**
 * Landing page Duitku (public entry point).
 *
 * Auth routing ditangani proxy.ts: visitor melihat landing page ini,
 * user yang sudah login otomatis diarahkan ke /dashboard.
 */
export default function LandingPage() {
  return (
    <div className="relative flex min-h-svh flex-col bg-gradient-to-b from-slate-50 via-slate-50/90 to-slate-100/80 text-slate-900 selection:bg-indigo-500 selection:text-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <ValueProposition />
        <FeaturesSection />
        <HowItWorks />
        <ReceiptScannerSection />
        <DashboardPreview />
        <PricingSection />
        <FaqSection />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
