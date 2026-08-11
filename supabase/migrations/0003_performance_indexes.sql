-- ============================================================
-- Duitku — Migration 0003: Performance Indexes (TASK-1301)
-- ------------------------------------------------------------
-- Query umum dashboard & riwayat selalu difilter oleh user_id
-- (RLS + session). Index tunggal per kolom (0001) tidak optimal
-- untuk pola (user_id, transaction_date), (user_id, type), dll.
-- Index komposit ini menghindari full-table scan per user.
-- ============================================================

-- Dashboard: tren bulanan & transaksi terakhir
-- (WHERE user_id = ? AND transaction_date BETWEEN ? AND ? ORDER BY transaction_date DESC)
create index transactions_user_date_idx
  on public.transactions (user_id, transaction_date desc);

-- Riwayat: filter tipe (income/expense)
create index transactions_user_type_idx
  on public.transactions (user_id, type);

-- Riwayat: filter kategori (breakdown dashboard juga join kategori)
create index transactions_user_category_idx
  on public.transactions (user_id, category_id);

-- Riwayat: filter wallet
create index transactions_user_wallet_idx
  on public.transactions (user_id, wallet_id);

-- Halaman transfer: urut per user berdasarkan tanggal
create index transfers_user_date_idx
  on public.transfers (user_id, transfer_date desc);
