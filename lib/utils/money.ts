/**
 * Duitku — formatter uang terpusat (DESIGN.md §14).
 * Jangan membuat formatter berbeda-beda di setiap komponen.
 *
 * Catatan: nilai uang disimpan sebagai NUMERIC(19,2) di database.
 * Untuk tampilan MVP, Rupiah praktis ditampilkan tanpa desimal.
 *
 * Penting: format dibangun secara DETERMINISTIK (tanpa
 * style:"currency") karena ICU Node dan browser menghasilkan output
 * berbeda untuk id-ID (Node menambah non-breaking space, browser
 * tidak). Konsistensi server/client adalah prasyarat tampilan uang.
 */

/** Pemisah ribuan id-ID ("3.000.000") — konsisten di Node & browser. */
const groupFormatter = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** "Rp3.000.000" — format Rupiah default. */
export function formatRupiah(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return "-";
  }
  return `Rp${groupFormatter.format(amount)}`;
}

/** "Rp3.000.000" tanpa desimal, untuk nilai 0 → "Rp0". */
export function formatRupiahZero(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || amount === 0) {
    return "Rp0";
  }
  return `Rp${groupFormatter.format(amount)}`;
}

/**
 * Representasi +/- sesuai DESIGN.md §14:
 * income → "+ Rp3.000.000", expense → "- Rp250.000".
 */
export function formatSignedRupiah(amount: number, positive: boolean): string {
  const formatted = groupFormatter.format(Math.abs(amount));
  return positive ? `+ Rp${formatted}` : `- Rp${formatted}`;
}

/** Parse string input user (mis. "1.500.000" / "1500000") ke number aman. */
export function parseRupiahInput(value: string): number | null {
  const cleaned = value.replace(/[^\d]/g, "");
  if (cleaned === "") {
    return null;
  }
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}
