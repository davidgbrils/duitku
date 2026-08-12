"use server";

import { createClient } from "@/lib/supabase/server";
import {
  receivablePaymentSchema,
  receivableSchema,
  type ReceivableInput,
  type ReceivablePaymentInput,
} from "@/lib/validations/receivable";

export type ReceivableActionResult = {
  error?: string;
  success?: string;
};

export async function createReceivableAction(
  input: ReceivableInput
): Promise<ReceivableActionResult> {
  const parsed = receivableSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Anda harus login terlebih dahulu." };
    }

    const numAmount = Number(parsed.data.amount);

    const { error } = await supabase.from("receivables").insert({
      user_id: user.id,
      borrower_name: parsed.data.borrowerName,
      amount: numAmount,
      remaining_amount: numAmount,
      due_date: parsed.data.dueDate || null,
      status: "unpaid",
      notes: parsed.data.notes || null,
    });

    if (error) {
      console.error("Create Receivable Error:", error);
      return { error: "Gagal mencatat piutang baru." };
    }

    return { success: "Piutang berhasil dicatat." };
  } catch (err) {
    console.error("Create Receivable Action Error:", err);
    return { error: "Terjadi kesalahan sistem saat mencatat piutang." };
  }
}

export async function updateReceivableAction(
  receivableId: string,
  input: ReceivableInput
): Promise<ReceivableActionResult> {
  const parsed = receivableSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Anda harus login terlebih dahulu." };
    }

    const { error } = await supabase
      .from("receivables")
      .update({
        borrower_name: parsed.data.borrowerName,
        due_date: parsed.data.dueDate || null,
        notes: parsed.data.notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", receivableId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Update Receivable Error:", error);
      return { error: "Gagal memperbarui data piutang." };
    }

    return { success: "Data piutang berhasil diperbarui." };
  } catch (err) {
    console.error("Update Receivable Action Error:", err);
    return { error: "Terjadi kesalahan sistem." };
  }
}

export async function deleteReceivableAction(
  receivableId: string
): Promise<ReceivableActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Anda harus login terlebih dahulu." };
    }

    const { error } = await supabase
      .from("receivables")
      .delete()
      .eq("id", receivableId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Delete Receivable Error:", error);
      return { error: "Gagal menghapus data piutang." };
    }

    return { success: "Data piutang berhasil dihapus." };
  } catch (err) {
    console.error("Delete Receivable Action Error:", err);
    return { error: "Terjadi kesalahan sistem." };
  }
}

export async function payReceivableAction(
  input: ReceivablePaymentInput
): Promise<ReceivableActionResult> {
  const parsed = receivablePaymentSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input pembayaran tidak valid." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Anda harus login terlebih dahulu." };
    }

    const { error } = await supabase.rpc("pay_receivable", {
      p_receivable_id: parsed.data.receivableId,
      p_wallet_id: parsed.data.walletId,
      p_amount: Number(parsed.data.amount),
      p_payment_date: parsed.data.paymentDate,
      p_notes: parsed.data.notes || null,
    });

    if (error) {
      console.error("Pay Receivable RPC Error:", error);
      return { error: error.message || "Gagal memproses pembayaran piutang." };
    }

    return { success: "Penerimaan pelunasan piutang berhasil disimpan dan saldo dompet diperbarui." };
  } catch (err) {
    console.error("Pay Receivable Action Error:", err);
    return { error: "Terjadi kesalahan sistem." };
  }
}
