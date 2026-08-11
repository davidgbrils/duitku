import Link from "next/link";

const productLinks = [
  { href: "/#fitur", label: "Fitur" },
  { href: "/#cara-kerja", label: "Cara Kerja" },
  { href: "/#harga", label: "Harga" },
  { href: "/#faq", label: "FAQ" },
] as const;

/** Footer minimal — hanya link ke halaman/section yang benar-benar ada. */
export function LandingFooter() {
  return (
    <footer className="border-border border-t">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="text-center sm:text-left">
          <p className="text-primary text-lg font-semibold tracking-tight">
            DUITKU
          </p>
          <p className="text-muted-foreground mt-1 max-w-xs text-sm">
            Personal finance tracking yang sederhana.
          </p>
        </div>

        <nav aria-label="Tautan produk">
          <p className="text-muted-foreground text-center text-xs font-medium uppercase tracking-wide sm:text-left">
            Product
          </p>
          <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 sm:flex-col sm:gap-y-1.5">
            {productLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Tautan akun">
          <p className="text-muted-foreground text-center text-xs font-medium uppercase tracking-wide sm:text-left">
            Akun
          </p>
          <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 sm:flex-col sm:gap-y-1.5">
            <li>
              <Link
                href="/login"
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                href="/register"
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                Daftar
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-border border-t">
        <p className="text-muted-foreground mx-auto w-full max-w-5xl px-4 py-4 text-center text-xs">
          © 2026 Duitku
        </p>
      </div>
    </footer>
  );
}
