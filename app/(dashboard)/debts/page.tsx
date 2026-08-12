import { redirect } from "next/navigation";
import { HandCoins } from "lucide-react";

import { Reveal } from "@/components/animations/reveal";
import { DebtsClient } from "@/components/debts/debts_client";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DebtsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const [{ data: debts }, { data: wallets }] = await Promise.all([
    supabase
      .from("debts")
      .select("*")
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("wallets")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true }),
  ]);

  const debtList = debts ?? [];
  const walletList = wallets ?? [];

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shadow-sm">
              <HandCoins className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Manajemen Hutang
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
                Catat kewajiban pinjaman, tanggal jatuh tempo, dan bayar cicilan yang memotong saldo wallet.
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      <DebtsClient debts={debtList} wallets={walletList} />
    </div>
  );
}
