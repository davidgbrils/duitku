import {
  LayoutDashboard,
  ReceiptText,
  ScanLine,
  Search,
  Tags,
} from "lucide-react";

import { Reveal } from "@/components/animations/reveal";

/** Fitur yang SEMUA sudah tersedia di aplikasi (tidak ada klaim kosong). */
const features = [
  {
    icon: ReceiptText,
    title: "Pencatatan Transaksi",
    description: "Catat pemasukan dan pengeluaran dalam hitungan detik.",
  },
  {
    icon: Tags,
    title: "Kategori & Wallet",
    description: "Kelompokkan transaksi dan pisahkan uang per tempat penyimpanan.",
  },
  {
    icon: Search,
    title: "Riwayat & Pencarian",
    description: "Cari transaksi lama dengan filter tipe, kategori, wallet, dan tanggal.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard Ringkasan",
    description: "Saldo total, pemasukan vs pengeluaran, dan tren 6 bulan terakhir.",
  },
  {
    icon: ScanLine,
    title: "Scan Struk",
    description: "Foto struk belanja — Duitku membaca, kamu tinggal review dan simpan.",
  },
] as const;

export function FeaturesSection() {
  return (
    <section id="fitur" aria-labelledby="fitur-heading" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:py-20">
        <Reveal>
          <h2
            id="fitur-heading"
            className="text-center text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Fitur untuk mulai lebih teratur
          </h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-xl text-center text-sm sm:text-base">
            Semua fitur di bawah sudah bisa langsung kamu pakai setelah membuat
            akun.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 0.05}>
              <div className="bg-card ring-border hover:bg-muted/50 h-full rounded-xl p-5 ring-1 transition-colors">
                <span className="bg-muted flex size-10 items-center justify-center rounded-lg">
                  <feature.icon className="text-primary size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Reveal>
          ))}
          <Reveal delay={features.length * 0.05}>
            <div className="border-dashed border-border flex h-full flex-col justify-center rounded-xl border p-5 text-center">
              <p className="text-sm font-semibold">Dan terus berkembang</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Analisis keuangan lanjutan sedang disiapkan.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
