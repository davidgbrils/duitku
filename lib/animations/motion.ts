/**
 * Duitku — Motion variants terpusat (TASK-1005).
 *
 * Semua animasi UI menggunakan variant yang sama agar konsisten
 * dan mudah dijaga. Jangan membuat konfigurasi random per komponen.
 *
 * Referensi API: https://motion.dev/docs/react
 */

import type { Variants } from "motion/react";

/** Fade halus — untuk konten statis (tanpa pergeseran). */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

/** Muncul dari bawah — untuk kartu/section entrance. */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

/** Muncul dengan scale halus — untuk dialog/kartu utama. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

/** Container untuk animasi stagger — anaknya memakai fadeInUp dkk. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

/** Viewport config umum: animasi sekali saja saat elemen terlihat. */
export const viewportOnce = { once: true, margin: "-40px" } as const;
