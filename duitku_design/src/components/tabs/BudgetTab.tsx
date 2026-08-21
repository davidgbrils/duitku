import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Budget } from '../../types';
import {
  Plus,
  Search,
  ShoppingCart,
  Film,
  Utensils,
  Zap,
  Bus,
  ShoppingBag,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  Sparkles,
  PieChart,
  Grid,
} from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';

interface Props {
  onOpenAddBudget: (budget?: Budget | null) => void;
}

export const BudgetTab: React.FC<Props> = ({ onOpenAddBudget }) => {
  const { budgets, deleteBudget } = useApp();

  const [viewMode, setViewMode] = useState<'grid' | 'overview'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const totalLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const totalPercent = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  const filteredBudgets = budgets.filter((b) =>
    b.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBudgetIcon = (catName: string) => {
    switch (catName.toLowerCase()) {
      case 'groceries':
      case 'belanja':
        return <ShoppingCart className="w-4 h-4 text-white" />;
      case 'entertainment':
      case 'hiburan':
        return <Film className="w-4 h-4 text-white" />;
      case 'dining out':
      case 'makanan':
        return <Utensils className="w-4 h-4 text-white" />;
      case 'utilities':
      case 'tagihan':
        return <Zap className="w-4 h-4 text-white" />;
      case 'transportation':
      case 'transportasi':
        return <Bus className="w-4 h-4 text-white" />;
      case 'shopping':
        return <ShoppingBag className="w-4 h-4 text-white" />;
      default:
        return <PieChart className="w-4 h-4 text-white" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Search Bar (Matching Image 1 & 6) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Advanced Budget Planning
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage your monthly spending with precision.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl text-xs font-bold transition ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid Perencanaan"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('overview')}
              className={`p-2 rounded-xl text-xs font-bold transition ${
                viewMode === 'overview'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Ringkasan Bulanan"
            >
              <PieChart className="w-4 h-4" />
            </button>
          </div>

          <button
            id="btn-create-budget"
            onClick={() => onOpenAddBudget(null)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Budget</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar (Matching Image 1) */}
      <div className="max-w-md relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-indigo-600/90 text-white placeholder:text-indigo-200 rounded-full text-xs font-medium focus:bg-indigo-700 focus:outline-none shadow-md shadow-indigo-500/10 transition"
        />
      </div>

      {/* OVERVIEW MODE (Matching Image 6) */}
      {viewMode === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Limit Card */}
            <div className="glass-card p-6 rounded-3xl border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    TOTAL BUDGET LIMIT (2026-08)
                  </span>
                  <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {formatRupiah(totalLimit)}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-6">
                <div className="w-full h-2 bg-indigo-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full w-full" />
                </div>
                <span className="text-[10px] text-right font-bold text-slate-400 block mt-1">
                  100%
                </span>
              </div>
            </div>

            {/* Used Card */}
            <div className="glass-card p-6 rounded-3xl border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    BUDGET USED
                  </span>
                  <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {formatRupiah(totalSpent)}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-6">
                <div className="w-full h-2 bg-indigo-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${Math.min(100, totalPercent)}%` }}
                  />
                </div>
                <span className="text-[10px] text-right font-bold text-slate-400 block mt-1">
                  {totalPercent}%
                </span>
              </div>
            </div>
          </div>

          {budgets.length === 0 && (
            <div className="glass-card p-12 text-center rounded-3xl border border-white/80 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <PieChart className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">No Budget Set Yet</h3>
              <p className="text-xs text-slate-500 mb-6">
                Set monthly limits per category to control your spending.
              </p>
              <button
                onClick={() => onOpenAddBudget(null)}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition"
              >
                + Set Budget
              </button>
            </div>
          )}
        </div>
      )}

      {/* GRID PLANNING MODE (Matching Image 1) */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBudgets.map((budget) => {
            const remaining = Math.max(0, budget.limit - budget.spent);
            const percentUsed = Math.min(100, Math.round((budget.spent / (budget.limit || 1)) * 100));
            const percentLeft = 100 - percentUsed;

            return (
              <div
                key={budget.id}
                className="glass-card rounded-3xl overflow-hidden border border-white/80 shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                {/* Indigo/Blue Header with Category Name & Action Icons (Matching Image 1) */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-3.5 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
                      {getBudgetIcon(budget.category)}
                    </div>
                    <span className="font-bold text-sm">{budget.category}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-white/80">
                    <button
                      onClick={() => onOpenAddBudget(budget)}
                      className="p-1 hover:text-white hover:bg-white/10 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus anggaran ${budget.category}?`)) {
                          deleteBudget(budget.id);
                        }
                      }}
                      className="p-1 hover:text-white hover:bg-white/10 rounded-lg transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Content (Matching Image 1) */}
                <div className="p-5 space-y-4">
                  {/* Used info */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Used: {formatRupiah(budget.spent)} of {formatRupiah(budget.limit)}
                    </span>
                    {/* Dual-tone Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentUsed}%` }}
                      />
                    </div>
                  </div>

                  {/* Remaining Big Text */}
                  <div>
                    <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      {formatRupiah(remaining)}
                      <span className="text-sm font-semibold text-slate-500 ml-1.5">Remaining</span>
                    </div>

                    {/* Left percent indicator */}
                    <div className="mt-2">
                      <span className="text-[11px] font-bold text-slate-500 block mb-1">
                        {percentLeft}% Left
                      </span>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-400 rounded-full"
                          style={{ width: `${percentLeft}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
