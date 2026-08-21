import { redirect } from "next/navigation";
import { Tags } from "lucide-react";

import { Reveal } from "@/components/animations/reveal";
import { CategoryCard } from "@/components/categories/category_card";
import { CreateCategoryDialog } from "@/features/categories/category_form";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";

type Category = Database["public"]["Tables"]["categories"]["Row"];

export default async function CategoriesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("type", { ascending: true })
    .order("name", { ascending: true });

  const categoryList = categories ?? [];
  const incomeCategories = categoryList.filter(
    (category) => category.type === "income"
  );
  const expenseCategories = categoryList.filter(
    (category) => category.type === "expense"
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Duitku Category Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola kategori pemasukan dan pengeluaranmu untuk pelacakan yang lebih baik.
          </p>
        </div>
        <CreateCategoryDialog />
      </div>

      {categoryList.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200/90 bg-white px-6 py-14 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex size-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Tags className="size-6 text-slate-400" />
          </div>
          <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
            Belum ada Kategori
          </p>
          <p className="text-xs text-slate-500 max-w-sm">
            Tambahkan kategori agar transaksimu lebih mudah dipahami.
          </p>
          <div className="mt-2">
            <CreateCategoryDialog />
          </div>
        </div>
      ) : (
        <>
          <CategorySection
            title="Income Categories"
            count={incomeCategories.length}
            categories={incomeCategories}
          />
          <CategorySection
            title="Expense Categories"
            count={expenseCategories.length}
            categories={expenseCategories}
          />
        </>
      )}
    </div>
  );
}

function CategorySection({
  title,
  count,
  categories,
}: {
  title: string;
  count: number;
  categories: Category[];
}) {
  if (categories.length === 0) {
    return null;
  }
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-bold text-slate-900 dark:text-white">
        {title} <span className="text-slate-400 text-xs font-normal">({count})</span>
      </h2>
      <Reveal>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </Reveal>
    </section>
  );
}
