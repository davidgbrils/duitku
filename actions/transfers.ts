"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  createTransferSchema,
  updateTransferSchema,
  type CreateTransferInput,
  type UpdateTransferInput,
} from "@/lib/validations/transfer";

/** Hasil action: error user-friendly untuk form. */
export type TransferActionResult = {
  error?: string;
};

const SERVICE_UNAVAILABLE =
  "Layanan belum tersedia. Pastikan Supabase sudah dikonfigurasi.";

/** Path yang menampilkan saldo — revalidasi semua setelah mutasi. */
const AFFECTED_PATHS = ["/transfers", "/wallets", "/dashboard"];

export async function createTransferAction(
  input: CreateTransferInput
): Promise<TransferActionResult> {
  const parsed = createTransferSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid." };
  }

  try {
    const supabase = await createClient();
    // Ownership & atomicity ditangani di dalam RPC create_transfer.
    const { error } = await supabase.rpc("create_transfer", {
      p_source_wallet_id: parsed.data.sourceWalletId,
      p_destination_wallet_id: parsed.data.destinationWalletId,
      p_amount: Number(parsed.data.amount),
      p_description: parsed.data.description || null,
      p_transfer_date: parsed.data.transferDate,
    });

    if (error) {
      console.error("create_transfer error:", error);
      return { error: "Gagal menyimpan transfer. Silakan coba lagi." };
    }
  } catch {
    return { error: SERVICE_UNAVAILABLE };
  }

  for (const path of AFFECTED_PATHS) {
    revalidatePath(path);
  }
  return {};
}

export async function updateTransferAction(
  input: UpdateTransferInput
): Promise<TransferActionResult> {
  const parsed = updateTransferSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("update_transfer", {
      p_transfer_id: parsed.data.id,
      p_source_wallet_id: parsed.data.sourceWalletId,
      p_destination_wallet_id: parsed.data.destinationWalletId,
      p_amount: Number(parsed.data.amount),
      p_description: parsed.data.description || null,
      p_transfer_date: parsed.data.transferDate,
    });

    if (error) {
      console.error("update_transfer error:", error);
      return { error: "Gagal memperbarui transfer. Silakan coba lagi." };
    }
  } catch {
    return { error: SERVICE_UNAVAILABLE };
  }

  for (const path of AFFECTED_PATHS) {
    revalidatePath(path);
  }
  return {};
}

export async function deleteTransferAction(
  transferId: string
): Promise<TransferActionResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("delete_transfer", {
      p_transfer_id: transferId,
    });

    if (error) {
      console.error("delete_transfer error:", error);
      return { error: "Gagal menghapus transfer. Silakan coba lagi." };
    }
  } catch {
    return { error: SERVICE_UNAVAILABLE };
  }

  for (const path of AFFECTED_PATHS) {
    revalidatePath(path);
  }
  return {};
}
