"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Edit2,
  Loader2,
  PieChart,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { deleteBudgetAction, upsertBudgetAction } from "@/actions/budgets";
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
import { formatRupiah } from "@/lib/utils/money";
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

  // State dialog
  const [isOpen, setIsOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const categoryItems = Object.fromEntries(
    expenseCategories.map((c) => [c.id, c.name])
  );
  
  // Form state
  const [categoryId, setCategoryId] = useState("");
  const [amountLimit, setAmountLimit] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Stats calculation
  const totalLimit = budgets.reduce((sum, b) => sum + Number(b.amount_limit), 0);
  const totalSpentInBudgetedCategories = budgets.reduce((sum, b) => {
    return sum + (categorySpentMap[b.category_id] ?? 0);
  }, 0);

  const filteredBudgets = budgets.filter((b) => {
    const cat = categories.find((c) => c.id === b.category_id);
    const name = cat?.name ?? "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                TOTAL BUDGET LIMIT ({currentMonthYear})
              </p>
              <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums">
                {formatRupiah(totalLimit)}
              </p>
            </div>
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 text-indigo-600 shadow-sm dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-400">
              <Clock className="size-5" />
            </div>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full rounded-full bg-indigo-600 w-full" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                BUDGET USED
              </p>
              <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums">
                {formatRupiah(totalSpentInBudgetedCategories)}
              </p>
            </div>
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-600 shadow-sm dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400">
              <CheckCircle2 className="size-5" />
            </div>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${totalLimit > 0 ? Math.min(100, Math.round((totalSpentInBudgetedCategories / totalLimit) * 100)) : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Action Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Advanced Budget Planning
          </h2>
          <p className="text-xs text-slate-500">
            Manage your monthly spending with precision.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-56">
            <Search className="size-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-full text-xs h-9 bg-slate-50/70 dark:bg-slate-800/70"
            />
          </div>
          <Button onClick={openCreateModal} className="shrink-0 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 gap-1.5 shadow-sm">
            <Plus className="size-4" />
            + Set Budget
          </Button>
        </div>
      </div>

      {/* Budget Items */}
      {filteredBudgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200/90 bg-white p-12 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex size-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <PieChart className="size-6 text-slate-400" />
          </div>
          <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
            {searchQuery ? `Tidak ada anggaran untuk "${searchQuery}"` : "No Budget Set Yet"}
          </p>
          <p className="text-xs text-slate-500 max-w-sm">
            {searchQuery
              ? "Coba cari dengan kata kunci kategori lain atau tambahkan anggaran baru."
              : "Set monthly limits per category to control your spending."}
          </p>
          {!searchQuery && (
            <Button onClick={openCreateModal} className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 gap-1.5 shadow-sm mt-1">
              <Plus className="size-4" />
              + Set Budget
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBudgets.map((budget) => {
            const category = categories.find((c) => c.id === budget.category_id);
            const limit = Number(budget.amount_limit);
            const spent = categorySpentMap[budget.category_id] ?? 0;
            const remaining = Math.max(0, limit - spent);
            const percentUsed = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
            const percentLeft = Math.max(0, 100 - percentUsed);

            return (
              <div
                key={budget.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                        <PieChart className="size-4.5" />
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white text-base">
                        {category?.name ?? "Kategori"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditModal(budget)}
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

                  <p className="text-xs text-slate-500 font-medium">
                    Used: {formatRupiah(spent)} of {formatRupiah(limit)}
                  </p>

                  {/* Gradient Progress Bar */}
                  <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percentUsed >= 100
                          ? "bg-rose-500"
                          : percentUsed >= 80
                          ? "bg-amber-500"
                          : "bg-gradient-to-r from-blue-500 to-emerald-400"
                      }`}
                      style={{ width: `${percentUsed}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <p className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums">
                    {formatRupiah(remaining)} <span className="text-xs font-normal text-slate-500">Remaining</span>
                  </p>
                  <span className="text-xs font-semibold text-slate-500 tabular-nums">
                    {percentLeft}% Left
                  </span>
                </div>
              </div>
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
