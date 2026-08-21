import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function TransactionNotFound() {
  return (
    <div className="bg-card border-border mx-auto flex w-full max-w-md flex-col items-center gap-3 rounded-2xl border px-6 py-14 text-center shadow-sm">
      <p className="text-base font-medium">Transaksi tidak ditemukan</p>
      <p className="text-muted-foreground max-w-sm text-sm">
        Transaksi mungkin sudah dihapus, atau alamatnya salah.
      </p>
      <Link href="/transactions" className="mt-2">
        <Button variant="outline">← Kembali ke Transaksi</Button>
      </Link>
    </div>
  );
}
