-- ============================================================
-- Duitku — Migration 0001: Initial Schema
-- ------------------------------------------------------------
-- Entities : profiles, categories, wallets, transactions, transfers
-- Security : RLS aktif di semua tabel user-owned (ADR-009)
-- Integrity: operasi finansial atomik via SECURITY DEFINER RPC (ADR-008)
-- Money    : NUMERIC(19,2) — bukan floating point (ARCHITECTURE §15)
-- ============================================================

-- ---------- Extensions ----------
create extension if not exists "pgcrypto";

-- ============================================================
-- Helper: trigger updated_at
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- Table: profiles
-- Identity utama = auth.users.id (ARCHITECTURE §8)
-- ============================================================
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 100),
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ============================================================
-- Table: categories (ARCHITECTURE §10)
-- ============================================================
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null check (char_length(trim(name)) between 1 and 100),
  type       text not null check (type in ('income', 'expense')),
  icon       text not null default 'tag',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_user_type_name_unique unique (user_id, type, name)
);

create index categories_user_id_idx on public.categories (user_id);

create trigger set_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- ============================================================
-- Table: wallets (ARCHITECTURE §9)
-- ============================================================
create table public.wallets (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  name            text not null check (char_length(trim(name)) between 1 and 100),
  type            text not null check (type in ('cash', 'bank', 'ewallet', 'other')) default 'cash',
  currency        text not null default 'IDR' check (char_length(currency) = 3),
  initial_balance numeric(19, 2) not null default 0 check (initial_balance >= 0),
  current_balance numeric(19, 2) not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index wallets_user_id_idx on public.wallets (user_id);

create trigger set_wallets_updated_at
  before update on public.wallets
  for each row execute function public.set_updated_at();

-- ============================================================
-- Table: transactions (ARCHITECTURE §11)
-- Catatan: type transfer TIDAK disimpan di tabel ini — transfer
-- memiliki entitas sendiri (ADR-007, ARCHITECTURE §12).
-- ============================================================
create table public.transactions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  wallet_id        uuid not null references public.wallets (id) on delete cascade,
  category_id      uuid references public.categories (id) on delete set null,
  type             text not null check (type in ('income', 'expense')),
  amount           numeric(19, 2) not null check (amount > 0),
  description      text,
  transaction_date date not null default current_date,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index transactions_user_id_idx on public.transactions (user_id);
create index transactions_wallet_id_idx on public.transactions (wallet_id);
create index transactions_category_id_idx on public.transactions (category_id);
create index transactions_date_idx on public.transactions (transaction_date desc);

create trigger set_transactions_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

-- ============================================================
-- Table: transfers (ARCHITECTURE §12)
-- Source -x, Destination +x, total balance tidak berubah.
-- ============================================================
create table public.transfers (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users (id) on delete cascade,
  source_wallet_id     uuid not null references public.wallets (id) on delete cascade,
  destination_wallet_id uuid not null references public.wallets (id) on delete cascade,
  amount               numeric(19, 2) not null check (amount > 0),
  description          text,
  transfer_date        date not null default current_date,
  created_at           timestamptz not null default now(),
  constraint transfers_distinct_wallets_check check (source_wallet_id <> destination_wallet_id)
);

create index transfers_user_id_idx on public.transfers (user_id);
create index transfers_source_wallet_id_idx on public.transfers (source_wallet_id);
create index transfers_destination_wallet_id_idx on public.transfers (destination_wallet_id);

-- ============================================================
-- Seed: kategori default untuk user baru (TASK-0501)
-- ============================================================
create or replace function public.seed_default_categories(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (user_id, name, type, icon, is_default)
  values
    (p_user_id, 'Gaji',         'income',  'wallet',          true),
    (p_user_id, 'Bonus',        'income',  'gift',            true),
    (p_user_id, 'Bisnis',       'income',  'briefcase',       true),
    (p_user_id, 'Lainnya',      'income',  'plus-circle',     true),
    (p_user_id, 'Makanan',      'expense', 'utensils',        true),
    (p_user_id, 'Transportasi', 'expense', 'bus',             true),
    (p_user_id, 'Belanja',      'expense', 'shopping-bag',    true),
    (p_user_id, 'Tagihan',      'expense', 'receipt',         true),
    (p_user_id, 'Kesehatan',    'expense', 'heart-pulse',     true),
    (p_user_id, 'Hiburan',      'expense', 'gamepad-2',       true),
    (p_user_id, 'Pendidikan',   'expense', 'graduation-cap',  true),
    (p_user_id, 'Lainnya',      'expense', 'tag',             true)
  on conflict (user_id, type, name) do nothing;
end;
$$;

-- ============================================================
-- Trigger: buat profile + seed kategori saat user baru daftar
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;

  -- Kegagalan seed kategori tidak boleh menggagalkan pembuatan akun.
  begin
    perform public.seed_default_categories(new.id);
  exception when others then
    null;
  end;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Row Level Security (ADR-009) — setiap user hanya bisa akses
-- data miliknya sendiri (auth.uid() = user_id).
-- ============================================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.wallets enable row level security;
alter table public.transactions enable row level security;
alter table public.transfers enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "categories_select_own" on public.categories
  for select using (auth.uid() = user_id);

create policy "categories_insert_own" on public.categories
  for insert with check (auth.uid() = user_id);

create policy "categories_update_own" on public.categories
  for update using (auth.uid() = user_id);

create policy "categories_delete_own" on public.categories
  for delete using (auth.uid() = user_id);

create policy "wallets_select_own" on public.wallets
  for select using (auth.uid() = user_id);

create policy "transactions_select_own" on public.transactions
  for select using (auth.uid() = user_id);

create policy "transfers_select_own" on public.transfers
  for select using (auth.uid() = user_id);

-- Mutasi wallets/transactions/transfers HANYA lewat RPC (ADR-013):
-- client tidak boleh INSERT/UPDATE/DELETE langsung, karena itu akan
-- melewati invariant saldo (dan berpotensi mereferensikan entitas user lain).
-- Kategori tetap boleh CRUD langsung karena RLS ownership cukup.
revoke insert, update, delete on public.wallets from authenticated;
revoke insert, update, delete on public.transactions from authenticated;
revoke insert, update, delete on public.transfers from authenticated;

-- ============================================================
-- RPC: operasi finansial atomik (ADR-008)
-- Body plpgsql berjalan dalam satu transaction — insert + update
-- balance berhasil atau gagal bersama-sama (ROLLBACK otomatis).
-- Semua fungsi melakukan validasi ownership berbasis auth.uid(),
-- bukan parameter dari client.
-- ============================================================

-- ---------- create_transaction ----------
create or replace function public.create_transaction(
  p_type              text,
  p_wallet_id         uuid,
  p_category_id       uuid,
  p_amount            numeric,
  p_description       text,
  p_transaction_date  date
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_tx_id   uuid;
begin
  if v_user_id is null then
    raise exception 'unauthorized';
  end if;
  if p_type not in ('income', 'expense') then
    raise exception 'invalid transaction type';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;
  if not exists (
    select 1 from public.wallets
    where id = p_wallet_id and user_id = v_user_id
  ) then
    raise exception 'wallet not found';
  end if;
  if p_category_id is not null and not exists (
    select 1 from public.categories
    where id = p_category_id and user_id = v_user_id
  ) then
    raise exception 'category not found';
  end if;

  insert into public.transactions (user_id, wallet_id, category_id, type, amount, description, transaction_date)
  values (
    v_user_id,
    p_wallet_id,
    p_category_id,
    p_type,
    p_amount,
    nullif(trim(p_description), ''),
    coalesce(p_transaction_date, current_date)
  )
  returning id into v_tx_id;

  if p_type = 'income' then
    update public.wallets
       set current_balance = current_balance + p_amount
     where id = p_wallet_id;
  else
    update public.wallets
       set current_balance = current_balance - p_amount
     where id = p_wallet_id;
  end if;

  return v_tx_id;
end;
$$;

-- ---------- update_transaction ----------
create or replace function public.update_transaction(
  p_tx_id             uuid,
  p_type              text,
  p_wallet_id         uuid,
  p_category_id       uuid,
  p_amount            numeric,
  p_description       text,
  p_transaction_date  date
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_old     record;
begin
  if v_user_id is null then
    raise exception 'unauthorized';
  end if;

  select * into v_old
    from public.transactions
   where id = p_tx_id and user_id = v_user_id;
  if not found then
    raise exception 'transaction not found';
  end if;

  if p_type not in ('income', 'expense') then
    raise exception 'invalid transaction type';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;
  if not exists (
    select 1 from public.wallets
    where id = p_wallet_id and user_id = v_user_id
  ) then
    raise exception 'wallet not found';
  end if;
  if p_category_id is not null and not exists (
    select 1 from public.categories
    where id = p_category_id and user_id = v_user_id
  ) then
    raise exception 'category not found';
  end if;

  -- Batalkan efek transaksi lama
  if v_old.type = 'income' then
    update public.wallets
       set current_balance = current_balance - v_old.amount
     where id = v_old.wallet_id;
  else
    update public.wallets
       set current_balance = current_balance + v_old.amount
     where id = v_old.wallet_id;
  end if;

  -- Terapkan nilai baru
  update public.transactions
     set wallet_id        = p_wallet_id,
         category_id      = p_category_id,
         type             = p_type,
         amount           = p_amount,
         description      = nullif(trim(p_description), ''),
         transaction_date = coalesce(p_transaction_date, current_date)
   where id = p_tx_id;

  if p_type = 'income' then
    update public.wallets
       set current_balance = current_balance + p_amount
     where id = p_wallet_id;
  else
    update public.wallets
       set current_balance = current_balance - p_amount
     where id = p_wallet_id;
  end if;
end;
$$;

-- ---------- delete_transaction ----------
create or replace function public.delete_transaction(p_tx_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_old     record;
begin
  if v_user_id is null then
    raise exception 'unauthorized';
  end if;

  select * into v_old
    from public.transactions
   where id = p_tx_id and user_id = v_user_id;
  if not found then
    raise exception 'transaction not found';
  end if;

  -- Batalkan efek transaksi
  if v_old.type = 'income' then
    update public.wallets
       set current_balance = current_balance - v_old.amount
     where id = v_old.wallet_id;
  else
    update public.wallets
       set current_balance = current_balance + v_old.amount
     where id = v_old.wallet_id;
  end if;

  delete from public.transactions where id = p_tx_id;
end;
$$;

-- ---------- create_transfer ----------
create or replace function public.create_transfer(
  p_source_wallet_id      uuid,
  p_destination_wallet_id uuid,
  p_amount                numeric,
  p_description           text,
  p_transfer_date         date
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id  uuid := auth.uid();
  v_transfer uuid;
begin
  if v_user_id is null then
    raise exception 'unauthorized';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;
  if p_source_wallet_id = p_destination_wallet_id then
    raise exception 'source and destination must differ';
  end if;
  if not exists (
    select 1 from public.wallets
    where id = p_source_wallet_id and user_id = v_user_id
  ) then
    raise exception 'source wallet not found';
  end if;
  if not exists (
    select 1 from public.wallets
    where id = p_destination_wallet_id and user_id = v_user_id
  ) then
    raise exception 'destination wallet not found';
  end if;

  insert into public.transfers (user_id, source_wallet_id, destination_wallet_id, amount, description, transfer_date)
  values (
    v_user_id,
    p_source_wallet_id,
    p_destination_wallet_id,
    p_amount,
    nullif(trim(p_description), ''),
    coalesce(p_transfer_date, current_date)
  )
  returning id into v_transfer;

  update public.wallets
     set current_balance = current_balance - p_amount
   where id = p_source_wallet_id;

  update public.wallets
     set current_balance = current_balance + p_amount
   where id = p_destination_wallet_id;

  return v_transfer;
end;
$$;

-- ---------- update_transfer ----------
create or replace function public.update_transfer(
  p_transfer_id           uuid,
  p_source_wallet_id      uuid,
  p_destination_wallet_id uuid,
  p_amount                numeric,
  p_description           text,
  p_transfer_date         date
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_old     record;
begin
  if v_user_id is null then
    raise exception 'unauthorized';
  end if;

  select * into v_old
    from public.transfers
   where id = p_transfer_id and user_id = v_user_id;
  if not found then
    raise exception 'transfer not found';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;
  if p_source_wallet_id = p_destination_wallet_id then
    raise exception 'source and destination must differ';
  end if;
  if not exists (
    select 1 from public.wallets
    where id = p_source_wallet_id and user_id = v_user_id
  ) then
    raise exception 'source wallet not found';
  end if;
  if not exists (
    select 1 from public.wallets
    where id = p_destination_wallet_id and user_id = v_user_id
  ) then
    raise exception 'destination wallet not found';
  end if;

  -- Batalkan efek transfer lama
  update public.wallets
     set current_balance = current_balance + v_old.amount
   where id = v_old.source_wallet_id;
  update public.wallets
     set current_balance = current_balance - v_old.amount
   where id = v_old.destination_wallet_id;

  -- Terapkan nilai baru
  update public.transfers
     set source_wallet_id      = p_source_wallet_id,
         destination_wallet_id = p_destination_wallet_id,
         amount                = p_amount,
         description           = nullif(trim(p_description), ''),
         transfer_date         = coalesce(p_transfer_date, current_date)
   where id = p_transfer_id;

  update public.wallets
     set current_balance = current_balance - p_amount
   where id = p_source_wallet_id;
  update public.wallets
     set current_balance = current_balance + p_amount
   where id = p_destination_wallet_id;
end;
$$;

-- ---------- delete_transfer ----------
create or replace function public.delete_transfer(p_transfer_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_old     record;
begin
  if v_user_id is null then
    raise exception 'unauthorized';
  end if;

  select * into v_old
    from public.transfers
   where id = p_transfer_id and user_id = v_user_id;
  if not found then
    raise exception 'transfer not found';
  end if;

  -- Batalkan efek transfer
  update public.wallets
     set current_balance = current_balance + v_old.amount
   where id = v_old.source_wallet_id;
  update public.wallets
     set current_balance = current_balance - v_old.amount
   where id = v_old.destination_wallet_id;

  delete from public.transfers where id = p_transfer_id;
end;
$$;

-- ============================================================
-- Hak akses function: hanya role authenticated
-- ============================================================
revoke execute on function public.set_updated_at() from public, anon;
revoke execute on function public.seed_default_categories(uuid) from public, anon;
revoke execute on function public.handle_new_user() from public, anon;
revoke execute on function public.create_transaction(text, uuid, uuid, numeric, text, date) from public, anon;
revoke execute on function public.update_transaction(uuid, text, uuid, uuid, numeric, text, date) from public, anon;
revoke execute on function public.delete_transaction(uuid) from public, anon;
revoke execute on function public.create_transfer(uuid, uuid, numeric, text, date) from public, anon;
revoke execute on function public.update_transfer(uuid, uuid, uuid, numeric, text, date) from public, anon;
revoke execute on function public.delete_transfer(uuid) from public, anon;

grant execute on function public.create_transaction(text, uuid, uuid, numeric, text, date) to authenticated;
grant execute on function public.update_transaction(uuid, text, uuid, uuid, numeric, text, date) to authenticated;
grant execute on function public.delete_transaction(uuid) to authenticated;
grant execute on function public.create_transfer(uuid, uuid, numeric, text, date) to authenticated;
grant execute on function public.update_transfer(uuid, uuid, uuid, numeric, text, date) to authenticated;
grant execute on function public.delete_transfer(uuid) to authenticated;
