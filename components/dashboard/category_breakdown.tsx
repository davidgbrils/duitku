import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatRupiah } from "@/lib/utils/money";

export type CategoryBreakdownItem = {
  name: string;
  amount: number;
  color: string;
};

const PALETTE = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#0ea5e9",
  "#ec4899",
  "#8b5cf6",
  "#ef4444",
  "#14b8a6",
];

/**
 * Breakdown pengeluaran per kategori bulan ini (TASK-0802).
 * 5 kategori teratas + "Lainnya". Murni CSS, tanpa dependency chart.
 */
export function CategoryBreakdown({
  items,
  total,
}: {
  items: CategoryBreakdownItem[];
  total: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengeluaran per Kategori</CardTitle>
        <CardDescription>Bulan ini</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {items.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            Belum ada pengeluaran bulan ini.
          </p>
        ) : (
          items.map((item, index) => {
            const percentage = total > 0 ? (item.amount / total) * 100 : 0;
            return (
              <div key={item.name} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    <span
                      className="size-2.5 rounded-sm"
                      style={{
                        backgroundColor:
                          item.color ?? PALETTE[index % PALETTE.length],
                      }}
                    />
                    {item.name}
                  </span>
                  <span className="text-muted-foreground">
                    {formatRupiah(item.amount)}
                    <span className="ml-2 tabular-nums">
                      {percentage.toFixed(0)}%
                    </span>
                  </span>
                </div>
                <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(2, percentage)}%`,
                      backgroundColor:
                        item.color ?? PALETTE[index % PALETTE.length],
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
