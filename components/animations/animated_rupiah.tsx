"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "motion/react";

import { formatRupiah } from "@/lib/utils/money";

/**
 * Angka Rupiah dengan count-up halus saat nilai berubah (TASK-1005).
 *
 * - Nilai awal ditampilkan langsung (tidak ada flash dari 0) — aman SSR.
 * - User dengan prefers-reduced-motion langsung melihat nilai akhir
 *   (useReducedMotion), tanpa animasi angka.
 * - Format Rupiah memakai formatter terpusat yang deterministik.
 */
export function AnimatedRupiah({ value }: { value: number }) {
  const prefersReducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const previousRef = useRef(value);

  useEffect(() => {
    if (prefersReducedMotion) {
      // Tidak ada animasi — nilai akhir langsung (aksesibilitas).
      previousRef.current = value;
      return;
    }
    const controls = animate(previousRef.current, value, {
      duration: 0.6,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(latest),
    });
    previousRef.current = value;
    return () => controls.stop();
  }, [value, prefersReducedMotion]);

  // Saat reduced motion, render nilai final langsung tanpa count-up.
  return <>{formatRupiah(prefersReducedMotion ? value : display)}</>;
}
