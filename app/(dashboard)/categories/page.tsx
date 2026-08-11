import { redirect } from "next/navigation";

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
          <h1 className="text-2xl font-semibold tracking-tight">Kategori</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Kelompokkan pemasukan dan pengeluaranmu
          </p>
        </div>
        <CreateCategoryDialog />
      </div>

      {categoryList.length === 0 ? (
        <div className="bg-card ring-border flex flex-col items-center gap-3 rounded-xl px-6 py-14 text-center ring-1">
          <p className="text-base font-medium">Belum ada Kategori</p>
          <p className="text-muted-foreground max-w-sm text-sm">
            Tambahkan kategori agar transaksimu lebih mudah dipahami.
          </p>
          <div className="mt-2">
            <CreateCategoryDialog />
          </div>
        </div>
      ) : (
        <>
          <CategorySection
            title="Kategori Pemasukan"
            count={incomeCategories.length}
            categories={incomeCategories}
          />
          <CategorySection
            title="Kategori Pengeluaran"
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
      <h2 className="text-muted-foreground text-sm font-medium">
        {title} <span className="text-muted-foreground/60">({count})</span>
      </h2>
      <Reveal>
        <div className="grid gap-3 sm:grid-cols-2">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </Reveal>
    </section>
  );
}
