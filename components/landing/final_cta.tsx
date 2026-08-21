import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Reveal } from "@/components/animations/reveal";

export function FinalCta() {
  return (
    <section aria-labelledby="final-cta-heading" className="relative py-16 sm:py-24 overflow-hidden">
      {/* Background glow orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-indigo-500/20 via-blue-500/10 to-teal-400/10 blur-3xl"
      />

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-white/90 via-white/70 to-indigo-50/50 p-8 sm:p-14 text-center shadow-[0_20px_60px_rgba(79,70,229,0.12)] backdrop-blur-2xl dark:border-slate-800/80 dark:bg-slate-900/80">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/25">
              <Sparkles className="size-6" />
            </div>
            <h2
              id="final-cta-heading"
              className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white"
            >
              Mulai Rapikan Keuanganmu Hari Ini.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-slate-600 sm:text-base dark:text-slate-300">
              Buat akun gratis dalam hitungan detik, catat transaksi pertamamu, dan dapatkan kejelasan finansial seutuhnya.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-blue-700 hover:to-indigo-700 active:scale-95"
              >
                <span>Daftar Gratis Sekarang</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-xs backdrop-blur-md transition-all hover:bg-white hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Masuk ke Akun
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
