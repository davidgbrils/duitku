import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Debt } from '../../types';
import {
  Plus,
  HandCoins,
  Calendar,
  CreditCard,
  Building2,
  CheckCircle2,
  Trash2,
  Edit2,
  AlertTriangle,
} from 'lucide-react';
import { formatIDR } from '../../utils/formatters';

interface Props {
  onOpenAddDebt: (debt?: Debt | null) => void;
  onOpenPayDebt: (debt: Debt) => void;
}

export const DebtTab: React.FC<Props> = ({ onOpenAddDebt, onOpenPayDebt }) => {
  const { debts, deleteDebt, totalDebt, upcomingDebt } = useApp();

  const activeDebts = debts.filter((d) => d.status === 'active');
  const paidDebts = debts.filter((d) => d.status === 'paid');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & "+ Add Debt" (Matching Image 7) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Hutang
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Kelola kewajiban, cicilan, dan tagihan pinjaman Anda.
          </p>
        </div>

        <button
          id="btn-add-debt"
          onClick={() => onOpenAddDebt(null)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Debt</span>
        </button>
      </div>

      {/* Top 2 Stats Cards (Matching Image 7) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Total Debt Hero Card with Blue/Purple Gloss */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-700 p-6 sm:p-7 text-white shadow-xl shadow-indigo-600/20">
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <span className="text-xs sm:text-sm font-medium text-indigo-100 block mb-1">
              Total Debt
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {formatIDR(totalDebt)}
            </div>
            <span className="text-xs font-medium text-indigo-200 mt-2 block">
              {activeDebts.length} accounts
            </span>
          </div>
        </div>

        {/* Upcoming Payments Card */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <span className="text-xs sm:text-sm font-semibold text-slate-500 block mb-1">
              Upcoming Payments
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {formatIDR(upcomingDebt)}
            </div>
            <span className="text-xs font-medium text-slate-400 mt-2 block">
              Due this month
            </span>
          </div>
        </div>
      </div>

      {/* Your Creditors Section (Matching Image 7) */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Your Creditors</h2>

        <div className="space-y-3">
          {debts.map((debt) => {
            const percentPaid = Math.min(
              100,
              Math.round((debt.paidAmount / (debt.totalAmount || 1)) * 100)
            );
            const remaining = debt.totalAmount - debt.paidAmount;

            return (
              <div
                key={debt.id}
                className="glass-card p-5 rounded-2xl border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 group"
              >
                {/* 1. Creditor Name */}
                <div className="lg:w-1/4">
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    Creditor Name
                  </span>
                  <span className="text-sm font-bold text-slate-900 block mt-0.5">
                    {debt.creditorName}
                  </span>
                  {debt.note && (
                    <span className="text-[10px] text-slate-400 truncate block">
                      {debt.note}
                    </span>
                  )}
                </div>

                {/* 2. Amount Owed */}
                <div className="lg:w-1/5">
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    Amount Owed
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 block mt-0.5">
                    {formatIDR(debt.totalAmount)}
                  </span>
                </div>

                {/* 3. Due Date */}
                <div className="lg:w-1/6">
                  <span className="text-[11px] font-semibold text-slate-400 block">Due Date</span>
                  <span className="text-xs font-bold text-slate-700 block mt-0.5">
                    {debt.dueDate}
                  </span>
                </div>

                {/* 4. Progress bar */}
                <div className="lg:w-1/5 space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                    <span>{percentPaid}% paid</span>
                    {debt.status === 'paid' && (
                      <span className="text-emerald-600 font-bold">Lunas</span>
                    )}
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        debt.status === 'paid'
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-indigo-600 to-indigo-500'
                      }`}
                      style={{ width: `${percentPaid}%` }}
                    />
                  </div>
                </div>

                {/* 5. Action: Pay Now + Edit/Delete */}
                <div className="flex items-center gap-2 self-end lg:self-center">
                  <button
                    onClick={() => onOpenPayDebt(debt)}
                    disabled={debt.status === 'paid'}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold border transition shadow-2xs ${
                      debt.status === 'paid'
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-white hover:bg-indigo-50 text-slate-800 hover:text-indigo-700 border-slate-300 active:scale-95'
                    }`}
                  >
                    {debt.status === 'paid' ? 'Lunas' : 'Pay Now'}
                  </button>

                  <button
                    onClick={() => onOpenAddDebt(debt)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Hapus catatan hutang ${debt.creditorName}?`)) {
                        deleteDebt(debt.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
