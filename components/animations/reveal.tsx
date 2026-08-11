"use client";

import { motion } from "motion/react";

import { fadeInUp, viewportOnce } from "@/lib/animations/motion";

/**
 * Entrance animation untuk section/kartu (TASK-1005).
 * Boundary client sekecil mungkin: Server Page → <Reveal> → konten.
 *
 * Animasi hanya berjalan satu kali saat elemen masuk viewport;
 * user dengan prefers-reduced-motion otomatis tidak melihat
 * pergeseran (MotionConfig reducedMotion="user" di MotionProvider).
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </motion.div>
  );
}
