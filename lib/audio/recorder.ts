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