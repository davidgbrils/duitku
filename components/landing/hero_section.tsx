"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { animate, motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
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
    <section className="relative overflow-hidden">
      {/* Blob lembut di belakang mockup — dekoratif, subtle. */}
      <div
        aria-hidden
        className="from-primary/10 to-transparent absolute -top-24 right-0 -z-10 h-96 w-96 rounded-full bg-gradient-to-br blur-3xl"
      />
      <div className="mx-auto grid w-full max-w-5xl items-center gap-10 px-4 py-16 sm:py-20 lg:grid-cols-2 lg:gap-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-start gap-5"
        >
          <motion.h1
            variants={fadeInUp}
            className="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl"
          >
            Kelola Keuanganmu,{" "}
            <span className="text-primary">Lebih Sederhana.</span>
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-muted-foreground max-w-md text-base leading-relaxed"
          >
            Catat pemasukan dan pengeluaran, dan pahami ke mana uangmu pergi —
            dalam satu aplikasi. Tanpa ribet, tanpa spreadsheet.
          </motion.p>
          <motion.div variants={fadeInUp} className="flex flex-wrap gap-3">
            <Button size="lg" render={<Link href="/register" />}>
              Mulai Gratis
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<Link href="/#cara-kerja" />}
            >
              Lihat Cara Kerja
            </Button>
          </motion.div>
          <motion.p
            variants={fadeInUp}
            className="text-muted-foreground text-xs"
          >
            Gratis untuk mulai — tidak perlu kartu kredit.
          </motion.p>
        </motion.div>

        {/* Mockup dashboard — dibangun dari gaya komponen asli Duitku. */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative"
        >
          <motion.div
            variants={fadeInUp}
            className="bg-card ring-border shadow-sm rounded-2xl p-5 ring-1"
          >
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-xs font-medium">
                Total Saldo
              </p>
              <span className="bg-muted size-2 rounded-full" aria-hidden />
            </div>
            <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
              {formatRupiah(balance)}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="bg-success/10 text-success rounded-lg px-3 py-2">
                <p className="text-xs">Pemasukan</p>
                <p className="text-sm font-semibold tabular-nums">
                  {formatRupiah(income)}
                </p>
              </div>
              <div className="bg-destructive/10 text-destructive rounded-lg px-3 py-2">
                <p className="text-xs">Pengeluaran</p>
                <p className="text-sm font-semibold tabular-nums">
                  {formatRupiah(expense)}
                </p>
              </div>
            </div>

            {/* Mini bar chart murni CSS. */}
            <div className="mt-4" aria-hidden>
              <div className="flex h-20 items-end gap-2">
                {CHART_BARS.map((bar) => (
                  <div
                    key={bar.label}
                    className="flex flex-1 flex-col items-center justify-end gap-1"
                  >
                    <div className="flex w-full flex-1 items-end justify-center gap-0.5">
                      <div
                        className="bg-success/70 w-1.5 rounded-t-sm"
                        style={{ height: `${bar.income}%` }}
                      />
                      <div
                        className="bg-destructive/70 w-1.5 rounded-t-sm"
                        style={{ height: `${bar.expense}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-1 flex justify-between">
                {CHART_BARS.map((bar) => (
                  <span
                    key={bar.label}
                    className="text-muted-foreground text-[10px]"
                  >
                    {bar.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-2 border-t pt-4" aria-hidden>
              <MiniTransaction label="Belanja mingguan" amount="-Rp45.000" tone="expense" />
              <MiniTransaction label="Gaji bulanan" amount="+Rp6.000.000" tone="income" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function MiniTransaction({
  label,
  amount,
  tone,
}: {
  label: string;
  amount: string;
  tone: "income" | "expense";
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <p className="text-muted-foreground truncate">{label}</p>
      <p
        className={
          tone === "income" ? "text-success shrink-0" : "text-destructive shrink-0"
        }
      >
        {amount}
      </p>
    </div>
  );
}
