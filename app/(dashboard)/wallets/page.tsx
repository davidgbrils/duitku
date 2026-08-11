import { redirect } from "next/navigation";

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
          <h1 className="text-2xl font-semibold tracking-tight">Wallets</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Tempat penyimpanan uangmu
          </p>
        </div>
        <CreateWalletDialog />
      </div>

      {walletList.length === 0 ? (
        <div className="bg-card ring-border flex flex-col items-center gap-3 rounded-xl px-6 py-14 text-center ring-1">
          <p className="text-base font-medium">Belum ada Wallet</p>
          <p className="text-muted-foreground max-w-sm text-sm">
            Tambahkan tempat penyimpanan uangmu untuk mulai menggunakan Duitku.
          </p>
          <div className="mt-2">
            <CreateWalletDialog />
          </div>
        </div>
      ) : (
        <>
          <Reveal>
            <div className="bg-card ring-border flex items-center justify-between rounded-xl px-5 py-4 ring-1">
              <p className="text-muted-foreground text-sm font-medium">
                Total Saldo
              </p>
              <p className="text-primary text-2xl font-semibold tracking-tight">
                {formatRupiah(totalBalance)}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="grid gap-4 sm:grid-cols-2">
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
