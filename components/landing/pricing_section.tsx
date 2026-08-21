import Link from "next/link";
import { Check, Sparkles } from "lucide-react";

import { Reveal } from "@/components/animations/reveal";

const freeFeatures = [
  "Pencatatan transaksi tanpa batas",
  "Multi-wallet (Cash, Bank, E-Wallet)",
  "Kategori kustom + ikon dinamis",
  "Manajemen Hutang & Piutang + WA reminder",
  "Perencanaan Anggaran (Monthly Budgeting)",
  "Scan struk belanja (OCR)",
  "Voice input pencatatan suara",
  "Ekspor data transaksi CSV",
];

const premiumFeatures = [
  "Semua fitur Paket Free",
  "Analisis tren multi-tahun & perbandingan",
  "AI Smart Insights penghematan belanja",
  "Integrasi bank & settlement QRIS",
];

export function PricingSection() {
  return (
    <section id="harga" aria-labelledby="harga-heading" className="relative scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center">
            <span className="inline-block rounded-full border border-indigo-200/80 bg-white/70 px-3.5 py-1 text-xs font-semibold text-indigo-700 shadow-xs backdrop-blur-md dark:border-indigo-800/80 dark:bg-slate-900/70 dark:text-indigo-300">
              Transparent Pricing
            </span>
            <h2
              id="harga-heading"
              className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white"
            >
              Harga Jujur & Transparan
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600 sm:text-base dark:text-slate-300">
              Mulai gratis dengan fitur komprehensif. Tingkatkan nanti jika membutuhkan insight skala bisnis.
            </p>
          </div>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
          {/* Free Tier */}
          <Reveal>
            <div className="relative flex h-full flex-col justify-between rounded-3xl border border-indigo-200/90 bg-white/80 p-8 shadow-[0_15px_40px_rgba(79,70,229,0.08)] backdrop-blur-2xl transition-all duration-300 hover:shadow-xl dark:border-indigo-800 dark:bg-slate-900/80">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    Starter
                  </span>
                  <span className="text-xs font-semibold text-emerald-600">Populer</span>
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">Rp0</span>
                  <span className="ml-1.5 text-xs text-slate-500">/ selamanya</span>
                </div>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                  Semua yang kamu perlukan untuk mengelola keuangan harianmu.
                </p>
                <div className="my-6 border-t border-slate-100 dark:border-slate-800" />
                <ul className="flex flex-col gap-3 text-xs">
                  {freeFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300 font-medium">
                      <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mt-0.5">
                        <Check className="size-2.5 stroke-[3]" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  href="/register"
                  className="block w-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-center text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:from-blue-700 hover:to-indigo-700 active:scale-95"
                >
                  Mulai Gratis Sekarang
                </Link>
              </div>
            </div>
          </Reveal>

          {/* Pro / Enterprise Tier */}
          <Reveal delay={0.08}>
            <div className="relative flex h-full flex-col justify-between rounded-3xl border border-white/70 bg-white/60 p-8 shadow-sm backdrop-blur-2xl transition-all duration-300 dark:border-slate-800/80 dark:bg-slate-900/60">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    Pro
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                    <Sparkles className="size-2.5" />
                    Roadmap
                  </span>
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">—</span>
                  <span className="ml-1.5 text-xs text-slate-400">segera hadir</span>
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Untuk kebutuhan forecasting keuangan tingkat lanjut dan otomasi.
                </p>
                <div className="my-6 border-t border-slate-100 dark:border-slate-800" />
                <ul className="flex flex-col gap-3 text-xs">
                  {premiumFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-slate-500 dark:text-slate-400">
                      <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 mt-0.5">
                        <Check className="size-2.5 stroke-[3]" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8">
                <button
                  type="button"
                  disabled
                  className="block w-full cursor-not-allowed rounded-full border border-slate-200 bg-slate-100/80 py-3 text-center text-sm font-semibold text-slate-400 dark:border-slate-700 dark:bg-slate-800"
                >
                  Segera Hadir
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
