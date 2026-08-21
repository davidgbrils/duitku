import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Receivable } from '../../types';
import {
  Plus,
  Bell,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Edit2,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { formatIDR } from '../../utils/formatters';

interface Props {
  onOpenAddReceivable: (rec?: Receivable | null) => void;
  onOpenRemindModal: (rec: Receivable) => void;
}

export const ReceivablesTab: React.FC<Props> = ({
  onOpenAddReceivable,
  onOpenRemindModal,
}) => {
  const {
    receivables,
    deleteReceivable,
    markReceivablePaid,
    totalReceivables,
    collectedReceivablesMonth,
  } = useApp();

  const getStatusBadge = (status: Receivable['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Pending
          </span>
        );
      case 'upcoming':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Upcoming
          </span>
        );
      case 'overdue':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Overdue
          </span>
        );
      case 'paid':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Lunas
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & "+ Add Receivable" (Matching Image 8) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Piutang
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Pantau uang yang dipinjam oleh orang lain dan kirim pengingat pelunasan.
          </p>
        </div>

        <button
          id="btn-add-receivable"
          onClick={() => onOpenAddReceivable(null)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Receivable</span>
        </button>
      </div>

      {/* Top 2 Glossy Stat Cards (Matching Image 8) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Total Receivables */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-700 p-6 sm:p-7 text-white shadow-xl shadow-indigo-600/20 flex flex-col justify-between">
          <div>
            <span className="text-xs sm:text-sm font-medium text-indigo-100 block mb-1">
              Total Receivables
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {formatIDR(totalReceivables)}
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-300 mt-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+ IDR 2,500,000 (Last Month)</span>
            </div>
          </div>
          {/* Bottom subtle progress bar */}
          <div className="w-full h-1.5 bg-white/20 rounded-full mt-5 overflow-hidden">
            <div className="h-full bg-white rounded-full w-2/3" />
          </div>
        </div>

        {/* Collected This Month */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-700 p-6 sm:p-7 text-white shadow-xl shadow-indigo-600/20 flex flex-col justify-between">
          <div>
            <span className="text-xs sm:text-sm font-medium text-indigo-100 block mb-1">
              Collected This Month
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {formatIDR(collectedReceivablesMonth)}
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-300 mt-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+ IDR 1,200,000 (Vs. Target)</span>
            </div>
          </div>
          {/* Bottom subtle progress bar */}
          <div className="w-full h-1.5 bg-white/20 rounded-full mt-5 overflow-hidden">
            <div className="h-full bg-white rounded-full w-4/5" />
          </div>
        </div>
      </div>

      {/* Recent Debtors Table / List (Matching Image 8) */}
      <div className="glass-card p-6 rounded-3xl border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-4">
        <h2 className="text-base font-bold text-slate-800">Recent Debtors</h2>

        {/* Header Columns for Desktop */}
        <div className="hidden md:grid grid-cols-12 text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
          <div className="col-span-4">Debtor</div>
          <div className="col-span-2">Due Date</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-2 text-right">Action</div>
        </div>

        <div className="divide-y divide-slate-100">
          {receivables.map((rec) => (
            <div
              key={rec.id}
              className="py-4 flex flex-col md:grid md:grid-cols-12 items-start md:items-center gap-3 hover:bg-slate-50/50 rounded-2xl px-2 transition group"
            >
              {/* 1. Debtor with Avatar */}
              <div className="md:col-span-4 flex items-center gap-3">
                {rec.avatar ? (
                  <img
                    src={rec.avatar}
                    alt={rec.debtorName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-100"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                    {rec.initials || 'DB'}
                  </div>
                )}
                <div>
                  <span className="text-sm font-bold text-slate-900 block">
                    {rec.debtorName}
                  </span>
                  {rec.phone && (
                    <span className="text-[11px] text-slate-400 block">{rec.phone}</span>
                  )}
                </div>
              </div>

              {/* 2. Due Date */}
              <div className="md:col-span-2 text-xs font-semibold text-slate-700">
                <span className="md:hidden text-[11px] text-slate-400 block">Jatuh Tempo: </span>
                <span className={rec.status === 'overdue' ? 'text-rose-600 font-bold' : ''}>
                  {rec.dueDate}
                </span>
              </div>

              {/* 3. Status */}
              <div className="md:col-span-2">{getStatusBadge(rec.status)}</div>

              {/* 4. Amount */}
              <div className="md:col-span-2 text-sm font-extrabold text-slate-900">
                {formatIDR(rec.amount)}
              </div>

              {/* 5. Action: Remind & Mark Paid */}
              <div className="md:col-span-2 flex items-center justify-end gap-1.5 w-full md:w-auto">
                <button
                  onClick={() => onOpenRemindModal(rec)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition active:scale-95"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Remind</span>
                </button>

                {rec.status !== 'paid' && (
                  <button
                    onClick={() => {
                      if (confirm(`Tandai piutang dari ${rec.debtorName} sudah lunas?`)) {
                        markReceivablePaid(rec.id, 'w-1');
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                    title="Tandai Lunas"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => onOpenAddReceivable(rec)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Hapus catatan piutang ${rec.debtorName}?`)) {
                      deleteReceivable(rec.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Hapus"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
