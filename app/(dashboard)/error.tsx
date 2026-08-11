"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log teknis untuk debugging — jangan pernah ditampilkan ke user.
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="bg-card ring-border flex flex-col items-center gap-3 rounded-xl px-6 py-14 text-center ring-1">
      <p className="text-base font-medium">Terjadi kesalahan</p>
      <p className="text-muted-foreground max-w-sm text-sm">
        Maaf, halaman gagal dimuat. Coba muat ulang, atau kembali beberapa saat
        lagi.
      </p>
      <Button onClick={reset} className="mt-2">
        <RefreshCw />
        Muat Ulang
      </Button>
    </div>
  );
}
