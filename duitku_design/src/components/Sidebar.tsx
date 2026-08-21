import React from 'react';
import { useApp } from '../context/AppContext';
import { TabType } from '../types';
import {
  LayoutDashboard,
  Receipt,
  Wallet as WalletIcon,
  Grid2X2,
  ArrowLeftRight,
  HandCoins,
  PiggyBank,
  PieChart,
  LogOut,
  X,
  ShieldCheck,
} from 'lucide-react';

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transaksi', label: 'Transaksi', icon: Receipt },
  { id: 'wallets', label: 'Wallets', icon: WalletIcon },
  { id: 'kategori', label: 'Kategori', icon: Grid2X2 },
  { id: 'transfer', label: 'Transfer', icon: ArrowLeftRight },
  { id: 'hutang', label: 'Hutang', icon: HandCoins },
  { id: 'piutang', label: 'Piutang', icon: PiggyBank },
  { id: 'anggaran', label: 'Anggaran', icon: PieChart },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { tab, setTab, resetDemoData } = useApp();

  const handleSelectTab = (id: TabType) => {
    setTab(id);
    if (onClose) onClose();
  };

  const content = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 select-none shadow-[1px_0_4px_0_rgba(15,23,42,0.03)]">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 py-4.5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-sm font-black text-lg tracking-wider">
            D
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-slate-900 leading-tight">
              Duitku
            </span>
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              Keuangan Pro
            </span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Menu Utama
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = tab === item.id;

          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer / Reset Action */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <button
          id="sidebar-btn-reset"
          onClick={() => {
            if (confirm('Kembalikan semua data ke pengaturan awal (demo)?')) {
              resetDemoData();
              if (onClose) onClose();
            }
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50/80 transition-colors"
          title="Reset data demo"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500" />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-60 z-20">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onClose}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
