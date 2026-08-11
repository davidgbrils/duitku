"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import {
  createCategoryAction,
  updateCategoryAction,
} from "@/actions/categories";
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
import {
  CATEGORY_TYPES,
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "@/lib/validations/category";
import type { Database } from "@/types/database";

type Category = Database["public"]["Tables"]["categories"]["Row"];

const typeLabels: Record<(typeof CATEGORY_TYPES)[number], string> = {
  income: "Pemasukan",
  expense: "Pengeluaran",
};

export function CreateCategoryDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus />
            Tambah Kategori
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Kategori</DialogTitle>
          <DialogDescription>
            Kelompokkan transaksimu agar lebih mudah dipahami, mis. Gaji atau
            Makanan.
          </DialogDescription>
        </DialogHeader>
        <CategoryForm onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

export function EditCategoryDialog({ category }: { category: Category }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm">
            <Pencil />
            <span className="sr-only">Edit {category.name}</span>
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Kategori</DialogTitle>
          <DialogDescription>
            Perbarui nama atau tipe kategori.
          </DialogDescription>
        </DialogHeader>
        <CategoryForm category={category} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function CategoryForm({
  category,
  onDone,
}: {
  category?: Category;
  onDone: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEdit = Boolean(category);
  const schema = isEdit ? updateCategorySchema : createCategorySchema;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateCategoryInput | UpdateCategoryInput>({
    resolver: zodResolver(schema),
    defaultValues: category
      ? { id: category.id, name: category.name, type: category.type }
      : { name: "", type: "expense" },
  });

  const onSubmit = handleSubmit((values) => {
    setError(null);
    startTransition(async () => {
      const result = category
        ? await updateCategoryAction(values as UpdateCategoryInput)
        : await createCategoryAction(values as CreateCategoryInput);
      if (result?.error) {
        setError(result.error);
        return;
      }
      onDone();
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <FormError error={error} />

      <div className="grid gap-1.5">
        <Label htmlFor="category-name">Nama Kategori</Label>
        <Input
          id="category-name"
          placeholder="mis. Gaji, Makanan, Transportasi"
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-destructive text-xs">{errors.name.message}</p>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label>Tipe</Label>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(value) =>
                field.onChange(value as (typeof CATEGORY_TYPES)[number])
              }
              // Base UI menampilkan label hanya jika `items` diberikan ke Root.
              items={typeLabels}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {typeLabels[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <Button type="submit" disabled={isPending} className="mt-2 w-full">
        {isPending ? (
          <>
            <Loader2 className="animate-spin" />
            Menyimpan...
          </>
        ) : isEdit ? (
          "Simpan Perubahan"
        ) : (
          "Simpan Kategori"
        )}
      </Button>
    </form>
  );
}

function FormError({ error }: { error: string | null }) {
  if (!error) {
    return null;
  }
  return (
    <p
      role="alert"
      className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm"
    >
      {error}
    </p>
  );
}
