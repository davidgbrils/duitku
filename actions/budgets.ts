"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { budgetSchema, type BudgetInput } from "@/lib/validations/budget";

export type BudgetActionResult = {
  error?: string;
  success?: string;
};

export async function upsertBudgetAction(input: BudgetInput): Promise<BudgetActionResult> {
  const parsed = budgetSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input anggaran tidak valid." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: "Anda harus login terlebih dahulu." };
    }

    // Cek apakah kategori valid dan milik user
    const { data: category, error: catError } = await supabase
      .from("categories")
      .select("id")
      .eq("id", parsed.data.categoryId)
      .eq("user_id", user.id)
      .eq("type", "expense")
      .single();

    if (catError || !category) {
      return { error: "Kategori tidak valid atau bukan milik Anda." };
    }

    // Gunakan upsert dengan RLS (user_id akan otomatis dari auth.uid())
    const { error } = await supabase.from("budgets").upsert(
      {
        user_id: user.id,
        category_id: parsed.data.categoryId,
        amount_limit: Number(parsed.data.amountLimit),
        month_year: parsed.data.monthYear,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,category_id,month_year",
      }
    );

    if (error) {
      console.error("Upsert Budget Error:", error);
      
      // Handle specific errors
      if (error.code === "23505") {
        return { error: "Anggaran untuk kategori dan bulan ini sudah ada." };
      }
      
      if (error.code === "42501") {
        return { error: "Anda tidak memiliki izin untuk menyimpan anggaran." };
      }
      
      return { error: "Gagal menyimpan batas anggaran. Silakan coba lagi." };
    }

    revalidatePath("/budgets");
    revalidatePath("/dashboard");
    
    return { success: "Batas anggaran bulanan berhasil disimpan." };
  } catch (err) {
    console.error("Upsert Budget Action Error:", err);
    return { error: "Terjadi kesalahan sistem saat menyimpan anggaran." };
  }
}

export async function deleteBudgetAction(budgetId: string): Promise<BudgetActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: "Anda harus login terlebih dahulu." };
    }

    const { error } = await supabase
      .from("budgets")
      .delete()
      .eq("id", budgetId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Delete Budget Error:", error);
      return { error: "Gagal menghapus batas anggaran." };
    }

    revalidatePath("/budgets");
    revalidatePath("/dashboard");
    
    return { success: "Batas anggaran berhasil dihapus." };
  } catch (err) {
    console.error("Delete Budget Action Error:", err);
    return { error: "Terjadi kesalahan sistem." };
  }
}
