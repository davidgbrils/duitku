"use server";

import { createClient } from "@/lib/supabase/server";
import {
  debtPaymentSchema,
  debtSchema,
  type DebtInput,
  type DebtPaymentInput,
} from "@/lib/validations/debt";

export type DebtActionResult = {
  error?: string;
  success?: string;
};

export async function createDebtAction(input: DebtInput): Promise<DebtActionResult> {
  const parsed = debtSchema.safeParse(input);
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

    const { error } = await supabase.from("debts").insert({
      user_id: user.id,
      lender_name: parsed.data.lenderName,
      amount: numAmount,
      remaining_amount: numAmount,
      due_date: parsed.data.dueDate || null,
      status: "unpaid",
      notes: parsed.data.notes || null,
    });

    if (error) {
      console.error("Create Debt Error:", error);
      return { error: "Gagal mencatat hutang baru." };
    }

    return { success: "Hutang berhasil dicatat." };
  } catch (err) {
    console.error("Create Debt Action Error:", err);
    return { error: "Terjadi kesalahan sistem saat mencatat hutang." };
  }
}

export async function updateDebtAction(
  debtId: string,
  input: DebtInput
): Promise<DebtActionResult> {
  const parsed = debtSchema.safeParse(input);
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
      .from("debts")
      .update({
        lender_name: parsed.data.lenderName,
        due_date: parsed.data.dueDate || null,
        notes: parsed.data.notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", debtId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Update Debt Error:", error);
      return { error: "Gagal memperbarui data hutang." };
    }

    return { success: "Data hutang berhasil diperbarui." };
  } catch (err) {
    console.error("Update Debt Action Error:", err);
    return { error: "Terjadi kesalahan sistem." };
  }
}

export async function deleteDebtAction(debtId: string): Promise<DebtActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Anda harus login terlebih dahulu." };
    }

    const { error } = await supabase
      .from("debts")
      .delete()
      .eq("id", debtId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Delete Debt Error:", error);
      return { error: "Gagal menghapus data hutang." };
    }

    return { success: "Data hutang berhasil dihapus." };
  } catch (err) {
    console.error("Delete Debt Action Error:", err);
    return { error: "Terjadi kesalahan sistem." };
  }
}

export async function payDebtAction(input: DebtPaymentInput): Promise<DebtActionResult> {
  const parsed = debtPaymentSchema.safeParse(input);
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

    const { error } = await supabase.rpc("pay_debt", {
      p_debt_id: parsed.data.debtId,
      p_wallet_id: parsed.data.walletId,
      p_amount: Number(parsed.data.amount),
      p_payment_date: parsed.data.paymentDate,
      p_notes: parsed.data.notes || null,
    });

    if (error) {
      console.error("Pay Debt RPC Error:", error);
      return { error: error.message || "Gagal memproses cicilan hutang." };
    }

    return { success: "Pembayaran cicilan hutang berhasil disimpan dan saldo dompet diperbarui." };
  } catch (err) {
    console.error("Pay Debt Action Error:", err);
    return { error: "Terjadi kesalahan sistem." };
  }
}
