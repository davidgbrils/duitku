"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  createSplitBillSchema,
  type CreateSplitBillInput,
} from "@/lib/validations/split_bill";

export type SplitBillActionResult = {
  error?: string;
  splitBillId?: string;
};

const SERVICE_UNAVAILABLE =
  "Layanan belum tersedia. Pastikan Supabase sudah dikonfigurasi.";

export async function createSplitBillAction(
  input: CreateSplitBillInput
): Promise<SplitBillActionResult> {
  const parsed = createSplitBillSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input split bill tidak valid." };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("create_split_bill", {
      p_transaction_id: parsed.data.transactionId,
      p_members: parsed.data.members.map((m) => ({
        name: m.name,
        amount: Number(m.amount),
      })),
      p_create_receivables: parsed.data.createReceivables,
      p_notes: parsed.data.notes || null,
    });

    if (error) {
      console.error("create_split_bill error:", error);
      return {
        error:
          error.message?.includes("transaction not found")
            ? "Transaksi tidak ditemukan atau bukan milik Anda."
            : error.message?.includes("exceeds")
              ? "Total pembagian melebihi nominal belanja."
              : "Gagal menyimpan pembagian tagihan. Silakan coba lagi.",
      };
    }

    revalidatePath("/transactions");
    revalidatePath("/receivables");

    return { splitBillId: data };
  } catch {
    return { error: SERVICE_UNAVAILABLE };
  }
}