"use client";

import {
  ArrowDown,
  ArrowUp,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { AnimatedRupiah } from "@/components/animations/animated_rupiah";
import { formatSignedRupiah } from "@/lib/utils/money";
import { cn } from "@/lib/utils";

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
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in duration-300">
      {/* 1. Total Saldo */}
      <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1.5 min-w-0">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Saldo
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
              <AnimatedRupiah value={totalBalance} />
            </p>
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-blue-200/80 bg-blue-50/80 text-blue-600 shadow-sm shadow-blue-500/10 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-400">
            <Wallet className="size-5" />
          </div>
        </div>
      </div>

      {/* 2. Pemasukan Bulan Ini */}
      <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1.5 min-w-0">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Pemasukan Bulan Ini
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 truncate">
              <AnimatedRupiah value={monthIncome} />
            </p>
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-emerald-200/80 bg-emerald-50/80 text-emerald-600 shadow-sm shadow-emerald-500/10 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
            <ArrowUp className="size-5" />
          </div>
        </div>
      </div>

      {/* 3. Pengeluaran Bulan Ini */}
      <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1.5 min-w-0">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Pengeluaran Bulan Ini
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
              <AnimatedRupiah value={monthExpense} />
            </p>
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-rose-200/80 bg-rose-50/80 text-rose-500 shadow-sm shadow-rose-500/10 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-400">
            <ArrowUp className="size-5" />
          </div>
        </div>
      </div>

      {/* 4. Arus Kas Bersih */}
      <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1.5 min-w-0">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Arus Kas Bersih
            </p>
            <p
              className={cn(
                "text-2xl sm:text-3xl font-extrabold tracking-tight truncate",
                netCashFlow >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              )}
            >
              {formatSignedRupiah(netCashFlow, netCashFlow >= 0)}
            </p>
          </div>
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-full border shadow-sm",
              netCashFlow >= 0
                ? "border-emerald-200/80 bg-emerald-50/80 text-emerald-600 shadow-emerald-500/10 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
                : "border-rose-200/80 bg-rose-50/80 text-rose-500 shadow-rose-500/10 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-400"
            )}
          >
            {netCashFlow >= 0 ? (
              <TrendingUp className="size-5" />
            ) : (
              <ArrowDown className="size-5" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
