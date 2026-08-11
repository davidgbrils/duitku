import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/date";
import { formatSignedRupiah } from "@/lib/utils/money";
import type { Database } from "@/types/database";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

export function TransactionItem({
  transaction,
  walletName,
  categoryName,
}: {
  transaction: Transaction;
  walletName: string;
  categoryName: string | null;
}) {
  const isIncome = transaction.type === "income";

  return (
    <li>
      <Link href={`/transactions/${transaction.id}`} className="block">
        <Card className="hover:bg-muted/50 transition-colors">
          <CardContent className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <Badge
                variant={isIncome ? "default" : "destructive"}
                className={isIncome ? "bg-success/10 text-success" : undefined}
              >
                {isIncome ? "Pemasukan" : "Pengeluaran"}
              </Badge>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {categoryName ?? "Tanpa kategori"}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {walletName} · {formatDate(transaction.transaction_date)}
                </p>
              </div>
            </div>
            <p
              className={
                isIncome
                  ? "text-success shrink-0 text-sm font-semibold"
                  : "text-destructive shrink-0 text-sm font-semibold"
              }
            >
              {formatSignedRupiah(transaction.amount, isIncome)}
            </p>
          </CardContent>
        </Card>
      </Link>
    </li>
  );
}
