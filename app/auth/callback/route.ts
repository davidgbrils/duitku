import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Callback Supabase Auth — dipakai untuk email confirmation
 * (redirect dari email) dan alur OAuth.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch {
      // jatuh ke redirect login di bawah
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
