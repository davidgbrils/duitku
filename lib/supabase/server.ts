import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/types/database";
import { getSupabaseEnv } from "@/lib/env";

/**
 * Supabase client untuk Server Components, Server Actions, dan Route Handlers.
 * Session dibaca/ditulis melalui cookie store Next.js.
 */
export async function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Dipanggil dari Server Component — aman untuk diabaikan
          // karena middleware yang bertanggung jawab refresh session.
        }
      },
    },
  });
}
