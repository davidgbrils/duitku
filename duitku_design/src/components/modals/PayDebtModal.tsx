import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Debt } from '../../types';
import { X, CheckCircle2, Wallet, AlertCircle } from 'lucide-react';
import { formatIDR, formatRupiah } from '../../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt | null;
}

export const PayDebtModal: React.FC<Props> = ({ isOpen, onClose, debt }) => {
  const { wallets, payDebt } = useApp();

  const remaining = debt ? debt.totalAmount - debt.paidAmount : 0;
  const [amount, setAmount] = useState<string>(remaining > 0 ? remaining.toString() : '0');
  const [walletId, setWalletId] = useState<string>(wallets[0]?.id || 'w-1');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !debt) return null;

  const selectedWallet = wallets.find((w) => w.id === walletId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const numAmount = parseFloat(amount.replace(/[^0-9]/g, '')) || 0;

    if (numAmount <= 0) {
      setError('Masukkan nominal pembayaran yang valid.');
      return;
    }

    if (selectedWallet && selectedWallet.balance < numAmount) {
      setError(`Saldo ${selectedWallet.name} tidak mencukupi (${formatRupiah(selectedWallet.balance)}).`);
      return;
    }

    const success = payDebt(debt.id, numAmount, walletId);
    if (success) {
      onClose();
    } else {
      setError('Gagal memproses pembayaran. Periksa saldo dompet Anda.');
    }
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

        <h2 className="text-xl font-bold text-slate-800 mb-1">Bayar Hutang / Cicilan</h2>
        <p className="text-xs text-slate-500 mb-4">
          Pelunasan untuk <span className="font-semibold text-slate-700">{debt.creditorName}</span>
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 mb-4 flex justify-between items-center">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Sisa Hutang</span>
            <span className="text-lg font-extrabold text-indigo-900">{formatIDR(remaining)}</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-semibold text-slate-500 block">Jatuh Tempo</span>
            <span className="text-xs font-bold text-slate-700">{debt.dueDate}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Jumlah Pembayaran</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                Rp
              </span>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-lg focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setAmount(remaining.toString())}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition"
              >
                Bayar Lunas (100%)
              </button>
              <button
                type="button"
                onClick={() => setAmount((remaining / 2).toFixed(0))}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition"
              >
                Bayar 50%
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-slate-400" /> Bayar Menggunakan Dompet
            </label>
            <select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} — Saldo: {formatRupiah(w.balance)}
                </option>
              ))}
            </select>
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
              className="flex-1 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Konfirmasi Bayar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
