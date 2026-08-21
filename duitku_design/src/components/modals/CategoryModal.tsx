import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Category } from '../../types';
import { X, Briefcase, Gift, ShoppingCart, Home, Utensils, Bus, Film, Coffee, Heart, Zap, Tag } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Category | null;
  defaultType?: 'income' | 'expense';
}

const iconList = [
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Gift', icon: Gift },
  { name: 'ShoppingCart', icon: ShoppingCart },
  { name: 'Home', icon: Home },
  { name: 'Utensils', icon: Utensils },
  { name: 'Bus', icon: Bus },
  { name: 'Film', icon: Film },
  { name: 'Coffee', icon: Coffee },
  { name: 'Heart', icon: Heart },
  { name: 'Zap', icon: Zap },
  { name: 'Tag', icon: Tag },
];

export const CategoryModal: React.FC<Props> = ({ isOpen, onClose, initialData, defaultType = 'expense' }) => {
  const { addCategory, updateCategory } = useApp();

  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState<'income' | 'expense'>(initialData?.type || defaultType);
  const [icon, setIcon] = useState(initialData?.icon || 'Tag');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (initialData) {
      updateCategory(initialData.id, { name, type, icon });
    } else {
      addCategory({ name, type, icon });
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
          {initialData ? 'Edit Kategori' : 'Tambah Kategori'}
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Kelompokkan pengeluaran dan pemasukan dengan rapi.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Tipe Kategori</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2 rounded-xl text-xs font-bold transition ${
                  type === 'expense' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'
                }`}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2 rounded-xl text-xs font-bold transition ${
                  type === 'income' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'
                }`}
              >
                Pemasukan
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Kategori</label>
            <input
              type="text"
              required
              placeholder="Contoh: Investasi, Kesehatan, Kuliner"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Pilih Ikon</label>
            <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1">
              {iconList.map((ic) => {
                const IconComponent = ic.icon;
                const isSelected = icon === ic.name;
                return (
                  <button
                    key={ic.name}
                    type="button"
                    onClick={() => setIcon(ic.name)}
                    className={`p-2.5 rounded-2xl flex items-center justify-center border transition ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-600 shadow-sm'
                        : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
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
              Simpan Kategori
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
