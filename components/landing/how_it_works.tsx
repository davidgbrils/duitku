import { ArrowRightLeft, PencilLine, PieChart } from "lucide-react";

import { Reveal } from "@/components/animations/reveal";

const steps = [
  {
    number: "01",
    icon: PencilLine,
    title: "Catat atau Scan",
    description:
      "Catat pemasukan/pengeluaran secara manual, gunakan voice input, atau scan struk belanja otomatis.",
  },
  {
    number: "02",
    icon: ArrowRightLeft,
    title: "Kelompokkan & Alokasikan",
    description:
      "Atur kategori, pilih dompet/rekening, serta tetapkan batas anggaran bulanan per kategori.",
  },
  {
    number: "03",
    icon: PieChart,
    title: "Pahami & Pantau",
    description:
      "Lihat ringkasan total aset kas, kurva tren bulanan, dan progres pelunasan hutang/piutang.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="cara-kerja"
      aria-labelledby="cara-kerja-heading"
      className="relative scroll-mt-20 border-y border-white/60 bg-slate-50/50 py-16 sm:py-24 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/40"
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center">
            <span className="inline-block rounded-full border border-indigo-200/80 bg-white/70 px-3.5 py-1 text-xs font-semibold text-indigo-700 shadow-xs backdrop-blur-md dark:border-indigo-800/80 dark:bg-slate-900/70 dark:text-indigo-300">
              Workflow
            </span>
            <h2
              id="cara-kerja-heading"
              className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white"
            >
              Cara Kerjanya Sangat Sederhana
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600 sm:text-base dark:text-slate-300">
              Tiga langkah mudah menuju pencatatan keuangan yang rapi dan terukur.
            </p>
          </div>
        </Reveal>

        <ol className="mt-12 grid gap-6 sm:grid-cols-3">
          {steps.map((step, index) => (
            <Reveal key={step.number} delay={index * 0.08}>
              <li className="group relative flex h-full flex-col items-center rounded-3xl border border-white/70 bg-white/70 p-7 text-center shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200/90 hover:bg-white/90 hover:shadow-xl hover:shadow-indigo-500/10 dark:border-slate-800/80 dark:bg-slate-900/70">
                <span
                  aria-hidden
                  className="bg-gradient-to-br from-indigo-500/30 to-blue-500/20 bg-clip-text text-5xl font-black tracking-tight text-transparent select-none"
                >
                  {step.number}
                </span>
                <span className="relative -mt-6 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/25">
                  <step.icon className="size-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
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
