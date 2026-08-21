import { redirect } from "next/navigation";

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
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Hutang</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Catat kewajiban pinjaman dan pantau pembayarannya
          </p>
        </div>
      </Reveal>

      <DebtsClient debts={debtList} wallets={walletList} />
    </div>
  );
}
