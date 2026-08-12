import { redirect } from "next/navigation";
import { Banknote } from "lucide-react";

import { Reveal } from "@/components/animations/reveal";
import { ReceivablesClient } from "@/components/receivables/receivables_client";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ReceivablesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const [{ data: receivables }, { data: wallets }] = await Promise.all([
    supabase
      .from("receivables")
      .select("*")
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("wallets")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true }),
  ]);

  const receivableList = receivables ?? [];
  const walletList = wallets ?? [];

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
              <Banknote className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Manajemen Piutang
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
                Catat uang Anda yang dipinjam orang lain, janji bayar, dan pelunasan yang menambah saldo wallet.
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      <ReceivablesClient receivables={receivableList} wallets={walletList} />
    </div>
  );
}
