"use server";

export type AiReceiptResult = {
  merchantName?: string;
  transactionDate?: string;
  totalAmount?: number;
  paymentMethod?: string;
  items?: Array<{ name: string; quantity?: number; amount: number }>;
  categoryHint?: string;
};

/**
 * Server action untuk ekstraksi foto struk belanja menggunakan AI Vision (Gemini 2.5 Flash).
 * Berjalan murni dengan REST API (zero npm dependencies) dan mengembalikan data JSON terstruktur.
 */
export async function scanReceiptWithAIAction(
  base64Image: string
): Promise<{ data?: AiReceiptResult; error?: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      error:
        "GEMINI_API_KEY belum dikonfigurasi. Silakan tambahkan GEMINI_API_KEY=AIzaSy... di file .env.local Anda.",
    };
  }

  try {
    const mimeMatch = base64Image.match(/^data:image\/([^;,]+)/);
    const detectedMime = mimeMatch ? `image/${mimeMatch[1]}` : "image/jpeg";

    const cleanBase64 = base64Image.replace(/^data:image\/[^;,]+;base64,/, "");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: detectedMime,
                    data: cleanBase64,
                  },
                },
                {
                  text: `Analisis foto struk belanjaan Indonesia ini. Ekstrak informasi dengan cermat dan berikan dalam format JSON terstruktur:
                  - merchantName: Nama toko/merchant (misal: Indomaret, Alfamart, Kopi Kenangan).
                  - transactionDate: Tanggal transaksi format YYYY-MM-DD. PENTING: Format tanggal di struk Indonesia biasanya DD-MM-YY atau DD/MM/YY (contoh: 18-08-26 = 18 Agustus 2026, 15/12/25 = 15 Desember 2025). Tahun 2 digit selalu berarti 20XX (misal: 26 = 2026, 25 = 2025).
                  - totalAmount: Total pembayaran bersih (number).
                  - paymentMethod: Metode pembayaran (Tunai, QRIS, E-Wallet, Kartu Debit, Kartu Kredit).
                  - items: Daftar barang [{ name: string, quantity?: number, amount: number }].
                  - categoryHint: Kategori barang (Makanan, Minuman, Kebersihan, Kebutuhan Rumah, Transportasi, Elektronik & Pulsa).`,
                },
              ],
            },
          ],
          generationConfig: {
            response_mime_type: "application/json",
            response_schema: {
              type: "OBJECT",
              properties: {
                merchantName: { type: "STRING" },
                transactionDate: { type: "STRING" },
                totalAmount: { type: "NUMBER" },
                paymentMethod: { type: "STRING" },
                items: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      name: { type: "STRING" },
                      quantity: { type: "NUMBER" },
                      amount: { type: "NUMBER" },
                    },
                    required: ["name", "amount"],
                  },
                },
                categoryHint: { type: "STRING" },
              },
              required: ["merchantName", "transactionDate", "totalAmount", "items"],
            },
          },
        }),
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API HTTP Error:", errText);
      return { error: "Gagal terhubung ke AI Vision API. Periksa API key atau koneksi Anda." };
    }

    const json = await response.json();
    const rawTextResult =
      json.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    const data: AiReceiptResult = JSON.parse(rawTextResult);

    return { data };
  } catch (err) {
    console.error("AI Receipt Action Error:", err);
    
    if (err instanceof Error && err.name === "AbortError") {
      return { 
        error: "Request timeout. Coba dengan gambar lebih kecil atau gunakan mode OCR." 
      };
    }
    
    return { error: "Terjadi kesalahan saat mengekstraksi struk dengan AI Vision." };
  }
}
