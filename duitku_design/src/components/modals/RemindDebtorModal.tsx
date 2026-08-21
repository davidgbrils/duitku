import React, { useState } from 'react';
import { Receivable } from '../../types';
import { X, Send, Copy, Check, MessageSquare } from 'lucide-react';
import { formatIDR } from '../../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  receivable: Receivable | null;
}

export const RemindDebtorModal: React.FC<Props> = ({ isOpen, onClose, receivable }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !receivable) return null;

  const defaultMsg = `Halo ${receivable.debtorName}, sekadar mengingatkan terkait pinjaman sebesar ${formatIDR(
    receivable.amount
  )} dengan jatuh tempo pada tanggal ${receivable.dueDate}. Terima kasih banyak ya! 🙏`;

  const [message, setMessage] = useState(defaultMsg);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWA = () => {
    const cleanPhone = (receivable.phone || '').replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
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

        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
          <MessageSquare className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-bold text-slate-800 mb-1">Kirim Pengingat Piutang</h2>
        <p className="text-xs text-slate-500 mb-4">
          Kirim pesan ramah pengingat pembayaran ke <span className="font-bold text-slate-700">{receivable.debtorName}</span>.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Pesan Pengingat</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Tersalin!' : 'Salin Pesan'}
            </button>
            <button
              type="button"
              onClick={handleSendWA}
              className="flex-1 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/25 transition flex items-center justify-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              Kirim via WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
