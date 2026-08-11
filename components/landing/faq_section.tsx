import { ChevronDown } from "lucide-react";

import { Reveal } from "@/components/animations/reveal";

const faqs = [
  {
    question: "Apa itu Duitku?",
    answer:
      "Duitku adalah aplikasi web pencatatan keuangan pribadi. Kamu mencatat pemasukan dan pengeluaran, mengelompokkannya per kategori dan wallet, lalu melihat ringkasan kondisimu di dashboard.",
  },
  {
    question: "Apakah Duitku gratis?",
    answer:
      "Ya. Semua fitur inti — pencatatan, kategori, riwayat, dashboard, dan scan struk — gratis. Paket Premium dengan analisis lanjutan sedang disiapkan dan belum dirilis.",
  },
  {
    question: "Apakah data keuangan saya aman?",
    answer:
      "Data tersimpan di database Supabase (PostgreSQL) dan dilindungi autentikasi akun. Setiap pengguna hanya bisa mengakses datanya sendiri, dan semua halaman yang menampilkan data keuangan dilindungi di sisi server.",
  },
  {
    question: "Bisakah saya mengedit atau menghapus transaksi?",
    answer:
      "Bisa. Setiap transaksi bisa diedit atau dihapus kapan saja, termasuk mengubah nominal, kategori, wallet, dan tanggalnya.",
  },
  {
    question: "Bagaimana cara kerja scan struk?",
    answer:
      "Kamu memfoto struk belanja, lalu Duitku membaca teksnya langsung di browser kamu (gambar tidak dikirim ke server). Hasilnya — merchant, tanggal, total, dan item — ditampilkan untuk kamu review dan koreksi sebelum disimpan sebagai transaksi.",
  },
  {
    question: "Apakah Duitku bisa digunakan di HP?",
    answer:
      "Bisa. Duitku adalah aplikasi web yang responsif: di HP ada navigasi bawah dan menu hamburger, jadi nyaman dipakai dari ponsel maupun desktop.",
  },
] as const;

export function FaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="border-border scroll-mt-20 border-y bg-muted/40"
    >
      <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:py-20">
        <Reveal>
          <h2
            id="faq-heading"
            className="text-center text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Pertanyaan yang sering ditanyakan
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="mt-8 flex flex-col gap-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="bg-card ring-border group rounded-xl ring-1"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium select-none [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <ChevronDown className="text-muted-foreground size-4 shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <p className="text-muted-foreground px-5 pb-4 text-sm leading-relaxed">
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
