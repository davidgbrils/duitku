"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Banknote,
  Check,
  Copy,
  Edit2,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  Trash2,
} from "lucide-react";

import {
  createReceivableAction,
  deleteReceivableAction,
  payReceivableAction,
  updateReceivableAction,
} from "@/actions/receivables";
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

  // Remind Debtor Modal State
  const [isRemindOpen, setIsRemindOpen] = useState(false);
  const [remindReceivable, setRemindReceivable] = useState<Receivable | null>(null);
  const [remindMessage, setRemindMessage] = useState("");
  const [remindPhone, setRemindPhone] = useState("");
  const [copied, setCopied] = useState(false);

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

  function openRemindModal(rec: Receivable) {
    setRemindReceivable(rec);
    setRemindPhone("");
    setCopied(false);
    const dateText = rec.due_date ? ` pada tanggal ${rec.due_date}` : "";
    setRemindMessage(
      `Halo ${rec.borrower_name}, sekadar mengingatkan terkait pinjaman sebesar ${formatRupiah(
        Number(rec.remaining_amount)
      )}${dateText}. Terima kasih banyak ya! 🙏`
    );
    setIsRemindOpen(true);
  }

  function handleCopyReminder() {
    navigator.clipboard.writeText(remindMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSendWhatsApp() {
    const cleanPhone = remindPhone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("0") ? `62${cleanPhone.slice(1)}` : cleanPhone;
    const encoded = encodeURIComponent(remindMessage);
    const waUrl = formattedPhone ? `https://wa.me/${formattedPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(waUrl, "_blank");
    setIsRemindOpen(false);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-tr from-blue-700 via-indigo-600 to-indigo-500 p-6 text-white shadow-lg shadow-indigo-600/20">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-indigo-100 uppercase tracking-wider">
              Total Receivables (Total Piutang)
            </p>
            <p className="text-3xl font-extrabold tracking-tight text-white tabular-nums">
              {formatRupiah(totalAmount)}
            </p>
            <p className="text-xs text-indigo-200">
              {receivables.filter((r) => Number(r.remaining_amount) > 0).length} piutang aktif
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Collected / Total Diterima
            </p>
            <p className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatRupiah(totalReceived)}
            </p>
            <p className="text-xs text-slate-400">
              {totalAmount > 0 ? Math.round((totalReceived / totalAmount) * 100) : 100}% telah diterima
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs hidden lg:block dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Sisa Piutang Belum Diterima
            </p>
            <p className="text-3xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400 tabular-nums">
              {formatRupiah(totalRemaining)}
            </p>
            <p className="text-xs text-slate-400">
              Menunggu pelunasan
            </p>
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex items-center justify-between mt-2">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Recent Debtors (Daftar Peminjam)
        </h2>
        <Button onClick={openCreateForm} className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 gap-1.5 shadow-sm">
          <Plus className="size-4" />
          + Tambah Piutang
        </Button>
      </div>

      {/* Receivable List */}
      {receivables.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200/90 bg-white p-12 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex size-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Banknote className="size-6 text-slate-400" />
          </div>
          <p className="text-base font-semibold text-slate-800 dark:text-slate-200">Belum Ada Catatan</p>
          <p className="text-xs text-slate-500 max-w-sm">
            Tidak ada uang yang sedang dipinjamkan. Klik &quot;+ Tambah Piutang&quot; jika ingin mencatat uang yang dipinjam orang lain.
          </p>
          <Button onClick={openCreateForm} className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 gap-1.5 shadow-sm mt-1">
            <Plus className="size-4" />
            + Tambah Piutang
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {receivables.map((rec) => {
            const rem = Number(rec.remaining_amount);
            const total = Number(rec.amount);
            const received = total - rem;
            const receivedPct = total > 0 ? Math.min(100, Math.round((received / total) * 100)) : 100;
            const isPaid = rec.status === "paid" || rem === 0;

            return (
              <div
                key={rec.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-indigo-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 text-sm dark:bg-indigo-950 dark:text-indigo-300">
                      {rec.borrower_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-base font-bold text-slate-900 dark:text-white truncate">
                          {rec.borrower_name}
                        </p>
                        <StatusBadge status={rec.status} />
                      </div>
                      <p className="text-xs text-slate-400">
                        {rec.due_date ? `Jatuh tempo: ${rec.due_date}` : "Tanpa jatuh tempo"}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                        style={{ width: `${receivedPct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 tabular-nums shrink-0">
                      {receivedPct}% diterima
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t pt-3 md:border-t-0 md:pt-0 justify-between md:justify-end shrink-0">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] uppercase font-semibold text-slate-400">
                      Sisa Piutang
                    </p>
                    <p className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatRupiah(rem)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!isPaid && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => openPayModal(rec)}
                          className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-1.5 shadow-sm"
                        >
                          Terima Bayar
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openRemindModal(rec)}
                          title="Kirim Pengingat WhatsApp"
                          className="size-8 rounded-full text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        >
                          <MessageSquare className="size-3.5" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEditForm(rec)}
                      className="size-8 rounded-full text-slate-400 hover:bg-slate-100"
                    >
                      <Edit2 className="size-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteReceivable(rec.id)}
                      className="size-8 rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
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

      {/* Dialog Kirim Pengingat WhatsApp */}
      <Dialog open={isRemindOpen} onOpenChange={setIsRemindOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mb-2">
              <MessageSquare className="size-5" />
            </div>
            <DialogTitle className="text-xl font-bold">Kirim Pengingat Piutang</DialogTitle>
            <DialogDescription className="text-xs">
              Kirim pesan pengingat ramah ke <strong className="text-slate-800 dark:text-slate-200">{remindReceivable?.borrower_name}</strong> via WhatsApp atau salin ke clipboard.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Nomor WhatsApp (Opsional)</Label>
              <Input
                placeholder="Contoh: 08123456789"
                value={remindPhone}
                onChange={(e) => setRemindPhone(e.target.value)}
                className="rounded-2xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Draft Pesan</Label>
              <Textarea
                rows={4}
                value={remindMessage}
                onChange={(e) => setRemindMessage(e.target.value)}
                className="rounded-2xl text-xs leading-relaxed"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyReminder}
                className="flex-1 rounded-2xl gap-1.5 text-xs font-semibold"
              >
                {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                {copied ? "Tersalin!" : "Salin Pesan"}
              </Button>
              <Button
                type="button"
                onClick={handleSendWhatsApp}
                className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs font-bold shadow-md shadow-emerald-500/20"
              >
                <Send className="size-4" />
                Kirim WhatsApp
              </Button>
            </div>
          </div>
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
