"use server";

import { redirect } from "next/navigation";

import { getSiteUrl } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { sanitizeNextPath } from "@/lib/utils/navigation";
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "@/lib/validations/auth";

/** Hasil action: error user-friendly untuk ditampilkan di form. */
export type AuthActionResult = {
  error?: string;
  success?: string;
};

export async function loginAction(
  input: LoginInput,
  next?: string
): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      // Jangan bocorkan detail error auth ke user (AGENTS §17).
      return { error: "Email atau password salah." };
    }
  } catch {
    return {
      error:
        "Layanan autentikasi belum tersedia. Pastikan Supabase sudah dikonfigurasi.",
    };
  }

  redirect(sanitizeNextPath(next));
}

export async function registerAction(
  input: RegisterInput
): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid." };
  }

  // redirect() melempar error khusus — HARUS dipanggil di luar try/catch
  // agar tidak tertelan oleh blok catch (lihat ADR-013 / Next.js docs).
  let sessionReady = false;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { display_name: parsed.data.displayName },
        emailRedirectTo: `${getSiteUrl()}/auth/callback`,
      },
    });

    if (error) {
      return {
        error:
          error.code === "user_already_exists"
            ? "Email sudah terdaftar. Silakan login."
            : "Gagal mendaftar. Silakan coba lagi.",
      };
    }

    // Jika email confirmation nonaktif, session langsung tersedia.
    sessionReady = Boolean(data.session);
  } catch {
    return {
      error:
        "Layanan autentikasi belum tersedia. Pastikan Supabase sudah dikonfigurasi.",
    };
  }

  if (sessionReady) {
    redirect("/dashboard");
  }

  return {
    success:
      "Registrasi berhasil! Cek email kamu untuk konfirmasi sebelum login.",
  };
}

export async function signOutAction(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Tetap arahkan ke beranda walau signOut gagal (sesi tidak valid).
  }
  redirect("/");
}
