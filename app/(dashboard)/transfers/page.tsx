import { redirect } from "next/navigation";

import { Reveal } from "@/components/animations/reveal";
import { DeleteTransferButton } from "@/components/transfers/delete_transfer_button";
import { Card, CardContent } from "@/components/ui/card";
import { CreateTransferDialog } from "@/features/transfers/transfer_form";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils/date";
import { formatRupiah } from "@/lib/utils/money";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TransfersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const [{ data: transfers }, { data: wallets }] = await Promise.all([
    supabase
      .from("transfers")
      .select(
        "*, source_wallet:wallets!transfers_source_wallet_id_fkey(name), destination_wallet:wallets!transfers_destination_wallet_id_fkey(name)"
      )
      .order("transfer_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("wallets").select("*"),
  ]);

  const transferList = transfers ?? [];
  const walletList = wallets ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transfer</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Pindahkan uang antar wallet tanpa mengubah total saldo
          </p>
        </div>
        <CreateTransferDialog wallets={walletList} />
      </div>

      {transferList.length === 0 ? (
        <div className="bg-card ring-border flex flex-col items-center gap-3 rounded-xl px-6 py-14 text-center ring-1">
          <p className="text-base font-medium">Belum ada Transfer</p>
          <p className="text-muted-foreground max-w-sm text-sm">
            Pindahkan uang antar wallet, mis. tarik tunai dari bank ke dompet.
          </p>
          <div className="mt-2">
            <CreateTransferDialog wallets={walletList} />
          </div>
        </div>
      ) : (
        <Reveal>
          <ul className="flex flex-col gap-3">
            {transferList.map((transfer) => (
              <li key={transfer.id}>
                <Card>
                  <CardContent className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex min-w-0 items-center gap-2 text-sm">
                        <span className="truncate font-medium">
                          {transfer.source_wallet?.name ?? "Wallet"}
                        </span>
                        <ArrowRight className="text-muted-foreground size-4 shrink-0" />
                        <span className="truncate font-medium">
                          {transfer.destination_wallet?.name ?? "Wallet"}
                        </span>
                      </div>
                      <p className="text-muted-foreground hidden text-xs sm:block">
                        {formatDate(transfer.transfer_date)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <p className="text-sm font-semibold">
                        {formatRupiah(transfer.amount)}
                      </p>
                      <DeleteTransferButton transferId={transfer.id} />
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </Reveal>
      )}
    </div>
  );
}
