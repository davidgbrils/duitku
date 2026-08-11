import { notFound, redirect } from "next/navigation";

import { DeleteTransactionButton } from "@/components/transactions/delete_transaction_button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EditTransactionDialog } from "@/features/transactions/transaction_form";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatDateTime } from "@/lib/utils/date";
import { formatRupiah, formatSignedRupiah } from "@/lib/utils/money";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const [{ data: transaction }, { data: wallets }, { data: categories }] =
    await Promise.all([
      supabase
        .from("transactions")
        .select("*, wallets(name), categories(name)")
        .eq("id", id)
        .maybeSingle(),
      supabase.from("wallets").select("*"),
      supabase.from("categories").select("*"),
    ]);

  // RLS menjamin transaksi milik user lain tidak terlihat → notFound.
  if (!transaction) {
    notFound();
  }

  const wallet = wallets?.find((w) => w.id === transaction.wallet_id);
  const isIncome = transaction.type === "income";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link
            href="/transactions"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            ← Kembali
          </Link>
        </div>
        <div className="flex gap-2">
          <EditTransactionDialog
            transaction={transaction}
            wallets={wallets ?? []}
            categories={categories ?? []}
          />
          <DeleteTransactionButton transactionId={transaction.id} />
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 px-6 py-10 text-center">
          <span
            className={
              isIncome
                ? "bg-success/10 text-success flex size-12 items-center justify-center rounded-full"
                : "bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full"
            }
          >
            {isIncome ? (
              <ArrowDownLeft className="size-6" />
            ) : (
              <ArrowUpRight className="size-6" />
            )}
          </span>
          <div>
            <p
              className={
                isIncome
                  ? "text-success text-3xl font-semibold tracking-tight"
                  : "text-destructive text-3xl font-semibold tracking-tight"
              }
            >
              {formatSignedRupiah(transaction.amount, isIncome)}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              {isIncome ? "Pemasukan" : "Pengeluaran"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {transaction.categories?.name ?? "Tanpa kategori"}
            </Badge>
            {wallet && <Badge variant="outline">{wallet.name}</Badge>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4 px-6 py-5 text-sm">
          <DetailRow
            label="Tanggal"
            value={formatDate(transaction.transaction_date)}
          />
          <DetailRow
            label="Dibuat"
            value={formatDateTime(transaction.created_at)}
          />
          {transaction.description && (
            <DetailRow label="Deskripsi" value={transaction.description} />
          )}
          <DetailRow label="Nominal" value={formatRupiah(transaction.amount)} />
          <DetailRow label="Wallet" value={wallet?.name ?? "Wallet"} />
          <DetailRow
            label="Kategori"
            value={transaction.categories?.name ?? "Tanpa kategori"}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <dt className="text-muted-foreground shrink-0">{label}</dt>
      <dd className="text-right font-medium break-words">{value}</dd>
    </div>
  );
}
