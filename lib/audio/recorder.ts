export type RecorderHandle = {
  stop: () => void;
  cancel: () => void;
};

export type RecordingResult = {
  blob: Blob;
  mime: string;
};

/** Deteksi format audio yang didukung browser (webm/mp4) untuk dikirim ke Gemini. */
export function pickAudioMime(): string {
  if (
    typeof MediaRecorder !== "undefined" &&
    MediaRecorder.isTypeSupported("audio/webm")
  ) {
    return "audio/webm";
  }
  if (
    typeof MediaRecorder !== "undefined" &&
    MediaRecorder.isTypeSupported("audio/mp4")
  ) {
    return "audio/mp4";
  }
  return "audio/webm";
}

export function pickAudioExtension(mime: string): string {
  return mime.includes("mp4") ? "mp4" : "webm";
}

/** Maksud bloat butuh recorder: mulai rekam mikrofon, kembalikan handle untuk stop/cancel. */
export async function startRecording(): Promise<{
  handle: RecorderHandle | null;
  onResult: (callback: (result: RecordingResult | null) => void) => void;
}> {
  let resultCallback: ((result: RecordingResult | null) => void) | null = null;

  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
    return {
      handle: null,
      onResult: (cb) => cb?.(null),
    };
  }

  const stream = await navigator.mediaDevices
    .getUserMedia({ audio: true })
    .catch(() => null);

  if (!stream) {
    return {
      handle: null,
      onResult: (cb) => cb?.(null),
    };
  }

  const mime = pickAudioMime();
  let recorder: MediaRecorder;
  try {
    recorder = new MediaRecorder(stream, { mimeType: mime });
  } catch {
    try {
      recorder = new MediaRecorder(stream);
    } catch {
      stream.getTracks().forEach((track) => track.stop());
      return {
        handle: null,
        onResult: (cb) => cb?.(null),
      };
    }
  }

  const chunks: Blob[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      chunks.push(event.data);
    }
  };
  recorder.onstop = () => {
    stream.getTracks().forEach((track) => track.stop());
    const blob = new Blob(chunks, { type: recorder.mimeType || mime });
    resultCallback?.(blob ? { blob, mime: recorder.mimeType || mime } : null);
  };
  recorder.onerror = () => {
    stream.getTracks().forEach((track) => track.stop());
    resultCallback?.(null);
  };

  recorder.start();

  return {
    handle: {
      stop: () => {
        if (recorder.state !== "inactive") {
          recorder.stop();
        }
      },
      cancel: () => {
        stream.getTracks().forEach((track) => track.stop());
      },
    },
    onResult: (cb) => {
      resultCallback = cb;
    },
  };
}

/** Konversi Blob audio → data URL base64 untuk server action. */
export function audioBlobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/** Encode Float32 PCM → WAV PCM 16-bit (44.1kHz 16-bit mono). */
function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return buffer;
}

/**
 * Konversi blob rekaman (webm/mp4/ogg) → data URL WAV PCM.
 * decodeAudioData didukung browser modern untuk format MediaRecorder,
 * dan WAV dijamin didukung oleh Gemini (bebas masalah codec/parameter mime).
 */
export async function blobToWavDataUrl(
  blob: Blob
): Promise<{ dataUrl: string; mime: string } | null> {
  if (typeof AudioContext === "undefined") {
    return null;
  }
  const arrayBuffer = await blob.arrayBuffer();
  const AudioCtx = window.AudioContext;
  const ctx = new AudioCtx();

  try {
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    const raw = audioBuffer.getChannelData(0);
    const wav = encodeWav(raw, audioBuffer.sampleRate);
    const wavBlob = new Blob([wav], { type: "audio/wav" });
    return { dataUrl: await audioBlobToBase64(wavBlob), mime: "audio/wav" };
  } catch {
    return null;
  } finally {
    void ctx.close();
  }
}