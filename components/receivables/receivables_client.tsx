"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Banknote,
  Calendar,
  CheckCircle2,
  Coins,
  CreditCard,
  Edit2,
  Loader2,
  Plus,
  Trash2,
  Wallet,
} from "lucide-react";

import {
  createReceivableAction,
  deleteReceivableAction,
  payReceivableAction,
  updateReceivableAction,
} from "@/actions/receivables";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

type Receivable = Database["public"]["Tables"]["receivables"]["Row"];
type WalletType = Database["public"]["Tables"]["wallets"]["Row"];

export function ReceivablesClient({
  receivables,
  wallets,
}: {
  receivables: Receivable[];
  wallets: WalletType[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // State dialogs
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReceivable, setEditingReceivable] = useState<Receivable | null>(null);

  const [isPayOpen, setIsPayOpen] = useState(false);
  const [payingReceivable, setPayingReceivable] = useState<Receivable | null>(null);

  // Form State
  const [borrowerName, setBorrowerName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  // Payment Form State
  const [payWalletId, setPayWalletId] = useState(wallets[0]?.id ?? "");
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(todayIso());
  const [payNotes, setPayNotes] = useState("");

  const [error, setError] = useState<string | null>(null);

  // Stats calculation
  const totalAmount = receivables.reduce((sum, r) => sum + Number(r.amount), 0);
  const totalRemaining = receivables.reduce((sum, r) => sum + Number(r.remaining_amount), 0);
  const totalReceived = totalAmount - totalRemaining;

  function openCreateForm() {
    setEditingReceivable(null);
    setBorrowerName("");
    setAmount("");
    setDueDate("");
    setNotes("");
    setError(null);
    setIsFormOpen(true);
  }

  function openEditForm(rec: Receivable) {
    setEditingReceivable(rec);
    setBorrowerName(rec.borrower_name);
    setAmount(String(rec.amount));
    setDueDate(rec.due_date || "");
    setNotes(rec.notes || "");
    setError(null);
    setIsFormOpen(true);
  }

  function openPayModal(rec: Receivable) {
    setPayingReceivable(rec);
    setPayWalletId(wallets[0]?.id ?? "");
    setPayAmount(String(rec.remaining_amount));
    setPayDate(todayIso());
    setPayNotes("");
    setError(null);
    setIsPayOpen(true);
  }

  function handleSaveReceivable() {
    setError(null);
    startTransition(async () => {
      let res;
      if (editingReceivable) {
        res = await updateReceivableAction(editingReceivable.id, {
          borrowerName,
          amount,
          dueDate,
          notes,
        });
      } else {
        res = await createReceivableAction({
          borrowerName,
          amount,
          dueDate,
          notes,
        });
      }

      if (res?.error) {
        setError(res.error);
        return;
      }
      setIsFormOpen(false);
      router.refresh();
    });
  }

  function handleDeleteReceivable(recId: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus data piutang ini?")) {
      return;
    }
    startTransition(async () => {
      const res = await deleteReceivableAction(recId);
      if (res?.error) {
        alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  function handlePayReceivable() {
    if (!payingReceivable) return;
    setError(null);
    startTransition(async () => {
      const res = await payReceivableAction({
        receivableId: payingReceivable.id,
        walletId: payWalletId,
        amount: payAmount,
        paymentDate: payDate,
        notes: payNotes,
      });

      if (res?.error) {
        setError(res.error);
        return;
      }

      setIsPayOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Sisa Piutang</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                {formatRupiah(totalRemaining)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Banknote className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Diterima</p>
              <p className="text-xl font-bold text-primary mt-1 tabular-nums">
                {formatRupiah(totalReceived)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <CheckCircle2 className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Pinjaman Diberikan</p>
              <p className="text-xl font-bold text-foreground mt-1 tabular-nums">
                {formatRupiah(totalAmount)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-muted text-muted-foreground">
              <Coins className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight">Daftar Piutang</h2>
        <Button onClick={openCreateForm} className="gap-2 shadow-sm font-semibold">
          <Plus className="size-4" />
          Tambah Piutang
        </Button>
      </div>

      {/* Receivable List */}
      {receivables.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center justify-center gap-2">
            <Banknote className="size-10 text-muted-foreground/60" />
            <p className="text-sm font-semibold text-foreground">Belum Ada Catatan Piutang</p>
            <p className="text-xs text-muted-foreground max-w-sm">
              Tidak ada uang yang sedang dipinjamkan. Klik "+ Tambah Piutang" jika ingin mencatat uang yang dipinjam orang lain.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-3">
          {receivables.map((rec) => {
            const rem = Number(rec.remaining_amount);
            const isPaid = rec.status === "paid" || rem === 0;

            return (
              <Card key={rec.id} className="hover:border-primary/30 transition-all">
                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-base font-bold text-foreground truncate">
                        {rec.borrower_name}
                      </p>
                      <StatusBadge status={rec.status} />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Coins className="size-3.5" />
                        Total Pinjaman: <strong>{formatRupiah(Number(rec.amount))}</strong>
                      </span>
                      {rec.due_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3.5" />
                          Janji Bayar: <strong>{rec.due_date}</strong>
                        </span>
                      )}
                    </div>
                    {rec.notes && (
                      <p className="text-xs text-muted-foreground/80 italic truncate">
                        "{rec.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                        Sisa Piutang
                      </p>
                      <p
                        className={cn(
                          "text-base font-bold tabular-nums",
                          isPaid ? "text-muted-foreground" : "text-emerald-600 dark:text-emerald-400"
                        )}
                      >
                        {formatRupiah(rem)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!isPaid && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => openPayModal(rec)}
                          className="gap-1 text-xs shadow-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Wallet className="size-3.5" />
                          Terima Pelunasan
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditForm(rec)}
                        className="size-8"
                      >
                        <Edit2 className="size-3.5 text-muted-foreground" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteReceivable(rec.id)}
                        className="size-8 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog Form Tambah / Edit Piutang */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md rounded-2xl p-5">
          <DialogHeader>
            <DialogTitle>
              {editingReceivable ? "Edit Data Piutang" : "Tambah Catatan Piutang"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Isi data uang Anda yang dipinjam oleh orang lain.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {error && (
              <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">
                {error}
              </div>
            )}
            <div className="grid gap-1.5">
              <Label className="text-xs font-semibold">Nama Peminjam</Label>
              <Input
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                placeholder="Contoh: Andi, Budi, Rekan Bisnis"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-semibold">Nominal Piutang (Rp)</Label>
                <Input
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  disabled={Boolean(editingReceivable)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-semibold">Tanggal Janji Bayar</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label className="text-xs font-semibold">Catatan Tambahan</Label>
              <Textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tambah catatan mengenai piutang ini..."
                className="resize-none text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button onClick={handleSaveReceivable} disabled={isPending}>
                {isPending && <Loader2 className="size-4 animate-spin mr-1.5" />}
                Simpan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Terima Pelunasan Piutang */}
      <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
        <DialogContent className="max-w-md rounded-2xl p-5">
          <DialogHeader>
            <DialogTitle>Terima Pelunasan / Cicilan Piutang</DialogTitle>
            <DialogDescription className="text-xs">
              Penerimaan pembayaran akan **menambah saldo dompet** yang Anda pilih secara otomatis.
            </DialogDescription>
          </DialogHeader>

          {payingReceivable && (
            <div className="grid gap-4 py-2">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                <p className="font-semibold text-foreground">{payingReceivable.borrower_name}</p>
                <p className="text-muted-foreground">
                  Sisa Piutang:{" "}
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {formatRupiah(Number(payingReceivable.remaining_amount))}
                  </strong>
                </p>
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">
                  {error}
                </div>
              )}

              <div className="grid gap-1.5">
                <Label className="text-xs font-semibold">Pilih Dompet Penerima</Label>
                <Select value={payWalletId} onValueChange={(val) => setPayWalletId(val ?? "")}>
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue placeholder="Pilih dompet" />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name} ({formatRupiah(Number(w.current_balance))})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold">Nominal Diterima (Rp)</Label>
                  <Input
                    inputMode="numeric"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold">Tanggal Penerimaan</Label>
                  <Input
                    type="date"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label className="text-xs font-semibold">Catatan Penerimaan</Label>
                <Input
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="Contoh: Pelunasan via Transfer BCA"
                  className="text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsPayOpen(false)}
                  disabled={isPending}
                >
                  Batal
                </Button>
                <Button
                  onClick={handlePayReceivable}
                  disabled={isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isPending && <Loader2 className="size-4 animate-spin mr-1.5" />}
                  Simpan Penerimaan
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: Receivable["status"] }) {
  if (status === "paid") {
    return (
      <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
        Lunas
      </span>
    );
  }
  if (status === "partially_paid") {
    return (
      <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
        Dicicil
      </span>
    );
  }
  return (
    <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
      Belum Dibayar
    </span>
  );
}
