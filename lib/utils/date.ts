/**
 * Duitku — formatter tanggal terpusat.
 * Format tampilan konsisten (id-ID) di seluruh aplikasi.
 *
 * Nama bulan memakai array tetap (bukan Intl.DateTimeFormat dengan
 * nama bulan) agar output identik di Node dan browser — halaman
 * di-render di server lalu di-hydrate di client.
 */

const MONTHS_FULL = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agt",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

/** "2026-08-11" → "11 Agustus 2026". String date di-parse sebagai waktu lokal. */
export function formatDate(isoDate: string): string {
  const date = parseLocalDate(isoDate);
  if (!date) {
    return isoDate;
  }
  return `${date.getDate()} ${MONTHS_FULL[date.getMonth()]} ${date.getFullYear()}`;
}

/** ISO datetime → "11 Agustus 2026 14.30". */
export function formatDateTime(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) {
    return isoDateTime;
  }
  const time = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  return `${formatDate(toLocalIso(date))} ${time}`;
}

/** Tanggal lokal hari ini dalam format "YYYY-MM-DD" (untuk input type="date"). */
export function todayIso(): string {
  return toLocalIso(new Date());
}

/** Date → "YYYY-MM-DD" dengan waktu lokal (bukan UTC). */
export function toLocalIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** "2026-08" → "Agt 26" (label chart, singkat). */
export function formatMonthShort(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  if (!year || !month || month < 1 || month > 12) {
    return monthKey;
  }
  return `${MONTHS_SHORT[month - 1]} ${String(year % 100).padStart(2, "0")}`;
}

/** Daftar N kunci bulan terakhir: ["2026-03", ..., "2026-08"] (tertua → terbaru). */
export function lastMonths(count: number, now: Date = new Date()): string[] {
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  }
  return keys;
}

/** Parse "YYYY-MM-DD" sebagai waktu lokal; null jika tidak valid. */
function parseLocalDate(isoDate: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) {
    return null;
  }
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3])
  );
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== Number(match[1]) ||
    date.getMonth() !== Number(match[2]) - 1 ||
    date.getDate() !== Number(match[3])
  ) {
    return null;
  }
  return date;
}
