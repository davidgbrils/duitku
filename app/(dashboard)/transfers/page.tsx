import { redirect } from "next/navigation";
import { ArrowRight, ArrowRightLeft } from "lucide-react";

import { Reveal } from "@/components/animations/reveal";
import { DeleteTransferButton } from "@/components/transfers/delete_transfer_button";
import { TransferFundsCard } from "@/features/transfers/transfer_form";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils/date";
import { formatRupiah } from "@/lib/utils/money";

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
    <div className="flex flex-col gap-8">
      {/* Transfer Funds Interactive Card */}
      <Reveal>
        <TransferFundsCard wallets={walletList} />
      </Reveal>

      {/* History of Transfers */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Riwayat Transfer ({transferList.length})
        </h2>

        {transferList.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200/90 bg-white px-6 py-12 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex size-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <ArrowRightLeft className="size-6 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
              Belum ada Transfer
            </p>
            <p className="text-xs text-slate-500 max-w-sm">
              Pindahkan uang antar wallet menggunakan form di atas.
            </p>
          </div>
        ) : (
          <Reveal>
            <ul className="flex flex-col gap-2.5">
              {transferList.map((transfer) => (
                <li key={transfer.id}>
                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white px-5 py-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                        <ArrowRightLeft className="size-4" />
                      </div>

                      <div className="flex min-w-0 flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white truncate">
                            {transfer.source_wallet?.name ?? "Wallet"}
                          </span>
                          <ArrowRight className="size-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-900 dark:text-white truncate">
                            {transfer.destination_wallet?.name ?? "Wallet"}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {formatDate(transfer.transfer_date)}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                        {formatRupiah(transfer.amount)}
                      </p>
                      <DeleteTransferButton transferId={transfer.id} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>
    </div>
  );
}
