import {
  ArrowRightLeft,
  Banknote,
  HandCoins,
  LayoutDashboard,
  PieChart,
  Receipt,
  Tags,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

/** Navigasi utama aplikasi — dipakai di nav desktop, bottom nav mobile, dan hamburger menu. */
export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transaksi", icon: Receipt },
  { href: "/wallets", label: "Wallets", icon: Wallet },
  { href: "/categories", label: "Kategori", icon: Tags },
  { href: "/transfers", label: "Transfer", icon: ArrowRightLeft },
  { href: "/debts", label: "Hutang", icon: HandCoins },
  { href: "/receivables", label: "Piutang", icon: Banknote },
  { href: "/budgets", label: "Anggaran", icon: PieChart },
];
