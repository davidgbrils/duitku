"use server";

export type AiVoiceResult = {
  type: "income" | "expense";
  amount?: number;
  categoryHint?: string;
  walletHint?: string;
  merchantName?: string;
  paymentMethod?: string;
  notes?: string;
};

/**
 * Server action untuk pencatatan transaksi via suara.
 * Audio (data URL base64) dikirim ke Gemini 2.5 Flash (multimodal) dan
 * dikembalikan sebagai JSON terstruktur untuk di-review user sebelum disimpan.
 */
export async function processVoiceTransactionAction(
  audioDataUrl: string
): Promise<{ data?: AiVoiceResult; error?: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      error:
        "GEMINI_API_KEY belum dikonfigurasi. Silakan tambahkan GEMINI_API_KEY di .env.local.",
    };
  }

  const mimeMatch = /^data:(audio\/[^;,]+);base64,/.exec(audioDataUrl);
  if (!mimeMatch) {
    return { error: "Rekaman audio tidak valid." };
  }
  const mime = mimeMatch[1];
  const base64 = audioDataUrl.replace(/^data:audio\/[^;,]+;base64,/, "");

  try {
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
                    mime_type: mime,
                    data: base64,
                  },
                },
                {
                  text: `Anda adalah asisten pencatat keuangan pribadi Indonesia. Dengarkan rekaman suara pengguna yang berisi perintah mencatat transaksi keuangan, lalu kembalikan JSON terstruktur:
- type: "income" (pemasukan) atau "expense" (pengeluaran).
- amount: Nominal rupiah (number bulat). Contoh 25 ribu -> 25000, 50 ribu -> 50000, 1 juta -> 1000000.
- categoryHint: Kategori yang paling cocok dari (Food & Beverage, Transportasi, Belanja, Tagihan & Utilitas, Hiburan, Kesehatan, Pendidikan, Gaji, Bonus, Penjualan, Investasi) atau perkiraan nama kategori.
- walletHint: Petunjuk dompet jika disebutkan (misal Cash, BCA, DANA, GoPay) — kosongkan jika tidak ada.
- merchantName: Nama toko/tempat jika ada.
- paymentMethod: Cara bayar jika disebutkan (Tunai, QRIS, Transfer, Kartu Debit, E-Wallet) — kosongkan jika tidak jelas.
- notes: Deskripsi singkat transaksi.
Hanya kembalikan JSON valid, tanpa teks lain.`,
                },
              ],
            },
          ],
          generationConfig: {
            response_mime_type: "application/json",
            response_schema: {
              type: "OBJECT",
              properties: {
                type: { type: "STRING", enum: ["income", "expense"] },
                amount: { type: "NUMBER" },
                categoryHint: { type: "STRING" },
                walletHint: { type: "STRING" },
                merchantName: { type: "STRING" },
                paymentMethod: { type: "STRING" },
                notes: { type: "STRING" },
              },
              required: ["type"],
            },
          },
        }),
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini Voice HTTP Error:", errText.slice(0, 500));
      return {
        error:
          errText.includes("audio")
            ? "Format audio tidak didukung. Coba rekam kembali atau gunakan mode manual."
            : "Gagal memproses suara. Periksa koneksi atau API key.",
      };
    }

    const json = await response.json();
    const rawText =
      json.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    const parsed = JSON.parse(rawText.trim());
    if (!parsed || typeof parsed !== "object") {
      return { error: "AI tidak dapat memahami ucapan. Coba lagi." };
    }

    return { data: parsed as AiVoiceResult };
  } catch (err) {
    console.error("Gemini Voice Action Error:", err);
    if (err instanceof Error && err.name === "AbortError") {
      return { error: "Waktu pemrosesan suara habis. Silakan coba lagi." };
    }
    return { error: "Terjadi kesalahan saat memproses suara." };
  }
}