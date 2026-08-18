import type { ReceiptExtraction, ReceiptItem } from "./types";

export type { ReceiptExtraction, ReceiptItem } from "./types";

/**
 * Parser teks hasil OCR struk belanja Indonesia (murni, tanpa dependency —
 * mudah diuji dan bisa diganti Vision API nanti).
 *
 * Heuristik:
 * - Merchant: deteksi brand ritel (Indomaret, Alfamart, dll) atau baris pertama yang "berarti".
 * - Tanggal: pola DD/MM/YYYY / DD.MM.YY (konvensi Indonesia) atau "11 Agustus 2026".
 * - Item: pola 4-kolom ritel (Nama Qty UnitPrice TotalPrice) atau 3-kolom. Mengabaikan voucher/diskon/alamat.
 * - Pembersihan OCR: membersihkan simbol noise (:, *, =, #, |, ||), koreksi huruf o/O/l/I/S pada angka harga.
 * - Total: baris bertanda TOTAL/JUMLAH/BAYAR (dukung titik dua ':'), fallback penjumlahan item.
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

const RETAIL_BRANDS: { brand: string; pattern: RegExp }[] = [
  { brand: "Indomaret", pattern: /\b(indomaret|indomarco)\b/i },
  { brand: "Alfamart", pattern: /\b(alfamart|alfaria)\b/i },
  { brand: "Alfamidi", pattern: /\b(alfamidi)\b/i },
  { brand: "Super Indo", pattern: /\b(super\s*indo)\b/i },
  { brand: "Lawson", pattern: /\b(lawson)\b/i },
  { brand: "Circle K", pattern: /\b(circle\s*k)\b/i },
  { brand: "Transmart", pattern: /\b(transmart|carrefour)\b/i },
  { brand: "Hypermart", pattern: /\b(hypermart)\b/i },
  { brand: "Hero", pattern: /\b(hero\s*supermarket)\b/i },
  { brand: "Guardian", pattern: /\b(guardian)\b/i },
  { brand: "Watsons", pattern: /\b(watsons?)\b/i },
];

const ADDRESS_KEYWORDS_RE =
  /\b(jl|jalan|no|kec|kecamatan|kel|kelurahan|kota|kab|kabupaten|prov|rt|rw|kodepos|npwp|telp|fax|gedung|menara|pantai|indah|kapuk)\b/i;

/** "5.000" → 5000, "1.234,56" → 1234.56, "5000" → 5000, "Rp 27.000" → 27000. Memasang pembuka & penutup noise OCR. */
export function parseAmount(raw: string): number | null {
  let s = raw.trim().replace(/\s+/g, "");
  // Hapus prefiks Rp/RP/rp dengan variasi titik/titik dua (mis. "Rp.", "Rp:")
  s = s.replace(/^rp[:.]?/i, "");
  // Hapus simbol noise OCR di ujung string (mis. "19.800:", "38.400*", "38.400=")
  s = s.replace(/[:;*=+#|!?"'~]+$/g, "").replace(/^[:;*=+#|!?"'~]+/g, "");

  // Nilai di dalam kurung seperti (4,300) adalah diskon/voucher, bukan nilai transaksi positif.
  if (!s || /^\(.*\)$/.test(s) || s.startsWith("-")) {
    return null;
  }

  // Koreksi kesalahan OCR umum angka yang terbaca sebagai huruf (O/o/S/l/I -> 0/5/1) pada token harga.
  if (/[0-9]/.test(s)) {
    s = s
      .replace(/(?<=\d)[Oo](?=\d|$)/g, "0")
      .replace(/(?<=\d)[lI](?=\d|$)/g, "1")
      .replace(/^S(?=\d)/i, "5");
  }

  if (!/^[\d.,]+$/.test(s)) {
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

function cleanItemName(name: string): string {
  return name
    .replace(/[|`~_#$^=@]/g, "") // Hapus karakter noise murni OCR
    .replace(/:\s*$/, "") // Hapus titik dua di ujung nama
    .replace(/\s+/g, " ") // Rapikan spasi berlebih
    .trim();
}

function extractMerchant(
  lines: string[]
): { name: string | null; confidence: number } {
  // 1. Cek brand ritel besar (Indomaret, Alfamart, dll).
  for (const { brand, pattern } of RETAIL_BRANDS) {
    for (let i = 0; i < Math.min(lines.length, 12); i++) {
      if (pattern.test(lines[i])) {
        // Cari baris cabang toko di sekitarnya (mis. "DURI KOSAMBI 18").
        let branch: string | null = null;
        for (let j = 0; j < Math.min(lines.length, 12); j++) {
          const l = lines[j];
          const parts = l.split(/\s+/);
          const lastToken = parts[parts.length - 1];
          if (
            j !== i &&
            !SEPARATOR_RE.test(l) &&
            parseAmount(lastToken) === null &&
            !HEADER_KEYWORDS.some((k) => l.toLowerCase().startsWith(k)) &&
            !ADDRESS_KEYWORDS_RE.test(l) &&
            !pattern.test(l) &&
            l.length >= 3 &&
            l.length <= 40 &&
            /[a-z]/i.test(l)
          ) {
            branch = cleanItemName(l);
            break;
          }
        }
        return {
          name: branch ? `${brand} - ${branch}` : brand,
          confidence: 0.98,
        };
      }
    }
  }

  // 2. Fallback heuristik standar baris pertama.
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
      name: cleanItemName(line).slice(0, 60),
      confidence: 0.96,
    };
  }
  return { name: null, confidence: 0 };
}

function extractItems(lines: string[]): ReceiptItem[] {
  const items: ReceiptItem[] = [];
  const IGNORED_LINE_RE =
    /^(qty|jumlah|banyak|disc|diskon|voucher|promo|cashback|potongan|kembali|anda|hemat|harga|dpp|ppn|subtotal|layanan|sms|wa|telp|kontak|npwp|member|kasir)/i;

  for (const line of lines) {
    if (SEPARATOR_RE.test(line)) {
      continue;
    }
    // Abaikan baris alamat / header yang kebetulan memiliki angka di ujung (seperti kodepos / nomor jalan)
    if (ADDRESS_KEYWORDS_RE.test(line) || parseDate(line) !== null || line.includes("/")) {
      continue;
    }

    const parts = line.split(/\s+/);
    if (parts.length < 2) {
      continue;
    }
    const lastToken = parts[parts.length - 1];
    const amount = parseAmount(lastToken);
    // Di Indonesia tidak ada harga item ritel < Rp100 (angka seperti 18 adalah nomor cabang toko "DURI KOSAMBI 18").
    if (amount === null || amount < 100) {
      continue;
    }

    let nameParts = parts.slice(0, -1);
    let quantity: number | undefined;

    // Pola ritel 4-kolom: "NAMA ITEM <qty> <harga_satuan> <total_harga>"
    // Contoh: "GIV BW MLB&CLG PC400 1 19800 19,800"
    if (parts.length >= 4) {
      const secondLastToken = parts[parts.length - 2];
      const thirdLastToken = parts[parts.length - 3];
      const unitPrice = parseAmount(secondLastToken);
      if (unitPrice !== null && /^\d{1,2}$/.test(thirdLastToken)) {
        quantity = Number(thirdLastToken);
        nameParts = parts.slice(0, -3);
      }
    }

    // Pola standar 3-kolom: "NAMA ITEM <qty> <total_harga>"
    if (quantity === undefined) {
      const secondLast = nameParts[nameParts.length - 1];
      if (nameParts.length >= 2 && /^\d{1,2}$/.test(secondLast)) {
        quantity = Number(secondLast);
        nameParts = nameParts.slice(0, -1);
      }
    }

    const name = cleanItemName(nameParts.join(" "));
    if (!name || !/[a-z0-9]/i.test(name)) {
      continue;
    }
    const lower = name.toLowerCase();
    if (
      TOTAL_KEYWORDS.some((keyword) => lower.includes(keyword)) ||
      PAYMENT_PATTERNS.some(({ pattern }) => pattern.test(name)) ||
      IGNORED_LINE_RE.test(lower) ||
      IGNORED_LINE_RE.test(line.toLowerCase())
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
