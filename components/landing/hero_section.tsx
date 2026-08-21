"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { animate, motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUpRight, CheckCircle2, Sparkles, TrendingUp, Wallet } from "lucide-react";

import { fadeInUp, staggerContainer } from "@/lib/animations/motion";
import { formatRupiah } from "@/lib/utils/money";

const CHART_BARS = [
  { label: "Mar", income: 55, expense: 38 },
  { label: "Apr", income: 62, expense: 45 },
  { label: "Mei", income: 48, expense: 40 },
  { label: "Jun", income: 70, expense: 52 },
  { label: "Jul", income: 64, expense: 44 },
  { label: "Agu", income: 78, expense: 58 },
] as const;

/** Count-up halus 0 → target saat mount (dihormati prefers-reduced-motion). */
function useCountUp(target: number, duration = 0.9): number {
  const prefersReducedMotion = useReducedMotion();
  const [value, setValue] = useState(0);

  // prefers-reduced-motion: tampilkan nilai akhir langsung (render-phase update).
  if (prefersReducedMotion && value !== target) {
    setValue(target);
  }

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }
    const controls = animate(0, target, {
      duration,
      ease: "easeOut",
      onUpdate: setValue,
    });
    return () => controls.stop();
  }, [target, duration, prefersReducedMotion]);

  return value;
}

export function HeroSection() {
  const balance = useCountUp(4250000);
  const income = useCountUp(6500000, 1.1);
  const expense = useCountUp(2250000, 1.1);

  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      {/* Glowing Glassmorphism Background Orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 -z-10 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-indigo-500/25 via-blue-400/15 to-transparent blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -right-40 -z-10 h-[450px] w-[450px] rounded-full bg-gradient-to-bl from-teal-400/20 via-indigo-500/15 to-transparent blur-3xl"
      />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12">
        {/* Left Column: Heading & CTA */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-start gap-6"
        >
          {/* Glass Badge */}
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-white/70 px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-xs backdrop-blur-md dark:border-indigo-800/60 dark:bg-slate-900/70 dark:text-indigo-300"
          >
            <Sparkles className="size-3.5 text-indigo-500" />
            <span>Smart Personal Finance Tracking</span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-4xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-5xl dark:text-white"
          >
            Kelola Keuanganmu,{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-500 bg-clip-text text-transparent">
              Lebih Sederhana.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="max-w-lg text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg"
          >
            Catat pemasukan dan pengeluaran, pantau hutang/piutang, serta kendalikan anggaran bulanan dalam satu dashboard visual yang terpadu.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-3.5 pt-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-indigo-500/40 active:scale-95"
            >
              <span>Mulai Gratis Sekarang</span>
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/#cara-kerja"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-5 py-3.5 text-sm font-semibold text-slate-700 shadow-xs backdrop-blur-md transition-all hover:bg-white hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Lihat Cara Kerja
            </Link>
          </motion.div>

          {/* Value note */}
          <motion.div variants={fadeInUp} className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              <span>Gratis</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              <span>Tanpa Kartu Kredit</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              <span>Database Terenkripsi</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column: Glassmorphic Interactive Mockup */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative"
        >
          <motion.div
            variants={fadeInUp}
            className="group relative overflow-hidden rounded-3xl border border-white/70 bg-white/75 p-6 sm:p-7 shadow-[0_20px_50px_rgba(79,70,229,0.12)] backdrop-blur-2xl transition-all duration-300 hover:shadow-[0_25px_60px_rgba(79,70,229,0.18)] dark:border-slate-800/90 dark:bg-slate-900/80"
          >
            {/* Mockup Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Wallet className="size-4.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Total Saldo
                  </p>
                  <p className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums">
                    {formatRupiah(balance)}
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <TrendingUp className="size-3" />
                <span>+14.2%</span>
              </div>
            </div>

            {/* Income & Expense Glass Badges */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-3.5 backdrop-blur-sm dark:border-emerald-900/60 dark:bg-emerald-950/30">
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Pemasukan</p>
                <p className="text-base font-bold text-emerald-800 dark:text-emerald-200 tabular-nums">
                  {formatRupiah(income)}
                </p>
              </div>
              <div className="rounded-2xl border border-rose-200/60 bg-rose-50/50 p-3.5 backdrop-blur-sm dark:border-rose-900/60 dark:bg-rose-950/30">
                <p className="text-xs font-medium text-rose-700 dark:text-rose-300">Pengeluaran</p>
                <p className="text-base font-bold text-rose-800 dark:text-rose-200 tabular-nums">
                  {formatRupiah(expense)}
                </p>
              </div>
            </div>

            {/* Mini Bar Wave Chart */}
            <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/50" aria-hidden>
              <div className="flex h-18 items-end gap-3 px-1">
                {CHART_BARS.map((bar) => (
                  <div
                    key={bar.label}
                    className="flex flex-1 flex-col items-center justify-end gap-1.5 h-full"
                  >
                    <div className="flex w-full flex-1 items-end justify-center gap-1">
                      <div
                        className="w-2 rounded-t-full bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all duration-500"
                        style={{ height: `${bar.income}%` }}
                      />
                      <div
                        className="w-2 rounded-t-full bg-gradient-to-t from-rose-500 to-rose-400 transition-all duration-500"
                        style={{ height: `${bar.expense}%` }}
                      />
                    </div>
                    <span className="text-slate-400 text-[10px] font-semibold">
                      {bar.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini Transaction Items */}
            <div className="mt-4 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800" aria-hidden>
              <MiniTransaction label="Gaji bulanan" category="Pemasukan" amount="+Rp6.000.000" tone="income" />
              <MiniTransaction label="Belanja mingguan" category="Pengeluaran" amount="-Rp45.000" tone="expense" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function MiniTransaction({
  label,
  category,
  amount,
  tone,
}: {
  label: string;
  category: string;
  amount: string;
  tone: "income" | "expense";
}) {
  const isIncome = tone === "income";
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white/70 px-3.5 py-2 text-xs shadow-2xs backdrop-blur-sm dark:border-slate-800 dark:bg-slate-800/70">
      <div className="flex items-center gap-2">
        <div
          className={`flex size-6 items-center justify-center rounded-lg ${
            isIncome
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
          }`}
        >
          <ArrowUpRight className={`size-3 ${!isIncome && "rotate-90"}`} />
        </div>
        <div>
          <p className="font-semibold text-slate-800 dark:text-white truncate">{label}</p>
          <p className="text-[10px] text-slate-400">{category}</p>
        </div>
      </div>
      <span
        className={`font-bold tabular-nums ${
          isIncome
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-rose-600 dark:text-rose-400"
        }`}
      >
        {amount}
      </span>
    </div>
  );
}
