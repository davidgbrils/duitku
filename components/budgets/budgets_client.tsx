"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Loader2,
  PieChart,
  Plus,
  ShieldAlert,
  Trash2,
} from "lucide-react";

import { deleteBudgetAction, upsertBudgetAction } from "@/actions/budgets";
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
import { formatRupiah } from "@/lib/utils/money";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

type Budget = Database["public"]["Tables"]["budgets"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

export function BudgetsClient({
  budgets,
  categories,
  categorySpentMap,
  currentMonthYear,
}: {
  budgets: Budget[];
  categories: Category[];
  categorySpentMap: Record<string, number>;
  currentMonthYear: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [isOpen, setIsOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const categoryItems = Object.fromEntries(
    expenseCategories.map((c) => [c.id, c.name])
  );
  const [categoryId, setCategoryId] = useState("");
  const [amountLimit, setAmountLimit] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const totalLimit = budgets.reduce((sum, b) => sum + Number(b.amount_limit), 0);
  const totalSpentInBudgetedCategories = budgets.reduce(
    (sum, b) => sum + (categorySpentMap[b.category_id] ?? 0),
    0
  );

  function openCreateModal() {
    setEditingBudget(null);
    setCategoryId(expenseCategories[0]?.id ?? "");
    setAmountLimit("");
    setError(null);
    setSuccessMsg(null);
    setIsOpen(true);
  }

  function openEditModal(budget: Budget) {
    setEditingBudget(budget);
    setCategoryId(budget.category_id);
    setAmountLimit(String(budget.amount_limit));
    setError(null);
    setSuccessMsg(null);
    setIsOpen(true);
  }

  function handleSaveBudget() {
    setError(null);
    setSuccessMsg(null);

    if (!categoryId) {
      setError("Silakan pilih kategori pengeluaran.");
      return;
    }

    if (!amountLimit || Number(amountLimit) <= 0) {
      setError("Batas anggaran harus lebih dari 0.");
      return;
    }

    startTransition(async () => {
      const res = await upsertBudgetAction({
        categoryId,
        amountLimit,
        monthYear: currentMonthYear,
      });

      if (res?.error) {
        setError(res.error);
        return;
      }

      if (res?.success) {
        setSuccessMsg(res.success);
        setTimeout(() => {
          setIsOpen(false);
          router.refresh();
        }, 1500);
      }
    });
  }

  function handleDeleteBudget(budgetId: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus batas anggaran ini?")) {
      return;
    }
    startTransition(async () => {
      const res = await deleteBudgetAction(budgetId);
      if (res?.error) {
        alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Total Limit Anggaran ({currentMonthYear})
              </p>
              <p className="text-xl font-bold text-primary mt-1 tabular-nums">
                {formatRupiah(totalLimit)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <PieChart className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Pengeluaran Terpakai
              </p>
              <p className="text-xl font-bold text-foreground mt-1 tabular-nums">
                {formatRupiah(totalSpentInBudgetedCategories)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-muted text-muted-foreground">
              <CheckCircle2 className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight">Anggaran Kategori</h2>
        <Button onClick={openCreateModal} className="gap-2 shadow-sm font-semibold">
          <Plus className="size-4" />
          Pasang Anggaran
        </Button>
      </div>

      {/* Budget Items */}
      {budgets.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center justify-center gap-2">
            <PieChart className="size-10 text-muted-foreground/60" />
            <p className="text-sm font-semibold text-foreground">Belum Ada Anggaran Ditetapkan</p>
            <p className="text-xs text-muted-foreground max-w-sm">
              Pasang batas anggaran bulanan per kategori untuk mengontrol pengeluaran Anda.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {budgets.map((budget) => {
            const category = categories.find((c) => c.id === budget.category_id);
            const limit = Number(budget.amount_limit);
            const spent = categorySpentMap[budget.category_id] ?? 0;
            const percent = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;
            const exactRatio = limit > 0 ? (spent / limit) * 100 : 0;

            // Indicator Colors
            let barColor = "bg-emerald-500";
            let badgeText = "Aman";
            let badgeTone = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
            let IconComponent = CheckCircle2;

            if (exactRatio >= 100) {
              barColor = "bg-rose-500";
              badgeText = "Melebihi Limit!";
              badgeTone = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
              IconComponent = ShieldAlert;
            } else if (exactRatio >= 80) {
              barColor = "bg-amber-500";
              badgeText = "Mendekati Limit";
              badgeTone = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
              IconComponent = AlertTriangle;
            }

            return (
              <Card key={budget.id} className="hover:border-primary/30 transition-all">
                <CardContent className="p-4 sm:p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-base">
                        {category?.name ?? "Kategori"}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                          badgeTone
                        )}
                      >
                        <IconComponent className="size-3" />
                        {badgeText} ({Math.round(exactRatio)}%)
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditModal(budget)}
                        className="size-8"
                      >
                        <Edit2 className="size-3.5 text-muted-foreground" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="size-8 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar Visual */}
                  <div className="space-y-1.5">
                    <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn("h-full transition-all duration-500 rounded-full", barColor)}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                      <span>Terpakai: <strong>{formatRupiah(spent)}</strong></span>
                      <span>Batas Limit: <strong>{formatRupiah(limit)}</strong></span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog Form Tambah / Edit Anggaran */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md rounded-2xl p-5">
          <DialogHeader>
            <DialogTitle>
              {editingBudget ? "Edit Batas Anggaran" : "Pasang Batas Anggaran Bulanan"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Tentukan batas maksimal pengeluaran untuk kategori tertentu pada bulan ini ({currentMonthYear}).
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {error && (
              <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20 flex items-start gap-2">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs font-medium border border-emerald-500/20 flex items-start gap-2">
                <span className="shrink-0 mt-0.5">✓</span>
                <span>{successMsg}</span>
              </div>
            )}

            {expenseCategories.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-500/10 text-amber-600 text-xs font-medium border border-amber-500/20">
                Belum ada kategori pengeluaran. Silakan buat kategori pengeluaran terlebih dahulu di halaman Kategori.
              </div>
            ) : (
              <>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold">Kategori Pengeluaran</Label>
                  <Select
                    value={categoryId}
                    onValueChange={(val) => setCategoryId(val ?? "")}
                    disabled={Boolean(editingBudget)}
                    items={categoryItems}
                  >
                    <SelectTrigger className="h-10 text-sm">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {editingBudget && (
                    <p className="text-xs text-muted-foreground">
                      Kategori tidak dapat diubah saat edit. Hapus dan buat anggaran baru jika perlu.
                    </p>
                  )}
                </div>

                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold">Batas Limit Anggaran (Rp)</Label>
                  <Input
                    inputMode="numeric"
                    value={amountLimit}
                    onChange={(e) => setAmountLimit(e.target.value)}
                    placeholder="Contoh: 1500000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Masukkan batas maksimal pengeluaran untuk kategori ini di bulan {currentMonthYear}.
                  </p>
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button 
                onClick={handleSaveBudget} 
                disabled={isPending || expenseCategories.length === 0}
              >
                {isPending && <Loader2 className="size-4 animate-spin mr-1.5" />}
                Simpan Anggaran
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
