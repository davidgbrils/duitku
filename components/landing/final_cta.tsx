import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/animations/reveal";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section aria-labelledby="final-cta-heading">
      <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:py-20">
        <Reveal>
          <div className="from-primary/10 to-transparent bg-card ring-border relative overflow-hidden rounded-2xl bg-gradient-to-br p-8 text-center ring-1 sm:p-12">
            <h2
              id="final-cta-heading"
              className="text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Mulai lebih teratur mengelola keuanganmu.
            </h2>
            <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm sm:text-base">
              Buat akun gratis, catat transaksi pertamamu, dan lihat sendiri
              bedanya.
            </p>
            <Button
              size="lg"
              className="mt-6"
              render={<Link href="/register" />}
            >
              Mulai Gratis
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
