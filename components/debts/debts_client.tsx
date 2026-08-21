"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
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
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-tr from-blue-700 via-indigo-600 to-indigo-500 p-6 text-white shadow-lg shadow-indigo-600/20">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-indigo-100 uppercase tracking-wider">
              Total Debt (Total Pinjaman)
            </p>
            <p className="text-3xl font-extrabold tracking-tight text-white tabular-nums">
              {formatRupiah(totalAmount)}
            </p>
            <p className="text-xs text-indigo-200">
              {debts.filter((d) => Number(d.remaining_amount) > 0).length} pinjaman aktif
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Sisa Hutang Belum Lunas
            </p>
            <p className="text-3xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400 tabular-nums">
              {formatRupiah(totalRemaining)}
            </p>
            <p className="text-xs text-slate-400">
              Total terbayar: {formatRupiah(totalPaid)}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs hidden lg:block dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Terbayar
            </p>
            <p className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatRupiah(totalPaid)}
            </p>
            <p className="text-xs text-slate-400">
              {totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 100}% lunas
            </p>
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex items-center justify-between mt-2">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Your Creditors (Daftar Pemberi Pinjaman)
        </h2>
        <Button onClick={openCreateForm} className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 gap-1.5 shadow-sm">
          <Plus className="size-4" />
          + Add Debt
        </Button>
      </div>

      {/* Debt List */}
      {debts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200/90 bg-white p-12 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex size-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <HandCoins className="size-6 text-slate-400" />
          </div>
          <p className="text-base font-semibold text-slate-800 dark:text-slate-200">Belum Ada Catatan</p>
          <p className="text-xs text-slate-500 max-w-sm">
            Semua catatan pinjaman Anda bersih! Klik &quot;+ Add Debt&quot; jika ingin mencatat kewajiban baru.
          </p>
          <Button onClick={openCreateForm} className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 gap-1.5 shadow-sm mt-1">
            <Plus className="size-4" />
            + Add Debt
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {debts.map((debt) => {
            const rem = Number(debt.remaining_amount);
            const total = Number(debt.amount);
            const paid = total - rem;
            const paidPct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 100;
            const isPaid = debt.status === "paid" || rem === 0;

            return (
              <div
                key={debt.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-indigo-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <p className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {debt.lender_name}
                    </p>
                    <StatusBadge status={debt.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      Amount Owed: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{formatRupiah(total)}</strong>
                    </span>
                    {debt.due_date && (
                      <span>
                        Due Date: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{debt.due_date}</strong>
                      </span>
                    )}
                    <span>
                      Sisa: <strong className="text-rose-600 dark:text-rose-400 font-semibold">{formatRupiah(rem)}</strong>
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                        style={{ width: `${paidPct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 tabular-nums shrink-0">
                      {paidPct}% paid
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t pt-3 md:border-t-0 md:pt-0 justify-end shrink-0">
                  {!isPaid && (
                    <Button
                      size="sm"
                      onClick={() => openPayModal(debt)}
                      className="rounded-full border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 text-xs font-semibold px-4 py-1.5 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      Pay Now
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEditForm(debt)}
                    className="size-8 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <Edit2 className="size-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteDebt(debt.id)}
                    className="size-8 rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
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
