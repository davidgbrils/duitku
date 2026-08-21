import { ChevronDown } from "lucide-react";

import { Reveal } from "@/components/animations/reveal";

const faqs = [
  {
    question: "Apa itu Duitku?",
    answer:
      "Duitku adalah aplikasi web manajemen keuangan pribadi terpadu. Kamu dapat mencatat pemasukan & pengeluaran, mengelola saldo berbagai wallet, mengatur anggaran bulanan, memantau hutang/piutang, serta menganalisis kondisi finansial lewat visual dashboard.",
  },
  {
    question: "Apakah Duitku gratis?",
    answer:
      "Ya! Semua fitur inti — pencatatan transaksi, multi-wallet, kategori, riwayat transaksi, anggaran bulanan, manajemen hutang & piutang (termasuk WhatsApp reminder), serta OCR scan struk belanja — 100% gratis digunakan.",
  },
  {
    question: "Apakah data keuangan saya aman?",
    answer:
      "Sangat aman. Seluruh data tersimpan di database PostgreSQL Supabase yang dilindungi oleh Row Level Security (RLS). Setiap pengguna hanya dapat mengakses dan memanipulasi datanya sendiri dari sesi login yang terautentikasi.",
  },
  {
    question: "Bisakah saya mentransfer saldo antar-wallet?",
    answer:
      "Bisa. Duitku mendukung transfer saldo antar-wallet (misalnya dari BCA ke Dompet Tunai / E-Wallet) secara atomic tanpa memengaruhi total laba bersih / net cash flow pengeluaran bulananmu.",
  },
  {
    question: "Bagaimana cara kerja scan struk dan voice input?",
    answer:
      "Kamu cukup mengunggah foto struk belanja belanjaanmu atau berbicara melalui mikrofon. Duitku akan memproses OCR / Speech recognition langsung di browser dan mengisi formulir transaksi untuk kamu review sebelum disimpan.",
  },
  {
    question: "Apakah Duitku responsif diakses dari HP?",
    answer:
      "Ya. Duitku dirancang mobile-first dengan navigasi bottom bar adaptif di ponsel dan top navigation di desktop, sehingga sangat nyaman digunakan di berbagai perangkat.",
  },
] as const;

export function FaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative scroll-mt-20 border-y border-white/60 bg-slate-50/50 py-16 sm:py-24 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/40"
    >
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center">
            <span className="inline-block rounded-full border border-indigo-200/80 bg-white/70 px-3.5 py-1 text-xs font-semibold text-indigo-700 shadow-xs backdrop-blur-md dark:border-indigo-800/80 dark:bg-slate-900/70 dark:text-indigo-300">
              Pertanyaan Umum
            </span>
            <h2
              id="faq-heading"
              className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white"
            >
              Frequently Asked Questions
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600 sm:text-base dark:text-slate-300">
              Jawaban seputar fitur, keamanan data, dan cara pemakaian Duitku.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-12 flex flex-col gap-3.5">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-white/80 bg-white/70 p-1 shadow-2xs backdrop-blur-xl transition-all duration-200 open:border-indigo-200/90 open:bg-white/90 open:shadow-md dark:border-slate-800 dark:bg-slate-900/70 dark:open:border-indigo-800"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-bold text-slate-900 select-none dark:text-white [&::-webkit-details-marker]:hidden">
                  <span>{faq.question}</span>
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100 group-open:bg-indigo-50 group-open:text-indigo-600 transition-colors dark:bg-slate-800">
                    <ChevronDown className="size-4 text-slate-500 transition-transform duration-200 group-open:rotate-180 group-open:text-indigo-600 dark:text-slate-400" />
                  </div>
                </summary>
                <p className="px-5 pb-5 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 border-t border-slate-100/80 pt-3 dark:border-slate-800">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
