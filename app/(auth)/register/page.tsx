import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RegisterForm } from "@/features/auth/auth_register";

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Buat Akun Duitku</CardTitle>
        <CardDescription>
          Mulai catat keuangan pribadimu dalam beberapa detik.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-muted-foreground text-sm">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            Masuk
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
