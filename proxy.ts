import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/database";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/env";

/** Prefix route yang hanya boleh diakses user terautentikasi. */
const protectedPrefixes = [
  "/dashboard",
  "/transactions",
  "/wallets",
  "/categories",
  "/reports",
  "/settings",
] as const;

/** Halaman auth — user yang sudah login diarahkan ke dashboard. */
const authPages = ["/login", "/register"] as const;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Sebelum Supabase dikonfigurasi (.env.local kosong), lewati proteksi
  // supaya halaman publik tetap bisa diakses saat development.
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  const { url, anonKey } = getSupabaseEnv();

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Verifikasi & refresh session (getUser memvalidasi ke Supabase Auth).
  // Jika Supabase tidak reachable, perlakukan sebagai unauthenticated
  // (fail-open) agar halaman publik tetap bisa diakses.
  let user = null;
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch {
    user = null;
  }

  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const isAuthPage = authPages.some((page) => pathname === page);

  if (!user && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && (isAuthPage || pathname === "/")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.searchParams.delete("next");
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Jalankan di semua route kecuali asset statis
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
