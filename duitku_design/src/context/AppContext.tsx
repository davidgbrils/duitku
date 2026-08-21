import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  TabType,
  Wallet,
  Category,
  Transaction,
  Debt,
  Receivable,
  Budget,
  NotificationItem,
} from '../types';
import {
  initialWallets,
  initialCategories,
  initialTransactions,
  initialDebts,
  initialReceivables,
  initialBudgets,
  initialNotifications,
} from '../data/initialData';
import confetti from 'canvas-confetti';

interface AppContextType {
  tab: TabType;
  setTab: (tab: TabType) => void;
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  debts: Debt[];
  receivables: Receivable[];
  budgets: Budget[];
  notifications: NotificationItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Wallet CRUD
  addWallet: (wallet: Omit<Wallet, 'id'>) => void;
  updateWallet: (id: string, wallet: Partial<Wallet>) => void;
  deleteWallet: (id: string) => void;

  // Category CRUD
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Transaction CRUD
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Transfer Action
  transferFunds: (fromWalletId: string, toWalletId: string, amount: number, note?: string, date?: string) => boolean;

  // Debt CRUD & Actions
  addDebt: (debt: Omit<Debt, 'id'>) => void;
  updateDebt: (id: string, debt: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  payDebt: (debtId: string, amount: number, walletId: string) => boolean;

  // Receivable CRUD & Actions
  addReceivable: (receivable: Omit<Receivable, 'id'>) => void;
  updateReceivable: (id: string, receivable: Partial<Receivable>) => void;
  deleteReceivable: (id: string) => void;
  markReceivablePaid: (id: string, walletId: string) => void;

  // Budget CRUD
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;

  // Notifications
  markAllNotificationsRead: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'read' | 'time'>) => void;

  // Computed summary
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  netCashFlow: number;
  totalDebt: number;
  upcomingDebt: number;
  totalReceivables: number;
  collectedReceivablesMonth: number;

  // Reset to demo data
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tab, setTab] = useState<TabType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Local storage state with initial fallbacks
  const [wallets, setWallets] = useState<Wallet[]>(() => {
    const saved = localStorage.getItem('duitku_wallets');
    return saved ? JSON.parse(saved) : initialWallets;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('duitku_categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('duitku_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem('duitku_debts');
    return saved ? JSON.parse(saved) : initialDebts;
  });

  const [receivables, setReceivables] = useState<Receivable[]>(() => {
    const saved = localStorage.getItem('duitku_receivables');
    return saved ? JSON.parse(saved) : initialReceivables;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('duitku_budgets');
    return saved ? JSON.parse(saved) : initialBudgets;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('duitku_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('duitku_wallets', JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
    localStorage.setItem('duitku_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('duitku_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('duitku_debts', JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem('duitku_receivables', JSON.stringify(receivables));
  }, [receivables]);

  useEffect(() => {
    localStorage.setItem('duitku_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('duitku_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Wallet Handlers
  const addWallet = (wallet: Omit<Wallet, 'id'>) => {
    const newWallet: Wallet = { ...wallet, id: `w-${Date.now()}` };
    setWallets((prev) => [...prev, newWallet]);
  };

  const updateWallet = (id: string, updated: Partial<Wallet>) => {
    setWallets((prev) => prev.map((w) => (w.id === id ? { ...w, ...updated } : w)));
  };

  const deleteWallet = (id: string) => {
    setWallets((prev) => prev.filter((w) => w.id !== id));
  };

  // Category Handlers
  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = { ...category, id: `c-${Date.now()}` };
    setCategories((prev) => [...prev, newCategory]);
  };

  const updateCategory = (id: string, updated: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Transaction Handlers
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = { ...transaction, id: `tx-${Date.now()}` };
    setTransactions((prev) => [newTx, ...prev]);

    // Update wallet balance automatically
    setWallets((prev) =>
      prev.map((w) => {
        if (w.id === transaction.walletId) {
          if (transaction.type === 'expense') {
            return { ...w, balance: Math.max(0, w.balance - transaction.amount) };
          } else if (transaction.type === 'income') {
            return { ...w, balance: w.balance + transaction.amount };
          }
        }
        return w;
      })
    );

    // Update budget spent if it's an expense
    if (transaction.type === 'expense') {
      setBudgets((prev) =>
        prev.map((b) => {
          if (b.category.toLowerCase() === transaction.category.toLowerCase()) {
            return { ...b, spent: b.spent + transaction.amount };
          }
          return b;
        })
      );
    }
  };

  const updateTransaction = (id: string, updated: Partial<Transaction>) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Transfer Handlers
  const transferFunds = (
    fromWalletId: string,
    toWalletId: string,
    amount: number,
    note?: string,
    date?: string
  ): boolean => {
    const fromWallet = wallets.find((w) => w.id === fromWalletId);
    const toWallet = wallets.find((w) => w.id === toWalletId);

    if (!fromWallet || !toWallet || fromWallet.balance < amount || amount <= 0) {
      return false;
    }

    setWallets((prev) =>
      prev.map((w) => {
        if (w.id === fromWalletId) {
          return { ...w, balance: w.balance - amount };
        }
        if (w.id === toWalletId) {
          return { ...w, balance: w.balance + amount };
        }
        return w;
      })
    );

    const transferTx: Transaction = {
      id: `tx-tf-${Date.now()}`,
      category: 'Transfer',
      type: 'transfer',
      walletId: fromWalletId,
      walletName: fromWallet.name,
      toWalletId: toWalletId,
      toWalletName: toWallet.name,
      amount,
      date: date || 'Hari ini',
      note: note || `Transfer dari ${fromWallet.name} ke ${toWallet.name}`,
    };

    setTransactions((prev) => [transferTx, ...prev]);

    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    } catch {
      // safe fallback
    }

    return true;
  };

  // Debt Handlers
  const addDebt = (debt: Omit<Debt, 'id'>) => {
    const newDebt: Debt = { ...debt, id: `d-${Date.now()}` };
    setDebts((prev) => [...prev, newDebt]);
  };

  const updateDebt = (id: string, updated: Partial<Debt>) => {
    setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, ...updated } : d)));
  };

  const deleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  const payDebt = (debtId: string, amount: number, walletId: string): boolean => {
    const debt = debts.find((d) => d.id === debtId);
    const wallet = wallets.find((w) => w.id === walletId);
    if (!debt || !wallet || wallet.balance < amount || amount <= 0) return false;

    // Deduct from wallet
    setWallets((prev) =>
      prev.map((w) => (w.id === walletId ? { ...w, balance: w.balance - amount } : w))
    );

    // Update debt
    const newPaid = debt.paidAmount + amount;
    const isFullyPaid = newPaid >= debt.totalAmount;
    setDebts((prev) =>
      prev.map((d) =>
        d.id === debtId
          ? {
              ...d,
              paidAmount: newPaid,
              status: isFullyPaid ? 'paid' : 'active',
            }
          : d
      )
    );

    // Record as transaction
    const payTx: Transaction = {
      id: `tx-debt-${Date.now()}`,
      category: 'Tagihan',
      type: 'expense',
      walletId,
      walletName: wallet.name,
      amount,
      date: 'Hari ini',
      note: `Pembayaran cicilan: ${debt.creditorName}`,
    };
    setTransactions((prev) => [payTx, ...prev]);

    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch {
      // safe fallback
    }

    return true;
  };

  // Receivable Handlers
  const addReceivable = (receivable: Omit<Receivable, 'id'>) => {
    const newRec: Receivable = {
      ...receivable,
      id: `r-${Date.now()}`,
      initials: receivable.debtorName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase(),
    };
    setReceivables((prev) => [...prev, newRec]);
  };

  const updateReceivable = (id: string, updated: Partial<Receivable>) => {
    setReceivables((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
  };

  const deleteReceivable = (id: string) => {
    setReceivables((prev) => prev.filter((r) => r.id !== id));
  };

  const markReceivablePaid = (id: string, walletId: string) => {
    const receivable = receivables.find((r) => r.id === id);
    const wallet = wallets.find((w) => w.id === walletId) || wallets[0];
    if (!receivable) return;

    // Add to wallet
    if (wallet) {
      setWallets((prev) =>
        prev.map((w) => (w.id === wallet.id ? { ...w, balance: w.balance + receivable.amount } : w))
      );
    }

    // Mark as paid
    setReceivables((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'paid', paidAmount: r.amount } : r))
    );

    // Record transaction
    const incTx: Transaction = {
      id: `tx-rec-${Date.now()}`,
      category: 'Pelunasan Piutang',
      type: 'income',
      walletId: wallet ? wallet.id : 'w-1',
      walletName: wallet ? wallet.name : 'BCA',
      amount: receivable.amount,
      date: 'Hari ini',
      note: `Pelunasan piutang oleh ${receivable.debtorName}`,
    };
    setTransactions((prev) => [incTx, ...prev]);

    try {
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    } catch {
      // safe fallback
    }
  };

  // Budget Handlers
  const addBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget: Budget = { ...budget, id: `b-${Date.now()}` };
    setBudgets((prev) => [...prev, newBudget]);
  };

  const updateBudget = (id: string, updated: Partial<Budget>) => {
    setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  // Notifications
  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addNotification = (item: Omit<NotificationItem, 'id' | 'read' | 'time'>) => {
    const newNotif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}`,
      read: false,
      time: 'Baru saja',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Computed Summaries
  const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);

  const monthlyIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const monthlyExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const netCashFlow = monthlyIncome - monthlyExpense;

  const totalDebt = debts
    .filter((d) => d.status === 'active')
    .reduce((acc, d) => acc + (d.totalAmount - d.paidAmount), 0);

  const upcomingDebt = 2500000; // Simulated upcoming due this month

  const totalReceivables = receivables
    .filter((r) => r.status !== 'paid')
    .reduce((acc, r) => acc + r.amount, 0);

  const collectedReceivablesMonth = 12000000;

  const resetDemoData = () => {
    setWallets(initialWallets);
    setCategories(initialCategories);
    setTransactions(initialTransactions);
    setDebts(initialDebts);
    setReceivables(initialReceivables);
    setBudgets(initialBudgets);
    setNotifications(initialNotifications);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        tab,
        setTab,
        wallets,
        categories,
        transactions,
        debts,
        receivables,
        budgets,
        notifications,
        searchQuery,
        setSearchQuery,
        addWallet,
        updateWallet,
        deleteWallet,
        addCategory,
        updateCategory,
        deleteCategory,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        transferFunds,
        addDebt,
        updateDebt,
        deleteDebt,
        payDebt,
        addReceivable,
        updateReceivable,
        deleteReceivable,
        markReceivablePaid,
        addBudget,
        updateBudget,
        deleteBudget,
        markAllNotificationsRead,
        addNotification,
        totalBalance,
        monthlyIncome,
        monthlyExpense,
        netCashFlow,
        totalDebt,
        upcomingDebt,
        totalReceivables,
        collectedReceivablesMonth,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
