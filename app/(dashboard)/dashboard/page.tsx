import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/shared/SignOutButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Placeholder dashboard — konten lengkap dibangun di TASK-0801.
 * Halaman ini hanya memverifikasi protected route + session.
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Selamat datang, {profile?.display_name || user.email} 👋
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Selamat datang di Duitku</CardTitle>
          <CardDescription>
            Dashboard ringkasan keuanganmu akan tersedia di sini.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Rute ini terproteksi — hanya user yang sudah login yang bisa
          mengaksesnya.
        </CardContent>
      </Card>

      <div className="mt-8">
        <SignOutButton />
      </div>
    </main>
  );
}
