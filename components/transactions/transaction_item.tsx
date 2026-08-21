import Link from "next/link";
import {
  Briefcase,
  Bus,
  Film,
  GraduationCap,
  HeartPulse,
  Receipt,
  ReceiptText,
  ShoppingBag,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Utensils,
} from "lucide-react";

import { formatDate } from "@/lib/utils/date";
import { formatSignedRupiah } from "@/lib/utils/money";
import type { Database } from "@/types/database";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

function renderCategoryIcon(name: string | null, isIncome: boolean, className = "size-5") {
  if (!name) return isIncome ? <TrendingUp className={className} /> : <TrendingDown className={className} />;
  const lower = name.toLowerCase();
  if (lower.includes("makan") || lower.includes("food") || lower.includes("resto")) return <Utensils className={className} />;
  if (lower.includes("belanja") || lower.includes("shop")) return <ShoppingCart className={className} />;
  if (lower.includes("tagih") || lower.includes("bill") || lower.includes("listrik")) return <Receipt className={className} />;
  if (lower.includes("trans") || lower.includes("bensin") || lower.includes("ojek")) return <Bus className={className} />;
  if (lower.includes("sehat") || lower.includes("obat") || lower.includes("medis")) return <HeartPulse className={className} />;
  if (lower.includes("didik") || lower.includes("kuliah") || lower.includes("sekolah")) return <GraduationCap className={className} />;
  if (lower.includes("hibur") || lower.includes("game") || lower.includes("nonton")) return <Film className={className} />;
  if (lower.includes("gaji") || lower.includes("bisnis") || lower.includes("bonus")) return <Briefcase className={className} />;
  return isIncome ? <TrendingUp className={className} /> : <ShoppingBag className={className} />;
}

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
      <Link href={`/transactions/${transaction.id}`} className="block group">
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white px-5 py-3.5 shadow-2xs transition-all duration-200 hover:border-indigo-300 hover:shadow-xs dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-indigo-800">
          <div className="flex min-w-0 items-center gap-3.5">
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                isIncome
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                  : "bg-rose-50 text-rose-500 dark:bg-rose-950/60 dark:text-rose-400"
              }`}
            >
              {renderCategoryIcon(categoryName, isIncome, "size-5")}
            </div>

            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                  {categoryName ?? transaction.description ?? "Tanpa Kategori"}
                </p>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${
                    isIncome
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {renderCategoryIcon(categoryName, isIncome, "size-3")}
                  {isIncome ? "Pemasukan" : "Pengeluaran"}
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {walletName}
                </span>{" "}
                • {formatDate(transaction.transaction_date)}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {transaction.receipt_image_url && (
              <ReceiptText className="size-4 text-slate-400" />
            )}
            <p
              className={`text-base font-bold tabular-nums tracking-tight ${
                isIncome
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {formatSignedRupiah(transaction.amount, isIncome)}
            </p>
          </div>
        </div>
      </Link>
    </li>
  );
}
