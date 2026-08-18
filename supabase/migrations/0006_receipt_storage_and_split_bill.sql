-- ============================================================
-- Duitku — Migration 0006: Receipt Storage & Split Bill
-- ------------------------------------------------------------
-- 1. Tambah kolom `receipt_image_url` di transactions (preview struk).
-- 2. Update RPC create/update_transaction untuk menerima URL struk.
-- 3. Tabel split_bills & split_bill_members (fitur bagi tagihan struk).
-- 4. RPC create_split_bill (atomik, opsi auto-link ke receivables).
-- ============================================================

-- ============================================================
-- 1. Receipt image URL
-- ============================================================
alter table public.transactions
  add column if not exists receipt_image_url text;

-- ============================================================
-- 2. RPC create/update_transaction dengan signature baru
-- ============================================================
drop function if exists public.create_transaction(text, uuid, uuid, numeric, text, date);
drop function if exists public.update_transaction(uuid, text, uuid, uuid, numeric, text, date);

create or replace function public.create_transaction(
  p_type               text,
  p_wallet_id          uuid,
  p_category_id        uuid,
  p_amount             numeric,
  p_description        text,
  p_transaction_date   date,
  p_receipt_image_url  text default null
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

  insert into public.transactions (user_id, wallet_id, category_id, type, amount, description, transaction_date, receipt_image_url)
  values (
    v_user_id,
    p_wallet_id,
    p_category_id,
    p_type,
    p_amount,
    nullif(trim(p_description), ''),
    coalesce(p_transaction_date, current_date),
    nullif(trim(p_receipt_image_url), '')
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

create or replace function public.update_transaction(
  p_tx_id              uuid,
  p_type               text,
  p_wallet_id          uuid,
  p_category_id        uuid,
  p_amount             numeric,
  p_description        text,
  p_transaction_date   date,
  p_receipt_image_url  text default null
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
         transaction_date = coalesce(p_transaction_date, current_date),
         receipt_image_url = nullif(trim(p_receipt_image_url), '')
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

revoke execute on function public.create_transaction(text, uuid, uuid, numeric, text, date, text) from public, anon;
revoke execute on function public.update_transaction(uuid, text, uuid, uuid, numeric, text, date, text) from public, anon;
grant execute on function public.create_transaction(text, uuid, uuid, numeric, text, date, text) to authenticated;
grant execute on function public.update_transaction(uuid, text, uuid, uuid, numeric, text, date, text) to authenticated;

-- ============================================================
-- 3. Split Bill tables
-- ============================================================
create table if not exists public.split_bills (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  transaction_id uuid not null references public.transactions (id) on delete cascade,
  split_date     date not null default current_date,
  notes          text,
  created_at     timestamptz not null default now(),
  constraint split_bills_transaction_unique unique (transaction_id)
);

create table if not exists public.split_bill_members (
  id            uuid primary key default gen_random_uuid(),
  split_bill_id uuid not null references public.split_bills (id) on delete cascade,
  member_name   text not null check (char_length(trim(member_name)) between 1 and 100),
  amount        numeric(19, 2) not null check (amount >= 0),
  is_settled    boolean not null default false,
  receivable_id uuid references public.receivables (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.split_bills enable row level security;
alter table public.split_bill_members enable row level security;

create policy "Users can manage their own split bills"
  on public.split_bills for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own split bill members"
  on public.split_bill_members for all
  using (auth.uid() in (select user_id from public.split_bills where id = split_bill_id))
  with check (auth.uid() in (select user_id from public.split_bills where id = split_bill_id));

create index if not exists idx_split_bills_user on public.split_bills (user_id);
create index if not exists idx_split_bill_members_split on public.split_bill_members (split_bill_id);

-- ============================================================
-- 4. RPC create_split_bill (atomik)
--    p_members jsonb: [{ "name": "Budi", "amount": 25000 }]
-- ============================================================
create or replace function public.create_split_bill(
  p_transaction_id     uuid,
  p_members            jsonb,
  p_create_receivables boolean default false,
  p_notes              text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id       uuid := auth.uid();
  v_tx            record;
  v_split_id      uuid;
  v_member        jsonb;
  v_member_name   text;
  v_member_amount numeric(19, 2);
  v_sum           numeric(19, 2) := 0;
  v_rec_id        uuid;
begin
  if v_user_id is null then
    raise exception 'unauthorized';
  end if;

  select * into v_tx
    from public.transactions
   where id = p_transaction_id and user_id = v_user_id;
  if not found then
    raise exception 'transaction not found';
  end if;

  if jsonb_typeof(p_members) <> 'array' or jsonb_array_length(p_members) = 0 then
    raise exception 'split members must be a non-empty array';
  end if;

  for v_member in select * from jsonb_array_elements(p_members)
  loop
    v_member_name := trim(coalesce(v_member->>'name', ''));
    v_member_amount := coalesce((v_member->>'amount')::numeric, 0);
    if char_length(v_member_name) < 1 then
      raise exception 'member name is required';
    end if;
    if v_member_amount < 0 then
      raise exception 'member amount cannot be negative';
    end if;
    v_sum := v_sum + v_member_amount;
  end loop;

  if v_sum > v_tx.amount then
    raise exception 'total split amount exceeds transaction amount';
  end if;

  insert into public.split_bills (user_id, transaction_id, notes, split_date)
  values (v_user_id, p_transaction_id, nullif(trim(p_notes), ''), v_tx.transaction_date)
  returning id into v_split_id;

  for v_member in select * from jsonb_array_elements(p_members)
  loop
    v_member_name := trim(coalesce(v_member->>'name', ''));
    v_member_amount := coalesce((v_member->>'amount')::numeric, 0);

    v_rec_id := null;
    if p_create_receivables and v_member_amount > 0 then
      insert into public.receivables (
        user_id, borrower_name, amount, remaining_amount, status
      ) values (
        v_user_id, v_member_name, v_member_amount, v_member_amount, 'unpaid'
      ) returning id into v_rec_id;
    end if;

    insert into public.split_bill_members (
      split_bill_id, member_name, amount, receivable_id
    ) values (
      v_split_id, v_member_name, v_member_amount, v_rec_id
    );
  end loop;

  return v_split_id;
end;
$$;

revoke execute on function public.create_split_bill(uuid, jsonb, boolean, text) from public, anon;
grant execute on function public.create_split_bill(uuid, jsonb, boolean, text) to authenticated;
