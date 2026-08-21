import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  ScanLine,
  Sparkles,
} from "lucide-react";

import { Reveal } from "@/components/animations/reveal";

const scanSteps = [
  { icon: Camera, label: "Upload / Foto Struk", desc: "Kamera atau file foto langsung di browser" },
  { icon: Sparkles, label: "OCR Deteksi Instan", desc: "Membaca tanggal, nominal, dan toko" },
  { icon: BadgeCheck, label: "Review & Koreksi", desc: "Pastikan nominal dan kategori tepat" },
  { icon: ScanLine, label: "Tercatat Otomatis", desc: "Saldo & riwayat langsung ter-update" },
] as const;

export function ReceiptScannerSection() {
  return (
    <section
      aria-labelledby="scan-heading"
      className="relative scroll-mt-20 py-16 sm:py-24"
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-white/80 via-white/60 to-indigo-50/40 p-8 sm:p-12 shadow-[0_20px_50px_rgba(79,70,229,0.08)] backdrop-blur-2xl dark:border-slate-800/80 dark:bg-slate-900/80">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
            <Reveal>
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-700 backdrop-blur-sm dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <BadgeCheck className="size-3.5" />
                  Fitur Unggulan Siap Pakai
                </span>
                <h2
                  id="scan-heading"
                  className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white"
                >
                  Malas input nominal manual?{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent block">
                    Tinggal Scan Struk.
                  </span>
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
                  Cukup foto struk belanja minimarket atau restoran. Duitku membaca total nominal dan tanggal transaksi secara instan tanpa mengunggah foto pribadimu ke server publik.
                </p>
                <div className="mt-8">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:from-blue-700 hover:to-indigo-700 active:scale-95"
                  >
                    <span>Coba Scan Struk Gratis</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <ol className="flex flex-col gap-3.5">
                {scanSteps.map((step, index) => (
                  <li
                    key={step.label}
                    className="flex items-center gap-4 rounded-2xl border border-white/80 bg-white/75 p-4 shadow-2xs backdrop-blur-md transition-all hover:bg-white/95 dark:border-slate-800 dark:bg-slate-800/70"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-2xs dark:bg-indigo-950 dark:text-indigo-400">
                      <step.icon className="size-5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{step.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{step.desc}</p>
                    </div>
                    {index < scanSteps.length - 1 && (
                      <span className="text-xs font-bold text-slate-300 dark:text-slate-600">
                        0{index + 1}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
