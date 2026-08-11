import Link from "next/link";
import { redirect } from "next/navigation";

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
import { TransactionItem } from "@/components/transactions/transaction_item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import {
  formatMonthShort,
  lastMonths,
  todayIso,
  toLocalIso,
} from "@/lib/utils/date";
import { ChevronRight } from "lucide-react";

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
  const [{ data: wallets }, { data: transactions }, { data: recent }] =
    await Promise.all([
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
    ]);

  const walletList = wallets ?? [];
  const transactionList = transactions ?? [];

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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Selamat datang, {profile?.display_name || user.email} 👋
        </p>
      </div>

      <SummaryCards
        totalBalance={totalBalance}
        monthIncome={monthIncome}
        monthExpense={monthExpense}
      />

      <Reveal>
        <div className="grid gap-6 lg:grid-cols-2">
          <MonthlyTrendChart data={trendData} />
          <CategoryBreakdown items={breakdownItems} total={breakdownTotal} />
        </div>
      </Reveal>

      <Reveal delay={0.06}>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Transaksi Terakhir</CardTitle>
            <Link
              href="/transactions"
              className="text-primary hover:text-primary/80 flex items-center gap-0.5 text-sm font-medium transition-colors"
            >
              Lihat semua
              <ChevronRight className="size-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentList.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-sm">
                Belum ada transaksi. Catat pemasukan atau pengeluaran pertamamu!
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
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
          </CardContent>
        </Card>
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
