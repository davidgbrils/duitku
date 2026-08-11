import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  ScanLine,
  Sparkles,
} from "lucide-react";

import { Reveal } from "@/components/animations/reveal";
import { Button } from "@/components/ui/button";

const scanSteps = [
  { icon: Camera, label: "Upload struk" },
  { icon: Sparkles, label: "AI membaca detail" },
  { icon: BadgeCheck, label: "Kamu review" },
  { icon: ScanLine, label: "Transaksi tercatat" },
] as const;

/**
 * Section Scan Struk — fitur ini SUDAH tersedia (bukan klaim kosong):
 * foto → OCR di browser → review & konfirmasi → transaksi tersimpan.
 */
export function ReceiptScannerSection() {
  return (
    <section
      aria-labelledby="scan-heading"
      className="scroll-mt-20"
    >
      <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:py-20">
        <div className="bg-card ring-border overflow-hidden rounded-2xl ring-1">
          <div className="grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-2">
            <Reveal>
              <div>
                <span className="bg-success/10 text-success inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold">
                  <BadgeCheck className="size-3.5" />
                  Sudah Tersedia
                </span>
                <h2
                  id="scan-heading"
                  className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl"
                >
                  Capek input transaksi satu-satu?
                  <span className="text-primary block">Scan aja.</span>
                </h2>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed sm:text-base">
                  Foto struk belanja, Duitku membacanya, kamu tinggal review —
                  transaksi langsung tercatat. Hasil bacaannya tidak pernah
                  langsung tersimpan: kamu selalu bisa mengoreksi sebelum
                  disimpan.
                </p>
                <Button
                  size="lg"
                  className="mt-6"
                  render={<Link href="/register" />}
                >
                  Coba Scan Struk
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <ol className="flex flex-col gap-3">
                {scanSteps.map((step, index) => (
                  <li
                    key={step.label}
                    className="bg-muted/50 flex items-center gap-3 rounded-xl px-4 py-3"
                  >
                    <span className="bg-card ring-border flex size-9 shrink-0 items-center justify-center rounded-lg ring-1">
                      <step.icon className="text-primary size-4" />
                    </span>
                    <span className="flex-1 text-sm font-medium">
                      {step.label}
                    </span>
                    {index < scanSteps.length - 1 && (
                      <ArrowRight
                        aria-hidden
                        className="text-muted-foreground size-4 rotate-90 lg:rotate-0"
                      />
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
