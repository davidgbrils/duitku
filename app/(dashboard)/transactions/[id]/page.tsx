import { notFound, redirect } from "next/navigation";

import { ReceiptPreview } from "@/components/receipts/receipt_preview";
import { DeleteTransactionButton } from "@/components/transactions/delete_transaction_button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EditTransactionDialog } from "@/features/transactions/transaction_form";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatDateTime } from "@/lib/utils/date";
import { formatRupiah, formatSignedRupiah } from "@/lib/utils/money";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Users,
  CheckCircle2,
  Circle,
} from "lucide-react";
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

  const [{ data: transaction }, { data: wallets }, { data: categories }, { data: splitBill }] =
    await Promise.all([
      supabase
        .from("transactions")
        .select("*, wallets(name), categories(name)")
        .eq("id", id)
        .maybeSingle(),
      supabase.from("wallets").select("*"),
      supabase.from("categories").select("*"),
      supabase
        .from("split_bills")
        .select("*, split_bill_members(*)")
        .eq("transaction_id", id)
        .maybeSingle(),
    ]);

  // RLS menjamin transaksi milik user lain tidak terlihat → notFound.
  if (!transaction) {
    notFound();
  }

  const wallet = wallets?.find((w) => w.id === transaction.wallet_id);
  const isIncome = transaction.type === "income";
  const members = splitBill?.split_bill_members ?? [];
  const totalMemberAmount = members.reduce((sum, m) => sum + Number(m.amount), 0);
  const unsettledCount = members.filter((m) => !m.is_settled).length;

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

      {transaction.receipt_image_url && (
        <Card>
          <CardContent className="px-6 py-5">
            <p className="text-muted-foreground text-sm mb-2">Bukti Struk</p>
            <ReceiptPreview url={transaction.receipt_image_url} />
          </CardContent>
        </Card>
      )}

      {splitBill && (
        <Card>
          <CardContent className="px-6 py-5 grid gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-primary" />
                <p className="font-semibold text-sm">Bagi Tagihan</p>
              </div>
              {unsettledCount > 0 ? (
                <Badge variant="outline" className="text-amber-600">
                  {unsettledCount} belum lunas
                </Badge>
              ) : (
                <Badge className="text-success bg-success/10">Lunas</Badge>
              )}
            </div>
            <div className="rounded-lg bg-muted/40 p-3 grid gap-1.5 text-xs">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 font-medium">
                    {member.is_settled ? (
                      <CheckCircle2 className="size-3.5 text-success" />
                    ) : (
                      <Circle className="size-3.5 text-muted-foreground" />
                    )}
                    {member.member_name}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {formatRupiah(Number(member.amount))}
                  </span>
                </div>
              ))}
            </div>
            {totalMemberAmount > 0 && (
              <p className="text-xs text-muted-foreground">
                Bagian Anda:{" "}
                <strong>{formatRupiah(Number(transaction.amount) - totalMemberAmount)}</strong>{" "}
                dari total belanja {formatRupiah(Number(transaction.amount))}
              </p>
            )}
          </CardContent>
        </Card>
      )}
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
