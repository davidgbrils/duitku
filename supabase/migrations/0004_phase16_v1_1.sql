-- ============================================================
-- Duitku — Phase 16 V1.1 Migration (0004_phase16_v1_1.sql)
-- ------------------------------------------------------------
-- Menambahkan 5 tabel baru:
--   1. debts (Manajemen Hutang)
--   2. debt_payments (Pembayaran Cicilan Hutang)
--   3. receivables (Manajemen Piutang)
--   4. receivable_payments (Penerimaan Pelunasan Piutang)
--   5. budgets (Batas Anggaran Bulanan Per Kategori)
--
-- RLS aktif di semua tabel + RPC Stored Procedures atomik
-- ============================================================

-- ---------- 1. Debts Table ----------
create table if not exists public.debts (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid references auth.users(id) on delete cascade not null,
  lender_name      text not null,
  amount           numeric(19,2) not null check (amount > 0),
  remaining_amount numeric(19,2) not null check (remaining_amount >= 0),
  due_date         date,
  status           text not null check (status in ('unpaid', 'partially_paid', 'paid')),
  notes            text,
  created_at       timestamptz default now() not null,
  updated_at       timestamptz default now() not null
);

alter table public.debts enable row level security;

create policy "Users can manage their own debts"
  on public.debts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------- 2. Debt Payments Table ----------
create table if not exists public.debt_payments (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  debt_id      uuid references public.debts(id) on delete cascade not null,
  wallet_id    uuid references public.wallets(id) on delete cascade not null,
  amount       numeric(19,2) not null check (amount > 0),
  payment_date date not null,
  notes        text,
  created_at   timestamptz default now() not null
);

alter table public.debt_payments enable row level security;

create policy "Users can manage their own debt payments"
  on public.debt_payments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------- 3. Receivables Table ----------
create table if not exists public.receivables (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid references auth.users(id) on delete cascade not null,
  borrower_name    text not null,
  amount           numeric(19,2) not null check (amount > 0),
  remaining_amount numeric(19,2) not null check (remaining_amount >= 0),
  due_date         date,
  status           text not null check (status in ('unpaid', 'partially_paid', 'paid')),
  notes            text,
  created_at       timestamptz default now() not null,
  updated_at       timestamptz default now() not null
);

alter table public.receivables enable row level security;

create policy "Users can manage their own receivables"
  on public.receivables for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------- 4. Receivable Payments Table ----------
create table if not exists public.receivable_payments (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users(id) on delete cascade not null,
  receivable_id uuid references public.receivables(id) on delete cascade not null,
  wallet_id     uuid references public.wallets(id) on delete cascade not null,
  amount        numeric(19,2) not null check (amount > 0),
  payment_date  date not null,
  notes         text,
  created_at    timestamptz default now() not null
);

alter table public.receivable_payments enable row level security;

create policy "Users can manage their own receivable payments"
  on public.receivable_payments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------- 5. Budgets Table ----------
create table if not exists public.budgets (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  category_id  uuid references public.categories(id) on delete cascade not null,
  amount_limit numeric(19,2) not null check (amount_limit > 0),
  month_year   text not null check (month_year ~ '^\d{4}-\d{2}$'),
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null,
  constraint unique_user_category_month unique (user_id, category_id, month_year)
);

alter table public.budgets enable row level security;

create policy "Users can manage their own budgets"
  on public.budgets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------- Indexes for Performance ----------
create index if not exists idx_debts_user_status on public.debts(user_id, status);
create index if not exists idx_receivables_user_status on public.receivables(user_id, status);
create index if not exists idx_budgets_user_month on public.budgets(user_id, month_year);

-- ============================================================
-- RPC Atomic Functions for Debt & Receivable Payments
-- ============================================================

-- ---------- RPC Pay Debt (Atomik: Kurangi saldo wallet + sisa hutang) ----------
create or replace function public.pay_debt(
  p_debt_id      uuid,
  p_wallet_id    uuid,
  p_amount       numeric(19,2),
  p_payment_date date,
  p_notes        text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id      uuid := auth.uid();
  v_debt         record;
  v_wallet       record;
  v_new_rem      numeric(19,2);
  v_new_status   text;
begin
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  select * into v_debt from public.debts where id = p_debt_id and user_id = v_user_id for update;
  if not found then
    raise exception 'Hutang tidak ditemukan atau bukan milik Anda.';
  end if;

  select * into v_wallet from public.wallets where id = p_wallet_id and user_id = v_user_id for update;
  if not found then
    raise exception 'Wallet tidak ditemukan atau bukan milik Anda.';
  end if;

  if p_amount <= 0 then
    raise exception 'Nominal pembayaran harus lebih dari 0.';
  end if;

  if p_amount > v_debt.remaining_amount then
    raise exception 'Nominal pembayaran tidak boleh melebihi sisa hutang (Rp %).', v_debt.remaining_amount;
  end if;

  -- 1. Insert record pembayaran
  insert into public.debt_payments (user_id, debt_id, wallet_id, amount, payment_date, notes)
  values (v_user_id, p_debt_id, p_wallet_id, p_amount, p_payment_date, p_notes);

  -- 2. Kurangi saldo wallet
  update public.wallets
     set current_balance = current_balance - p_amount,
         updated_at = now()
   where id = p_wallet_id;

  -- 3. Update sisa hutang & status
  v_new_rem := v_debt.remaining_amount - p_amount;
  if v_new_rem = 0 then
    v_new_status := 'paid';
  else
    v_new_status := 'partially_paid';
  end if;

  update public.debts
     set remaining_amount = v_new_rem,
         status = v_new_status,
         updated_at = now()
   where id = p_debt_id;
end;
$$;

-- ---------- RPC Pay Receivable (Atomik: Tambah saldo wallet + sisa piutang) ----------
create or replace function public.pay_receivable(
  p_receivable_id uuid,
  p_wallet_id     uuid,
  p_amount        numeric(19,2),
  p_payment_date  date,
  p_notes         text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id      uuid := auth.uid();
  v_rec          record;
  v_wallet       record;
  v_new_rem      numeric(19,2);
  v_new_status   text;
begin
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  select * into v_rec from public.receivables where id = p_receivable_id and user_id = v_user_id for update;
  if not found then
    raise exception 'Piutang tidak ditemukan atau bukan milik Anda.';
  end if;

  select * into v_wallet from public.wallets where id = p_wallet_id and user_id = v_user_id for update;
  if not found then
    raise exception 'Wallet tidak ditemukan atau bukan milik Anda.';
  end if;

  if p_amount <= 0 then
    raise exception 'Nominal penerimaan harus lebih dari 0.';
  end if;

  if p_amount > v_rec.remaining_amount then
    raise exception 'Nominal penerimaan tidak boleh melebihi sisa piutang (Rp %).', v_rec.remaining_amount;
  end if;

  -- 1. Insert record pembayaran piutang
  insert into public.receivable_payments (user_id, receivable_id, wallet_id, amount, payment_date, notes)
  values (v_user_id, p_receivable_id, p_wallet_id, p_amount, p_payment_date, p_notes);

  -- 2. Tambah saldo wallet
  update public.wallets
     set current_balance = current_balance + p_amount,
         updated_at = now()
   where id = p_wallet_id;

  -- 3. Update sisa piutang & status
  v_new_rem := v_rec.remaining_amount - p_amount;
  if v_new_rem = 0 then
    v_new_status := 'paid';
  else
    v_new_status := 'partially_paid';
  end if;

  update public.receivables
     set remaining_amount = v_new_rem,
         status = v_new_status,
         updated_at = now()
   where id = p_receivable_id;
end;
$$;
