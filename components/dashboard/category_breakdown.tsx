"use client";

import {
  Briefcase,
  Bus,
  Film,
  GraduationCap,
  HeartPulse,
  Receipt,
  ShoppingBag,
  Tag,
  Utensils,
} from "lucide-react";

import { formatRupiah } from "@/lib/utils/money";

export type CategoryBreakdownItem = {
  name: string;
  amount: number;
  color: string;
};

function renderCategoryIcon(name: string, className = "size-4.5") {
  const lower = name.toLowerCase();
  if (lower.includes("makan") || lower.includes("food") || lower.includes("resto")) return <Utensils className={className} />;
  if (lower.includes("belanja") || lower.includes("shop")) return <ShoppingBag className={className} />;
  if (lower.includes("tagih") || lower.includes("bill") || lower.includes("listrik")) return <Receipt className={className} />;
  if (lower.includes("trans") || lower.includes("bensin") || lower.includes("ojek")) return <Bus className={className} />;
  if (lower.includes("sehat") || lower.includes("obat") || lower.includes("medis")) return <HeartPulse className={className} />;
  if (lower.includes("didik") || lower.includes("kuliah") || lower.includes("sekolah")) return <GraduationCap className={className} />;
  if (lower.includes("hibur") || lower.includes("game") || lower.includes("nonton")) return <Film className={className} />;
  if (lower.includes("gaji") || lower.includes("bisnis") || lower.includes("kerja")) return <Briefcase className={className} />;
  return <Tag className={className} />;
}

export function CategoryBreakdown({
  items,
  total,
}: {
  items: CategoryBreakdownItem[];
  total: number;
}) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Pengeluaran per Kategori
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Bulan ini</p>
        </div>

        <div className="flex flex-col gap-4">
          {items.length === 0 ? (
            <p className="text-muted-foreground py-10 text-center text-sm">
              Belum ada pengeluaran bulan ini.
            </p>
          ) : (
            items.map((item) => {
              const percentage = total > 0 ? (item.amount / total) * 100 : 0;

              return (
                <div key={item.name} className="flex items-center gap-3.5">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                    {renderCategoryIcon(item.name)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {item.name}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm tabular-nums shrink-0 ml-2">
                        {formatRupiah(item.amount)}{" "}
                        <span className="text-slate-400 font-normal ml-0.5">
                          {percentage.toFixed(0)}%
                        </span>
                      </span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-500"
                        style={{
                          width: `${Math.max(3, percentage)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
