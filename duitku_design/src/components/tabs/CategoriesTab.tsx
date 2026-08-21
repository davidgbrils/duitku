import React from 'react';
import { useApp } from '../../context/AppContext';
import { Category } from '../../types';
import {
  Plus,
  Briefcase,
  Gift,
  ShoppingCart,
  Home,
  Utensils,
  Bus,
  Film,
  Coffee,
  Heart,
  Zap,
  Tag,
  Edit2,
  Trash2,
} from 'lucide-react';

interface Props {
  onOpenAddCategory: (category?: Category | null, defaultType?: 'income' | 'expense') => void;
}

export const CategoriesTab: React.FC<Props> = ({ onOpenAddCategory }) => {
  const { categories, deleteCategory } = useApp();

  const incomeCategories = categories.filter((c) => c.type === 'income');
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const getIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'briefcase':
        return <Briefcase className="w-5 h-5 text-slate-800" />;
      case 'gift':
        return <Gift className="w-5 h-5 text-slate-800" />;
      case 'shoppingcart':
        return <ShoppingCart className="w-5 h-5 text-slate-800" />;
      case 'home':
        return <Home className="w-5 h-5 text-slate-800" />;
      case 'utensils':
        return <Utensils className="w-5 h-5 text-slate-800" />;
      case 'bus':
        return <Bus className="w-5 h-5 text-slate-800" />;
      case 'film':
        return <Film className="w-5 h-5 text-slate-800" />;
      case 'coffee':
        return <Coffee className="w-5 h-5 text-slate-800" />;
      case 'heart':
        return <Heart className="w-5 h-5 text-slate-800" />;
      case 'zap':
        return <Zap className="w-5 h-5 text-slate-800" />;
      default:
        return <Tag className="w-5 h-5 text-slate-800" />;
    }
  };

  const renderCategoryCard = (cat: Category) => (
    <div
      key={cat.id}
      className="glass-card p-5 rounded-3xl border border-white/80 shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-md transition-all flex flex-col justify-between"
    >
      <div>
        <div className="w-12 h-12 rounded-2xl bg-white/90 border border-slate-100 flex items-center justify-center mb-4 shadow-xs">
          {getIcon(cat.icon)}
        </div>
        <h3 className="font-extrabold text-base text-slate-900 mb-3">{cat.name}</h3>
      </div>

      <div className="flex items-center justify-between pt-2">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-xs">
          {cat.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onOpenAddCategory(cat)}
            className="w-8 h-8 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition"
            title="Edit Kategori"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              if (confirm(`Hapus kategori ${cat.name}?`)) deleteCategory(cat.id);
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition"
            title="Hapus Kategori"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header (Matching Image 3) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Duitku Category Settings
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Kelola kategori pemasukan dan pengeluaranmu untuk pelacakan yang lebih baik.
          </p>
        </div>

        <button
          id="btn-tambah-kategori"
          onClick={() => onOpenAddCategory(null)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori</span>
        </button>
      </div>

      {/* Income Categories (Matching Image 3) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Income Categories</h2>
          <button
            onClick={() => onOpenAddCategory(null, 'income')}
            className="text-xs font-semibold text-indigo-600 hover:underline"
          >
            + Tambah Pemasukan
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {incomeCategories.map(renderCategoryCard)}
        </div>
      </div>

      {/* Expense Categories (Matching Image 3) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Expense Categories</h2>
          <button
            onClick={() => onOpenAddCategory(null, 'expense')}
            className="text-xs font-semibold text-indigo-600 hover:underline"
          >
            + Tambah Pengeluaran
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {expenseCategories.map(renderCategoryCard)}
        </div>
      </div>
    </div>
  );
};
