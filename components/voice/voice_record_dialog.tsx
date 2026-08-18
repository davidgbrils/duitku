"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Mic,
  Square,
  Sparkles,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

import { createTransactionAction } from "@/actions/transactions";
import { processVoiceTransactionAction } from "@/actions/voice_ai";
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
import {
  audioBlobToBase64,
  startRecording,
} from "@/lib/audio/recorder";
import { NO_CATEGORY_VALUE } from "@/lib/validations/transaction";
import { todayIso } from "@/lib/utils/date";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

type Wallet = Database["public"]["Tables"]["wallets"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type TxType = "income" | "expense";

type VoicePhase = "idle" | "recording" | "processing" | "review" | "saved";

export function VoiceRecordDialog({
  wallets,
  categories,
  trigger,
}: {
  wallets: Wallet[];
  categories: Category[];
  trigger: React.ReactElement;
}) {
  const router = useRouter();
  const recorderRef = useRef<Awaited<ReturnType<typeof startRecording>> | null>(
    null
  );

  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<VoicePhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Field review
  const [type, setType] = useState<TxType>("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(NO_CATEGORY_VALUE);
  const [walletId, setWalletId] = useState("");
  const [description, setDescription] = useState("");
  const [transactionDate, setTransactionDate] = useState(todayIso());

  const activeWallets = wallets.filter((wallet) => wallet.is_active);

  function handleOpenChange(next: boolean) {
    if (!next) {
      if (recorderRef.current?.handle) {
        recorderRef.current.handle.cancel();
      }
      recorderRef.current = null;
      reset();
    }
    setOpen(next);
  }

  function reset() {
    setPhase("idle");
    setError(null);
    setType("expense");
    setAmount("");
    setCategoryId(NO_CATEGORY_VALUE);
    setWalletId("");
    setDescription("");
    setTransactionDate(todayIso());
  }

  async function handleStart() {
    setError(null);
    setPhase("recording");

    const started = await startRecording();
    recorderRef.current = started;

    if (!started.handle) {
      setError(
        "Mikrofon tidak tersedia. Pastikan izin akses mikrofon diberikan dan gunakan browser modern."
      );
      setPhase("idle");
      return;
    }

    started.onResult(async (result) => {
      if (!result) {
        setError("Perekaman gagal atau izin mikrofon ditolak.");
        setPhase("idle");
        return;
      }
      setPhase("processing");
      try {
        const dataUrl = await audioBlobToBase64(result.blob);
        const res = await processVoiceTransactionAction(dataUrl);
        if (res?.error) {
          setError(res.error);
          setPhase("idle");
          return;
        }
        if (res?.data) {
          applyVoiceResult(res.data);
          setPhase("review");
        }
      } catch (err) {
        console.error("[Voice] process error:", err);
        setError("Terjadi kesalahan saat memproses suara.");
        setPhase("idle");
      }
    });
  }

  function applyVoiceResult(result: {
    type?: "income" | "expense";
    amount?: number;
    categoryHint?: string;
    walletHint?: string;
    merchantName?: string;
    paymentMethod?: string;
    notes?: string;
  }) {
    const txType = result.type === "income" ? "income" : "expense";
    setType(txType);

    if (result.amount !== undefined && result.amount > 0) {
      setAmount(String(result.amount));
    }

    const relevantCategories = categories.filter(
      (c) => c.type === txType
    );
    const matchedCategory = relevantCategories.find((c) =>
      result.categoryHint
        ? c.name.toLowerCase().includes(result.categoryHint!.toLowerCase())
        : false
    );
    setCategoryId(matchedCategory?.id ?? NO_CATEGORY_VALUE);

    const matchedWallet = activeWallets.find((w) =>
      result.walletHint
        ? w.name.toLowerCase().includes(result.walletHint!.toLowerCase())
        : false
    );
    setWalletId(matchedWallet?.id ?? activeWallets[0]?.id ?? "");

    const parts = [
      result.merchantName,
      result.paymentMethod,
      result.notes,
    ].filter(Boolean);
    setDescription(parts.join(" · "));
  }

  function handleStopAndEnd() {
    recorderRef.current?.handle?.stop();
    // onResult akan memproses → processing/review
  }

  function handleRetryRecord() {
    reset();
    handleStart();
  }

  function handleSave() {
    setError(null);
    const total = Number(amount);
    if (!Number.isFinite(total) || total <= 0) {
      setError("Nominal transaksi tidak valid.");
      return;
    }
    if (!walletId) {
      setError("Silakan pilih dompet sumber transaksi.");
      return;
    }

    startTransition(async () => {
      const res = await createTransactionAction({
        type,
        walletId,
        categoryId,
        amount: String(total),
        description,
        transactionDate,
      });
      if (res?.error) {
        setError(res.error);
        return;
      }
      setPhase("saved");
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-w-md rounded-2xl p-5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            Catat Transaksi via Suara
          </DialogTitle>
          <DialogDescription className="text-xs">
            Ucapkan transaksimu, lalu periksa hasilnya sebelum disimpan. Tidak ada yang
            disimpan otomatis.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {error && (
            <div
              role="alert"
              className="p-2.5 rounded-xl bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20 flex items-start gap-2"
            >
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {phase === "idle" && (
            <div className="flex flex-col items-center gap-3 py-4">
              <p className="text-xs text-muted-foreground text-center max-w-xs leading-relaxed">
                Contoh ucapan:{" "}
                <strong>&quot;Beli kopi kenangan 25 ribu pakai QRIS&quot;</strong> atau{" "}
                <strong>&quot;Pemasukan gaji 5 juta ke BCA&quot;</strong>
              </p>
              <Button
                onClick={handleStart}
                className="rounded-full size-16 p-0 shadow-lg gap-0"
                aria-label="Mulai merekam"
              >
                <Mic className="size-7" />
              </Button>
            </div>
          )}

          {phase === "recording" && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="relative">
                <div className="size-16 rounded-full bg-destructive/10 animate-ping absolute inset-0" />
                <Button
                  onClick={handleStopAndEnd}
                  className="rounded-full size-16 p-0 shadow-lg gap-0 relative bg-destructive hover:bg-destructive/90"
                  aria-label="Berhenti merekam"
                >
                  <Square className="size-6" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Sedang mendengarkan... Tekan untuk selesai.</p>
            </div>
          )}

          {phase === "processing" && (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Mengenali ucapan dan ekstraksi data...</p>
            </div>
          )}

          {phase === "saved" && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="size-14 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="size-7" />
              </div>
              <p className="text-sm font-bold">Transaksi berhasil disimpan!</p>
              <Button
                variant="outline"
                className="gap-2 w-full"
                onClick={() => {
                  setOpen(false);
                  reset();
                  router.refresh();
                }}
              >
                Tutup
              </Button>
            </div>
          )}

          {phase === "review" && (
            <>
              {/* Tipe */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={cn(
                    "py-2.5 rounded-lg text-xs font-semibold transition-all border",
                    type === "expense"
                      ? "bg-destructive/10 text-destructive border-destructive/30"
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  )}
                >
                  Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={cn(
                    "py-2.5 rounded-lg text-xs font-semibold transition-all border",
                    type === "income"
                      ? "bg-success/10 text-success border-success/30"
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  )}
                >
                  Pemasukan
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold">Nominal (Rp)</Label>
                  <Input
                    inputMode="numeric"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="25000"
                    className="h-10 text-sm"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold">Tanggal</Label>
                  <Input
                    type="date"
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold">Kategori</Label>
                  <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? NO_CATEGORY_VALUE)}>
                    <SelectTrigger className="w-full h-10 text-sm">
                      <SelectValue placeholder="Tanpa kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_CATEGORY_VALUE}>Tanpa Kategori</SelectItem>
                      {categories
                        .filter((c) => c.type === type)
                        .map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold">Dompet</Label>
                  <Select value={walletId} onValueChange={(v) => setWalletId(v ?? "")}>
                    <SelectTrigger className="w-full h-10 text-sm">
                      <SelectValue placeholder="Pilih dompet" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeWallets.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label className="text-xs font-semibold">Catatan</Label>
                <Textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tambah catatan..."
                  className="text-sm resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <Button
                  variant="outline"
                  className="gap-2 sm:flex-1"
                  onClick={handleRetryRecord}
                  disabled={isPending}
                >
                  <RefreshCw className="size-4" />
                  Rekam Ulang
                </Button>
                <Button className="gap-2 sm:flex-1" onClick={handleSave} disabled={isPending}>
                  {isPending && <Loader2 className="size-4 animate-spin" />}
                  Simpan Transaksi
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}