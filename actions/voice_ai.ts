"use server";

export type VoiceDraft = {
  type: "income" | "expense";
  amount?: number;
  categoryHint?: string;
  walletHint?: string;
  merchantName?: string;
  paymentMethod?: string;
  notes?: string;
};

export type VoiceChatMessage = {
  role: "user" | "model";
  text: string;
};

export type AiVoiceResult = {
  userText: string;
  reply: string;
  confirmed: boolean;
  draft: VoiceDraft;
};

/**
 * Server action untuk asisten pencatatan transaksi dua arah.
 * Setiap suara direkam → dikonversi WAV → bersama riwayat percakapan dikirim
 * ke Gemini 2.5 Flash. Gemini mengembalikan:
 *   - userText: apa yang didengar pada turn ini
 *   - reply:    balasan konfirmasi (mis. "Pengeluaran Kopi Kenangan 80 ribu, ya?")
 *   - confirmed: true jika user mengonfirmasi
 *   - draft:    keadaan transaksi terkini (bisa direvisi lewat suara)
 * Tidak pernah auto-save dari sisi server — client yang menyimpan saat confirmed.
 */
export async function processVoiceTransactionAction(input: {
  audioDataUrl: string;
  conversation: VoiceChatMessage[];
  currentDraft?: VoiceDraft | null;
}): Promise<{ data?: AiVoiceResult; error?: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      error:
        "GEMINI_API_KEY belum dikonfigurasi. Silakan tambahkan GEMINI_API_KEY di .env.local.",
    };
  }

  const mimeMatch = /^data:(audio\/[^;,]+)/.exec(input.audioDataUrl);
  if (!mimeMatch) {
    return { error: "Rekaman audio tidak valid." };
  }
  const mime = mimeMatch[1];
  const base64 = input.audioDataUrl.replace(/^data:audio\/[^;]+;base64,/, "");

  const history: { role: "user" | "model"; parts: { text: string }[] }[] =
    input.conversation.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

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
            ...history,
            {
              role: "user",
              parts: [
                {
                  inline_data: {
                    mime_type: mime,
                    data: base64,
                  },
                },
                {
                  text: `Anda adalah asisten pencatatan keuangan pribadi Indonesia yang berbicara dua arah. Pengguna merekam suara untuk mencatat atau merevisi transaksi.

Konteks draft saat ini (mungkin kosong): ${JSON.stringify(input.currentDraft ?? null)}

Tugas Anda per turn:
1. Dengarkan ucapan pengguna pada audio turn ini.
2. userText: transkripsi ucapan pengguna turn ini (bahasa Indonesia).
3. Update draft berdasarkan ucapan: nominal (25 ribu -> 25000, 1 juta -> 1000000), type (income/expense), categoryHint, walletHint, merchantName, paymentMethod, notes. Pertahankan nilai lama yang tidak disebutkan.
4. reply: balasan singkat ramah yang MEMBACA ULANG draft untuk konfirmasi. Contoh: "Pengeluaran Kopi Kenangan 80 ribu pakai QRIS dari GoPay, ya?" atau "Baik, jadi nominalnya 70 ribu, ya?" Jika pengguna mengucapkan konfirmasi ("ya", "betul", "benar", "iya", "oke", "sudah", "bener"), set confirmed=true dan reply misal "Oke, transaksi sudah saya catat."
5. confirmed: true hanya jika pengguna jelas mengonfirmasi pada turn ini. Untuk perintah awal tanpa konfirmasi, selalu false.

turunkan juga kategori yang cocok dari list: Food & Beverage, Transportasi, Belanja, Tagihan & Utilitas, Hiburan, Kesehatan, Pendidikan, Gaji, Bonus, Penjualan, Investasi.
Kembalikan JSON valid tanpa teks lain.`,
                },
              ],
            },
          ],
          generationConfig: {
            response_mime_type: "application/json",
            response_schema: {
              type: "OBJECT",
              properties: {
                userText: { type: "STRING" },
                reply: { type: "STRING" },
                confirmed: { type: "BOOLEAN" },
                draft: {
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
              required: ["userText", "reply", "confirmed", "draft"],
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
          errText.includes("audio") || errText.includes("mime")
            ? "Format audio tidak didukung. Coba rekam kembali."
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