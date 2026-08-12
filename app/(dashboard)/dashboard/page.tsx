import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, PlusCircle, Wallet, Sparkles } from "lucide-react";

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
import { TransactionItem } from "@/components/transactions/transaction_item";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-r from-primary/10 via-emerald-500/5 to-background p-5 sm:p-6 shadow-sm">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="relative size-14 sm:size-16 shrink-0 rounded-2xl overflow-hidden shadow-md bg-card p-1.5 border border-primary/20">
                <Image
                  src="/images/brand/app_icon_light.png"
                  alt="Duitku App Icon"
                  width={64}
                  height={64}
                  className="size-full object-contain rounded-xl"
                  priority
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    Selamat Datang, {displayName}! 👋
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
                  <Sparkles className="size-3.5 text-primary shrink-0" />
                  <span>Kelola Keuanganmu, Lebih Sederhana.</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <ReceiptScannerDialog wallets={walletList} categories={categoryList} />
              <Button render={<Link href="/wallets" />} variant="outline" className="gap-2 shadow-sm">
                <Wallet className="size-4" />
                Dompet Saya
              </Button>
            </div>
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
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Transaksi Terakhir</CardTitle>
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
              <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                <div className="relative size-16 rounded-2xl overflow-hidden shadow-sm border bg-muted/30 p-2">
                  <Image
                    src="/images/brand/logo_icon.png"
                    alt="Duitku Logo Icon"
                    width={64}
                    height={64}
                    className="size-full object-contain opacity-80"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Belum Ada Transaksi Tercatat</p>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Mulai catat pemasukan, pengeluaran, atau scan struk pertama Anda sekarang!
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <ReceiptScannerDialog wallets={walletList} categories={categoryList} />
                </div>
              </div>
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
