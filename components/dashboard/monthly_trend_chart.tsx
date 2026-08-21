"use client";

export type MonthlyTrendPoint = {
  label: string;
  income: number;
  expense: number;
};

export function MonthlyTrendChart({ data }: { data: MonthlyTrendPoint[] }) {
  const maxVal = Math.max(
    1,
    ...data.flatMap((d) => [d.income, d.expense])
  );

  // Build SVG path points
  const width = 500;
  const height = 180;
  const paddingX = 30;
  const paddingY = 20;

  const innerW = width - paddingX * 2;
  const innerH = height - paddingY * 2;

  const count = Math.max(1, data.length - 1);
  const getX = (i: number) => paddingX + (i / count) * innerW;
  const getY = (val: number) => height - paddingY - (val / maxVal) * innerH;

  const incomePoints = data.map((d, i) => ({ x: getX(i), y: getY(d.income) }));
  const expensePoints = data.map((d, i) => ({ x: getX(i), y: getY(d.expense) }));

  // Helper to make smooth SVG path
  function makeSmoothPath(pts: { x: number; y: number }[]) {
    if (pts.length === 0) return "";
    let path = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cx = (p0.x + p1.x) / 2;
      path += ` C ${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
    }
    return path;
  }

  const incomeLine = makeSmoothPath(incomePoints);
  const expenseLine = makeSmoothPath(expensePoints);

  const lastIncome = incomePoints[incomePoints.length - 1];
  const firstIncome = incomePoints[0];
  const incomeArea = `${incomeLine} L ${lastIncome.x},${height - paddingY} L ${firstIncome.x},${height - paddingY} Z`;

  const lastExpense = expensePoints[expensePoints.length - 1];
  const firstExpense = expensePoints[0];
  const expenseArea = `${expenseLine} L ${lastExpense.x},${height - paddingY} L ${firstExpense.x},${height - paddingY} Z`;

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Tren Bulanan
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              6 bulan terakhir sampai saat ini
            </p>
          </div>
          <div className="flex items-center gap-3.5 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <span className="size-2.5 rounded-full bg-emerald-500" />
              Pemasukan
            </span>
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <span className="size-2.5 rounded-full bg-rose-500" />
              Pengeluaran
            </span>
          </div>
        </div>

        <div className="relative h-48 w-full">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-full w-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line
              x1={paddingX}
              y1={height - paddingY}
              x2={width - paddingX}
              y2={height - paddingY}
              stroke="#E2E8F0"
              strokeDasharray="4 4"
            />
            <line
              x1={paddingX}
              y1={height / 2}
              x2={width - paddingX}
              y2={height / 2}
              stroke="#E2E8F0"
              strokeDasharray="4 4"
            />
            <line
              x1={paddingX}
              y1={paddingY}
              x2={width - paddingX}
              y2={paddingY}
              stroke="#E2E8F0"
              strokeDasharray="4 4"
            />

            {/* Income Area & Line */}
            <path d={incomeArea} fill="url(#incomeGrad)" />
            <path
              d={incomeLine}
              fill="none"
              stroke="#10B981"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Expense Area & Line */}
            <path d={expenseArea} fill="url(#expenseGrad)" />
            <path
              d={expenseLine}
              fill="none"
              stroke="#F43F5E"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Points */}
            {incomePoints.map((p, i) => (
              <circle
                key={`inc-${i}`}
                cx={p.x}
                cy={p.y}
                r="3.5"
                fill="#10B981"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            ))}
            {expensePoints.map((p, i) => (
              <circle
                key={`exp-${i}`}
                cx={p.x}
                cy={p.y}
                r="3.5"
                fill="#F43F5E"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            ))}
          </svg>
        </div>

        {/* Labels */}
        <div className="flex justify-between px-3 pt-2 text-[11px] font-medium text-slate-400">
          {data.map((d) => (
            <span key={d.label}>{d.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
