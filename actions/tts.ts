"use server";

import { getNineRouterEnv, isNineRouterConfigured } from "@/lib/env";

export type TtsResult = {
  audioBase64?: string;
  format?: string;
  /** `true` = 9Router tidak dikonfigurasi → client harus pakai fallback browser. */
  notConfigured?: boolean;
  error?: string;
};

const DEFAULT_MODEL = "edge-tts/id-ID-GadisNeural";

/**
 * Text-to-speech via 9Router gateway (OpenAI-compatible /v1/audio/speech).
 * Return base64 audio (mp3) untuk diputar di client. Tidak pernah throw —
 * setiap kegagalan → error generik; client fallback ke speechSynthesis.
 */
export async function synthesizeSpeechAction(
  text: string,
  model?: string
): Promise<TtsResult> {
  const cleanText = text.trim().slice(0, 500);
  if (!cleanText) {
    return { error: "Teks kosong." };
  }

  if (!isNineRouterConfigured()) {
    return { notConfigured: true };
  }

  const { url, key } = getNineRouterEnv();
  const finalModel = model || process.env.DUITKU_TTS_MODEL || DEFAULT_MODEL;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (key) {
      headers["Authorization"] = `Bearer ${key}`;
    }

    const response = await fetch(
      `${url}/v1/audio/speech?response_format=json`,
      {
        method: "POST",
        headers,
        signal: controller.signal,
        body: JSON.stringify({ model: finalModel, input: cleanText }),
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error("9Router TTS HTTP Error:", response.status);
      return {
        error: "Server suara tidak merespons. Pakai suara browser sebagai gantinya.",
      };
    }

    const json = (await response.json()) as {
      audio?: string;
      format?: string;
    };
    if (!json.audio) {
      return { error: "Audio kosong dari server suara." };
    }

    return {
      audioBase64: json.audio,
      format: json.format ?? "mp3",
    };
  } catch (err) {
    console.error("9Router TTS Action Error:", err);
    if (err instanceof Error && err.name === "AbortError") {
      return { error: "Waktu server suara habis. Pakai suara browser." };
    }
    return { error: "Server suara tidak tersedia." };
  }
}