"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftRight, Loader2, Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { createTransferAction } from "@/actions/transfers";
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
import { Textarea } from "@/components/ui/textarea";
import { todayIso } from "@/lib/utils/date";
import { formatRupiah } from "@/lib/utils/money";
import {
  createTransferSchema,
  type CreateTransferInput,
} from "@/lib/validations/transfer";
import type { Database } from "@/types/database";

type Wallet = Database["public"]["Tables"]["wallets"]["Row"];

export function TransferFundsCard({ wallets }: { wallets: Wallet[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const activeWallets = wallets.filter((w) => w.is_active);

  const [sourceWalletId, setSourceWalletId] = useState(activeWallets[0]?.id ?? "");
  const [destWalletId, setDestWalletId] = useState(activeWallets[1]?.id ?? activeWallets[0]?.id ?? "");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateTransferInput>({
    resolver: zodResolver(createTransferSchema),
    defaultValues: {
      sourceWalletId: activeWallets[0]?.id ?? "",
      destinationWalletId: activeWallets[1]?.id ?? "",
      amount: "",
      description: "",
      transferDate: todayIso(),
    },
  });

  const sourceWallet = activeWallets.find((w) => w.id === sourceWalletId);
  const destWallet = activeWallets.find((w) => w.id === destWalletId);

  const onSubmit = handleSubmit((values) => {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await createTransferAction({
        ...values,
        sourceWalletId,
        destinationWalletId: destWalletId,
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      reset({
        sourceWalletId,
        destinationWalletId: destWalletId,
        amount: "",
        description: "",
        transferDate: todayIso(),
      });
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    });
  });

  const handleSwap = () => {
    const temp = sourceWalletId;
    setSourceWalletId(destWalletId);
    setDestWalletId(temp);
    setValue("sourceWalletId", destWalletId);
    setValue("destinationWalletId", temp);
  };

  return (
    <div className="mx-auto w-full max-w-xl rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
        Transfer Funds
      </h2>

      <form onSubmit={onSubmit} className="space-y-5">
        <FormError error={error} />
        {success && (
          <p className="rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            ✓ Transfer berhasil dicatat! Saldo wallet telah diperbarui.
          </p>
        )}

        {/* From & To Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3">
          {/* From */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              From
            </Label>
            <select
              value={sourceWalletId}
              onChange={(e) => {
                setSourceWalletId(e.target.value);
                setValue("sourceWalletId", e.target.value);
              }}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {activeWallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
            {sourceWallet && (
              <p className="text-[11px] text-slate-500">
                Balance: {formatRupiah(sourceWallet.current_balance)}
              </p>
            )}
          </div>

          {/* Swap button */}
          <button
            type="button"
            onClick={handleSwap}
            className="flex size-9 self-center sm:mt-5 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            title="Tukar Wallet"
          >
            <ArrowLeftRight className="size-4" />
          </button>

          {/* To */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              To
            </Label>
            <select
              value={destWalletId}
              onChange={(e) => {
                setDestWalletId(e.target.value);
                setValue("destinationWalletId", e.target.value);
              }}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {activeWallets
                .filter((w) => w.id !== sourceWalletId)
                .map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
            </select>
            {destWallet && (
              <p className="text-[11px] text-slate-500">
                Balance: {formatRupiah(destWallet.current_balance)}
              </p>
            )}
          </div>
        </div>

        {/* Big Amount Card */}
        <div className="space-y-1.5">
          <Label htmlFor="transfer-amount" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Nominal Transfer
          </Label>
          <div className="relative rounded-2xl border-2 border-slate-200 bg-white p-4 focus-within:border-indigo-500 shadow-xs dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-400">
                Rp
              </span>
              <input
                id="transfer-amount"
                inputMode="numeric"
                placeholder="0"
                className="w-full bg-transparent text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 focus:outline-none dark:text-white tabular-nums"
                {...register("amount")}
              />
            </div>
          </div>
          {errors.amount && (
            <p className="text-destructive text-xs font-medium">{errors.amount.message}</p>
          )}
        </div>

        {/* Note & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="transfer-note" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Note (Optional)
            </Label>
            <Input
              id="transfer-note"
              placeholder="e.g., Tarik tunai ATM"
              className="rounded-2xl bg-slate-50/50 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
              {...register("description")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="transfer-date" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Date
            </Label>
            <Input
              id="transfer-date"
              type="date"
              className="rounded-2xl bg-slate-50/50 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
              {...register("transferDate")}
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isPending || activeWallets.length < 2}
          className="w-full rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 text-base shadow-md transition-all gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin size-4" />
              Memproses Transfer...
            </>
          ) : (
            <>
              Confirm Transfer →
            </>
          )}
        </Button>

        <p className="text-center text-xs text-slate-400">
          Pindahkan saldo antar wallet tanpa mengubah total saldo.
        </p>
      </form>
    </div>
  );
}

export function CreateTransferDialog({ wallets }: { wallets: Wallet[] }) {
  const [open, setOpen] = useState(false);
  const activeWallets = wallets.filter((wallet) => wallet.is_active);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
            <Plus className="size-4" />
            Transfer
          </Button>
        }
      />
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Transfer Antar Wallet</DialogTitle>
          <DialogDescription>
            Pindahkan uang antar wallet, mis. dari Cash ke BCA.
          </DialogDescription>
        </DialogHeader>
        <TransferForm wallets={activeWallets} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function TransferForm({
  wallets,
  onDone,
}: {
  wallets: Wallet[];
  onDone: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [sourceWalletId, setSourceWalletId] = useState("");

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<CreateTransferInput>({
    resolver: zodResolver(createTransferSchema),
    defaultValues: {
      sourceWalletId: "",
      destinationWalletId: "",
      amount: "",
      description: "",
      transferDate: todayIso(),
    },
  });

  const destinationOptions = wallets.filter(
    (wallet) => wallet.id !== sourceWalletId
  );

  const walletItems = Object.fromEntries(
    wallets.map((wallet) => [wallet.id, wallet.name])
  );
  const destinationItems = Object.fromEntries(
    destinationOptions.map((wallet) => [wallet.id, wallet.name])
  );

  const onSubmit = handleSubmit((values) => {
    setError(null);
    startTransition(async () => {
      const result = await createTransferAction(values);
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
        <Label>Dari Wallet</Label>
        <Controller
          control={control}
          name="sourceWalletId"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                setSourceWalletId(value ?? "");
                if (value === getValues("destinationWalletId")) {
                  setValue("destinationWalletId", "");
                }
              }}
              items={walletItems}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih wallet asal" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.sourceWalletId && (
          <p className="text-destructive text-xs">
            {errors.sourceWalletId.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-center">
        <span className="bg-muted flex size-8 items-center justify-center rounded-full">
          <ArrowLeftRight className="text-muted-foreground size-4" />
        </span>
      </div>

      <div className="grid gap-1.5">
        <Label>Ke Wallet</Label>
        <Controller
          control={control}
          name="destinationWalletId"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              items={destinationItems}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih wallet tujuan" />
              </SelectTrigger>
              <SelectContent>
                {destinationOptions.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.destinationWalletId && (
          <p className="text-destructive text-xs">
            {errors.destinationWalletId.message}
          </p>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="transfer-amount">Nominal</Label>
        <Input
          id="transfer-amount"
          inputMode="numeric"
          placeholder="0"
          className="text-lg font-semibold tracking-tight"
          aria-invalid={Boolean(errors.amount)}
          {...register("amount")}
        />
        {errors.amount && (
          <p className="text-destructive text-xs">{errors.amount.message}</p>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="transfer-date">Tanggal</Label>
        <Input
          id="transfer-date"
          type="date"
          aria-invalid={Boolean(errors.transferDate)}
          {...register("transferDate")}
        />
        {errors.transferDate && (
          <p className="text-destructive text-xs">
            {errors.transferDate.message}
          </p>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="transfer-description">Deskripsi</Label>
        <Textarea
          id="transfer-description"
          rows={2}
          placeholder="Opsional — mis. Tarik tunai"
          aria-invalid={Boolean(errors.description)}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-destructive text-xs">
            {errors.description.message}
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
          "Simpan Transfer"
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
