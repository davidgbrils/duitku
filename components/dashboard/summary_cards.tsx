"use client";

import { motion } from "motion/react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  TrendingUp,
} from "lucide-react";

import { AnimatedRupiah } from "@/components/animations/animated_rupiah";
import { Card, CardContent } from "@/components/ui/card";
import { fadeInUp, staggerContainer } from "@/lib/animations/motion";
import { formatSignedRupiah } from "@/lib/utils/money";
import { cn } from "@/lib/utils";

/**
 * Kartu ringkasan dashboard (TASK-0801) dengan entrance stagger dan
 * count-up Rupiah (TASK-1005). Animasi otomatis diredam bagi user
 * prefers-reduced-motion (MotionConfig + useReducedMotion).
 */
export function SummaryCards({
  totalBalance,
  monthIncome,
  monthExpense,
}: {
  totalBalance: number;
  monthIncome: number;
  monthExpense: number;
}) {
  const netCashFlow = monthIncome - monthExpense;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <SummaryCard
        label="Total Saldo"
        icon={<PiggyBank className="size-5" />}
        iconClassName="bg-primary/10 text-primary"
      >
        <AnimatedRupiah value={totalBalance} />
      </SummaryCard>

      <SummaryCard
        label="Pemasukan Bulan Ini"
        icon={<ArrowDownLeft className="size-5" />}
        iconClassName="bg-success/10 text-success"
      >
        <AnimatedRupiah value={monthIncome} />
      </SummaryCard>

      <SummaryCard
        label="Pengeluaran Bulan Ini"
        icon={<ArrowUpRight className="size-5" />}
        iconClassName="bg-destructive/10 text-destructive"
      >
        <AnimatedRupiah value={monthExpense} />
      </SummaryCard>

      <SummaryCard
        label="Arus Kas Bersih"
        icon={<TrendingUp className="size-5" />}
        iconClassName={cn(
          netCashFlow >= 0
            ? "bg-success/10 text-success"
            : "bg-destructive/10 text-destructive"
        )}
        valueClassName={cn(
          netCashFlow >= 0 ? "text-success" : "text-destructive"
        )}
      >
        {formatSignedRupiah(netCashFlow, netCashFlow >= 0)}
      </SummaryCard>
    </motion.div>
  );
}

function SummaryCard({
  label,
  icon,
  iconClassName,
  valueClassName,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  iconClassName: string;
  valueClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div variants={fadeInUp}>
      <Card>
        <CardContent className="flex items-center gap-4 px-5 py-4">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              iconClassName
            )}
          >
            {icon}
          </span>
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs font-medium">{label}</p>
            <p
              className={cn(
                "truncate text-lg font-semibold tracking-tight",
                valueClassName
              )}
            >
              {children}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
