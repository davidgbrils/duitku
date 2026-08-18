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

/** Data contoh — dipakai SEMUA komponen asli Duitku, bukan gambar statis. */
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

/**
 * Preview dashboard — komponen Duitku ASLI dengan data contoh, sehingga
 * selalu konsisten dengan aplikasi sebenarnya.
 */
export function DashboardPreview() {
  return (
    <section
      aria-labelledby="preview-heading"
      className="border-border border-y bg-muted/40"
    >
      <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:py-20">
        <Reveal>
          <h2
            id="preview-heading"
            className="text-center text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Kondisi keuanganmu, sekilas
          </h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-xl text-center text-sm sm:text-base">
            Ini dashboard asli Duitku — saldo, pemasukan vs pengeluaran, dan
            ringkasan bulanan dalam satu layar.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-10 flex flex-col gap-6">
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
        </Reveal>
      </div>
    </section>
  );
}
