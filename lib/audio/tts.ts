"use client";

/**
 * Client-side TTS helper untuk suara asisten (custom voice via 9Router).
 * - `speakWithRouterBytes`: memutar hasil `synthesizeSpeechAction` (mp3 base64).
 * - `speakBrowserFallback`: speechSynthesis id-ID (jika gateway mati).
 */

export function speakBrowserFallback(text: string): boolean {
  try {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      return false;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

function stopAnyAudio() {
  try {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  } catch {
    /* noop */
  }
}

/** Mainkan base64 audio (mp3) via <audio>, resolve true jika berhasil. */
function playBase64Audio(base64: string, mime: string): Promise<boolean> {
  return new Promise((resolve) => {
    let audioEl: HTMLAudioElement | null = document.createElement("audio");
    const cleanup = () => {
      audioEl?.remove();
      audioEl = null;
    };

    audioEl.onended = () => {
      cleanup();
      resolve(true);
    };
    audioEl.onerror = () => {
      cleanup();
      resolve(false);
    };

    audioEl.src = `data:audio/${mime};base64,${base64}`;
    audioEl
      .play()
      .then(() => {
        // success: tunggu onended (atau timeout pengaman)
        window.setTimeout(() => {
          if (audioEl) {
            cleanup();
            resolve(true);
          }
        }, 15000);
      })
      .catch(() => {
        cleanup();
        resolve(false);
      });
  });
}

/** Fallback mime untuk format audio (mp3/webm/wav/m4a). */
function mimeForFormat(format: string): string {
  const normalized = format.toLowerCase();
  if (normalized === "wav") return "wav";
  if (normalized === "webm") return "webm";
  if (normalized === "m4a") return "m4a";
  return "mpeg";
}

export async function speakWithRouterBytes(
  audioBase64: string,
  format: string
): Promise<boolean> {
  stopAnyAudio();
  return playBase64Audio(audioBase64, mimeForFormat(format));
}