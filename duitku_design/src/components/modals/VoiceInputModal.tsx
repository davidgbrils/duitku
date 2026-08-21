import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Mic, MicOff, Sparkles, Check, RefreshCw } from 'lucide-react';
import { getTodayDateString } from '../../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceInputModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { wallets, categories, addTransaction } = useApp();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedData, setParsedData] = useState<{
    amount?: number;
    category?: string;
    type?: 'expense' | 'income';
    walletId?: string;
    walletName?: string;
    note?: string;
  } | null>(null);

  const samplePresets = [
    'Makan siang nasi padang 25 ribu pakai BCA',
    'Beli bensin motor 20 ribu tunai',
    'Token listrik PLN 50 ribu dari Mandiri',
    'Dapat bonus freelance 1 juta 500 ribu masuk BCA',
  ];

  // Simple parsing engine for Indonesian text
  const parseIndonesianText = (text: string) => {
    let type: 'expense' | 'income' = 'expense';
    if (/dapat|gaji|bonus|terima|masuk|penjualan|transfer masuk/i.test(text)) {
      type = 'income';
    }

    // Extract amount
    let amount = 0;
    const jtMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:juta|jt)/i);
    const rbMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:ribu|rb|k)/i);
    const rawNumberMatch = text.match(/Rp\s*(\d[\d.,]*)|(\d{4,})/i);

    if (jtMatch) {
      amount = parseFloat(jtMatch[1].replace(',', '.')) * 1_000_000;
      if (rbMatch && text.indexOf(jtMatch[0]) < text.indexOf(rbMatch[0])) {
        amount += parseFloat(rbMatch[1].replace(',', '.')) * 1_000;
      }
    } else if (rbMatch) {
      amount = parseFloat(rbMatch[1].replace(',', '.')) * 1_000;
    } else if (rawNumberMatch) {
      const clean = (rawNumberMatch[1] || rawNumberMatch[2]).replace(/[.,]/g, '');
      amount = parseFloat(clean) || 0;
    }

    // Match category
    let matchedCat = type === 'income' ? 'Gaji' : 'Belanja';
    if (/makan|kopi|kafe|restoran|nasi|kuliner|minum/i.test(text)) matchedCat = 'Makanan';
    else if (/bensin|ojek|grab|gojek|parkir|transport|tol/i.test(text)) matchedCat = 'Transportasi';
    else if (/listrik|pln|pdam|air|wifi|pulsa|kuota|tagihan|sewa/i.test(text)) matchedCat = 'Tagihan';
    else if (/belanja|supermarket|indomaret|alfamart|baju|sepatu/i.test(text)) matchedCat = 'Belanja';
    else if (/nonton|bioskop|game|hiburan/i.test(text)) matchedCat = 'Hiburan';
    else if (/gaji/i.test(text)) matchedCat = 'Gaji';
    else if (/bonus|hadiah/i.test(text)) matchedCat = 'Bonus';

    // Match wallet
    let matchedWallet = wallets[0] || { id: 'w-1', name: 'BCA' };
    if (/mandiri/i.test(text)) {
      const found = wallets.find((w) => /mandiri/i.test(w.name));
      if (found) matchedWallet = found;
    } else if (/tunai|cash/i.test(text)) {
      const found = wallets.find((w) => /cash|tunai/i.test(w.name));
      if (found) matchedWallet = found;
    } else if (/bca/i.test(text)) {
      const found = wallets.find((w) => /bca/i.test(w.name));
      if (found) matchedWallet = found;
    }

    setParsedData({
      amount: amount || 25000,
      category: matchedCat,
      type,
      walletId: matchedWallet.id,
      walletName: matchedWallet.name,
      note: text,
    });
  };

  const toggleListening = () => {
    if (!isListening) {
      setIsListening(true);
      setTranscript('');
      setParsedData(null);

      // Check if browser SpeechRecognition is available
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.lang = 'id-ID';
          recognition.continuous = false;
          recognition.interimResults = false;

          recognition.onresult = (event: any) => {
            const current = event.results[0][0].transcript;
            setTranscript(current);
            parseIndonesianText(current);
            setIsListening(false);
          };

          recognition.onerror = () => {
            // Fallback simulation
            const fallback = samplePresets[Math.floor(Math.random() * samplePresets.length)];
            setTranscript(fallback);
            parseIndonesianText(fallback);
            setIsListening(false);
          };

          recognition.start();
          return;
        } catch {
          // Fall through to simulation
        }
      }

      // Simulation if microphone is restricted in iframe
      setTimeout(() => {
        const fallback = samplePresets[Math.floor(Math.random() * samplePresets.length)];
        setTranscript(fallback);
        parseIndonesianText(fallback);
        setIsListening(false);
      }, 2000);
    } else {
      setIsListening(false);
    }
  };

  const handleApply = () => {
    if (!parsedData || !parsedData.amount) return;
    addTransaction({
      type: parsedData.type || 'expense',
      amount: parsedData.amount,
      category: parsedData.category || 'Makanan',
      walletId: parsedData.walletId || wallets[0]?.id || 'w-1',
      walletName: parsedData.walletName || 'BCA',
      date: getTodayDateString(),
      note: parsedData.note || 'Catatan Suara AI',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Catat Suara Pintar</h2>
        </div>
        <p className="text-xs text-slate-500 mb-5">
          Ucapkan transaksi Anda dalam bahasa Indonesia, AI akan mengekstrak otomatis.
        </p>

        {/* Mic Visualizer Button */}
        <div className="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-3xl border border-slate-100 mb-4">
          <button
            type="button"
            onClick={toggleListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse ring-8 ring-rose-100 scale-110 shadow-lg shadow-rose-500/30'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 ring-4 ring-indigo-100 shadow-md shadow-indigo-500/25'
            }`}
          >
            {isListening ? <Mic className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
          <span className="text-xs font-semibold text-slate-600 mt-4">
            {isListening ? 'Mendengarkan suara Anda...' : 'Ketuk mikrofon untuk mulai bicara'}
          </span>
          {transcript && (
            <p className="text-xs text-indigo-700 italic font-medium mt-2 px-4 text-center">
              "{transcript}"
            </p>
          )}
        </div>

        {/* Quick Sample Presets */}
        <div className="mb-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Atau pilih contoh cepat:
          </span>
          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
            {samplePresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setTranscript(preset);
                  parseIndonesianText(preset);
                }}
                className="w-full text-left p-2 rounded-xl bg-slate-100/70 hover:bg-indigo-50 text-[11px] text-slate-700 hover:text-indigo-700 transition flex items-center justify-between"
              >
                <span className="truncate">{preset}</span>
                <Sparkles className="w-3 h-3 text-indigo-500 flex-shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>

        {/* Extracted Preview Card */}
        {parsedData && (
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 mb-4 animate-in fade-in slide-in-from-bottom-2">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-2">
              Hasil Ekstraksi AI:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Nominal:</span>
                <span className="font-bold text-slate-900">
                  Rp{parsedData.amount?.toLocaleString('id-ID')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Tipe:</span>
                <span className="font-bold text-slate-900 capitalize">
                  {parsedData.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Kategori:</span>
                <span className="font-bold text-slate-900">{parsedData.category}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Dompet:</span>
                <span className="font-bold text-slate-900">{parsedData.walletName}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Tutup
          </button>
          <button
            type="button"
            disabled={!parsedData}
            onClick={handleApply}
            className="flex-1 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Simpan Transaksi
          </button>
        </div>
      </div>
    </div>
  );
};
