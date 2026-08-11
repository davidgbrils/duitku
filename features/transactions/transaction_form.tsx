"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import {
  createTransactionAction,
  updateTransactionAction,
} from "@/actions/transactions";
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
  createTransactionSchema,
  updateTransactionSchema,
  NO_CATEGORY_VALUE,
  TRANSACTION_TYPES,
  type CreateTransactionInput,
  type TransactionType,
  type UpdateTransactionInput,
} from "@/lib/validations/transaction";
import type { Database } from "@/types/database";

type Wallet = Database["public"]["Tables"]["wallets"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

const typeLabels: Record<(typeof TRANSACTION_TYPES)[number], string> = {
  income: "Pemasukan",
  expense: "Pengeluaran",
};

export function CreateTransactionDialog({
  wallets,
  categories,
}: {
  wallets: Wallet[];
  categories: Category[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus />
            Tambah Transaksi
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Transaksi</DialogTitle>
          <DialogDescription>
            Catat pemasukan atau pengeluaranmu.
          </DialogDescription>
        </DialogHeader>
        <TransactionForm
          wallets={wallets}
          categories={categories}
          onDone={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export function EditTransactionDialog({
  transaction,
  wallets,
  categories,
}: {
  transaction: Transaction;
  wallets: Wallet[];
  categories: Category[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            Edit
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Transaksi</DialogTitle>
          <DialogDescription>
            Perbaiki kesalahan pencatatan transaksi.
          </DialogDescription>
        </DialogHeader>
        <TransactionForm
          transaction={transaction}
          wallets={wallets}
          categories={categories}
          onDone={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function TransactionForm({
  transaction,
  wallets,
  categories,
  onDone,
}: {
  transaction?: Transaction;
  wallets: Wallet[];
  categories: Category[];
  onDone: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEdit = Boolean(transaction);
  const schema = isEdit ? updateTransactionSchema : createTransactionSchema;

  const defaultType: TransactionType = transaction
    ? transaction.type
    : "expense";
  const [selectedType, setSelectedType] =
    useState<TransactionType>(defaultType);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateTransactionInput | UpdateTransactionInput>({
    resolver: zodResolver(schema),
    defaultValues: transaction
      ? {
          id: transaction.id,
          type: transaction.type,
          walletId: transaction.wallet_id,
          categoryId: transaction.category_id ?? NO_CATEGORY_VALUE,
          amount: Number(transaction.amount).toString(),
          description: transaction.description ?? "",
          transactionDate: transaction.transaction_date,
        }
      : {
          type: "expense",
          walletId: "",
          categoryId: NO_CATEGORY_VALUE,
          amount: "",
          description: "",
          transactionDate: todayIso(),
        },
  });

  const availableCategories = categories.filter(
    (category) => category.type === selectedType
  );

  // Base UI hanya menampilkan label bila `items` diberikan ke Root;
  // tanpa ini trigger menampilkan value mentah (mis. "__none", UUID, "income").
  const categoryItems = {
    [NO_CATEGORY_VALUE]: "Tanpa Kategori",
    ...Object.fromEntries(
      availableCategories.map((category) => [category.id, category.name])
    ),
  };
  const walletItems = Object.fromEntries(
    wallets
      .filter((wallet) => wallet.is_active)
      .map((wallet) => [wallet.id, wallet.name])
  );

  const onSubmit = handleSubmit((values) => {
    setError(null);
    startTransition(async () => {
      const result = transaction
        ? await updateTransactionAction(values as UpdateTransactionInput)
        : await createTransactionAction(values as CreateTransactionInput);
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
        <Label>Tipe</Label>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                setSelectedType(value as TransactionType);
                // Kategori income/expense berbeda — reset pilihan saat tipe berubah.
                setValue("categoryId", NO_CATEGORY_VALUE);
              }}
              items={typeLabels}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRANSACTION_TYPES.map((type) => (
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
        <Label htmlFor="transaction-amount">Nominal</Label>
        <Input
          id="transaction-amount"
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
        <Label>Kategori</Label>
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              items={categoryItems}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CATEGORY_VALUE}>
                  Tanpa Kategori
                </SelectItem>
                {availableCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.categoryId && (
          <p className="text-destructive text-xs">
            {errors.categoryId.message}
          </p>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label>Wallet</Label>
        <Controller
          control={control}
          name="walletId"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              items={walletItems}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih wallet" />
              </SelectTrigger>
              <SelectContent>
                {wallets
                  .filter((wallet) => wallet.is_active)
                  .map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.walletId && (
          <p className="text-destructive text-xs">{errors.walletId.message}</p>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="transaction-date">Tanggal</Label>
        <Input
          id="transaction-date"
          type="date"
          aria-invalid={Boolean(errors.transactionDate)}
          {...register("transactionDate")}
        />
        {errors.transactionDate && (
          <p className="text-destructive text-xs">
            {errors.transactionDate.message}
          </p>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="transaction-description">Deskripsi</Label>
        <Textarea
          id="transaction-description"
          rows={3}
          placeholder="Opsional — mis. Makan siang di kantin"
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
        ) : isEdit ? (
          "Simpan Perubahan"
        ) : (
          "Simpan Transaksi"
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
