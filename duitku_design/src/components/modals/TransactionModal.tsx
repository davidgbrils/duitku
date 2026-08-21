import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Transaction } from '../../types';
import { X, ArrowDownRight, ArrowUpRight, Calendar, DollarSign, Tag, Wallet } from 'lucide-react';
import { getTodayDateString } from '../../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Transaction | null;
}

export const TransactionModal: React.FC<Props> = ({ isOpen, onClose, initialData }) => {
  const { wallets, categories, addTransaction, updateTransaction } = useApp();

  const [type, setType] = useState<'income' | 'expense'>(initialData?.type === 'income' ? 'income' : 'expense');
  const [amount, setAmount] = useState<string>(initialData ? initialData.amount.toString() : '');
  const [category, setCategory] = useState<string>(initialData?.category || categories[0]?.name || 'Makanan');
  const [walletId, setWalletId] = useState<string>(initialData?.walletId || wallets[0]?.id || 'w-1');
  const [date, setDate] = useState<string>(initialData?.date || getTodayDateString());
  const [note, setNote] = useState<string>(initialData?.note || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(/[^0-9]/g, ''));
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Masukkan jumlah uang yang valid.');
      return;
    }

    const selectedWallet = wallets.find((w) => w.id === walletId);
    const walletName = selectedWallet ? selectedWallet.name : 'Dompet';

    if (initialData) {
      updateTransaction(initialData.id, {
        type,
        amount: numAmount,
        category,
        walletId,
        walletName,
        date,
        note,
      });
    } else {
      addTransaction({
        type,
        amount: numAmount,
        category,
        walletId,
        walletName,
        date,
        note,
      });
    }

    onClose();
  };

  const filteredCategories = categories.filter((c) => c.type === type);

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
          {initialData ? 'Edit Transaksi' : 'Tambah Transaksi'}
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          Catat pengeluaran atau pemasukan baru dengan mudah.
        </p>

        {/* Type Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl mb-4">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              type === 'expense'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownRight className="w-4 h-4 text-rose-500" />
            Pengeluaran
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              type === 'income'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
            Pemasukan
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Jumlah (Rp)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                Rp
              </span>
              <input
                type="number"
                required
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-lg focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
              />
            </div>
          </div>

          {/* Category & Wallet row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" /> Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
                {filteredCategories.length === 0 && (
                  <option value={type === 'income' ? 'Lainnya' : 'Lain-lain'}>Lainnya</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-slate-400" /> Dompet / Akun
              </label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Tanggal
            </label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="Contoh: 18 Agustus 2026"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Catatan (Opsional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Beli bensin, bayar makan..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
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
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
