"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, ScanLine } from "lucide-react";

import { createTransactionAction } from "@/actions/transactions";
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
import { detectCategory } from "@/lib/receipt/categories";
import { extractReceipt, type ReceiptExtraction } from "@/lib/receipt/extract";
import { NO_CATEGORY_VALUE } from "@/lib/validations/transaction";
import { todayIso } from "@/lib/utils/date";
import { formatRupiah } from "@/lib/utils/money";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

type Wallet = Database["public"]["Tables"]["wallets"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

type Step = "upload" | "processing" | "review";

/**
 * Scan struk belanja (TASK tambahan user):
 * upload foto → OCR Tesseract (di browser, tanpa kirim gambar ke server)
 * → ekstraksi data + confidence → layar Review & Confirm → simpan transaksi.
 *
 * Hasil OCR TIDAK pernah langsung disimpan: user selalu bisa mengedit
 * merchant, tanggal, nominal, kategori, dan wallet sebelum konfirmasi.
 */
export function ReceiptScannerDialog({
  wallets,
  categories,
}: {
  wallets: Wallet[];
  categories: Category[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("upload");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [extraction, setExtraction] = useState<ReceiptExtraction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startTransition] = useTransition();

  // Field yang bisa diedit user di layar Review.
  const [merchant, setMerchant] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(NO_CATEGORY_VALUE);
  const [walletId, setWalletId] = useState("");
  const [description, setDescription] = useState("");

  const activeWallets = wallets.filter((wallet) => wallet.is_active);

  // Base UI hanya menampilkan label bila `items` diberikan ke Root.
  const expenseCategoryItems = {
    [NO_CATEGORY_VALUE]: "Tanpa Kategori",
    ...Object.fromEntries(
      categories
        .filter((category) => category.type === "expense")
        .map((category) => [category.id, category.name])
    ),
  };
  const walletItems = Object.fromEntries(
    activeWallets.map((wallet) => [wallet.id, wallet.name])
  );

  function reset() {
    setStep("upload");
    setImageUrl(null);
    setExtraction(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Pilih file gambar (JPG atau PNG).");
      return;
    }
    setError(null);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setStep("processing");
    try {
      // OCR dimuat lazily agar bundle awal tetap kecil.
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("ind");
      const { data } = await worker.recognize(url);
      await worker.terminate();

      const base = extractReceipt(data.text);
      const category = detectCategory(
        base.items.map((item) => item.name),
        categories
      );
      const merged: ReceiptExtraction = {
        ...base,
        confidence: { ...base.confidence, category: category.confidence },
      };

      setExtraction(merged);
      setMerchant(base.merchantName ?? "");
      setTransactionDate(base.transactionDate ?? todayIso());
      setAmount(base.totalAmount !== null ? String(base.totalAmount) : "");
      setCategoryId(category.categoryId ?? NO_CATEGORY_VALUE);
      setWalletId(activeWallets[0]?.id ?? "");
      setDescription(
        base.merchantName ? `Struk ${base.merchantName}` : "Struk belanja"
      );
      setStep("review");
    } catch {
      setError(
        "Gagal membaca struk. Coba lagi dengan foto yang lebih terang, lurus, dan fokus."
      );
      setStep("upload");
    }
  }

  function handleSave() {
    setError(null);
    if (!walletId) {
      setError("Pilih wallet terlebih dahulu.");
      return;
    }
    const total = Number(amount);
    if (!Number.isFinite(total) || total <= 0) {
      setError("Nominal tidak valid.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(transactionDate)) {
      setError("Tanggal tidak valid.");
      return;
    }
    startTransition(async () => {
      const result = await createTransactionAction({
        type: "expense",
        walletId,
        categoryId,
        amount: String(total),
        description,
        transactionDate,
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      reset();
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          reset();
        }
      }}
    >
      <DialogTrigger
        render={
          <Button variant="outline">
            <ScanLine />
            Scan Struk
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {step === "review" ? "Review Transaksi" : "Scan Struk"}
          </DialogTitle>
          <DialogDescription>
            {step === "review"
              ? "Periksa hasil pembacaan sebelum disimpan — OCR bisa salah baca."
              : "Foto struk belanja, Duitku akan membacanya otomatis."}
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="hover:bg-muted/50 flex flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors"
            >
              <ImagePlus className="text-muted-foreground size-8" />
              <p className="text-sm font-medium">Pilih atau foto struk</p>
              <p className="text-muted-foreground text-xs">
                JPG atau PNG · OCR berjalan di browser kamu, gambar tidak
                dikirim ke server
              </p>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  handleFile(file);
                }
              }}
            />
            {error && <ErrorBanner message={error} />}
          </div>
        )}

        {step === "processing" && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <Loader2 className="text-primary size-8 animate-spin" />
            <p className="text-sm font-medium">Membaca struk...</p>
            <p className="text-muted-foreground text-xs">
              Ekstraksi merchant, tanggal, item, dan total
            </p>
          </div>
        )}

        {step === "review" && extraction && (
          <div className="grid gap-4">
            {imageUrl && (
              <div className="bg-muted flex justify-center rounded-lg p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Pratinjau struk"
                  className="max-h-40 rounded-md object-contain"
                />
              </div>
            )}

            <FieldRow label="Merchant" confidence={extraction.confidence.merchant}>
              <Input
                value={merchant}
                onChange={(event) => setMerchant(event.target.value)}
                placeholder="Nama toko/merchant"
              />
            </FieldRow>

            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Tanggal" confidence={extraction.confidence.date}>
                <Input
                  type="date"
                  value={transactionDate}
                  onChange={(event) =>
                    setTransactionDate(event.target.value)
                  }
                />
              </FieldRow>
              <FieldRow label="Total" confidence={extraction.confidence.total}>
                <Input
                  inputMode="numeric"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0"
                  className="text-base font-semibold"
                />
              </FieldRow>
            </div>

            <FieldRow
              label="Kategori"
              confidence={extraction.confidence.category}
            >
              <Select
                value={categoryId}
                onValueChange={(value) =>
                  setCategoryId(value ?? NO_CATEGORY_VALUE)
                }
                items={expenseCategoryItems}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CATEGORY_VALUE}>
                    Tanpa Kategori
                  </SelectItem>
                  {categories
                    .filter((category) => category.type === "expense")
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </FieldRow>

            <div className="grid gap-1.5">
              <Label>Wallet</Label>
              <Select
                value={walletId}
                onValueChange={(value) => setWalletId(value ?? "")}
                items={walletItems}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih wallet" />
                </SelectTrigger>
                <SelectContent>
                  {activeWallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {extraction.items.length > 0 && (
              <div className="bg-muted/50 rounded-lg px-3 py-2 text-sm">
                <p className="text-muted-foreground mb-1 text-xs font-medium">
                  Item terbaca ({extraction.items.length})
                </p>
                <ul className="grid gap-0.5">
                  {extraction.items.slice(0, 8).map((item, index) => (
                    <li key={index} className="flex justify-between gap-2">
                      <span className="truncate">
                        {item.name}
                        {item.quantity ? ` × ${item.quantity}` : ""}
                      </span>
                      <span className="shrink-0 font-medium">
                        {formatRupiah(item.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
                {extraction.items.length > 8 && (
                  <p className="text-muted-foreground text-xs">
                    +{extraction.items.length - 8} item lainnya
                  </p>
                )}
              </div>
            )}

            <div className="grid gap-1.5">
              <Label htmlFor="receipt-description">Deskripsi</Label>
              <Textarea
                id="receipt-description"
                rows={2}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            {extraction.paymentMethod && (
              <p className="text-muted-foreground text-xs">
                Pembayaran terdeteksi: {extraction.paymentMethod}
              </p>
            )}

            {error && <ErrorBanner message={error} />}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  reset();
                  setStep("upload");
                }}
                disabled={isSaving}
              >
                Pindai Ulang
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Transaksi"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FieldRow({
  label,
  confidence,
  children,
}: {
  label: string;
  confidence: number;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <ConfidenceBadge value={confidence} />
      </div>
      {children}
    </div>
  );
}

function ConfidenceBadge({ value }: { value: number }) {
  if (value <= 0) {
    return null;
  }
  const percent = Math.round(value * 100);
  const tone =
    value >= 0.9
      ? "bg-success/10 text-success"
      : value >= 0.7
        ? "bg-warning/10 text-warning"
        : "bg-destructive/10 text-destructive";
  return (
    <span
      title="Tingkat keyakinan hasil pembacaan"
      className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", tone)}
    >
      {percent}%
    </span>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm"
    >
      {message}
    </p>
  );
}
