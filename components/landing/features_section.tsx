import {
  ArrowRightLeft,
  CalendarCheck,
  CreditCard,
  LayoutDashboard,
  ReceiptText,
  ScanLine,
} from "lucide-react";

import { Reveal } from "@/components/animations/reveal";

const features = [
  {
    icon: ReceiptText,
    title: "Pencatatan Transaksi",
    description: "Catat pemasukan dan pengeluaran harian lengkap dengan kategori, wallet, dan catatan.",
    badge: "Core",
  },
  {
    icon: ArrowRightLeft,
    title: "Transfer Antar-Wallet",
    description: "Pindahkan dana antar-rekening atau e-wallet secara instan dan sinkron.",
    badge: "Atomic",
  },
  {
    icon: CreditCard,
    title: "Manajemen Hutang & Piutang",
    description: "Pantau kewajiban hutang, jatuh tempo, serta pengingat tagihan piutang via WhatsApp.",
    badge: "Smart Reminder",
  },
  {
    icon: CalendarCheck,
    title: "Perencanaan Anggaran (Budgeting)",
    description: "Tetapkan batas anggaran bulanan per kategori dan pantau persentase konsumsinya.",
    badge: "Budget Plan",
  },
  {
    icon: LayoutDashboard,
    title: "Visual Dashboard & Tren",
    description: "Pantau total saldo, arus kas bersih, serta kurva tren pemasukan dan pengeluaran bulanan.",
    badge: "Analytics",
  },
  {
    icon: ScanLine,
    title: "Scan Struk Belanja (OCR)",
    description: "Pindai struk belanja otomatis mengekstrak nominal, tanggal, dan rekomendasi kategori.",
    badge: "AI Powered",
  },
] as const;

export function FeaturesSection() {
  return (
    <section id="fitur" aria-labelledby="fitur-heading" className="relative scroll-mt-20 py-16 sm:py-24">
      {/* Subtle background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-transparent blur-3xl"
      />

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center">
            <span className="inline-block rounded-full border border-indigo-200/80 bg-white/70 px-3.5 py-1 text-xs font-semibold text-indigo-700 shadow-xs backdrop-blur-md dark:border-indigo-800/80 dark:bg-slate-900/70 dark:text-indigo-300">
              Ecosystem & Tools
            </span>
            <h2
              id="fitur-heading"
              className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white"
            >
              Fitur Lengkap untuk Finansialmu
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600 sm:text-base dark:text-slate-300">
              Semua fitur finansial yang kamu butuhkan sudah siap pakai secara instan tanpa biaya tersembunyi.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 0.05}>
              <div className="group relative flex h-full flex-col justify-between rounded-3xl border border-white/70 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200/90 hover:bg-white/85 hover:shadow-xl hover:shadow-indigo-500/10 dark:border-slate-800/80 dark:bg-slate-900/60 dark:hover:border-indigo-800">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex size-11 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50/80 text-indigo-600 shadow-xs dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-400">
                      <feature.icon className="size-5" />
                    </span>
                    <span className="rounded-full border border-slate-200/70 bg-white/80 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 shadow-2xs backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
