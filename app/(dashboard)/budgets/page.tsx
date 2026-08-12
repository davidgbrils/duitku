import { redirect } from "next/navigation";
import { PieChart } from "lucide-react";

import { Reveal } from "@/components/animations/reveal";
import { BudgetsClient } from "@/components/budgets/budgets_client";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function BudgetsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const currentMonthYear = new Date().toISOString().slice(0, 7); // e.g. "2026-08"

  const [{ data: budgets }, { data: categories }, { data: currentMonthTx }] =
    await Promise.all([
      supabase
        .from("budgets")
        .select("*")
        .eq("month_year", currentMonthYear),
      supabase
        .from("categories")
        .select("*")
        .eq("type", "expense")
        .order("name", { ascending: true }),
      supabase
        .from("transactions")
        .select("category_id, amount")
        .eq("type", "expense")
        .gte("transaction_date", `${currentMonthYear}-01`)
        .lte("transaction_date", `${currentMonthYear}-31`),
    ]);

  const budgetList = budgets ?? [];
  const categoryList = categories ?? [];
  const txList = currentMonthTx ?? [];

  // Calculate spent amounts per category
  const categorySpentMap: Record<string, number> = {};
  for (const tx of txList) {
    if (tx.category_id) {
      categorySpentMap[tx.category_id] =
        (categorySpentMap[tx.category_id] ?? 0) + Number(tx.amount);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <PieChart className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Anggaran Bulanan ({currentMonthYear})
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
                Pasang limit batas pengeluaran per kategori & pantau indikator warna progress bar secara real-time.
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      <BudgetsClient
        budgets={budgetList}
        categories={categoryList}
        categorySpentMap={categorySpentMap}
        currentMonthYear={currentMonthYear}
      />
    </div>
  );
}
