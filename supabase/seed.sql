-- ============================================================
-- Duitku — Demo Data (TASK-1502)
-- ------------------------------------------------------------
-- Cara pakai:
--   1. Daftar akun demo (mis. demo@example.com) lewat aplikasi.
--   2. Jalankan script ini di Supabase SQL Editor.
--
-- Script membuat wallet, kategori tambahan, dan ~2 bulan transaksi
-- fiktif (TIDAK mengandung data pribadi nyata). Aman dijalankan
-- ulang: kategori & wallet memakai ON CONFLICT, transaksi di-generate
-- deterministik per user (bukan tanggal tetap) agar terlihat segar.
-- ============================================================

do $$
declare
  v_user_id     uuid;
  v_wallet_cash uuid;
  v_wallet_bank uuid;
  v_wallet_ewallet uuid;
  v_cat         record;
  v_day         date;
  v_tx_count    int := 0;
begin
  select id into v_user_id from auth.users where email = 'demo@example.com';
  if v_user_id is null then
    raise notice 'Akun demo@example.com belum ada. Daftarkan dulu lewat aplikasi, lalu jalankan ulang.';
    return;
  end if;

  -- ---------- Wallet (idempotent: hanya dibuat jika belum ada) ----------
  insert into public.wallets (user_id, name, type, currency, initial_balance, current_balance)
  select v_user_id, 'Cash', 'cash', 'IDR', 1000000, 1000000
  where not exists (select 1 from public.wallets where user_id = v_user_id and name = 'Cash');
  insert into public.wallets (user_id, name, type, currency, initial_balance, current_balance)
  select v_user_id, 'BCA', 'bank', 'IDR', 2500000, 2500000
  where not exists (select 1 from public.wallets where user_id = v_user_id and name = 'BCA');
  insert into public.wallets (user_id, name, type, currency, initial_balance, current_balance)
  select v_user_id, 'DANA', 'ewallet', 'IDR', 500000, 500000
  where not exists (select 1 from public.wallets where user_id = v_user_id and name = 'DANA');

  select id into v_wallet_cash    from public.wallets where user_id = v_user_id and name = 'Cash' limit 1;
  select id into v_wallet_bank    from public.wallets where user_id = v_user_id and name = 'BCA'  limit 1;
  select id into v_wallet_ewallet from public.wallets where user_id = v_user_id and name = 'DANA' limit 1;

  -- ---------- Kategori tambahan ----------
  insert into public.categories (user_id, name, type, icon, is_default)
  values
    (v_user_id, 'Investasi',  'income',  'trending-up',  false),
    (v_user_id, 'Freelance',  'income',  'laptop',       false),
    (v_user_id, 'Kopi',       'expense', 'coffee',       false),
    (v_user_id, 'Nongkrong',  'expense', 'users',        false)
  on conflict (user_id, type, name) do nothing;

  -- ---------- Transaksi fiktif: 60 hari terakhir ----------
  -- Hapus dulu data demo lama agar script idempotent.
  delete from public.transactions
   where user_id = v_user_id
     and description like '[Demo] %';

  for i in 0..59 loop
    v_day := current_date - (i * interval '1 day');

    -- Gaji tiap tanggal 1 & 15 (income → BCA)
    if extract(day from v_day) in (1, 15) then
      insert into public.transactions (user_id, wallet_id, category_id, type, amount, description, transaction_date)
      select v_user_id, v_wallet_bank, id, 'income', 3500000, '[Demo] Gaji bulanan', v_day
        from public.categories where user_id = v_user_id and name = 'Gaji' limit 1;
      v_tx_count := v_tx_count + 1;
      update public.wallets set current_balance = current_balance + 3500000 where id = v_wallet_bank;
    end if;

    -- Pengeluaran harian kecil (makanan/kopi/transportasi) bergantian wallet
    if i % 7 <> 0 then
      insert into public.transactions (user_id, wallet_id, category_id, type, amount, description, transaction_date)
      select v_user_id,
             case i % 3 when 0 then v_wallet_cash when 1 then v_wallet_bank else v_wallet_ewallet end,
             id,
             'expense',
             case i % 3 when 0 then 25000 when 1 then 50000 else 18000 end,
             '[Demo] Pengeluaran harian',
             v_day
        from public.categories where user_id = v_user_id and name = 'Makanan' limit 1;
      v_tx_count := v_tx_count + 1;
    end if;
  end loop;

  -- Rekalkulasi saldo dari transaksi agar konsisten dengan riwayat demo.
  update public.wallets w
     set current_balance = w.initial_balance
   where w.user_id = v_user_id;

  update public.wallets w
     set current_balance = w.current_balance
       + coalesce((select sum(t.amount) from public.transactions t
                    where t.wallet_id = w.id and t.type = 'income'), 0)
       - coalesce((select sum(t.amount) from public.transactions t
                    where t.wallet_id = w.id and t.type = 'expense'), 0)
   where w.user_id = v_user_id;

  raise notice 'Seed selesai: % transaksi demo untuk demo@example.com', v_tx_count;
end;
$$;
