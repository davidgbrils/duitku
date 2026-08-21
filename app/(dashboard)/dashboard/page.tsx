import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, Wallet } from "lucide-react";

import { Reveal } from "@/components/animations/reveal";
import {
  CategoryBreakdown,
  type CategoryBreakdownItem,
} from "@/components/dashboard/category_breakdown";
import {
  MonthlyTrendChart,
  type MonthlyTrendPoint,
} from "@/components/dashboard/monthly_trend_chart";
import { SummaryCards } from "@/components/dashboard/summary_cards";
import { ReceiptScannerDialog } from "@/components/receipts/receipt_scanner";
import { VoiceButton } from "@/components/voice/voice_button";
import { TransactionItem } from "@/components/transactions/transaction_item";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import {
  formatMonthShort,
  lastMonths,
  todayIso,
  toLocalIso,
} from "@/lib/utils/date";

export const dynamic = "force-dynamic";

const TREND_MONTHS = 6;

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  // ---- Data utama ----
  const [
    { data: wallets },
    { data: transactions },
    { data: recent },
    { data: categories },
  ] = await Promise.all([
    supabase.from("wallets").select("*"),
    supabase
      .from("transactions")
      .select("type, amount, transaction_date, categories(name)")
      .gte("transaction_date", trendStartIso())
      .lte("transaction_date", todayIso()),
    supabase
      .from("transactions")
      .select("*, wallets(name), categories(name)")
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("categories").select("*"),
  ]);

  const walletList = wallets ?? [];
  const transactionList = transactions ?? [];
  const categoryList = categories ?? [];

  const totalBalance = walletList
    .filter((wallet) => wallet.is_active)
    .reduce((sum, wallet) => sum + wallet.current_balance, 0);

  // ---- Tren bulanan + ringkasan bulan ini ----
  const monthKeys = lastMonths(TREND_MONTHS);
  const trendData: MonthlyTrendPoint[] = monthKeys.map((key) => {
    const monthTransactions = transactionList.filter((tx) =>
      tx.transaction_date.startsWith(key)
    );
    return {
      label: formatMonthShort(key),
      income: monthTransactions
        .filter((tx) => tx.type === "income")
        .reduce((sum, tx) => sum + tx.amount, 0),
      expense: monthTransactions
        .filter((tx) => tx.type === "expense")
        .reduce((sum, tx) => sum + tx.amount, 0),
    };
  });

  const thisMonth = trendData[trendData.length - 1];
  const monthIncome = thisMonth?.income ?? 0;
  const monthExpense = thisMonth?.expense ?? 0;

  // ---- Breakdown kategori pengeluaran bulan ini ----
  const currentMonthKey = monthKeys[monthKeys.length - 1];
  const currentMonthExpenses = transactionList.filter(
    (tx) =>
      tx.type === "expense" && tx.transaction_date.startsWith(currentMonthKey)
  );

  const categoryTotals = new Map<string, number>();
  for (const tx of currentMonthExpenses) {
    const name = tx.categories?.name ?? "Tanpa kategori";
    categoryTotals.set(name, (categoryTotals.get(name) ?? 0) + tx.amount);
  }

  const sortedCategories = [...categoryTotals.entries()].sort(
    (a, b) => b[1] - a[1]
  );
  const breakdownItems: CategoryBreakdownItem[] = [];
  let othersTotal = 0;
  sortedCategories.forEach(([name, amount], index) => {
    if (index < 5) {
      breakdownItems.push({ name, amount, color: "" });
    } else {
      othersTotal += amount;
    }
  });
  if (othersTotal > 0) {
    breakdownItems.push({ name: "Lainnya", amount: othersTotal, color: "" });
  }
  const breakdownTotal = currentMonthExpenses.reduce(
    (sum, tx) => sum + tx.amount,
    0
  );

  const recentList = recent ?? [];
  const displayName = profile?.display_name || user.email?.split("@")[0] || "User";

  return (
    <div className="flex flex-col gap-6">
      {/* ---- User Dashboard Brand Hero Banner ---- */}
      <Reveal>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 py-2">
          <div className="flex items-center gap-4">
            <div className="flex size-14 sm:size-16 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 shadow-inner dark:bg-slate-800 dark:text-slate-400">
              <svg className="size-8 fill-current" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Selamat Datang, {displayName.toUpperCase()}!
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Kelola Keuanganmu, Lebih Sederhana.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <VoiceButton wallets={walletList} categories={categoryList} />
            <ReceiptScannerDialog wallets={walletList} categories={categoryList} />
            <Button
              render={<Link href="/wallets" />}
              className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 text-sm shadow-sm gap-2"
            >
              <Wallet className="size-4" />
              Dompet Saya
            </Button>
          </div>
        </div>
      </Reveal>

      {/* ---- Ringkasan Kartu ---- */}
      <SummaryCards
        totalBalance={totalBalance}
        monthIncome={monthIncome}
        monthExpense={monthExpense}
      />

      {/* ---- Chart Tren & Breakdown Kategori ---- */}
      <Reveal>
        <div className="grid gap-6 lg:grid-cols-2">
          <MonthlyTrendChart data={trendData} />
          <CategoryBreakdown items={breakdownItems} total={breakdownTotal} />
        </div>
      </Reveal>

      {/* ---- Transaksi Terakhir ---- */}
      <Reveal delay={0.06}>
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Transaksi Terakhir
            </h2>
            <Link
              href="/transactions"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 text-sm font-semibold transition-colors"
            >
              Lihat semua
              <ChevronRight className="size-4" />
            </Link>
          </div>

          {recentList.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                <Wallet className="size-6" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                  Belum Ada Transaksi Tercatat
                </p>
                <p className="text-xs text-slate-500 max-w-sm">
                  Mulai catat pemasukan, pengeluaran, atau scan struk pertama Anda sekarang!
                </p>
              </div>
            </div>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {recentList.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  walletName={transaction.wallets?.name ?? "Wallet"}
                  categoryName={transaction.categories?.name ?? null}
                />
              ))}
            </ul>
          )}
        </div>
      </Reveal>
    </div>
  );
}

/** ISO tanggal awal dari 6 bulan lalu (untuk filter tren). */
function trendStartIso(): string {
  const now = new Date();
  const start = new Date(
    now.getFullYear(),
    now.getMonth() - (TREND_MONTHS - 1),
    1
  );
  return toLocalIso(start);
}
