import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Budget } from '../../types';
import { X, PieChart, Tag, DollarSign } from 'lucide-react';
import { getMonthYearString } from '../../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Budget | null;
}

export const BudgetModal: React.FC<Props> = ({ isOpen, onClose, initialData }) => {
  const { categories, addBudget, updateBudget } = useApp();

  const [category, setCategory] = useState(initialData?.category || 'Groceries');
  const [limit, setLimit] = useState(initialData ? initialData.limit.toString() : '1200000');
  const [month, setMonth] = useState(initialData?.month || getMonthYearString());

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numLimit = parseFloat(limit.replace(/[^0-9]/g, '')) || 0;
    if (numLimit <= 0) {
      alert('Limit anggaran harus lebih dari 0.');
      return;
    }

    if (initialData) {
      updateBudget(initialData.id, {
        category,
        limit: numLimit,
        month,
      });
    } else {
      addBudget({
        category,
        limit: numLimit,
        spent: 0,
        month,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-slate-800 mb-1">
          {initialData ? 'Edit Anggaran' : 'Buat Anggaran Baru'}
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Batasi pengeluaran per kategori agar keuangan tetap terkendali.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" /> Kategori
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Groceries, Entertainment, Dining Out, Utilities"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Batas Anggaran Bulanan (Rp / $)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                Rp
              </span>
              <input
                type="number"
                required
                placeholder="1200000"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-base focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Bulan Periode</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition"
            >
              Simpan Anggaran
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
