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
import {
  createTransferSchema,
  type CreateTransferInput,
} from "@/lib/validations/transfer";
import type { Database } from "@/types/database";

type Wallet = Database["public"]["Tables"]["wallets"]["Row"];

export function CreateTransferDialog({ wallets }: { wallets: Wallet[] }) {
  const [open, setOpen] = useState(false);
  const activeWallets = wallets.filter((wallet) => wallet.is_active);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus />
            Transfer
          </Button>
        }
      />
      <DialogContent>
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

  // Base UI menampilkan label hanya jika `items` diberikan ke Root;
  // tanpa ini trigger menampilkan UUID wallet mentah.
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
