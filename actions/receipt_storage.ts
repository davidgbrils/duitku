"use server";

import { randomUUID } from "crypto";

import { createClient } from "@/lib/supabase/server";

export type ReceiptStorageResult = {
  url?: string;
  error?: string;
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Upload foto struk (data URL base64) ke Supabase Storage → URL publik. */
export async function uploadReceiptImageAction(
  base64DataUrl: string
): Promise<ReceiptStorageResult> {
  const mimeMatch = /^data:image\/([^;,]+);base64,([A-Za-z0-9+/=]+)$/.exec(
    base64DataUrl
  );
  if (!mimeMatch) {
    return { error: "Format gambar tidak valid." };
  }

  const ext = mimeMatch[1] === "png" ? "png" : "jpg";
  const rawBase64 = mimeMatch[2];
  const byteLength = Math.floor((rawBase64.length * 3) / 4);
  if (byteLength > MAX_IMAGE_BYTES) {
    return { error: "Ukuran foto terlalu besar untuk disimpan." };
  }

  const buffer = Buffer.from(rawBase64, "base64");

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Anda harus login terlebih dahulu." };
    }

    const fileName = `${randomUUID()}.${ext}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(filePath, buffer, {
        contentType: `image/${ext}`,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload receipt error:", uploadError);
      return { error: "Gagal mengunggah foto struk. Silakan coba lagi." };
    }

    const { data } = supabase.storage.from("receipts").getPublicUrl(filePath);
    return { url: data.publicUrl };
  } catch (err) {
    console.error("Upload receipt action error:", err);
    return { error: "Layanan belum tersedia." };
  }
}
