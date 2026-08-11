"use client";

import { MotionConfig } from "motion/react";

/**
 * Pembungkus MotionConfig — kebijakan reduced motion global (TASK-1005).
 *
 * `reducedMotion="user"` membuat Motion otomatis menonaktifkan animasi
 * transform (pergeseran/scale) bagi user yang mengaktifkan
 * prefers-reduced-motion di perangkatnya (aksesibilitas, DESIGN §21).
 *
 * Dipakai di layout grup (dashboard) — hanya aktif di halaman
 * authenticated, sehingga bundle Motion tidak ikut di halaman publik.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
