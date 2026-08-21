/**
 * Duitku — Environment helpers (TASK-0102).
 *
 * Env vars diakses secara lazy (di dalam fungsi), bukan di module scope,
 * agar `next build` tetap bisa berjalan sebelum .env.local diisi.
 */

const SUPABASE_URL_MISSING =
  "Supabase belum dikonfigurasi. Salin .env.example menjadi .env.local dan isi NEXT_PUBLIC_SUPABASE_URL.";

const SUPABASE_KEY_MISSING =
  "Supabase belum dikonfigurasi. Salin .env.example menjadi .env.local dan isi NEXT_PUBLIC_SUPABASE_ANON_KEY.";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function getSupabaseEnv(): {
  url: string;
  anonKey: string;
} {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error(SUPABASE_URL_MISSING);
  }
  if (!anonKey) {
    throw new Error(SUPABASE_KEY_MISSING);
  }

  // TASK-0102: validasi format agar error dini, bukan di tengah runtime.
  if (!/^https?:\/\/.+/.test(url)) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL tidak valid: harus berupa URL lengkap (mis. https://xxx.supabase.co)."
    );
  }
  if (!/^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(anonKey)) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY tidak valid: gunakan anon public key (diawali eyJ...), bukan service_role key."
    );
  }

  return { url, anonKey };
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/** Normalisasi base URL: buang trailing "/v1" / trailing slash. */
function normalizeBaseUrl(raw: string | undefined): string {
  return (raw ?? "").replace(/\/v1\/?$/, "").replace(/\/+$/, "");
}

export function isNineRouterConfigured(): boolean {
  return Boolean(
    process.env.NINEROUTER_URL &&
      /^https?:\/\//.test(process.env.NINEROUTER_URL)
  );
}

export function getNineRouterEnv(): {
  url: string;
  key?: string;
} {
  const url = normalizeBaseUrl(process.env.NINEROUTER_URL);
  const key = process.env.NINEROUTER_KEY?.trim() || undefined;
  return { url, key };
}
