import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Mic,
  ScanLine,
  Wallet as WalletIcon,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Utensils,
  Home,
  ShoppingCart,
  Bus,
  Film,
  Briefcase,
  Gift,
  Tag,
  CreditCard,
} from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';

interface Props {
  onOpenVoice: () => void;
  onOpenScanner: () => void;
  onOpenAddTx: () => void;
}

export const DashboardTab: React.FC<Props> = ({
  onOpenVoice,
  onOpenScanner,
  onOpenAddTx,
}) => {
  const {
    wallets,
    transactions,
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    netCashFlow,
    setTab,
  } = useApp();

  // Category spending calculation
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const totalExpenseAmount = expenseTransactions.reduce((acc, t) => acc + t.amount, 0) || 1;

  const categoryTotals: { [key: string]: number } = {};
  expenseTransactions.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const categoryBreakdown = Object.entries(categoryTotals)
    .map(([cat, amt]) => ({
      name: cat,
      amount: amt,
      percent: Math.round((amt / totalExpenseAmount) * 100),
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);

  const getCategoryIcon = (catName: string) => {
    switch (catName.toLowerCase()) {
      case 'makanan':
      case 'dining out':
      case 'kuliner':
        return <Utensils className="w-4 h-4 text-indigo-600" />;
      case 'tagihan':
      case 'utilities':
        return <Home className="w-4 h-4 text-indigo-600" />;
      case 'belanja':
      case 'groceries':
      case 'shopping':
        return <ShoppingCart className="w-4 h-4 text-indigo-600" />;
      case 'transportasi':
        return <Bus className="w-4 h-4 text-indigo-600" />;
      case 'hiburan':
      case 'entertainment':
        return <Film className="w-4 h-4 text-indigo-600" />;
      case 'gaji':
        return <Briefcase className="w-4 h-4 text-emerald-600" />;
      default:
        return <Tag className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Greeting & Action Buttons Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-100 ring-2 ring-slate-100 overflow-hidden flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
              alt="Avatar"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Selamat Datang, DAVIDGS!
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Kelola Keuanganmu, Lebih Sederhana & Terukur.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-catat-suara"
            onClick={onOpenVoice}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs transition active:scale-95"
          >
            <Mic className="w-3.5 h-3.5 text-indigo-600" />
            <span>Catat Suara</span>
          </button>

          <button
            id="btn-pindai-struk"
            onClick={onOpenScanner}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs transition active:scale-95"
          >
            <ScanLine className="w-3.5 h-3.5 text-indigo-600" />
            <span>Pindai Struk</span>
          </button>

          <button
            id="btn-dompet-saya"
            onClick={() => setTab('wallets')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition active:scale-95"
          >
            <WalletIcon className="w-3.5 h-3.5" />
            <span>Dompet Saya</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Saldo */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between hover:border-slate-300 transition">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">Total Saldo</span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatRupiah(totalBalance)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <WalletIcon className="w-5 h-5" />
          </div>
        </div>

        {/* Pemasukan Bulan Ini */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between hover:border-slate-300 transition">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              Pemasukan Bulan Ini
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 tracking-tight">
              {formatRupiah(monthlyIncome)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <ArrowUp className="w-5 h-5" />
          </div>
        </div>

        {/* Pengeluaran Bulan Ini */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between hover:border-slate-300 transition">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              Pengeluaran Bulan Ini
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatRupiah(monthlyExpense)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <ArrowDown className="w-5 h-5" />
          </div>
        </div>

        {/* Arus Kas Bersih */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between hover:border-slate-300 transition">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              Arus Kas Bersih
            </span>
            <span
              className={`text-xl sm:text-2xl font-extrabold tracking-tight ${
                netCashFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {formatRupiah(netCashFlow)}
            </span>
          </div>
          <div
            className={`w-11 h-11 rounded-xl border flex items-center justify-center ${
              netCashFlow >= 0
                ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                : 'bg-rose-50 border-rose-100 text-rose-600'
            }`}
          >
            {netCashFlow >= 0 ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Middle Row: Tren Bulanan Chart + Pengeluaran per Kategori */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Tren Bulanan Chart Card (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Tren Bulanan</h2>
              <p className="text-[11px] text-slate-500 font-medium">Grafik arus kas 6 bulan terakhir</p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Pemasukan</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Pengeluaran</span>
              </div>
            </div>
          </div>

          {/* Spline Area SVG chart */}
          <div className="relative w-full h-52 sm:h-56">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              <defs>
                {/* Pemasukan gradient */}
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
                {/* Pengeluaran gradient */}
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid horizontal lines */}
              {[0, 40, 80, 120, 160].map((y, idx) => (
                <line
                  key={idx}
                  x1="30"
                  y1={y}
                  x2="480"
                  y2={y}
                  stroke="#F1F5F9"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              ))}

              {/* Y-axis labels */}
              <text x="5" y="10" fill="#94A3B8" fontSize="10" fontWeight="500">500</text>
              <text x="5" y="50" fill="#94A3B8" fontSize="10" fontWeight="500">400</text>
              <text x="5" y="90" fill="#94A3B8" fontSize="10" fontWeight="500">300</text>
              <text x="5" y="130" fill="#94A3B8" fontSize="10" fontWeight="500">200</text>
              <text x="5" y="170" fill="#94A3B8" fontSize="10" fontWeight="500">100</text>
              <text x="15" y="195" fill="#94A3B8" fontSize="10" fontWeight="500">0</text>

              {/* Expense area */}
              <path
                d="M 40 190 C 80 190, 110 160, 140 100 C 180 30, 230 190, 280 190 C 310 190, 340 30, 370 40 C 400 60, 420 180, 480 190 L 480 190 L 40 190 Z"
                fill="url(#expenseGradient)"
              />
              <path
                d="M 40 190 C 80 190, 110 160, 140 100 C 180 30, 230 190, 280 190 C 310 190, 340 30, 370 40 C 400 60, 420 180, 480 190"
                fill="none"
                stroke="#E11D48"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Income area */}
              <path
                d="M 40 150 C 90 150, 120 70, 160 60 C 220 50, 280 150, 340 140 C 390 130, 420 30, 480 40 L 480 190 L 40 190 Z"
                fill="url(#incomeGradient)"
              />
              <path
                d="M 40 150 C 90 150, 120 70, 160 60 C 220 50, 280 150, 340 140 C 390 130, 420 30, 480 40"
                fill="none"
                stroke="#059669"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* X-axis labels */}
              <text x="60" y="198" fill="#64748B" fontSize="10" fontWeight="600" textAnchor="middle">Mar 26</text>
              <text x="160" y="198" fill="#64748B" fontSize="10" fontWeight="600" textAnchor="middle">Apr 26</text>
              <text x="260" y="198" fill="#64748B" fontSize="10" fontWeight="600" textAnchor="middle">Mei 26</text>
              <text x="370" y="198" fill="#64748B" fontSize="10" fontWeight="600" textAnchor="middle">Jul 26</text>
              <text x="460" y="198" fill="#64748B" fontSize="10" fontWeight="600" textAnchor="middle">Agt 26</text>
            </svg>
          </div>
        </div>

        {/* Pengeluaran per Kategori (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900">Pengeluaran per Kategori</h2>
              <p className="text-[11px] text-slate-500 font-medium">Bulan ini</p>
            </div>

            <div className="space-y-3.5">
              {categoryBreakdown.length > 0 ? (
                categoryBreakdown.map((item) => (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                          {getCategoryIcon(item.name)}
                        </div>
                        <span className="font-bold text-slate-800">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">
                          {formatRupiah(item.amount)}
                        </span>
                        <span className="font-bold text-slate-500 text-[11px]">
                          {item.percent}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(8, item.percent))}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  Belum ada data pengeluaran di bulan ini
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setTab('anggaran')}
            className="w-full mt-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-indigo-700 text-xs font-bold border border-slate-200/80 transition flex items-center justify-center gap-1"
          >
            <span>Kelola Anggaran Kategori</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Section: Transaksi Terakhir */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Transaksi Terakhir</h2>
            <p className="text-[11px] text-slate-500 font-medium">Riwayat pengeluaran dan pemasukan terkini</p>
          </div>
          <button
            onClick={() => setTab('transaksi')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 hover:underline"
          >
            <span>Lihat semua</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {transactions.slice(0, 5).map((tx) => (
            <div
              key={tx.id}
              className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/80 rounded-xl px-2 transition"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    tx.type === 'income'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : 'bg-rose-50 text-rose-600 border border-rose-100'
                  }`}
                >
                  {getCategoryIcon(tx.category)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">
                      {tx.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        tx.type === 'income'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : tx.type === 'transfer'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {tx.type === 'income'
                        ? 'Pemasukan'
                        : tx.type === 'transfer'
                        ? 'Transfer'
                        : 'Pengeluaran'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {tx.walletName} • {tx.date}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`font-bold text-xs sm:text-sm ${
                    tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {formatRupiah(tx.amount)}
                </span>
                {tx.note && (
                  <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{tx.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
