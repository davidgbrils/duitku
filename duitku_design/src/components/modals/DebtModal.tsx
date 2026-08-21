import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Debt } from '../../types';
import { X, Calendar, DollarSign, UserCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Debt | null;
}

export const DebtModal: React.FC<Props> = ({ isOpen, onClose, initialData }) => {
  const { addDebt, updateDebt } = useApp();

  const [creditorName, setCreditorName] = useState(initialData?.creditorName || '');
  const [totalAmount, setTotalAmount] = useState(initialData ? initialData.totalAmount.toString() : '');
  const [paidAmount, setPaidAmount] = useState(initialData ? initialData.paidAmount.toString() : '0');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '15 Mar 2026');
  const [note, setNote] = useState(initialData?.note || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numTotal = parseFloat(totalAmount.replace(/[^0-9]/g, '')) || 0;
    const numPaid = parseFloat(paidAmount.replace(/[^0-9]/g, '')) || 0;

    if (numTotal <= 0) {
      alert('Total hutang harus lebih dari 0.');
      return;
    }

    if (initialData) {
      updateDebt(initialData.id, {
        creditorName,
        totalAmount: numTotal,
        paidAmount: numPaid,
        dueDate,
        status: numPaid >= numTotal ? 'paid' : 'active',
        note,
      });
    } else {
      addDebt({
        creditorName,
        totalAmount: numTotal,
        paidAmount: numPaid,
        dueDate,
        status: numPaid >= numTotal ? 'paid' : 'active',
        note,
      });
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
          {initialData ? 'Edit Hutang' : 'Tambah Catatan Hutang'}
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Catat pinjaman, kartu kredit, atau cicilan agar tidak lupa.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Pemberi Pinjaman / Bank</label>
            <input
              type="text"
              required
              placeholder="Contoh: Bank Mandiri - KTA, BCA Kartu Kredit"
              value={creditorName}
              onChange={(e) => setCreditorName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Total Hutang (IDR)</label>
              <input
                type="number"
                required
                placeholder="0"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Sudah Dibayar (IDR)</label>
              <input
                type="number"
                placeholder="0"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Jatuh Tempo</label>
            <input
              type="text"
              required
              placeholder="Contoh: 15 Mar 2026"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Keterangan / Catatan</label>
            <input
              type="text"
              placeholder="Contoh: Cicilan 3 dari 12 bulan"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
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
              Simpan Hutang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
