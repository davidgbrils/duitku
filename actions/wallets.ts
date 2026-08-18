"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  createWalletSchema,
  updateWalletSchema,
  adjustWalletBalanceSchema,
  type CreateWalletInput,
  type UpdateWalletInput,
  type AdjustWalletBalanceInput,
} from "@/lib/validations/wallet";

/** Hasil action: error user-friendly untuk form. */
export type WalletActionResult = {
  error?: string;
};

const SERVICE_UNAVAILABLE =
  "Layanan belum tersedia. Pastikan Supabase sudah dikonfigurasi.";

export async function createWalletAction(
  input: CreateWalletInput
): Promise<WalletActionResult> {
  const parsed = createWalletSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid." };
  }

  const initialBalance = Number(parsed.data.initialBalance);

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("create_wallet", {
      p_name: parsed.data.name,
      p_type: parsed.data.type,
      p_currency: parsed.data.currency,
      p_initial_balance: initialBalance,
    });

    if (error) {
      console.error("create_wallet error:", error);
      return { error: "Gagal menyimpan wallet. Silakan coba lagi." };
    }
  } catch {
    return { error: SERVICE_UNAVAILABLE };
  }

  revalidatePath("/wallets");
  return {};
}

export async function updateWalletAction(
  input: UpdateWalletInput
): Promise<WalletActionResult> {
  const parsed = updateWalletSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("update_wallet", {
      p_wallet_id: parsed.data.id,
      p_name: parsed.data.name,
      p_type: parsed.data.type,
      p_currency: parsed.data.currency,
      p_is_active: parsed.data.isActive,
    });

    if (error) {
      console.error("update_wallet error:", error);
      return { error: "Gagal memperbarui wallet. Silakan coba lagi." };
    }
  } catch {
    return { error: SERVICE_UNAVAILABLE };
  }

  revalidatePath("/wallets");
  return {};
}

export async function deleteWalletAction(
  walletId: string
): Promise<WalletActionResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("delete_wallet", {
      p_wallet_id: walletId,
    });

    if (error) {
      console.error("delete_wallet error:", error);
      return { error: "Gagal menghapus wallet. Silakan coba lagi." };
    }
  } catch {
    return { error: SERVICE_UNAVAILABLE };
  }

  revalidatePath("/wallets");
  return {};
}

export async function adjustWalletBalanceAction(
  input: AdjustWalletBalanceInput
): Promise<WalletActionResult> {
  const parsed = adjustWalletBalanceSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid." };
  }

  const newBalance = Number(parsed.data.newBalance);

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("adjust_wallet_balance", {
      p_wallet_id: parsed.data.id,
      p_new_balance: newBalance,
      p_notes: parsed.data.notes || null,
    });

    if (error) {
      console.error("adjust_wallet_balance error:", error);
      return { error: "Gagal menyesuaikan saldo wallet. Silakan coba lagi." };
    }
  } catch {
    return { error: SERVICE_UNAVAILABLE };
  }

  revalidatePath("/wallets");
  revalidatePath("/dashboard");
  return {};
}
