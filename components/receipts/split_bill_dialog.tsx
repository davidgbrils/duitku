"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Users, HandCoins, Scale } from "lucide-react";

import { createSplitBillAction } from "@/actions/split_bill";
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
import { formatRupiah } from "@/lib/utils/money";
import { cn } from "@/lib/utils";

type SplitMode = "equal" | "custom";

type MemberRow = { key: string; name: string; amount: string };

function newKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function SplitBillDialog({
  transactionId,
  totalAmount,
  trigger,
}: {
  transactionId: string;
  totalAmount: number;
  trigger?: React.ReactElement;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<SplitMode>("equal");
  const [members, setMembers] = useState<MemberRow[]>([
    { key: newKey(), name: "", amount: "" },
  ]);
  const [createReceivables, setCreateReceivables] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setMode("equal");
    setMembers([{ key: newKey(), name: "", amount: "" }]);
    setCreateReceivables(true);
    setError(null);
  }

  function openDialog(next: boolean) {
    setOpen(next);
    if (next) {
      reset();
    }
  }

  function applyEqualSplit() {
    const count = members.length;
    if (count === 0) {
      return;
    }
    const perPerson = Math.floor((totalAmount / count) * 100) / 100;
    const updated = members.map((m, idx) => {
      const isLast = idx === count - 1;
      const remainder = isLast
        ? Math.round((totalAmount - perPerson * (count - 1)) * 100) / 100
        : perPerson;
      return { ...m, amount: String(remainder) };
    });
    setMembers(updated);
  }

  function addMember() {
    setMembers((prev) => [...prev, { key: newKey(), name: "", amount: "" }]);
  }

  function removeMember(key: string) {
    setMembers((prev) => prev.filter((m) => m.key !== key));
  }

  function updateMember(key: string, field: "name" | "amount", value: string) {
    setMembers((prev) =>
      prev.map((m) => (m.key === key ? { ...m, [field]: value } : m))
    );
  }

  const totalSplit = members.reduce(
    (sum, m) => sum + (Number(m.amount) || 0),
    0
  );
  const ownShare = totalAmount - totalSplit;
  const hasOverflow = totalSplit > totalAmount;

  function handleSubmit() {
    setError(null);

    const normalized = members.filter((m) => m.name.trim());
    if (normalized.length === 0) {
      setError("Tambahkan minimal satu nama teman.");
      return;
    }
    const invalidAmount = normalized.some(
      (m) => !m.amount.trim() || Number(m.amount) <= 0
    );
    if (invalidAmount) {
      setError("Setiap anggota harus memiliki nominal lebih dari 0.");
      return;
    }
    if (hasOverflow) {
      setError("Total pembagian melebihi nominal belanja.");
      return;
    }

    startTransition(async () => {
      const res = await createSplitBillAction({
        transactionId,
        members: normalized.map((m) => ({ name: m.name, amount: m.amount })),
        createReceivables,
        notes: `Split bill ${formatRupiah(totalAmount)}`,
      });

      if (res?.error) {
        setError(res.error);
        return;
      }

      setOpen(false);
      reset();
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={openDialog}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent className="max-w-md rounded-2xl p-5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="size-5 text-primary" />
            Bagi Tagihan (Split Bill)
          </DialogTitle>
          <DialogDescription className="text-xs">
            Bagi total belanja{" "}
            <strong className="text-foreground">{formatRupiah(totalAmount)}</strong>{" "}
            dengan temanmu. Bagian teman otomatis dapat dicatat sebagai piutang.
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

          {/* Mode */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-muted/40 rounded-xl border">
            <button
              type="button"
              onClick={() => setMode("equal")}
              className={cn(
                "flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all",
                mode === "equal"
                  ? "bg-card text-primary shadow-sm border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Scale className="size-4" />
              Bagi Rata
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("custom");
                if (members.length === 1 && !members[0].name) {
                  setMembers([
                    { key: newKey(), name: "", amount: String(totalAmount) },
                  ]);
                }
              }}
              className={cn(
                "flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all",
                mode === "custom"
                  ? "bg-card text-primary shadow-sm border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <HandCoins className="size-4" />
              Bagi Manual
            </button>
          </div>

          {/* Members */}
          <div className="grid gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
            {members.map((member) => (
              <div key={member.key} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
                <Input
                  value={member.name}
                  onChange={(e) =>
                    updateMember(member.key, "name", e.target.value)
                  }
                  placeholder="Nama teman (mis. Budi)"
                  className="h-9 text-sm"
                />
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    Rp
                  </span>
                  <Input
                    inputMode="decimal"
                    value={member.amount}
                    onChange={(e) =>
                      updateMember(member.key, "amount", e.target.value)
                    }
                    placeholder="0"
                    className="h-9 text-sm pl-9 w-28"
                  />
                </div>
                {members.length > 1 && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-8 text-destructive hover:bg-destructive/10"
                    onClick={() => removeMember(member.key)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {mode === "equal" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 w-full"
              onClick={applyEqualSplit}
            >
              <Scale className="size-4" />
              Hitung Bagi Rata (Otomatis)
            </Button>
          )}

          <Button type="button" variant="outline" size="sm" className="gap-1.5 w-full" onClick={addMember}>
            <Plus className="size-4" />
            Tambah Teman
          </Button>

          {/* Ringkasan */}
          <div className="rounded-xl bg-muted/40 p-3 grid gap-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Belanja</span>
              <span className="font-semibold">{formatRupiah(totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bagian Teman</span>
              <span className="font-semibold">{formatRupiah(totalSplit)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t">
              <span className="font-semibold">Bagian Anda</span>
              <span
                className={cn(
                  "font-bold",
                  ownShare < 0
                    ? "text-destructive"
                    : "text-primary"
                )}
              >
                {formatRupiah(Math.max(ownShare, 0))}
                {ownShare < 0 && " (melebihi!)"}
              </span>
            </div>
          </div>

          {/* Piutang option */}
          <label className="flex items-start gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={createReceivables}
              onChange={(e) => setCreateReceivables(e.target.checked)}
              className="accent-primary size-4 mt-0.5"
            />
            <span>
              Catat bagian teman sebagai <strong>Piutang</strong> (muncul di
              halaman Piutang untuk dilunasi)
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin mr-1.5" />}
              Simpan Pembagian
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}