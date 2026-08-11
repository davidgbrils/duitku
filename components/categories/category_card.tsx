"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Tag, Trash2 } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Database } from "@/types/database";

import { EditCategoryDialog } from "@/features/categories/category_form";

type Category = Database["public"]["Tables"]["categories"]["Row"];

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
    <Card>
      <CardContent className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-lg">
            <Tag className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{category.name}</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <Badge
                variant={isIncome ? "default" : "destructive"}
                className={isIncome ? "bg-success/10 text-success" : undefined}
              >
                {isIncome ? "Pemasukan" : "Pengeluaran"}
              </Badge>
              {category.is_default && (
                <span className="text-muted-foreground text-xs">Default</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <EditCategoryDialog category={category} />
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="ghost" size="icon-sm">
                  <Trash2 />
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
                  className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm"
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
                      <Loader2 className="animate-spin" />
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
      </CardContent>
    </Card>
  );
}
