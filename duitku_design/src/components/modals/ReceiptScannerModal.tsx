import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Camera, Upload, Sparkles, CheckCircle, FileText, ArrowRight } from 'lucide-react';
import { getTodayDateString, formatRupiah } from '../../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptScannerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { wallets, categories, addTransaction } = useApp();

  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<{
    merchant: string;
    total: number;
    category: string;
    date: string;
    items: { name: string; price: number }[];
    walletId: string;
  } | null>(null);

  const sampleReceipts = [
    {
      merchant: 'Indomaret Point',
      category: 'Belanja',
      total: 58500,
      date: getTodayDateString(),
      items: [
        { name: 'Susu UHT Full Cream 1L', price: 21500 },
        { name: 'Roti Gandum Tawar', price: 18000 },
        { name: 'Kopi Cold Brew Can', price: 19000 },
      ],
    },
    {
      merchant: 'Warung Nasi Padang Sederhana',
      category: 'Makanan',
      total: 42000,
      date: getTodayDateString(),
      items: [
        { name: 'Nasi Rendang Komplit', price: 32000 },
        { name: 'Es Teh Manis', price: 10000 },
      ],
    },
    {
      merchant: 'SPBU Pertamina 31.124',
      category: 'Transportasi',
      total: 100000,
      date: getTodayDateString(),
      items: [{ name: 'Pertamax Turbo 6.8 Liters', price: 100000 }],
    },
  ];

  const handleSimulateScan = (receipt = sampleReceipts[0]) => {
    setIsScanning(true);
    setScannedResult(null);

    setTimeout(() => {
      setIsScanning(false);
      setScannedResult({
        ...receipt,
        walletId: wallets[0]?.id || 'w-1',
      });
    }, 1200);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Pick random receipt or matching one
      const r = sampleReceipts[Math.floor(Math.random() * sampleReceipts.length)];
      handleSimulateScan(r);
    }
  };

  const handleSave = () => {
    if (!scannedResult) return;
    const wallet = wallets.find((w) => w.id === scannedResult.walletId) || wallets[0];

    addTransaction({
      type: 'expense',
      amount: scannedResult.total,
      category: scannedResult.category,
      walletId: wallet.id,
      walletName: wallet.name,
      date: scannedResult.date,
      note: `Struk di ${scannedResult.merchant}`,
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
            <Camera className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Pindai Struk / Bukti</h2>
        </div>
        <p className="text-xs text-slate-500 mb-5">
          Unggah foto struk belanja untuk membaca total dan rincian otomatis.
        </p>

        {/* Upload drop area */}
        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 rounded-3xl cursor-pointer transition mb-4 group">
          <Upload className="w-8 h-8 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-indigo-900">Pilih Foto Struk / Drag & Drop</span>
          <span className="text-[10px] text-slate-500 mt-0.5">Mendukung JPG, PNG, PDF</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* Quick sample receipts */}
        <div className="mb-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Atau gunakan sampel struk:
          </span>
          <div className="grid grid-cols-3 gap-2">
            {sampleReceipts.map((sr, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSimulateScan(sr)}
                className="p-2 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-left transition"
              >
                <FileText className="w-4 h-4 text-indigo-500 mb-1" />
                <span className="text-[11px] font-bold text-slate-800 line-clamp-1">{sr.merchant}</span>
                <span className="text-[10px] text-slate-500">{formatRupiah(sr.total)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scanning State */}
        {isScanning && (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-indigo-600">
              AI sedang membaca rincian struk...
            </span>
          </div>
        )}

        {/* Scanned Result Card */}
        {scannedResult && !isScanning && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Toko / Merchant</span>
                <p className="font-bold text-xs text-slate-900">{scannedResult.merchant}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Total Tagihan</span>
                <p className="font-extrabold text-sm text-indigo-600">
                  {formatRupiah(scannedResult.total)}
                </p>
              </div>
            </div>

            <div className="space-y-1 mb-3">
              <span className="text-[10px] font-semibold text-slate-400">Rincian Item:</span>
              {scannedResult.items.map((item, i) => (
                <div key={i} className="flex justify-between text-[11px] text-slate-700">
                  <span>• {item.name}</span>
                  <span className="font-medium text-slate-900">{formatRupiah(item.price)}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
              <div>
                <label className="text-[10px] font-bold text-slate-500">Kategori</label>
                <select
                  value={scannedResult.category}
                  onChange={(e) =>
                    setScannedResult({ ...scannedResult, category: e.target.value })
                  }
                  className="w-full mt-0.5 p-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500">Bayar Dari</label>
                <select
                  value={scannedResult.walletId}
                  onChange={(e) =>
                    setScannedResult({ ...scannedResult, walletId: e.target.value })
                  }
                  className="w-full mt-0.5 p-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
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
            Batal
          </button>
          <button
            type="button"
            disabled={!scannedResult || isScanning}
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition flex items-center justify-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            Simpan Transaksi
          </button>
        </div>
      </div>
    </div>
  );
};
