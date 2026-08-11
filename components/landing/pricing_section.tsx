import Link from "next/link";
import { Check } from "lucide-react";

import { Reveal } from "@/components/animations/reveal";
import { Button } from "@/components/ui/button";

const freeFeatures = [
  "Pencatatan transaksi tanpa batas",
  "Kategori & wallet",
  "Riwayat + pencarian & filter",
  "Dashboard ringkasan",
  "Scan struk belanja",
];

const premiumFeatures = [
  "Semua fitur Free",
  "Analisis keuangan lanjutan",
  "Insight pengeluaran otomatis",
];

export function PricingSection() {
  return (
    <section id="harga" aria-labelledby="harga-heading" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:py-20">
        <Reveal>
          <h2
            id="harga-heading"
            className="text-center text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Harga yang jujur
          </h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-xl text-center text-sm sm:text-base">
            Mulai gratis. Tingkatkan nanti kalau kamu butuh lebih.
          </p>
        </Reveal>

        <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
          <Reveal>
            <div className="bg-card ring-border flex h-full flex-col rounded-2xl p-6 ring-1">
              <p className="text-sm font-semibold">Free</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">
                Rp0
                <span className="text-muted-foreground ml-1 text-sm font-normal">
                  / selamanya
                </span>
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Semua yang kamu butuhkan untuk mulai teratur.
              </p>
              <ul className="mt-5 flex flex-col gap-2 text-sm">
                {freeFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="text-success mt-0.5 size-4 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                size="lg"
                className="mt-6 w-full"
                render={<Link href="/register" />}
              >
                Mulai Gratis
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="bg-card ring-border flex h-full flex-col rounded-2xl p-6 ring-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Premium</p>
                <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[11px] font-medium">
                  Segera Hadir
                </span>
              </div>
              <p className="mt-2 text-3xl font-semibold tracking-tight">
                —
                <span className="text-muted-foreground ml-1 text-sm font-normal">
                  harga belum diumumkan
                </span>
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Untuk kamu yang ingin analisis lebih dalam.
              </p>
              <ul className="mt-5 flex flex-col gap-2 text-sm">
                {premiumFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="text-primary mt-0.5 size-4 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button size="lg" variant="outline" className="mt-6 w-full" disabled>
                Segera Hadir
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
