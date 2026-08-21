import { PencilLine, PieChart, ShieldCheck, Tags } from "lucide-react";

import { Reveal } from "@/components/animations/reveal";

const values = [
  {
    icon: PencilLine,
    title: "Catat Mudah",
    description:
      "Pemasukan dan pengeluaran tercatat dalam beberapa detik — atau scan struk biar Duitku yang mencatat.",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    icon: Tags,
    title: "Lebih Teratur",
    description:
      "Kelompokkan transaksi per kategori dan wallet, dari uang tunai sampai e-wallet.",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: PieChart,
    title: "Lebih Paham",
    description:
      "Lihat ke mana uangmu pergi lewat ringkasan bulanan dan tren pemasukan vs pengeluaran.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: ShieldCheck,
    title: "Privasi Terjaga",
    description:
      "Akunmu terpisah dengan autentikasi PostgreSQL RLS, dan setiap user hanya bisa mengakses datanya sendiri.",
    gradient: "from-emerald-500 to-teal-500",
  },
] as const;

export function ValueProposition() {
  return (
    <section aria-label="Mengapa Duitku" className="relative border-y border-white/50 bg-slate-50/50 py-16 sm:py-24 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/40">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <Reveal>
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Satu aplikasi untuk memahami keuanganmu.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-slate-600 sm:text-base dark:text-slate-300">
            Semua pencatatan keuangan pribadi dalam satu tempat — tanpa ribet, tanpa spreadsheet terpisah.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => (
            <Reveal key={value.title} delay={index * 0.06}>
              <div className="group relative flex h-full flex-col justify-between rounded-3xl border border-white/80 bg-white/70 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200/80 hover:bg-white/90 hover:shadow-xl hover:shadow-indigo-500/10 dark:border-slate-800/80 dark:bg-slate-900/70 dark:hover:border-indigo-800">
                <div>
                  <div className={`flex size-11 items-center justify-center rounded-2xl bg-gradient-to-tr ${value.gradient} text-white shadow-md shadow-indigo-500/20`}>
                    <value.icon className="size-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">{value.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {value.description}
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
