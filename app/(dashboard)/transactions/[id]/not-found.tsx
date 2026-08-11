import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function TransactionNotFound() {
  return (
    <div className="bg-card ring-border mx-auto flex w-full max-w-md flex-col items-center gap-3 rounded-xl px-6 py-14 text-center ring-1">
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
