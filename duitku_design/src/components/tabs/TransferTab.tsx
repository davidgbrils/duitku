import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeftRight,
  ArrowRight,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Wallet,
} from 'lucide-react';
import { formatRupiah, getTodayDateString } from '../../utils/formatters';

export const TransferTab: React.FC = () => {
  const { wallets, transferFunds, transactions } = useApp();

  const [fromWalletId, setFromWalletId] = useState<string>(wallets[0]?.id || 'w-1');
  const [toWalletId, setToWalletId] = useState<string>(
    wallets[1]?.id || wallets[0]?.id || 'w-2'
  );
  const [amount, setAmount] = useState<string>('4146000');
  const [note, setNote] = useState<string>('Tabungan dana darurat');
  const [date, setDate] = useState<string>('15 Juli 2026');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fromWallet = wallets.find((w) => w.id === fromWalletId) || wallets[0];
  const toWallet = wallets.find((w) => w.id === toWalletId) || wallets[1] || wallets[0];

  const handleSwap = () => {
    setFromWalletId(toWalletId);
    setToWalletId(fromWalletId);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (fromWalletId === toWalletId) {
      setMessage({ text: 'Pilih dompet tujuan yang berbeda.', type: 'error' });
      return;
    }

    const numAmount = parseFloat(amount.replace(/[^0-9]/g, '')) || 0;
    if (numAmount <= 0) {
      setMessage({ text: 'Masukkan jumlah transfer yang valid.', type: 'error' });
      return;
    }

    if (fromWallet && fromWallet.balance < numAmount) {
      setMessage({
        text: `Saldo ${fromWallet.name} tidak mencukupi (${formatRupiah(fromWallet.balance)}).`,
        type: 'error',
      });
      return;
    }

    const success = transferFunds(fromWalletId, toWalletId, numAmount, note, date);
    if (success) {
      setMessage({
        text: `Berhasil mentransfer ${formatRupiah(numAmount)} dari ${fromWallet.name} ke ${
          toWallet.name
        }!`,
        type: 'success',
      });
      setAmount('');
      setNote('');
    } else {
      setMessage({ text: 'Gagal melakukan transfer. Coba lagi.', type: 'error' });
    }
  };

  const transferTransactions = transactions.filter((t) => t.type === 'transfer');

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300 py-2">
      {/* Transfer Glassmorphic Card (Matching Image 2) */}
      <div className="glass-card p-6 sm:p-9 rounded-[2.5rem] border border-white/90 shadow-[0_12px_40px_rgba(50,70,140,0.08)] relative">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Transfer Funds
        </h1>

        {message && (
          <div
            className={`p-3.5 mb-6 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleTransfer} className="space-y-6">
          {/* From and To Selector Row with Swap button */}
          <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center">
            {/* From */}
            <div className="sm:col-span-5 space-y-1">
              <label className="block text-xs font-bold text-slate-700">From</label>
              <select
                value={fromWalletId}
                onChange={(e) => setFromWalletId(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none shadow-xs"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
              <span className="text-[11px] font-semibold text-slate-500 block pt-0.5">
                Balance: {formatRupiah(fromWallet?.balance || 0)}
              </span>
            </div>

            {/* Swap Button */}
            <div className="sm:col-span-1 flex justify-center pt-3 sm:pt-0">
              <button
                type="button"
                onClick={handleSwap}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 flex items-center justify-center transition shadow-xs"
                title="Tukar Pengirim & Penerima"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
            </div>

            {/* To */}
            <div className="sm:col-span-5 space-y-1">
              <label className="block text-xs font-bold text-slate-700">To</label>
              <select
                value={toWalletId}
                onChange={(e) => setToWalletId(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none shadow-xs"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
              <span className="text-[11px] font-semibold text-slate-500 block pt-0.5">
                Balance: {formatRupiah(toWallet?.balance || 0)}
              </span>
            </div>
          </div>

          {/* Large Big Amount Input (Matching Image 2) */}
          <div className="relative">
            <div className="w-full px-5 py-4 bg-white border-2 border-slate-300/80 rounded-2xl shadow-inner flex items-center">
              <span className="text-xl sm:text-2xl font-bold text-slate-400 mr-2">Rp</span>
              <input
                type="number"
                required
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full font-extrabold text-2xl sm:text-4xl text-slate-900 tracking-tight bg-transparent focus:outline-none placeholder:text-slate-300"
              />
            </div>

            {/* Quick preset chips */}
            <div className="flex flex-wrap gap-2 mt-2">
              {[50000, 100000, 500000, 1000000, 2500000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-indigo-50 text-[11px] font-bold text-slate-700 hover:text-indigo-700 transition"
                >
                  +{formatRupiah(val)}
                </button>
              ))}
              {fromWallet && (
                <button
                  type="button"
                  onClick={() => setAmount(fromWallet.balance.toString())}
                  className="px-2.5 py-1 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-[11px] font-bold text-indigo-800 transition"
                >
                  Max (Semua)
                </button>
              )}
            </div>
          </div>

          {/* Note and Date Row (Matching Image 2) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Note (Optional)
              </label>
              <input
                type="text"
                placeholder="E.g., Rent for July / Tabungan"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Date</label>
              <div className="relative">
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="July 15, 2026"
                  className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Confirm Button (Matching Image 2) */}
          <button
            type="submit"
            id="btn-confirm-transfer"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-indigo-500/30 transition active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <span>Confirm Transfer</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-center text-slate-400 font-medium">
            Transaction fees may apply. Review before confirming.
          </p>
        </form>
      </div>

      {/* Recent Transfers History */}
      {transferTransactions.length > 0 && (
        <div className="glass-card p-6 rounded-3xl border border-white/80 space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-1">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Riwayat Transfer Terkini</span>
          </div>
          <div className="divide-y divide-slate-100">
            {transferTransactions.slice(0, 5).map((t) => (
              <div key={t.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">
                    {t.walletName} → {t.toWalletName || 'Tujuan'}
                  </span>
                  <span className="text-slate-400 block text-[11px]">
                    {t.date} {t.note && `• ${t.note}`}
                  </span>
                </div>
                <span className="font-extrabold text-slate-900">{formatRupiah(t.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
