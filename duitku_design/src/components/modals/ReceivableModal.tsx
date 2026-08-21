import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Receivable } from '../../types';
import { X, User, Phone, Calendar } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Receivable | null;
}

export const ReceivableModal: React.FC<Props> = ({ isOpen, onClose, initialData }) => {
  const { addReceivable, updateReceivable } = useApp();

  const [debtorName, setDebtorName] = useState(initialData?.debtorName || '');
  const [amount, setAmount] = useState(initialData ? initialData.amount.toString() : '');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '25 Okt 2026');
  const [status, setStatus] = useState<Receivable['status']>(initialData?.status || 'pending');
  const [phone, setPhone] = useState(initialData?.phone || '+628');
  const [note, setNote] = useState(initialData?.note || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(/[^0-9]/g, '')) || 0;
    if (numAmount <= 0) {
      alert('Jumlah piutang harus lebih dari 0.');
      return;
    }

    if (initialData) {
      updateReceivable(initialData.id, {
        debtorName,
        amount: numAmount,
        dueDate,
        status,
        phone,
        note,
      });
    } else {
      addReceivable({
        debtorName,
        amount: numAmount,
        paidAmount: 0,
        dueDate,
        status,
        phone,
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
          {initialData ? 'Edit Piutang' : 'Tambah Catatan Piutang'}
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Catat uang yang dipinjam oleh teman, rekan kerja, atau klien.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" /> Nama Peminjam
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Budi Santoso, Siti Rahma"
              value={debtorName}
              onChange={(e) => setDebtorName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Jumlah Piutang (IDR)</label>
              <input
                type="number"
                required
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Receivable['status'])}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="pending">Pending</option>
                <option value="upcoming">Upcoming</option>
                <option value="overdue">Overdue</option>
                <option value="paid">Paid (Lunas)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Jatuh Tempo
              </label>
              <input
                type="text"
                required
                placeholder="25 Okt 2026"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> WhatsApp / HP
              </label>
              <input
                type="text"
                placeholder="+6281234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Catatan / Alasan</label>
            <input
              type="text"
              placeholder="Contoh: Talangan beli tiket, modal usaha"
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
              Simpan Piutang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
