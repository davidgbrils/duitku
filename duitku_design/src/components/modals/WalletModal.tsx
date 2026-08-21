import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Wallet } from '../../types';
import { X, Building2, Wallet as CashIcon, Smartphone, LineChart } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Wallet | null;
}

export const WalletModal: React.FC<Props> = ({ isOpen, onClose, initialData }) => {
  const { addWallet, updateWallet } = useApp();

  const [name, setName] = useState(initialData?.name || '');
  const [balance, setBalance] = useState(initialData ? initialData.balance.toString() : '');
  const [type, setType] = useState<Wallet['type']>(initialData?.type || 'bank');
  const [accountNumber, setAccountNumber] = useState(initialData?.accountNumber || '');
  const [color, setColor] = useState(initialData?.color || '#3B82F6');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numBalance = parseFloat(balance.replace(/[^0-9]/g, '')) || 0;

    if (initialData) {
      updateWallet(initialData.id, {
        name,
        balance: numBalance,
        type,
        accountNumber,
        color,
      });
    } else {
      addWallet({
        name,
        balance: numBalance,
        type,
        accountNumber,
        color,
      });
    }
    onClose();
  };

  const colors = ['#3B82F6', '#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4'];

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
          {initialData ? 'Edit Dompet / Akun' : 'Tambah Dompet Baru'}
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          Kelola rekening bank, uang tunai, atau dompet digital Anda.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Akun / Bank</label>
            <input
              type="text"
              required
              placeholder="Contoh: BCA Bank, Mandiri, Gopay, Cash"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Tipe Akun</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'bank', label: 'Bank', icon: Building2 },
                { id: 'cash', label: 'Cash', icon: CashIcon },
                { id: 'ewallet', label: 'E-Wallet', icon: Smartphone },
                { id: 'investment', label: 'Invest', icon: LineChart },
              ].map((t) => {
                const Icon = t.icon;
                const active = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id as Wallet['type'])}
                    className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-2xl text-xs font-semibold border transition ${
                      active
                        ? 'border-indigo-500 bg-indigo-50/80 text-indigo-700'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Saldo Saat Ini (Rp)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                Rp
              </span>
              <input
                type="number"
                required
                placeholder="0"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-base focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Nomor Rekening / Keterangan</label>
            <input
              type="text"
              placeholder="Contoh: 123-456-7890"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Warna Aksen</label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-indigo-500 ring-offset-2' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
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
              Simpan Dompet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
