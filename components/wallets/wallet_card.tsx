"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Wallet as WalletIcon } from "lucide-react";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card
      data-active={wallet.is_active}
      className="data-[active=false]:opacity-60"
    >
      <CardHeader className="flex-row items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="bg-muted flex size-8 items-center justify-center rounded-lg">
            <WalletIcon className="size-4" />
          </span>
          <div>
            <CardTitle>{wallet.name}</CardTitle>
            <CardDescription>{typeLabels[wallet.type]}</CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <EditWalletDialog wallet={wallet} />
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="ghost" size="icon-sm">
                  <Trash2 />
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
                  className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm"
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
                      <Loader2 className="animate-spin" />
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
      </CardHeader>
      <CardContent>
        <p className="text-xl font-semibold tracking-tight">
          {formatRupiah(wallet.current_balance)}
        </p>
        {!wallet.is_active && (
          <Badge variant="secondary" className="mt-1">
            Nonaktif
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
