"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "@/lib/validations/category";

/** Hasil action: error user-friendly untuk form. */
export type CategoryActionResult = {
  error?: string;
};

const SERVICE_UNAVAILABLE =
  "Layanan belum tersedia. Pastikan Supabase sudah dikonfigurasi.";

/** Pesan yang disesuaikan untuk error unik (user_id, type, name). */
function categoryErrorMessage(error: { code?: string }): string {
  return error.code === "23505"
    ? "Kategori dengan nama yang sama sudah ada."
    : "Gagal menyimpan kategori. Silakan coba lagi.";
}

export async function createCategoryAction(
  input: CreateCategoryInput
): Promise<CategoryActionResult> {
  const parsed = createCategorySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Sesi berakhir. Silakan login ulang." };
    }

    const { error } = await supabase.from("categories").insert({
      user_id: user.id,
      name: parsed.data.name,
      type: parsed.data.type,
    });

    if (error) {
      console.error("create category error:", error);
      return { error: categoryErrorMessage(error) };
    }
  } catch {
    return { error: SERVICE_UNAVAILABLE };
  }

  revalidatePath("/categories");
  revalidatePath("/transactions");
  return {};
}

export async function updateCategoryAction(
  input: UpdateCategoryInput
): Promise<CategoryActionResult> {
  const parsed = updateCategorySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Sesi berakhir. Silakan login ulang." };
    }

    // Filter user_id sebagai defense-in-depth (RLS sudah membatasi).
    const { error } = await supabase
      .from("categories")
      .update({ name: parsed.data.name, type: parsed.data.type })
      .eq("id", parsed.data.id)
      .eq("user_id", user.id);

    if (error) {
      console.error("update category error:", error);
      return { error: categoryErrorMessage(error) };
    }
  } catch {
    return { error: SERVICE_UNAVAILABLE };
  }

  revalidatePath("/categories");
  revalidatePath("/transactions");
  return {};
}

export async function deleteCategoryAction(
  categoryId: string
): Promise<CategoryActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Sesi berakhir. Silakan login ulang." };
    }

    // Transaksi yang memakai kategori ini akan kehilangan kategori (FK set null).
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId)
      .eq("user_id", user.id);

    if (error) {
      console.error("delete category error:", error);
      return { error: "Gagal menghapus kategori. Silakan coba lagi." };
    }
  } catch {
    return { error: SERVICE_UNAVAILABLE };
  }

  revalidatePath("/categories");
  revalidatePath("/transactions");
  return {};
}
