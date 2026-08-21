import { redirect } from "next/navigation";
import { Wallet } from "lucide-react";

import { Reveal } from "@/components/animations/reveal";
import { CreateWalletDialog } from "@/components/wallets/wallet_form";
import { WalletCard } from "@/components/wallets/wallet_card";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils/money";

export const dynamic = "force-dynamic";

export default async function WalletsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: wallets } = await supabase
    .from("wallets")
    .select("*")
    .order("created_at", { ascending: true });

  const walletList = wallets ?? [];
  const activeWallets = walletList.filter((wallet) => wallet.is_active);
  const totalBalance = activeWallets.reduce(
    (sum, wallet) => sum + wallet.current_balance,
    0
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Wallets
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Tempat penyimpanan uangmu
          </p>
        </div>
        <CreateWalletDialog />
      </div>

      {walletList.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200/90 bg-white px-6 py-14 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex size-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Wallet className="size-6 text-slate-400" />
          </div>
          <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
            Belum ada Wallet
          </p>
          <p className="text-xs text-slate-500 max-w-sm">
            Tambahkan tempat penyimpanan uangmu untuk mulai menggunakan Duitku.
          </p>
          <div className="mt-2">
            <CreateWalletDialog />
          </div>
        </div>
      ) : (
        <>
          {/* Top Hero Balance Card */}
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 px-8 py-7 text-white shadow-xl shadow-indigo-950/20">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 size-52 rounded-full bg-indigo-500/20 blur-3xl"
              />
              <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-300">
                    Total Saldo
                  </p>
                  <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                    {formatRupiah(totalBalance)}
                  </p>
                </div>
                <div className="flex size-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-inner text-white">
                  <Wallet className="size-6" />
                </div>
              </div>
            </div>
          </Reveal>

          {/* Grid of Wallets */}
          <Reveal delay={0.05}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {walletList.map((wallet) => (
                <WalletCard key={wallet.id} wallet={wallet} />
              ))}
            </div>
          </Reveal>
        </>
      )}
    </div>
  );
}
