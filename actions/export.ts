"use server";

import { createClient } from "@/lib/supabase/server";

export type ExportTransactionsFilter = {
  type?: string;
  categoryId?: string;
  walletId?: string;
  dateFrom?: string;
  dateTo?: string;
  query?: string;
};

/**
 * Generates a clean UTF-8 CSV string for downloading transaction history.
 */
export async function exportTransactionsCsvAction(
  filter: ExportTransactionsFilter
): Promise<{ csv?: string; filename?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Anda harus login terlebih dahulu." };
    }

    let query = supabase
      .from("transactions")
      .select("*, wallets(name), categories(name)")
      .order("transaction_date", { ascending: false });

    if (filter.type && (filter.type === "income" || filter.type === "expense")) {
      query = query.eq("type", filter.type);
    }
    if (filter.categoryId) {
      query = query.eq("category_id", filter.categoryId);
    }
    if (filter.walletId) {
      query = query.eq("wallet_id", filter.walletId);
    }
    if (filter.dateFrom) {
      query = query.gte("transaction_date", filter.dateFrom);
    }
    if (filter.dateTo) {
      query = query.lte("transaction_date", filter.dateTo);
    }
    if (filter.query) {
      query = query.ilike("description", `%${filter.query}%`);
    }

    const { data: transactions, error } = await query;
    if (error) {
      console.error("Export Query Error:", error);
      return { error: "Gagal mengambil data transaksi untuk ekspor." };
    }

    const rows = transactions ?? [];

    // Construct CSV header & rows
    const header = ["Tanggal", "Tipe", "Nominal (IDR)", "Dompet", "Kategori", "Deskripsi"];
    const csvLines = [header.join(",")];

    for (const tx of rows) {
      const typeLabel = tx.type === "income" ? "Pemasukan" : "Pengeluaran";
      const walletName = escapeCsv(tx.wallets?.name ?? "Wallet");
      const categoryName = escapeCsv(tx.categories?.name ?? "Tanpa Kategori");
      const description = escapeCsv(tx.description ?? "-");

      csvLines.push(
        [
          tx.transaction_date,
          typeLabel,
          tx.amount,
          walletName,
          categoryName,
          description,
        ].join(",")
      );
    }

    const csvContent = csvLines.join("\n");
    const todayStr = new Date().toISOString().split("T")[0];
    const filename = `transaksi_duitku_${todayStr}.csv`;

    return { csv: csvContent, filename };
  } catch (err) {
    console.error("Export CSV Action Error:", err);
    return { error: "Terjadi kesalahan sistem saat mengekspor data." };
  }
}

function escapeCsv(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}
