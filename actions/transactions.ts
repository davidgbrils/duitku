"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  createTransactionSchema,
  updateTransactionSchema,
  NO_CATEGORY_VALUE,
  type CreateTransactionInput,
  type UpdateTransactionInput,
} from "@/lib/validations/transaction";

/** Hasil action: error user-friendly untuk form. */
export type TransactionActionResult = {
  error?: string;
};

const SERVICE_UNAVAILABLE =
  "Layanan belum tersedia. Pastikan Supabase sudah dikonfigurasi.";

/** Path yang menampilkan data transaksi/saldo — revalidasi semua setelah mutasi. */
const AFFECTED_PATHS = ["/transactions", "/wallets", "/dashboard"];

export async function createTransactionAction(
  input: CreateTransactionInput
): Promise<TransactionActionResult> {
  const parsed = createTransactionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid." };
  }

  try {
    const supabase = await createClient();
    // Ownership wallet/kategori divalidasi di dalam RPC (auth.uid()).
    const { error } = await supabase.rpc("create_transaction", {
      p_type: parsed.data.type,
      p_wallet_id: parsed.data.walletId,
      p_category_id:
        parsed.data.categoryId === NO_CATEGORY_VALUE
          ? null
          : parsed.data.categoryId,
      p_amount: Number(parsed.data.amount),
      p_description: parsed.data.description || null,
      p_transaction_date: parsed.data.transactionDate,
    });

    if (error) {
      console.error("create_transaction error:", error);
      return { error: "Gagal menyimpan transaksi. Silakan coba lagi." };
    }
  } catch {
    return { error: SERVICE_UNAVAILABLE };
  }

  revalidatePath("/transactions");
  revalidatePath("/wallets");
  revalidatePath("/dashboard");
  return {};
}

export async function updateTransactionAction(
  input: UpdateTransactionInput
): Promise<TransactionActionResult> {
  const parsed = updateTransactionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("update_transaction", {
      p_tx_id: parsed.data.id,
      p_type: parsed.data.type,
      p_wallet_id: parsed.data.walletId,
      p_category_id:
        parsed.data.categoryId === NO_CATEGORY_VALUE
          ? null
          : parsed.data.categoryId,
      p_amount: Number(parsed.data.amount),
      p_description: parsed.data.description || null,
      p_transaction_date: parsed.data.transactionDate,
    });

    if (error) {
      console.error("update_transaction error:", error);
      return { error: "Gagal memperbarui transaksi. Silakan coba lagi." };
    }
  } catch {
    return { error: SERVICE_UNAVAILABLE };
  }

  for (const path of AFFECTED_PATHS) {
    revalidatePath(path);
  }
  return {};
}

export async function deleteTransactionAction(
  transactionId: string
): Promise<TransactionActionResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("delete_transaction", {
      p_tx_id: transactionId,
    });

    if (error) {
      console.error("delete_transaction error:", error);
      return { error: "Gagal menghapus transaksi. Silakan coba lagi." };
    }
  } catch {
    return { error: SERVICE_UNAVAILABLE };
  }

  for (const path of AFFECTED_PATHS) {
    revalidatePath(path);
  }
  return {};
}
