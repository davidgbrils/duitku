import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { DashboardTab } from './components/tabs/DashboardTab';
import { TransactionsTab } from './components/tabs/TransactionsTab';
import { WalletsTab } from './components/tabs/WalletsTab';
import { CategoriesTab } from './components/tabs/CategoriesTab';
import { TransferTab } from './components/tabs/TransferTab';
import { DebtTab } from './components/tabs/DebtTab';
import { ReceivablesTab } from './components/tabs/ReceivablesTab';
import { BudgetTab } from './components/tabs/BudgetTab';

import { TransactionModal } from './components/modals/TransactionModal';
import { WalletModal } from './components/modals/WalletModal';
import { CategoryModal } from './components/modals/CategoryModal';
import { DebtModal } from './components/modals/DebtModal';
import { PayDebtModal } from './components/modals/PayDebtModal';
import { ReceivableModal } from './components/modals/ReceivableModal';
import { RemindDebtorModal } from './components/modals/RemindDebtorModal';
import { BudgetModal } from './components/modals/BudgetModal';
import { VoiceInputModal } from './components/modals/VoiceInputModal';
import { ReceiptScannerModal } from './components/modals/ReceiptScannerModal';

import { Transaction, Wallet, Category, Debt, Receivable, Budget } from './types';

const MainLayout: React.FC = () => {
  const { tab } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal States
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catDefaultType, setCatDefaultType] = useState<'income' | 'expense'>('expense');

  const [debtModalOpen, setDebtModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  const [payDebtModalOpen, setPayDebtModalOpen] = useState(false);
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null);

  const [recModalOpen, setRecModalOpen] = useState(false);
  const [editingRec, setEditingRec] = useState<Receivable | null>(null);

  const [remindModalOpen, setRemindModalOpen] = useState(false);
  const [remindingRec, setRemindingRec] = useState<Receivable | null>(null);

  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Navigation Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-60 transition-all duration-300">
        {/* Top Navbar */}
        <TopNav
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenVoice={() => setVoiceModalOpen(true)}
          onOpenScanner={() => setScannerModalOpen(true)}
          onOpenAddTx={() => {
            setEditingTx(null);
            setTxModalOpen(true);
          }}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20">
          {tab === 'dashboard' && (
            <DashboardTab
              onOpenVoice={() => setVoiceModalOpen(true)}
              onOpenScanner={() => setScannerModalOpen(true)}
              onOpenAddTx={() => {
                setEditingTx(null);
                setTxModalOpen(true);
              }}
            />
          )}

          {tab === 'transaksi' && (
            <TransactionsTab
              onOpenAddModal={(tx) => {
                setEditingTx(tx || null);
                setTxModalOpen(true);
              }}
            />
          )}

          {tab === 'wallets' && (
            <WalletsTab
              onOpenAddWallet={(w) => {
                setEditingWallet(w || null);
                setWalletModalOpen(true);
              }}
            />
          )}

          {tab === 'kategori' && (
            <CategoriesTab
              onOpenAddCategory={(cat, defType) => {
                setEditingCat(cat || null);
                if (defType) setCatDefaultType(defType);
                setCatModalOpen(true);
              }}
            />
          )}

          {tab === 'transfer' && <TransferTab />}

          {tab === 'hutang' && (
            <DebtTab
              onOpenAddDebt={(debt) => {
                setEditingDebt(debt || null);
                setDebtModalOpen(true);
              }}
              onOpenPayDebt={(debt) => {
                setPayingDebt(debt);
                setPayDebtModalOpen(true);
              }}
            />
          )}

          {tab === 'piutang' && (
            <ReceivablesTab
              onOpenAddReceivable={(rec) => {
                setEditingRec(rec || null);
                setRecModalOpen(true);
              }}
              onOpenRemindModal={(rec) => {
                setRemindingRec(rec);
                setRemindModalOpen(true);
              }}
            />
          )}

          {tab === 'anggaran' && (
            <BudgetTab
              onOpenAddBudget={(budget) => {
                setEditingBudget(budget || null);
                setBudgetModalOpen(true);
              }}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <TransactionModal
        isOpen={txModalOpen}
        onClose={() => {
          setTxModalOpen(false);
          setEditingTx(null);
        }}
        transactionToEdit={editingTx}
      />

      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => {
          setWalletModalOpen(false);
          setEditingWallet(null);
        }}
        walletToEdit={editingWallet}
      />

      <CategoryModal
        isOpen={catModalOpen}
        onClose={() => {
          setCatModalOpen(false);
          setEditingCat(null);
        }}
        categoryToEdit={editingCat}
        defaultType={catDefaultType}
      />

      <DebtModal
        isOpen={debtModalOpen}
        onClose={() => {
          setDebtModalOpen(false);
          setEditingDebt(null);
        }}
        debtToEdit={editingDebt}
      />

      <PayDebtModal
        isOpen={payDebtModalOpen}
        onClose={() => {
          setPayDebtModalOpen(false);
          setPayingDebt(null);
        }}
        debt={payingDebt}
      />

      <ReceivableModal
        isOpen={recModalOpen}
        onClose={() => {
          setRecModalOpen(false);
          setEditingRec(null);
        }}
        receivableToEdit={editingRec}
      />

      <RemindDebtorModal
        isOpen={remindModalOpen}
        onClose={() => {
          setRemindModalOpen(false);
          setRemindingRec(null);
        }}
        receivable={remindingRec}
      />

      <BudgetModal
        isOpen={budgetModalOpen}
        onClose={() => {
          setBudgetModalOpen(false);
          setEditingBudget(null);
        }}
        budgetToEdit={editingBudget}
      />

      <VoiceInputModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
      />

      <ReceiptScannerModal
        isOpen={scannerModalOpen}
        onClose={() => setScannerModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
