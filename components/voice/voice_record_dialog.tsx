"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  Mic,
  Pencil,
  Sparkles,
  Square,
  Volume2,
} from "lucide-react";

import { createTransactionAction } from "@/actions/transactions";
import {
  processVoiceTransactionAction,
  type VoiceChatMessage,
  type VoiceDraft,
} from "@/actions/voice_ai";
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
  blobToWavDataUrl,
  startRecording,
} from "@/lib/audio/recorder";
import { NO_CATEGORY_VALUE } from "@/lib/validations/transaction";
import { todayIso } from "@/lib/utils/date";
import { formatRupiah } from "@/lib/utils/money";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

type Wallet = Database["public"]["Tables"]["wallets"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

type VoicePhase = "idle" | "recording" | "processing" | "editing" | "saved";

function speak(text: string): boolean {
  try {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      return false;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

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

  // Percakapan & draft AI
  const [conversation, setConversation] = useState<VoiceChatMessage[]>([]);
  const [draft, setDraft] = useState<VoiceDraft | null>(null);
  const [lastReply, setLastReply] = useState<string | null>(null);

  // Form manual (fallback "Edit Manual")
  const [type, setType] = useState<"income" | "expense">("expense");
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
    setConversation([]);
    setDraft(null);
    setLastReply(null);
    setType("expense");
    setAmount("");
    setCategoryId(NO_CATEGORY_VALUE);
    setWalletId("");
    setDescription("");
    setTransactionDate(todayIso());
  }

  /** Hitung nilai form dari draft (tanpa bergantung pada state async). */
  function resolveFormFromDraft(
    current: VoiceDraft
  ): {
    type: "income" | "expense";
    amount: string;
    categoryId: string;
    walletId: string;
    description: string;
  } {
    const txType: "income" | "expense" =
      current.type === "income" ? "income" : "expense";
    const matchedCategory = categories
      .filter((c) => c.type === txType)
      .find((c) =>
        current.categoryHint
          ? c.name.toLowerCase().includes(current.categoryHint.toLowerCase())
          : false
      );
    const matchedWallet = activeWallets.find((w) =>
      current.walletHint
        ? w.name.toLowerCase().includes(current.walletHint.toLowerCase())
        : false
    );

    return {
      type: txType,
      amount:
        current.amount !== undefined && current.amount > 0
          ? String(current.amount)
          : "",
      categoryId: matchedCategory?.id ?? NO_CATEGORY_VALUE,
      walletId: matchedWallet?.id ?? activeWallets[0]?.id ?? "",
      description: [current.merchantName, current.paymentMethod, current.notes]
        .filter(Boolean)
        .join(" · "),
    };
  }

  /** Isi state form dari draft (dipakai saat masuk mode edit manual). */
  function fillFormFromDraft(current: VoiceDraft) {
    const resolved = resolveFormFromDraft(current);
    setType(resolved.type);
    setAmount(resolved.amount);
    setCategoryId(resolved.categoryId);
    setWalletId(resolved.walletId);
    setDescription(resolved.description);
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
        const wav = await blobToWavDataUrl(result.blob);
        const dataUrl = wav?.dataUrl ?? (await audioBlobToDataUrl(result.blob));

        const res = await processVoiceTransactionAction({
          audioDataUrl: dataUrl,
          conversation,
          currentDraft: draft,
        });

        if (res?.error) {
          setError(res.error);
          setPhase("idle");
          return;
        }
        if (res?.data) {
          const ai = res.data;
          setDraft(ai.draft);
          setLastReply(ai.reply);
          setConversation((prev) => [
            ...prev,
            { role: "user", text: ai.userText },
            { role: "model", text: ai.reply },
          ]);

          if (ai.confirmed) {
            const spoke = speak(ai.reply);
            saveFromDraft(ai.draft, spoke ? 1200 : 0);
          } else {
            speak(ai.reply);
            setPhase("idle");
          }
        }
      } catch (err) {
        console.error("[Voice] process error:", err);
        setError("Terjadi kesalahan saat memproses suara.");
        setPhase("idle");
      }
    });
  }

  function audioBlobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
    });
  }

  function handleStopAndEnd() {
    recorderRef.current?.handle?.stop();
  }

  /** Simpan draft AI saat user mengonfirmasi. Delay kecil agar TTS selesai dengar. */
  function saveFromDraft(current: VoiceDraft, delayMs: number) {
    const resolved = resolveFormFromDraft(current);
    setError(null);

    const total = Number(current.amount) || 0;
    if (total <= 0) {
      setError("Nominal transaksi tidak valid.");
      setPhase("idle");
      return;
    }
    if (!resolved.walletId) {
      setError("Silakan pilih dompet sumber transaksi.");
      setPhase("editing");
      fillFormFromDraft(current);
      return;
    }

    if (delayMs > 0) {
      window.setTimeout(() => {
        void runSave(resolved, total);
      }, delayMs);
      return;
    }
    void runSave(resolved, total);
  }

  function runSave(
    resolved: ReturnType<typeof resolveFormFromDraft>,
    total: number
  ) {
    startTransition(async () => {
      const res = await createTransactionAction({
        type: resolved.type,
        walletId: resolved.walletId,
        categoryId: resolved.categoryId,
        amount: String(total),
        description: resolved.description,
        transactionDate,
      });
      if (res?.error) {
        setError(res.error);
        setPhase("editing");
        return;
      }
      setPhase("saved");
      router.refresh();
    });
  }

  function handleSaveManual() {
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

  function openManualEdit() {
    if (draft) {
      fillFormFromDraft(draft);
    }
    setError(null);
    setPhase("editing");
  }

  const hintedCategory = draft
    ? categories.find(
        (c) =>
          c.type === (draft.type ?? "expense") &&
          draft.categoryHint &&
          c.name.toLowerCase().includes(draft.categoryHint.toLowerCase())
      )
    : undefined;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-w-md rounded-2xl p-5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            Asisten Catat Transaksi (Suara)
          </DialogTitle>
          <DialogDescription className="text-xs">
            Bicara untuk mencatat. Asisten membacakan ulang transaksimu dan
            menanyakan konfirmasi. Jawab &quot;ya&quot; untuk menyimpan, atau koreksi
            lewat suara.
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

          {conversation.length > 0 && (
            <ConversationThread conversation={conversation} onRepeat={(text) => speak(text)} />
          )}

          {draft && phase !== "saved" && phase !== "editing" && (
            <div className="rounded-xl bg-muted/40 p-3 grid gap-1.5 text-xs">
              <p className="font-semibold flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" />
                Draft Transaksi
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                <span>{draft.type === "income" ? "Pemasukan" : "Pengeluaran"}</span>
                {draft.amount !== undefined && draft.amount > 0 && (
                  <strong>{formatRupiah(draft.amount)}</strong>
                )}
                {hintedCategory && <span>{hintedCategory.name}</span>}
                {draft.merchantName && <span>{draft.merchantName}</span>}
                {draft.paymentMethod && <span>{draft.paymentMethod}</span>}
                {draft.walletHint && <span>{draft.walletHint}</span>}
              </div>
            </div>
          )}

          {phase === "processing" && (
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-muted/40 text-xs text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-primary" />
              Sedang mendengarkan & memahami...
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

          {phase !== "saved" && phase !== "editing" && (
            <div className="flex flex-col items-center gap-3 py-2">
              {phase === "idle" && lastReply && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground text-center">
                  <Volume2 className="size-3.5 shrink-0" />
                  Jawab di mikrofon: &quot;ya&quot; untuk simpan, atau koreksi nominal/kategori.
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={openManualEdit}
                  disabled={phase === "processing"}
                >
                  <Pencil className="size-3.5" />
                  Edit Manual
                </Button>
                {phase === "recording" ? (
                  <Button
                    onClick={handleStopAndEnd}
                    className="rounded-full size-14 p-0 shadow-lg gap-0 relative bg-destructive hover:bg-destructive/90"
                    aria-label="Berhenti merekam"
                  >
                    <Square className="size-5" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleStart}
                    className="rounded-full size-14 p-0 shadow-lg gap-0"
                    aria-label="Mulai merekam"
                    disabled={phase === "processing"}
                  >
                    <Mic className="size-6" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {phase === "recording"
                  ? "Mendengarkan... tekan stop saat selesai"
                  : conversation.length === 0
                    ? "Tekan mikrofon lalu ucapkan transaksi"
                    : "Tekan mikrofon untuk menjawab/merevisi"}
              </p>
            </div>
          )}

          {phase === "editing" && (
            <ManualEditForm
              categories={categories}
              activeWallets={activeWallets}
              type={type}
              setType={setType}
              amount={amount}
              setAmount={setAmount}
              categoryId={categoryId}
              setCategoryId={setCategoryId}
              walletId={walletId}
              setWalletId={setWalletId}
              description={description}
              setDescription={setDescription}
              transactionDate={transactionDate}
              setTransactionDate={setTransactionDate}
              isPending={isPending}
              onCancel={() => setPhase("idle")}
              onSave={handleSaveManual}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ConversationThread({
  conversation,
  onRepeat,
}: {
  conversation: VoiceChatMessage[];
  onRepeat: (text: string) => void;
}) {
  const latestModelIndex = (() => {
    for (let i = conversation.length - 1; i >= 0; i--) {
      if (conversation[i].role === "model") {
        return i;
      }
    }
    return -1;
  })();

  return (
    <div className="grid gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
      {conversation.map((msg, idx) => (
        <div
          key={idx}
          className={cn(
            "max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed",
            msg.role === "user"
              ? "justify-self-start bg-muted/60 text-foreground rounded-bl-sm"
              : "justify-self-end bg-primary text-primary-foreground rounded-br-sm"
          )}
        >
          {msg.text}
          {msg.role === "model" && idx === latestModelIndex && (
            <button
              type="button"
              className="ml-1.5 inline-flex items-center align-middle text-[10px] underline opacity-70 hover:opacity-100"
              onClick={() => onRepeat(msg.text)}
              aria-label="Putar ulang suara"
            >
              <Volume2 className="size-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function ManualEditForm(props: {
  categories: Category[];
  activeWallets: Wallet[];
  type: "income" | "expense";
  setType: (t: "income" | "expense") => void;
  amount: string;
  setAmount: (v: string) => void;
  categoryId: string;
  setCategoryId: (v: string) => void;
  walletId: string;
  setWalletId: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  transactionDate: string;
  setTransactionDate: (v: string) => void;
  isPending: boolean;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => props.setType("expense")}
          className={cn(
            "py-2.5 rounded-lg text-xs font-semibold transition-all border",
            props.type === "expense"
              ? "bg-destructive/10 text-destructive border-destructive/30"
              : "text-muted-foreground border-transparent hover:text-foreground"
          )}
        >
          Pengeluaran
        </button>
        <button
          type="button"
          onClick={() => props.setType("income")}
          className={cn(
            "py-2.5 rounded-lg text-xs font-semibold transition-all border",
            props.type === "income"
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
            value={props.amount}
            onChange={(e) => props.setAmount(e.target.value)}
            placeholder="25000"
            className="h-10 text-sm"
          />
        </div>
        <div className="grid gap-1.5">
          <Label className="text-xs font-semibold">Tanggal</Label>
          <Input
            type="date"
            value={props.transactionDate}
            onChange={(e) => props.setTransactionDate(e.target.value)}
            className="h-10 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label className="text-xs font-semibold">Kategori</Label>
          <Select
            value={props.categoryId}
            onValueChange={(v) => props.setCategoryId(v ?? NO_CATEGORY_VALUE)}
          >
            <SelectTrigger className="w-full h-10 text-sm">
              <SelectValue placeholder="Tanpa kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_CATEGORY_VALUE}>Tanpa Kategori</SelectItem>
              {props.categories
                .filter((c) => c.type === props.type)
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
          <Select
            value={props.walletId}
            onValueChange={(v) => props.setWalletId(v ?? "")}
          >
            <SelectTrigger className="w-full h-10 text-sm">
              <SelectValue placeholder="Pilih dompet" />
            </SelectTrigger>
            <SelectContent>
              {props.activeWallets.map((w) => (
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
          value={props.description}
          onChange={(e) => props.setDescription(e.target.value)}
          placeholder="Tambah catatan..."
          className="text-sm resize-none"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 pt-1">
        <Button
          variant="outline"
          className="gap-2 sm:flex-1"
          onClick={props.onCancel}
          disabled={props.isPending}
        >
          Kembali ke Suara
        </Button>
        <Button className="gap-2 sm:flex-1" onClick={props.onSave} disabled={props.isPending}>
          {props.isPending && <Loader2 className="size-4 animate-spin" />}
          Simpan Transaksi
        </Button>
      </div>
    </>
  );
}