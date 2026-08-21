import React from 'react';
import { useApp } from '../../context/AppContext';
import { Wallet as WalletType } from '../../types';
import {
  Plus,
  Building2,
  Wallet as CashIcon,
  Smartphone,
  LineChart,
  Edit2,
  Trash2,
  ArrowRight,
  TrendingUp,
  CreditCard,
} from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';

interface Props {
  onOpenAddWallet: (wallet?: WalletType | null) => void;
}

export const WalletsTab: React.FC<Props> = ({ onOpenAddWallet }) => {
  const { wallets, totalBalance, deleteWallet, setTab, transactions } = useApp();

  const getWalletIcon = (type: WalletType['type']) => {
    switch (type) {
      case 'bank':
        return <Building2 className="w-5 h-5 text-indigo-600" />;
      case 'cash':
        return <CashIcon className="w-5 h-5 text-indigo-600" />;
      case 'ewallet':
        return <Smartphone className="w-5 h-5 text-indigo-600" />;
      case 'investment':
        return <LineChart className="w-5 h-5 text-indigo-600" />;
      default:
        return <Building2 className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header with "+ Tambah Wallet" button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Wallets</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Daftar seluruh rekening bank, dompet fisik, dan e-wallet Anda.
          </p>
        </div>

        <button
          id="btn-tambah-wallet"
          onClick={() => onOpenAddWallet(null)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 shadow-xs transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Wallet</span>
        </button>
      </div>

      {/* Hero Dark Glossy Banner (Matching Image 9) */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#181824] via-[#211d33] to-[#12111d] p-7 sm:p-9 text-white shadow-xl shadow-indigo-950/20 border border-slate-700/40">
        {/* Soft background ambient glows */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <span className="text-xs sm:text-sm font-medium text-slate-300 block mb-1">
              Total Saldo
            </span>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              {formatRupiah(totalBalance)}
            </div>
            <div className="flex items-center gap-2 mt-2 text-slate-400 text-xs">
              <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
              <span>{wallets.length} Akun Terdaftar</span>
            </div>
          </div>

          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg">
            <CashIcon className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
        </div>
      </div>

      {/* Wallets Grid (Matching Image 9) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {wallets.map((wallet) => {
          const walletTxs = transactions.filter(
            (t) => t.walletId === wallet.id || t.toWalletId === wallet.id
          );

          return (
            <div
              key={wallet.id}
              className="glass-card p-6 rounded-3xl border border-white/80 shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all flex flex-col justify-between group relative"
            >
              <div>
                {/* Top Icon & Edit/Delete actions */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50/80 border border-indigo-100/80 flex items-center justify-center shadow-xs">
                    {getWalletIcon(wallet.type)}
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-50/80 p-1 rounded-xl border border-slate-100">
                    <button
                      onClick={() => onOpenAddWallet(wallet)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition"
                      title="Edit Wallet"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus dompet ${wallet.name}?`)) deleteWallet(wallet.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition"
                      title="Hapus Wallet"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Name & Balance */}
                <span className="text-xs font-semibold text-slate-500 block mb-0.5">
                  {wallet.name}
                </span>
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight block">
                  {formatRupiah(wallet.balance)}
                </span>
                {wallet.accountNumber && (
                  <span className="text-[11px] font-medium text-slate-400 mt-1 block">
                    {wallet.accountNumber}
                  </span>
                )}
              </div>

              {/* Bottom Quick Link */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
                <span>{walletTxs.length} Transaksi</span>
                <button
                  onClick={() => setTab('transfer')}
                  className="flex items-center gap-1 hover:underline"
                >
                  <span>Transfer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Add new wallet card placeholder */}
        <button
          onClick={() => onOpenAddWallet(null)}
          className="glass-card p-6 rounded-3xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/20 hover:bg-indigo-50/50 flex flex-col items-center justify-center text-center transition group min-h-[190px]"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-xs">
            <Plus className="w-6 h-6" />
          </div>
          <span className="font-bold text-xs text-indigo-900">Tambah Wallet Baru</span>
          <span className="text-[11px] text-slate-500 mt-0.5">
            Tambahkan rekening bank atau dompet digital
          </span>
        </button>
      </div>
    </div>
  );
};
