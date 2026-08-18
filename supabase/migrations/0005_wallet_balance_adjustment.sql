-- ============================================================
-- Duitku — Migration 0005: Wallet Balance Adjustment
-- ------------------------------------------------------------
-- Fitur edit manual saldo wallet dengan tracking history
-- Format timestamp: DD-MM-YYYY HH:MM:SS (format Indonesia)
-- ============================================================

-- ---------- Table: wallet_balance_history ----------
-- Menyimpan riwayat perubahan saldo wallet (manual adjustment)
create table if not exists public.wallet_balance_history (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  wallet_id        uuid not null references public.wallets (id) on delete cascade,
  old_balance      numeric(19, 2) not null,
  new_balance      numeric(19, 2) not null,
  difference       numeric(19, 2) not null,
  adjustment_type  text not null check (adjustment_type in ('manual_increase', 'manual_decrease', 'correction')),
  notes            text,
  adjusted_at      timestamptz not null default now(),
  created_at       timestamptz not null default now()
);

create index wallet_balance_history_user_id_idx on public.wallet_balance_history (user_id);
create index wallet_balance_history_wallet_id_idx on public.wallet_balance_history (wallet_id);
create index wallet_balance_history_adjusted_at_idx on public.wallet_balance_history (adjusted_at desc);

-- ---------- RLS ----------
alter table public.wallet_balance_history enable row level security;

create policy "Users can view their own balance history"
  on public.wallet_balance_history for select
  using (auth.uid() = user_id);

-- ---------- RPC: adjust_wallet_balance ----------
-- Mengubah saldo wallet secara manual dan mencatat history
create or replace function public.adjust_wallet_balance(
  p_wallet_id   uuid,
  p_new_balance numeric(19, 2),
  p_notes       text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id      uuid := auth.uid();
  v_wallet       record;
  v_difference   numeric(19, 2);
  v_adj_type     text;
begin
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  -- Lock wallet row untuk konsistensi
  select * into v_wallet 
  from public.wallets 
  where id = p_wallet_id and user_id = v_user_id 
  for update;

  if not found then
    raise exception 'Wallet tidak ditemukan atau bukan milik Anda.';
  end if;

  -- Validasi new_balance
  if p_new_balance is null then
    raise exception 'Saldo baru tidak boleh kosong.';
  end if;

  -- Hitung perbedaan
  v_difference := p_new_balance - v_wallet.current_balance;

  -- Tentukan tipe adjustment
  if v_difference > 0 then
    v_adj_type := 'manual_increase';
  elsif v_difference < 0 then
    v_adj_type := 'manual_decrease';
  else
    v_adj_type := 'correction';
  end if;

  -- Update wallet balance
  update public.wallets
     set current_balance = p_new_balance,
         updated_at = now()
   where id = p_wallet_id;

  -- Insert history record
  insert into public.wallet_balance_history (
    user_id,
    wallet_id,
    old_balance,
    new_balance,
    difference,
    adjustment_type,
    notes,
    adjusted_at
  ) values (
    v_user_id,
    p_wallet_id,
    v_wallet.current_balance,
    p_new_balance,
    v_difference,
    v_adj_type,
    p_notes,
    now()
  );
end;
$$;

-- ---------- Function: format_adjustment_timestamp ----------
-- Format timestamp ke DD-MM-YYYY HH:MM:SS (format Indonesia)
create or replace function public.format_adjustment_timestamp(ts timestamptz)
returns text
language plpgsql
immutable
as $$
begin
  return to_char(ts at time zone 'Asia/Jakarta', 'DD-MM-YYYY HH24:MI:SS');
end;
$$;

-- ---------- Hak akses ----------
revoke execute on function public.adjust_wallet_balance(uuid, numeric, text) from public, anon;
grant execute on function public.adjust_wallet_balance(uuid, numeric, text) to authenticated;

grant execute on function public.format_adjustment_timestamp(timestamptz) to authenticated;

-- ---------- View: wallet_balance_history_formatted ----------
-- View untuk menampilkan history dengan timestamp formatted
create or replace view public.wallet_balance_history_formatted as
select 
  h.id,
  h.user_id,
  h.wallet_id,
  w.name as wallet_name,
  h.old_balance,
  h.new_balance,
  h.difference,
  h.adjustment_type,
  h.notes,
  h.adjusted_at,
  format_adjustment_timestamp(h.adjusted_at) as adjusted_at_formatted,
  h.created_at
from public.wallet_balance_history h
join public.wallets w on w.id = h.wallet_id;

-- RLS untuk view
alter view public.wallet_balance_history_formatted owner to postgres;
grant select on public.wallet_balance_history_formatted to authenticated;
