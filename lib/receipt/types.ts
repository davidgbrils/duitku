export type ReceiptItem = {
  name: string;
  quantity?: number;
  amount: number;
};

/** Skor keyakinan 0–1 per field hasil OCR (0 = tidak terdeteksi). */
export type ReceiptConfidence = {
  merchant: number;
  date: number;
  total: number;
  category: number;
};

export type ReceiptExtraction = {
  merchantName: string | null;
  /** "YYYY-MM-DD" atau null jika tidak terbaca. */
  transactionDate: string | null;
  totalAmount: number | null;
  currency: "IDR";
  items: ReceiptItem[];
  paymentMethod: string | null;
  confidence: ReceiptConfidence;
  /** Teks mentah hasil OCR — selalu disimpan untuk audit/koreksi. */
  rawText: string;
};
