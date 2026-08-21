import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Transaction } from '../../types';
import {
  Search,
  Plus,
  Filter,
  Calendar,
  Wallet,
  Tag,
  ArrowUpDown,
  Edit2,
  Trash2,
  ShoppingCart,
  Home,
  Utensils,
  Bus,
  Film,
  Briefcase,
  Gift,
  ArrowLeftRight,
} from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';

interface Props {
  onOpenAddModal: (tx?: Transaction | null) => void;
}

export const TransactionsTab: React.FC<Props> = ({ onOpenAddModal }) => {
  const { transactions, wallets, categories, deleteTransaction } = useApp();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedWallet, setSelectedWallet] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Filter transactions
  const filtered = transactions.filter((tx) => {
    // Search query
    if (
      search &&
      !tx.category.toLowerCase().includes(search.toLowerCase()) &&
      !(tx.note && tx.note.toLowerCase().includes(search.toLowerCase())) &&
      !tx.walletName.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }

    // Type filter
    if (selectedType !== 'all' && tx.type !== selectedType) {
      return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && tx.category !== selectedCategory) {
      return false;
    }

    // Wallet filter
    if (selectedWallet !== 'all' && tx.walletId !== selectedWallet && tx.toWalletId !== selectedWallet) {
      return false;
    }

    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === 'highest') return b.amount - a.amount;
    if (sortOrder === 'lowest') return a.amount - b.amount;
    if (sortOrder === 'oldest') return a.id.localeCompare(b.id);
    return b.id.localeCompare(a.id); // newest by default
  });

  const getCategoryIcon = (catName: string) => {
    switch (catName.toLowerCase()) {
      case 'makanan':
      case 'dining out':
        return <Utensils className="w-4 h-4" />;
      case 'tagihan':
      case 'utilities':
        return <Home className="w-4 h-4" />;
      case 'belanja':
      case 'groceries':
      case 'shopping':
        return <ShoppingCart className="w-4 h-4" />;
      case 'transportasi':
        return <Bus className="w-4 h-4" />;
      case 'hiburan':
      case 'entertainment':
        return <Film className="w-4 h-4" />;
      case 'gaji':
        return <Briefcase className="w-4 h-4" />;
      case 'bonus':
        return <Gift className="w-4 h-4" />;
      case 'transfer':
        return <ArrowLeftRight className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Duitku Transaction History
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Semua riwayat pemasukan, pengeluaran, dan transfer Anda.
          </p>
        </div>

        <button
          id="btn-add-transaction"
          onClick={() => onOpenAddModal(null)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Filter Card (Matching Image 4) */}
      <div className="glass-card p-5 rounded-3xl border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-3">
        {/* Row 1: Cari, Type, Category */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6">
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Cari</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 focus:border-indigo-500 focus:outline-none transition shadow-xs"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none shadow-xs"
            >
              <option value="all">Semua Tipe</option>
              <option value="expense">Pengeluaran</option>
              <option value="income">Pemasukan</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none shadow-xs"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Wallet, From Date, To Date, Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 pt-1">
          <div className="md:col-span-4">
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Wallet</label>
            <select
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value)}
              className="w-full px-3.5 py-2 bg-indigo-600/90 text-white font-semibold rounded-2xl text-xs focus:ring-2 focus:ring-indigo-300 focus:outline-none shadow-xs"
            >
              <option value="all" className="bg-white text-slate-800">
                Semua Wallet
              </option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id} className="bg-white text-slate-800">
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold text-slate-500 mb-1">From Date</label>
            <div className="relative">
              <input
                type="text"
                placeholder="mm/dd/yyyy"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 focus:border-indigo-500 focus:outline-none shadow-xs"
              />
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold text-slate-500 mb-1">To Date</label>
            <div className="relative">
              <input
                type="text"
                placeholder="mm/dd/yyyy"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 focus:border-indigo-500 focus:outline-none shadow-xs"
              />
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Sort</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none shadow-xs"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="highest">Terbesar</option>
              <option value="lowest">Terkecil</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List (Matching Image 4) */}
      <div className="space-y-3">
        {sorted.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-3xl border border-white/80">
            <p className="text-slate-500 text-sm font-semibold">
              Tidak ada transaksi yang cocok dengan filter.
            </p>
            <button
              onClick={() => onOpenAddModal(null)}
              className="mt-3 px-4 py-2 rounded-2xl bg-indigo-600 text-white text-xs font-bold"
            >
              Tambah Transaksi Pertama
            </button>
          </div>
        ) : (
          sorted.map((tx) => (
            <div
              key={tx.id}
              className="glass-card p-4 sm:p-5 rounded-2xl border border-white/80 flex items-center justify-between gap-4 hover:shadow-md transition-all group"
            >
              {/* Left Details */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900">{tx.category}</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border border-slate-200/80 bg-white text-slate-700 shadow-2xs">
                    {getCategoryIcon(tx.category)}
                    <span>
                      {tx.type === 'income'
                        ? 'Pemasukan'
                        : tx.type === 'transfer'
                        ? 'Transfer'
                        : 'Pengeluaran'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Middle Wallet & Date */}
              <div className="hidden sm:block text-slate-500 text-xs font-semibold">
                {tx.walletName} • {tx.date}
              </div>

              {/* Right Amount & Actions */}
              <div className="flex items-center gap-4">
                <span
                  className={`font-bold text-sm sm:text-base tracking-tight ${
                    tx.type === 'income' ? 'text-emerald-600' : 'text-slate-800'
                  }`}
                >
                  {tx.type === 'income' ? '+ ' : '- '}
                  {formatRupiah(tx.amount)}
                </span>

                {/* Edit / Delete actions on hover */}
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                  <button
                    onClick={() => onOpenAddModal(tx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Hapus transaksi ini?')) deleteTransaction(tx.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
