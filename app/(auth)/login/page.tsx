import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/features/auth/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Masuk ke Duitku</CardTitle>
        <CardDescription>
          Catat pemasukan dan pengeluaranmu dengan aman.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {error === "auth" && (
          <p
            role="alert"
            className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm"
          >
            Sesi berakhir atau tautan tidak valid. Silakan login ulang.
          </p>
        )}
        <LoginForm nextUrl={next} />
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-muted-foreground text-sm">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="text-primary font-medium hover:underline"
          >
            Daftar
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
