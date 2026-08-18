"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Coins } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  createWalletAction,
  updateWalletAction,
  adjustWalletBalanceAction,
} from "@/actions/wallets";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createWalletSchema,
  updateWalletSchema,
  adjustWalletBalanceSchema,
  WALLET_TYPES,
  type CreateWalletInput,
  type UpdateWalletInput,
  type AdjustWalletBalanceInput,
} from "@/lib/validations/wallet";
import { formatRupiah } from "@/lib/utils/money";
import type { Database } from "@/types/database";

type Wallet = Database["public"]["Tables"]["wallets"]["Row"];

const typeLabels: Record<(typeof WALLET_TYPES)[number], string> = {
  cash: "Tunai (Cash)",
  bank: "Bank",
  ewallet: "E-Wallet",
  other: "Lainnya",
};

export function CreateWalletDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus />
            Tambah Wallet
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Wallet</DialogTitle>
          <DialogDescription>
            Tempat penyimpanan uangmu, mis. Cash, BCA, atau DANA.
          </DialogDescription>
        </DialogHeader>
        <CreateWalletForm onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

export function EditWalletDialog({ wallet }: { wallet: Wallet }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"info" | "balance">("info");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm">
            <Pencil />
            <span className="sr-only">Edit {wallet.name}</span>
          </Button>
        }
      />
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Wallet</DialogTitle>
          <DialogDescription>
            Ubah informasi atau sesuaikan saldo wallet Anda.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Selector */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setTab("info")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === "info"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Info Wallet
          </button>
          <button
            onClick={() => setTab("balance")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === "balance"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Coins className="size-4 inline mr-1" />
            Sesuaikan Saldo
          </button>
        </div>

        {tab === "info" && <EditWalletForm wallet={wallet} onDone={() => setOpen(false)} />}
        {tab === "balance" && (
          <AdjustBalanceForm wallet={wallet} onDone={() => setOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function CreateWalletForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateWalletInput>({
    resolver: zodResolver(createWalletSchema),
    defaultValues: {
      name: "",
      type: "cash",
      currency: "IDR",
      initialBalance: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    setError(null);
    startTransition(async () => {
      const result = await createWalletAction(values);
      if (result?.error) {
        setError(result.error);
        return;
      }
      onDone();
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <FormError error={error} />

      <div className="grid gap-1.5">
        <Label htmlFor="wallet-name">Nama Wallet</Label>
        <Input
          id="wallet-name"
          placeholder="mis. Cash, BCA, DANA"
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-destructive text-xs">{errors.name.message}</p>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label>Tipe Wallet</Label>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(value) =>
                field.onChange(value as (typeof WALLET_TYPES)[number])
              }
              // Base UI menampilkan label hanya jika `items` diberikan ke Root.
              items={typeLabels}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WALLET_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {typeLabels[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="wallet-currency">Currency</Label>
        <Input
          id="wallet-currency"
          placeholder="IDR"
          maxLength={3}
          aria-invalid={Boolean(errors.currency)}
          {...register("currency")}
        />
        {errors.currency && (
          <p className="text-destructive text-xs">{errors.currency.message}</p>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="wallet-balance">Saldo Awal</Label>
        <Input
          id="wallet-balance"
          inputMode="numeric"
          placeholder="0"
          aria-invalid={Boolean(errors.initialBalance)}
          {...register("initialBalance")}
        />
        {errors.initialBalance && (
          <p className="text-destructive text-xs">
            {errors.initialBalance.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isPending} className="mt-2 w-full">
        {isPending ? (
          <>
            <Loader2 className="animate-spin" />
            Menyimpan...
          </>
        ) : (
          "Simpan Wallet"
        )}
      </Button>
    </form>
  );
}

function EditWalletForm({
  wallet,
  onDone,
}: {
  wallet: Wallet;
  onDone: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UpdateWalletInput>({
    resolver: zodResolver(updateWalletSchema),
    defaultValues: {
      id: wallet.id,
      name: wallet.name,
      type: wallet.type,
      currency: wallet.currency,
      isActive: wallet.is_active,
    },
  });

  const onSubmit = handleSubmit((values) => {
    setError(null);
    startTransition(async () => {
      const result = await updateWalletAction(values);
      if (result?.error) {
        setError(result.error);
        return;
      }
      onDone();
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <FormError error={error} />

      <div className="grid gap-1.5">
        <Label htmlFor="wallet-name">Nama Wallet</Label>
        <Input
          id="wallet-name"
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-destructive text-xs">{errors.name.message}</p>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label>Tipe Wallet</Label>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(value) =>
                field.onChange(value as (typeof WALLET_TYPES)[number])
              }
              // Base UI menampilkan label hanya jika `items` diberikan ke Root.
              items={typeLabels}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WALLET_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {typeLabels[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="wallet-currency">Currency</Label>
        <Input
          id="wallet-currency"
          maxLength={3}
          aria-invalid={Boolean(errors.currency)}
          {...register("currency")}
        />
        {errors.currency && (
          <p className="text-destructive text-xs">{errors.currency.message}</p>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          className="accent-primary size-4"
          {...register("isActive")}
        />
        Wallet aktif
      </label>

      <Button type="submit" disabled={isPending} className="mt-2 w-full">
        {isPending ? (
          <>
            <Loader2 className="animate-spin" />
            Menyimpan...
          </>
        ) : (
          "Simpan Perubahan"
        )}
      </Button>
    </form>
  );
}

function AdjustBalanceForm({
  wallet,
  onDone,
}: {
  wallet: Wallet;
  onDone: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AdjustWalletBalanceInput>({
    resolver: zodResolver(adjustWalletBalanceSchema),
    defaultValues: {
      id: wallet.id,
      newBalance: String(wallet.current_balance),
      notes: "",
    },
  });

  const newBalanceValue = watch("newBalance");
  const currentBalance = Number(wallet.current_balance);
  const newBalance = Number(newBalanceValue) || 0;
  const difference = newBalance - currentBalance;

  const onSubmit = handleSubmit((values) => {
    setError(null);
    startTransition(async () => {
      const result = await adjustWalletBalanceAction(values);
      if (result?.error) {
        setError(result.error);
        return;
      }
      onDone();
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4 pt-4">
      <FormError error={error} />

      {/* Current Balance Info */}
      <div className="rounded-lg bg-muted/50 p-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Saldo Saat Ini:</span>
          <span className="font-bold text-lg">{formatRupiah(currentBalance)}</span>
        </div>
        {difference !== 0 && (
          <div className="flex items-center justify-between text-sm pt-2 border-t">
            <span className="text-muted-foreground">Perubahan:</span>
            <span
              className={`font-semibold ${
                difference > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {difference > 0 ? "+" : ""}
              {formatRupiah(difference)}
            </span>
          </div>
        )}
      </div>

      {/* New Balance Input */}
      <div className="grid gap-1.5">
        <Label htmlFor="new-balance">Saldo Baru</Label>
        <Input
          id="new-balance"
          type="text"
          inputMode="decimal"
          placeholder="0"
          aria-invalid={Boolean(errors.newBalance)}
          {...register("newBalance")}
        />
        {errors.newBalance && (
          <p className="text-destructive text-xs">{errors.newBalance.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Masukkan nominal saldo yang benar. Boleh negatif untuk hutang.
        </p>
      </div>

      {/* Notes */}
      <div className="grid gap-1.5">
        <Label htmlFor="adjustment-notes">Catatan (Opsional)</Label>
        <Input
          id="adjustment-notes"
          placeholder="Contoh: Koreksi saldo awal, Lupa catat transaksi"
          aria-invalid={Boolean(errors.notes)}
          {...register("notes")}
        />
        {errors.notes && (
          <p className="text-destructive text-xs">{errors.notes.message}</p>
        )}
      </div>

      {/* Timestamp Info */}
      <div className="rounded-lg bg-primary/5 p-3 text-xs text-muted-foreground">
        <p>
          ⏱️ Waktu perubahan akan dicatat otomatis dengan format:{" "}
          <strong>DD-MM-YYYY HH:MM:SS</strong>
        </p>
      </div>

      <Button type="submit" disabled={isPending} className="mt-2 w-full">
        {isPending ? (
          <>
            <Loader2 className="animate-spin" />
            Menyimpan...
          </>
        ) : (
          <>
            <Coins className="size-4" />
            Sesuaikan Saldo
          </>
        )}
      </Button>
    </form>
  );
}

function FormError({ error }: { error: string | null }) {
  if (!error) {
    return null;
  }
  return (
    <p
      role="alert"
      className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm"
    >
      {error}
    </p>
  );
}
