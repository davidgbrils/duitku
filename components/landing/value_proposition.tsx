import { PencilLine, PieChart, ShieldCheck, Tags } from "lucide-react";

import { Reveal } from "@/components/animations/reveal";

const values = [
  {
    icon: PencilLine,
    title: "Catat Mudah",
    description:
      "Pemasukan dan pengeluaran tercatat dalam beberapa detik — atau scan struk biar Duitku yang mencatat.",
  },
  {
    icon: Tags,
    title: "Lebih Teratur",
    description:
      "Kelompokkan transaksi per kategori dan wallet, dari uang tunai sampai e-wallet.",
  },
  {
    icon: PieChart,
    title: "Lebih Paham",
    description:
      "Lihat ke mana uangmu pergi lewat ringkasan bulanan dan tren pemasukan vs pengeluaran.",
  },
  {
    icon: ShieldCheck,
    title: "Privasi Terjaga",
    description:
      "Akunmu terpisah dengan autentikasi, dan setiap user hanya bisa mengakses datanya sendiri.",
  },
] as const;

export function ValueProposition() {
  return (
    <section aria-label="Mengapa Duitku" className="border-border border-y bg-muted/40">
      <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:py-20">
        <Reveal>
          <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
            Satu aplikasi untuk memahami keuanganmu.
          </h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-xl text-center text-sm sm:text-base">
            Semua pencatatan keuangan pribadi dalam satu tempat — tanpa ribet,
            tanpa aplikasi terpisah-pisah.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => (
            <Reveal key={value.title} delay={index * 0.05}>
              <div className="bg-card ring-border h-full rounded-xl p-5 ring-1">
                <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                  <value.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{value.title}</h3>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
