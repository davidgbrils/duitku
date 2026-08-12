"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  CreditCard,
  Edit2,
  HandCoins,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

import {
  createDebtAction,
  deleteDebtAction,
  payDebtAction,
  updateDebtAction,
} from "@/actions/debts";
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

type Debt = Database["public"]["Tables"]["debts"]["Row"];
type Wallet = Database["public"]["Tables"]["wallets"]["Row"];

export function DebtsClient({ debts, wallets }: { debts: Debt[]; wallets: Wallet[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // State dialogs
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  const [isPayOpen, setIsPayOpen] = useState(false);
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null);

  // Form State
  const [lenderName, setLenderName] = useState("");
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
  const totalAmount = debts.reduce((sum, d) => sum + Number(d.amount), 0);
  const totalRemaining = debts.reduce((sum, d) => sum + Number(d.remaining_amount), 0);
  const totalPaid = totalAmount - totalRemaining;

  function openCreateForm() {
    setEditingDebt(null);
    setLenderName("");
    setAmount("");
    setDueDate("");
    setNotes("");
    setError(null);
    setIsFormOpen(true);
  }

  function openEditForm(debt: Debt) {
    setEditingDebt(debt);
    setLenderName(debt.lender_name);
    setAmount(String(debt.amount));
    setDueDate(debt.due_date || "");
    setNotes(debt.notes || "");
    setError(null);
    setIsFormOpen(true);
  }

  function openPayModal(debt: Debt) {
    setPayingDebt(debt);
    setPayWalletId(wallets[0]?.id ?? "");
    setPayAmount(String(debt.remaining_amount));
    setPayDate(todayIso());
    setPayNotes("");
    setError(null);
    setIsPayOpen(true);
  }

  function handleSaveDebt() {
    setError(null);
    startTransition(async () => {
      let res;
      if (editingDebt) {
        res = await updateDebtAction(editingDebt.id, {
          lenderName,
          amount,
          dueDate,
          notes,
        });
      } else {
        res = await createDebtAction({
          lenderName,
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

  function handleDeleteDebt(debtId: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus data hutang ini?")) {
      return;
    }
    startTransition(async () => {
      const res = await deleteDebtAction(debtId);
      if (res?.error) {
        alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  function handlePayDebt() {
    if (!payingDebt) return;
    setError(null);
    startTransition(async () => {
      const res = await payDebtAction({
        debtId: payingDebt.id,
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
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Sisa Hutang</p>
              <p className="text-xl font-bold text-destructive mt-1 tabular-nums">
                {formatRupiah(totalRemaining)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive">
              <HandCoins className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Terbayar</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                {formatRupiah(totalPaid)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Pinjaman</p>
              <p className="text-xl font-bold text-foreground mt-1 tabular-nums">
                {formatRupiah(totalAmount)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Coins className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight">Daftar Hutang</h2>
        <Button onClick={openCreateForm} className="gap-2 shadow-sm font-semibold">
          <Plus className="size-4" />
          Tambah Hutang
        </Button>
      </div>

      {/* Debt List */}
      {debts.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center justify-center gap-2">
            <HandCoins className="size-10 text-muted-foreground/60" />
            <p className="text-sm font-semibold text-foreground">Belum Ada Catatan Hutang</p>
            <p className="text-xs text-muted-foreground max-w-sm">
              Semua catatan pinjaman Anda bersih! Klik "+ Tambah Hutang" jika ingin mencatat kewajiban baru.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-3">
          {debts.map((debt) => {
            const rem = Number(debt.remaining_amount);
            const isPaid = debt.status === "paid" || rem === 0;

            return (
              <Card key={debt.id} className="hover:border-primary/30 transition-all">
                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-base font-bold text-foreground truncate">
                        {debt.lender_name}
                      </p>
                      <StatusBadge status={debt.status} />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Coins className="size-3.5" />
                        Total: <strong>{formatRupiah(Number(debt.amount))}</strong>
                      </span>
                      {debt.due_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3.5" />
                          Jatuh Tempo: <strong>{debt.due_date}</strong>
                        </span>
                      )}
                    </div>
                    {debt.notes && (
                      <p className="text-xs text-muted-foreground/80 italic truncate">
                        "{debt.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                        Sisa Hutang
                      </p>
                      <p
                        className={cn(
                          "text-base font-bold tabular-nums",
                          isPaid ? "text-muted-foreground" : "text-destructive"
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
                          onClick={() => openPayModal(debt)}
                          className="gap-1 text-xs shadow-sm font-medium"
                        >
                          <CreditCard className="size-3.5" />
                          Bayar
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditForm(debt)}
                        className="size-8"
                      >
                        <Edit2 className="size-3.5 text-muted-foreground" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteDebt(debt.id)}
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

      {/* Dialog Form Tambah / Edit Hutang */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md rounded-2xl p-5">
          <DialogHeader>
            <DialogTitle>
              {editingDebt ? "Edit Data Hutang" : "Tambah Catatan Hutang"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Isi data kewajiban pinjaman Anda kepada orang lain atau institusi.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {error && (
              <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">
                {error}
              </div>
            )}
            <div className="grid gap-1.5">
              <Label className="text-xs font-semibold">Nama Pemberi Pinjaman</Label>
              <Input
                value={lenderName}
                onChange={(e) => setLenderName(e.target.value)}
                placeholder="Contoh: Bank BCA, Budi, Teman Kantor"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-semibold">Nominal Pinjaman (Rp)</Label>
                <Input
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  disabled={Boolean(editingDebt)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-semibold">Tanggal Jatuh Tempo</Label>
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
                placeholder="Tambah catatan tentang hutang ini..."
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
              <Button onClick={handleSaveDebt} disabled={isPending}>
                {isPending && <Loader2 className="size-4 animate-spin mr-1.5" />}
                Simpan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Bayar Cicilan Hutang */}
      <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
        <DialogContent className="max-w-md rounded-2xl p-5">
          <DialogHeader>
            <DialogTitle>Bayar Cicilan / Pelunasan Hutang</DialogTitle>
            <DialogDescription className="text-xs">
              Pembayaran akan **mengurangi saldo dompet** yang Anda pilih secara otomatis.
            </DialogDescription>
          </DialogHeader>

          {payingDebt && (
            <div className="grid gap-4 py-2">
              <div className="p-3 rounded-xl bg-muted/40 border text-xs space-y-1">
                <p className="font-semibold text-foreground">{payingDebt.lender_name}</p>
                <p className="text-muted-foreground">
                  Sisa Hutang:{" "}
                  <strong className="text-destructive font-bold">
                    {formatRupiah(Number(payingDebt.remaining_amount))}
                  </strong>
                </p>
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">
                  {error}
                </div>
              )}

              <div className="grid gap-1.5">
                <Label className="text-xs font-semibold">Pilih Sumber Dompet</Label>
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
                  <Label className="text-xs font-semibold">Nominal Pembayaran (Rp)</Label>
                  <Input
                    inputMode="numeric"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold">Tanggal Pembayaran</Label>
                  <Input
                    type="date"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label className="text-xs font-semibold">Catatan Pembayaran</Label>
                <Input
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="Contoh: Cicilan ke-1"
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
                <Button onClick={handlePayDebt} disabled={isPending}>
                  {isPending && <Loader2 className="size-4 animate-spin mr-1.5" />}
                  Proses Pembayaran
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: Debt["status"] }) {
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
    <span className="rounded-full bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
      Belum Lunas
    </span>
  );
}
