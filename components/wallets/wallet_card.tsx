"use client";

import { useState, useTransition } from "react";
import {
  Coins,
  Landmark,
  Loader2,
  Smartphone,
  Trash2,
  Wallet as WalletIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { deleteWalletAction } from "@/actions/wallets";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils/money";
import type { Database } from "@/types/database";

import { EditWalletDialog } from "./wallet_form";

type Wallet = Database["public"]["Tables"]["wallets"]["Row"];

const typeLabels: Record<Wallet["type"], string> = {
  cash: "Tunai",
  bank: "Bank",
  ewallet: "E-Wallet",
  other: "Lainnya",
};

/** Pilih element icon sesuai tipe/nama wallet (mendekati referensi Stitch). */
function walletIconFor(wallet: Wallet): React.ReactElement {
  const name = wallet.name.toLowerCase();
  if (name.includes("bank") || /bca|bri|bni|mandiri|btn|permata|hsbc/i.test(name)) {
    return <Landmark className="size-4" />;
  }
  if (wallet.type === "ewallet" || /dana|gopay|ovo|shopeepay|linkaja/i.test(name)) {
    return <Smartphone className="size-4" />;
  }
  if (wallet.type === "cash" || /cash|tunai|uang/i.test(name)) {
    return <Coins className="size-4" />;
  }
  if (wallet.type === "bank") {
    return <Landmark className="size-4" />;
  }
  return <WalletIcon className="size-4" />;
}

export function WalletCard({ wallet }: { wallet: Wallet }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = () => {
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteWalletAction(wallet.id);
      if (result?.error) {
        setDeleteError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div
      data-active={wallet.is_active}
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:border-indigo-300 hover:shadow-md data-[active=false]:opacity-60 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-xs dark:bg-indigo-950/60 dark:text-indigo-400">
          {walletIconFor(wallet)}
        </div>

        <div className="flex items-center gap-1">
          <EditWalletDialog wallet={wallet} />
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">Hapus {wallet.name}</span>
                </Button>
              }
            />
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus wallet?</AlertDialogTitle>
                <AlertDialogDescription>
                  Wallet <strong>{wallet.name}</strong> beserta semua
                  transaksinya akan dihapus. Tindakan ini tidak dapat
                  dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              {deleteError && (
                <p
                  role="alert"
                  className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
                >
                  {deleteError}
                </p>
              )}
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={isPending}
                  onClick={handleDelete}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="animate-spin mr-1" />
                      Menghapus...
                    </>
                  ) : (
                    "Hapus"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {wallet.name}
          </p>
          <span className="text-[11px] font-medium text-slate-400">
            {typeLabels[wallet.type]}
          </span>
        </div>
        <p className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums">
          {formatRupiah(wallet.current_balance)}
        </p>
      </div>

      {!wallet.is_active && (
        <div className="mt-2">
          <Badge variant="secondary" className="text-xs">
            Nonaktif
          </Badge>
        </div>
      )}
    </div>
  );
}
