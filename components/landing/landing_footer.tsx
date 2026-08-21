import Link from "next/link";

const productLinks = [
  { href: "/#fitur", label: "Fitur" },
  { href: "/#cara-kerja", label: "Cara Kerja" },
  { href: "/#harga", label: "Harga" },
  { href: "/#faq", label: "FAQ" },
] as const;

export function LandingFooter() {
  return (
    <footer className="border-t border-white/60 bg-white/60 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-4 py-12 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md shadow-indigo-500/20 text-white font-extrabold text-base">
              D
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
              Duitku
            </span>
          </div>
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Platform modern manajemen keuangan pribadi: multi-wallet, budgeting, pelacakan hutang & piutang, dan scanner struk pintar.
          </p>
        </div>

        <nav aria-label="Tautan produk">
          <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 sm:text-left">
            Produk
          </p>
          <ul className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2 sm:flex-col sm:gap-y-2">
            {productLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-xs font-medium text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Tautan akun">
          <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 sm:text-left">
            Akun & Akses
          </p>
          <ul className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2 sm:flex-col sm:gap-y-2">
            <li>
              <Link
                href="/login"
                className="text-xs font-medium text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white"
              >
                Masuk (Login)
              </Link>
            </li>
            <li>
              <Link
                href="/register"
                className="text-xs font-medium text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white"
              >
                Daftar Akun Baru
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-slate-200/60 dark:border-slate-800">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 text-[11px] text-slate-400">
          <p>© 2026 Duitku. All rights reserved.</p>
          <p>Dibuat untuk pengelolaan finansial yang lebih teratur.</p>
        </div>
      </div>
    </footer>
  );
}
