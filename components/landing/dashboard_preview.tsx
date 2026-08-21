"use client";

import {
  CategoryBreakdown,
  type CategoryBreakdownItem,
} from "@/components/dashboard/category_breakdown";
import {
  MonthlyTrendChart,
  type MonthlyTrendPoint,
} from "@/components/dashboard/monthly_trend_chart";
import { SummaryCards } from "@/components/dashboard/summary_cards";
import { TransactionItem } from "@/components/transactions/transaction_item";
import { Reveal } from "@/components/animations/reveal";
import type { Database } from "@/types/database";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

const trendData: MonthlyTrendPoint[] = [
  { label: "Mar", income: 4500000, expense: 3100000 },
  { label: "Apr", income: 5200000, expense: 3600000 },
  { label: "Mei", income: 4800000, expense: 3300000 },
  { label: "Jun", income: 6100000, expense: 4200000 },
  { label: "Jul", income: 5400000, expense: 3800000 },
  { label: "Agu", income: 6500000, expense: 2250000 },
];

const breakdownItems: CategoryBreakdownItem[] = [
  { name: "Makanan & Kebutuhan", amount: 980000, color: "" },
  { name: "Transportasi", amount: 620000, color: "" },
  { name: "Tagihan & Utilitas", amount: 450000, color: "" },
  { name: "Hiburan", amount: 200000, color: "" },
];

const USER_ID = "00000000-0000-4000-8000-000000000000";
const WALLET_ID = "11111111-1111-4111-8111-111111111111";
const CATEGORY_ID = "22222222-2222-4222-8222-222222222222";

const recentTransactions: Transaction[] = [
  {
    id: "mock-1",
    user_id: USER_ID,
    wallet_id: WALLET_ID,
    category_id: CATEGORY_ID,
    type: "income",
    amount: 6500000,
    description: "Gaji bulanan",
    transaction_date: "2026-08-10",
    receipt_image_url: null,
    created_at: "2026-08-10T09:00:00.000Z",
    updated_at: "2026-08-10T09:00:00.000Z",
  },
  {
    id: "mock-2",
    user_id: USER_ID,
    wallet_id: WALLET_ID,
    category_id: CATEGORY_ID,
    type: "expense",
    amount: 45000,
    description: "Belanja mingguan",
    transaction_date: "2026-08-09",
    receipt_image_url: null,
    created_at: "2026-08-09T14:30:00.000Z",
    updated_at: "2026-08-09T14:30:00.000Z",
  },
  {
    id: "mock-3",
    user_id: USER_ID,
    wallet_id: WALLET_ID,
    category_id: CATEGORY_ID,
    type: "expense",
    amount: 27000,
    description: "Scan struk Indomaret",
    transaction_date: "2026-08-08",
    receipt_image_url: null,
    created_at: "2026-08-08T18:05:00.000Z",
    updated_at: "2026-08-08T18:05:00.000Z",
  },
];

export function DashboardPreview() {
  return (
    <section
      aria-labelledby="preview-heading"
      className="relative scroll-mt-20 border-y border-white/60 bg-slate-50/50 py-16 sm:py-24 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/40"
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center">
            <span className="inline-block rounded-full border border-indigo-200/80 bg-white/70 px-3.5 py-1 text-xs font-semibold text-indigo-700 shadow-xs backdrop-blur-md dark:border-indigo-800/80 dark:bg-slate-900/70 dark:text-indigo-300">
              Live Interactive UI
            </span>
            <h2
              id="preview-heading"
              className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white"
            >
              Kondisi Keuanganmu, Sekilas & Nyata
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600 sm:text-base dark:text-slate-300">
              Ini adalah tampilan visual asli dashboard Duitku — saldo multi-wallet, kurva tren, dan pembagian kategori.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-12 rounded-3xl border border-white/80 bg-white/60 p-6 sm:p-8 shadow-[0_20px_50px_rgba(79,70,229,0.08)] backdrop-blur-2xl dark:border-slate-800/80 dark:bg-slate-900/60">
            <div className="flex flex-col gap-6">
              <SummaryCards
                totalBalance={4250000}
                monthIncome={6500000}
                monthExpense={2250000}
              />
              <div className="grid gap-6 lg:grid-cols-2">
                <MonthlyTrendChart data={trendData} />
                <CategoryBreakdown items={breakdownItems} total={2250000} />
              </div>
              <ul className="flex flex-col gap-3">
                {recentTransactions.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    walletName="Bank BCA"
                    categoryName="Makanan & Kebutuhan"
                  />
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
