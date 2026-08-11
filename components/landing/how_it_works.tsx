import { PencilLine, PieChart, Tags } from "lucide-react";

import { Reveal } from "@/components/animations/reveal";

const steps = [
  {
    number: "01",
    icon: PencilLine,
    title: "Catat transaksi",
    description:
      "Masukkan pemasukan atau pengeluaran manual, atau foto struknya biar Duitku yang membaca.",
  },
  {
    number: "02",
    icon: Tags,
    title: "Kelompokkan",
    description:
      "Tentukan kategori dan wallet-nya — uangmu jadi terstruktur dengan sendirinya.",
  },
  {
    number: "03",
    icon: PieChart,
    title: "Pahami keuanganmu",
    description:
      "Lihat ringkasan bulanan, tren pengeluaran, dan saldo semua wallet dalam satu dashboard.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="cara-kerja"
      aria-labelledby="cara-kerja-heading"
      className="border-border scroll-mt-20 border-y bg-muted/40"
    >
      <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:py-20">
        <Reveal>
          <h2
            id="cara-kerja-heading"
            className="text-center text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Cara kerjanya sederhana
          </h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-xl text-center text-sm sm:text-base">
            Tiga langkah, dan keuanganmu mulai rapi.
          </p>
        </Reveal>

        <ol className="mt-10 grid gap-6 sm:grid-cols-3">
          {steps.map((step, index) => (
            <Reveal key={step.number} delay={index * 0.08}>
              <li className="relative flex flex-col items-center gap-3 text-center">
                <span
                  aria-hidden
                  className="text-primary/20 text-5xl font-semibold tracking-tight"
                >
                  {step.number}
                </span>
                <span className="bg-primary/10 text-primary -mt-8 flex size-10 items-center justify-center rounded-lg">
                  <step.icon className="size-5" />
                </span>
                <h3 className="text-base font-semibold">{step.title}</h3>
                <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
                  {step.description}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
