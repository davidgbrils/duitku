import { redirect } from "next/navigation";

/**
 * Alias route — landing page memakai /signup, form daftar ada di /register
 * (route existing, tidak diubah agar tidak breaking).
 */
export default function SignupPage() {
  redirect("/register");
}
