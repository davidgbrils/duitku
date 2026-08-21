"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Bus,
  Film,
  Gift,
  GraduationCap,
  HeartPulse,
  Loader2,
  Receipt,
  ShoppingCart,
  Tag,
  Trash2,
  Utensils,
} from "lucide-react";

import { deleteCategoryAction } from "@/actions/categories";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database";

import { EditCategoryDialog } from "@/features/categories/category_form";

type Category = Database["public"]["Tables"]["categories"]["Row"];

function renderCategoryIcon(name: string, isIncome: boolean, className = "size-5") {
  const lower = name.toLowerCase();
  if (lower.includes("gaji") || lower.includes("salary")) return <Briefcase className={className} />;
  if (lower.includes("bonus") || lower.includes("hadiah")) return <Gift className={className} />;
  if (lower.includes("belanja") || lower.includes("shop")) return <ShoppingCart className={className} />;
  if (lower.includes("tagih") || lower.includes("bill") || lower.includes("rumah")) return <Receipt className={className} />;
  if (lower.includes("makan") || lower.includes("food") || lower.includes("resto")) return <Utensils className={className} />;
  if (lower.includes("trans") || lower.includes("bensin") || lower.includes("bus")) return <Bus className={className} />;
  if (lower.includes("sehat") || lower.includes("obat") || lower.includes("medis")) return <HeartPulse className={className} />;
  if (lower.includes("didik") || lower.includes("kuliah") || lower.includes("sekolah")) return <GraduationCap className={className} />;
  if (lower.includes("hibur") || lower.includes("game") || lower.includes("nonton")) return <Film className={className} />;
  return isIncome ? <Briefcase className={className} /> : <Tag className={className} />;
}

export function CategoryCard({ category }: { category: Category }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isIncome = category.type === "income";

  const handleDelete = () => {
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteCategoryAction(category.id);
      if (result?.error) {
        setDeleteError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="space-y-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {renderCategoryIcon(category.name, isIncome)}
        </div>
        <p className="text-base font-semibold text-slate-900 dark:text-white truncate">
          {category.name}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
            isIncome
              ? "bg-indigo-600 text-white shadow-2xs dark:bg-indigo-500"
              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          {isIncome ? "Pemasukan" : "Pengeluaran"}
        </span>

        <div className="flex items-center gap-1.5">
          <EditCategoryDialog category={category} />
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="size-8 rounded-full border border-indigo-200/80 bg-indigo-50/60 text-indigo-600 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400"
                >
                  <Trash2 className="size-3.5" />
                  <span className="sr-only">Hapus {category.name}</span>
                </Button>
              }
            />
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus kategori?</AlertDialogTitle>
                <AlertDialogDescription>
                  Kategori <strong>{category.name}</strong> akan dihapus.
                  Transaksi yang memakainya tetap tersimpan tanpa kategori.
                </AlertDialogDescription>
              </AlertDialogHeader>
              {deleteError && (
                <p
                  role="alert"
                  className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
                >
                  {deleteError}
                </p>
              )}
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={isPending}
                  onClick={handleDelete}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="animate-spin mr-1" />
                      Menghapus...
                    </>
                  ) : (
                    "Hapus"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
