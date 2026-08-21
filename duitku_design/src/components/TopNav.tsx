import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TabType } from '../types';
import {
  Bell,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  Menu,
  Sparkles,
  Plus,
} from 'lucide-react';

const navTabs: { id: TabType; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'transaksi', label: 'Transaksi' },
  { id: 'wallets', label: 'Wallets' },
  { id: 'kategori', label: 'Kategori' },
  { id: 'transfer', label: 'Transfer' },
  { id: 'hutang', label: 'Hutang' },
  { id: 'piutang', label: 'Piutang' },
  { id: 'anggaran', label: 'Anggaran' },
];

interface TopNavProps {
  onOpenSidebar?: () => void;
  onOpenVoice?: () => void;
  onOpenScanner?: () => void;
  onOpenAddTx?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenSidebar,
  onOpenVoice,
  onOpenScanner,
  onOpenAddTx,
}) => {
  const {
    tab,
    setTab,
    notifications,
    markAllNotificationsRead,
    searchQuery,
    setSearchQuery,
  } = useApp();

  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)] px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-menu-toggle"
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => setTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none lg:hidden"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              D
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">
              Duitku
            </span>
          </div>
        </div>

        {/* Center Pill Navigation (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200/80">
          {navTabs.map((t) => {
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                id={`topnav-tab-${t.id}`}
                onClick={() => setTab(t.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Search */}
          <div className="relative hidden xl:block w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              id="global-search-input"
              placeholder="Cari transaksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-full bg-slate-100 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Quick Add Button */}
          {onOpenAddTx && (
            <button
              onClick={onOpenAddTx}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tambah Transaksi</span>
            </button>
          )}

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              id="btn-notifications-bell"
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 rounded-full bg-slate-100 hover:bg-slate-200/70 text-slate-600 hover:text-indigo-600 transition"
              aria-label="Notifikasi"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-900">Notifikasi</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-700">
                        {unreadCount} baru
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-indigo-600 hover:underline font-medium"
                    >
                      Tandai dibaca
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      Tidak ada notifikasi baru
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-2.5 rounded-xl text-xs transition ${
                          notif.read ? 'bg-slate-50 text-slate-600' : 'bg-indigo-50/70 border border-indigo-100 text-slate-800'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {notif.type === 'alert' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          ) : notif.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Info className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">{notif.title}</p>
                            <p className="text-slate-600 text-[11px] mt-0.5">{notif.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {notif.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-200 ring-2 ring-slate-100 overflow-hidden shadow-2xs">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="DAVIDGS"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight">DAVIDGS</span>
              <span className="text-[10px] font-medium text-emerald-600">Personal Pro</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
