"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { createWalletAction, updateWalletAction } from "@/actions/wallets";
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
  WALLET_TYPES,
  type CreateWalletInput,
  type UpdateWalletInput,
} from "@/lib/validations/wallet";
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Wallet</DialogTitle>
          <DialogDescription>
            Perbarui nama, tipe, atau currency.
          </DialogDescription>
        </DialogHeader>
        <EditWalletForm wallet={wallet} onDone={() => setOpen(false)} />
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
