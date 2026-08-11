import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatRupiah } from "@/lib/utils/money";

export type MonthlyTrendPoint = {
  label: string;
  income: number;
  expense: number;
};

/**
 * Chart Income vs Expense per bulan (TASK-0802) — bar chart murni CSS,
 * tanpa dependency chart. Skala disamakan antara income & expense agar
 * perbandingan jujur.
 */
export function MonthlyTrendChart({ data }: { data: MonthlyTrendPoint[] }) {
  const maxValue = Math.max(
    1,
    ...data.flatMap((point) => [point.income, point.expense])
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tren Bulanan</CardTitle>
        <CardDescription>6 bulan terakhir</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-44 items-end justify-between gap-3">
          {data.map((point) => (
            <div
              key={point.label}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
            >
              <div className="flex w-full flex-1 items-end justify-center gap-1">
                <div
                  className="bg-success/80 w-2.5 rounded-t-sm sm:w-3.5"
                  style={{
                    height: `${Math.max(2, (point.income / maxValue) * 100)}%`,
                  }}
                  title={`Pemasukan ${point.label}: ${formatRupiah(point.income)}`}
                />
                <div
                  className="bg-destructive/80 w-2.5 rounded-t-sm sm:w-3.5"
                  style={{
                    height: `${Math.max(2, (point.expense / maxValue) * 100)}%`,
                  }}
                  title={`Pengeluaran ${point.label}: ${formatRupiah(point.expense)}`}
                />
              </div>
              <span className="text-muted-foreground text-[10px] font-medium">
                {point.label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="bg-success/80 size-2.5 rounded-sm" />
            Pemasukan
          </span>
          <span className="flex items-center gap-1.5">
            <span className="bg-destructive/80 size-2.5 rounded-sm" />
            Pengeluaran
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
