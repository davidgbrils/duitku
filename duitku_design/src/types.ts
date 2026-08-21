export type TabType = 
  | 'dashboard'
  | 'transaksi'
  | 'wallets'
  | 'kategori'
  | 'transfer'
  | 'hutang'
  | 'piutang'
  | 'anggaran';

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  type: 'bank' | 'cash' | 'ewallet' | 'investment';
  accountNumber?: string;
  color?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color?: string;
}

export interface Transaction {
  id: string;
  category: string;
  type: 'income' | 'expense' | 'transfer';
  walletId: string;
  walletName: string;
  toWalletId?: string;
  toWalletName?: string;
  amount: number;
  date: string; // YYYY-MM-DD or formatted
  note?: string;
  receiptUrl?: string;
}

export interface Debt {
  id: string;
  creditorName: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: 'active' | 'paid';
  note?: string;
}

export interface Receivable {
  id: string;
  debtorName: string;
  avatar?: string;
  initials?: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: 'pending' | 'upcoming' | 'overdue' | 'paid';
  phone?: string;
  note?: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  month: string; // YYYY-MM
  icon?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'alert' | 'info' | 'success';
}
