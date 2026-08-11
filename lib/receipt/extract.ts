import type { ReceiptExtraction, ReceiptItem } from "./types";

export type { ReceiptExtraction, ReceiptItem } from "./types";

/**
 * Parser teks hasil OCR struk belanja Indonesia (murni, tanpa dependency —
 * mudah diuji dan bisa diganti Vision API nanti).
 *
 * Heuristik:
 * - Merchant: baris pertama yang "berarti" (bukan header/tanggal/angka).
 * - Tanggal: pola DD/MM/YYYY (konvensi Indonesia) atau "11 Agustus 2026".
 * - Item: baris berakhiran nominal; token terakhir = harga, sisanya nama.
 * - Total: baris bertanda TOTAL/JUMLAH/BAYAR, fallback penjumlahan item.
 */

const MONTH_NAMES = [
  "januari",
  "februari",
  "maret",
  "april",
  "mei",
  "juni",
  "juli",
  "agustus",
  "september",
  "oktober",
  "november",
  "desember",
] as const;

/** Kata kunci baris total — diurutkan prioritas (TOTAL lebih dipercaya dari BAYAR). */
const TOTAL_KEYWORDS = [
  "grand total",
  "total belanja",
  "total bayar",
  "total",
  "jumlah",
  "subtotal",
  "bayar",
  "pembayaran",
] as const;

/** Baris header yang bukan merchant (mis. label struk, pesanan). */
const HEADER_KEYWORDS = [
  "struk",
  "nota",
  "invoice",
  "receipt",
  "bukti",
  "pembelian",
  "kwitansi",
  "faktur",
  "pesanan",
  "order",
  "laporan",
  "kasir",
  "member",
  "no.",
  "no :",
  "no:",
  "tanggal",
  "date",
  "jam",
  "time",
] as const;

const SEPARATOR_RE = /^[=\-*_.·]{3,}$/;

const PAYMENT_PATTERNS: { method: string; pattern: RegExp }[] = [
  { method: "QRIS", pattern: /\bqris\b/i },
  { method: "E-Wallet", pattern: /\b(gopay|ovo|dana|shopeepay|linkaja|e-?wallet)\b/i },
  { method: "Kartu Kredit", pattern: /\b(kredit|visa|mastercard)\b/i },
  { method: "Kartu Debit", pattern: /\b(debit|bca|mandiri|bni|bri)\b/i },
  { method: "Tunai", pattern: /\b(tunai|cash)\b/i },
];

/** "5.000" → 5000, "1.234,56" → 1234.56, "5000" → 5000, "Rp 27.000" → 27000. */
export function parseAmount(raw: string): number | null {
  let s = raw.trim().replace(/\s+/g, "").replace(/^rp/i, "");
  if (!s || !/^[\d.,]+$/.test(s)) {
    return null;
  }

  // 1.234.567,89 → ribuan titik, desimal koma (konvensi Indonesia).
  if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(s)) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(,\d{3})+(\.\d{1,2})?$/.test(s)) {
    // 1,234,567.89 → ribuan koma, desimal titik.
    s = s.replace(/,/g, "");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
    // 27.000 → ribuan titik tanpa desimal.
    s = s.replace(/\./g, "");
  } else if (/^\d+,\d{1,2}$/.test(s)) {
    // 27000,50 → desimal koma.
    s = s.replace(",", ".");
  } else if (!/^\d+(\.\d{1,2})?$/.test(s)) {
    return null;
  }

  const value = Number(s);
  return Number.isFinite(value) && value > 0 ? value : null;
}

/** Ambil tanggal dari teks → "YYYY-MM-DD" (konvensi DD/MM untuk struk Indonesia). */
export function parseDate(text: string): string | null {
  const numeric = /\b(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})\b/.exec(text);
  if (numeric) {
    let day = Number(numeric[1]);
    let month = Number(numeric[2]);
    let year = Number(numeric[3]);
    // Jika salah satu jelas hari/bulan (mis. 15/08), perbaiki urutan.
    if (day > 12 && month <= 12) {
      // DD/MM — sudah benar.
    } else if (month > 12 && day <= 12) {
      [day, month] = [month, day]; // MM/DD → DD/MM
    }
    if (year < 100) {
      year += 2000;
    }
    return toIsoDate(day, month, year);
  }

  const named = new RegExp(
    `\\b(\\d{1,2})\\s+(${MONTH_NAMES.join("|")})\\s+(\\d{4})\\b`,
    "i"
  ).exec(text);
  if (named) {
    const month =
      MONTH_NAMES.indexOf(
        named[2].toLowerCase() as (typeof MONTH_NAMES)[number]
      ) + 1;
    return toIsoDate(Number(named[1]), month, Number(named[3]));
  }
  return null;
}

function toIsoDate(day: number, month: number, year: number): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function isTotalLine(line: string): boolean {
  const lower = line.toLowerCase();
  return TOTAL_KEYWORDS.some((keyword) => lower.startsWith(keyword));
}

export function extractReceipt(rawText: string): ReceiptExtraction {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const merchant = extractMerchant(lines);
  const transactionDate = parseDate(rawText);
  const items = extractItems(lines);
  const total = extractTotal(lines, items);
  const payment = extractPayment(lines);

  return {
    merchantName: merchant.name,
    transactionDate,
    totalAmount: total.total,
    currency: "IDR",
    items,
    paymentMethod: payment.method,
    confidence: {
      merchant: merchant.confidence,
      date: transactionDate ? 0.97 : 0,
      total: total.confidence,
      category: 0,
    },
    rawText,
  };
}

function extractMerchant(
  lines: string[]
): { name: string | null; confidence: number } {
  for (const line of lines) {
    if (SEPARATOR_RE.test(line)) {
      continue;
    }
    // Baris angka saja (nomor antrian, dll) bukan merchant.
    if (/^[\d.,\s]+$/.test(line) || parseAmount(line) !== null) {
      continue;
    }
    // Baris tanggal saja.
    if (/^\d{1,2}[/.\-]\d{1,2}[/.\-]\d{2,4}$/.test(line)) {
      continue;
    }
    const lower = line.toLowerCase();
    if (HEADER_KEYWORDS.some((keyword) => lower.startsWith(keyword))) {
      continue;
    }
    if (TOTAL_KEYWORDS.some((keyword) => lower.startsWith(keyword))) {
      continue;
    }
    if (!/[a-z]/i.test(line)) {
      continue;
    }
    return {
      name: line.replace(/\s+/g, " ").slice(0, 60),
      confidence: 0.96,
    };
  }
  return { name: null, confidence: 0 };
}

function extractItems(lines: string[]): ReceiptItem[] {
  const items: ReceiptItem[] = [];
  for (const line of lines) {
    if (SEPARATOR_RE.test(line)) {
      continue;
    }
    const parts = line.split(/\s+/);
    if (parts.length < 2) {
      continue;
    }
    const amount = parseAmount(parts[parts.length - 1]);
    if (amount === null) {
      continue;
    }
    let nameParts = parts.slice(0, -1);

    // Pola "NAMA <qty> <harga>" — token kedua terakhir bilangan kecil = qty.
    let quantity: number | undefined;
    const secondLast = nameParts[nameParts.length - 1];
    if (nameParts.length >= 2 && /^\d{1,2}$/.test(secondLast)) {
      quantity = Number(secondLast);
      nameParts = nameParts.slice(0, -1);
    }

    const name = nameParts.join(" ").trim();
    if (!name || !/[a-z0-9]/i.test(name)) {
      continue;
    }
    const lower = name.toLowerCase();
    if (
      TOTAL_KEYWORDS.some((keyword) => lower.includes(keyword)) ||
      PAYMENT_PATTERNS.some(({ pattern }) => pattern.test(name)) ||
      /^(qty|jumlah|banyak|disc|diskon|ppn)/i.test(lower)
    ) {
      continue;
    }
    items.push({ name, quantity, amount });
    if (items.length >= 50) {
      break;
    }
  }
  return items;
}

function extractTotal(
  lines: string[],
  items: ReceiptItem[]
): { total: number | null; confidence: number } {
  const sumItems = items.reduce((sum, item) => sum + item.amount, 0);

  // Pass 1: TOTAL / JUMLAH / SUBTOTAL (lebih spesifik).
  for (const line of lines) {
    const lower = line.toLowerCase();
    const isPrimary = TOTAL_KEYWORDS.slice(0, 6).some((keyword) =>
      lower.startsWith(keyword)
    );
    if (!isPrimary) {
      continue;
    }
    const parts = line.split(/\s+/);
    const amount = parseAmount(parts[parts.length - 1]);
    if (amount !== null) {
      const consistent =
        Math.abs(sumItems - amount) <= Math.max(1, amount * 0.05);
      return { total: amount, confidence: consistent ? 0.99 : 0.95 };
    }
  }

  // Pass 2: BAYAR / PEMBAYARAN (uang yang dibayarkan — bisa lebih besar dari total).
  for (const line of lines) {
    if (!/(^|\s)(bayar|pembayaran)/i.test(line)) {
      continue;
    }
    const parts = line.split(/\s+/);
    const amount = parseAmount(parts[parts.length - 1]);
    if (amount !== null) {
      return { total: amount, confidence: 0.9 };
    }
  }

  if (sumItems > 0) {
    return { total: sumItems, confidence: 0.8 };
  }
  return { total: null, confidence: 0 };
}

function extractPayment(lines: string[]): {
  method: string | null;
  confidence: number;
} {
  for (const { method, pattern } of PAYMENT_PATTERNS) {
    for (const line of lines) {
      if (pattern.test(line)) {
        return { method, confidence: 0.9 };
      }
    }
  }
  return { method: null, confidence: 0 };
}
