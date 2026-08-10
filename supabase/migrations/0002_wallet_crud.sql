-- ============================================================
-- Duitku — Migration 0002: Wallet CRUD via RPC
-- ------------------------------------------------------------
-- DML langsung pada `wallets` di-revoke dari authenticated (0001).
-- Semua operasi wallet melalui RPC security definer ini, sehingga:
--   - current_balance HANYA berubah lewat RPC transaksi/transfer (ADR-013)
--   - update wallet tidak bisa mengubah balance
--   - ownership selalu divalidasi dengan auth.uid()
-- ============================================================

-- ---------- create_wallet ----------
create or replace function public.create_wallet(
  p_name           text,
  p_type           text,
  p_currency       text,
  p_initial_balance numeric
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_wallet  uuid;
begin
  if v_user_id is null then
    raise exception 'unauthorized';
  end if;
  if char_length(trim(p_name)) between 1 and 100 is false then
    raise exception 'invalid wallet name';
  end if;
  if p_type not in ('cash', 'bank', 'ewallet', 'other') then
    raise exception 'invalid wallet type';
  end if;
  if p_initial_balance is null then
    p_initial_balance := 0;
  end if;
  if p_initial_balance < 0 then
    raise exception 'initial balance cannot be negative';
  end if;

  insert into public.wallets (user_id, name, type, currency, initial_balance, current_balance)
  values (
    v_user_id,
    trim(p_name),
    p_type,
    upper(trim(coalesce(p_currency, 'IDR'))),
    p_initial_balance,
    p_initial_balance
  )
  returning id into v_wallet;

  return v_wallet;
end;
$$;

-- ---------- update_wallet ----------
-- Catatan: current_balance & initial_balance TIDAK dapat diubah di sini —
-- balance hanya dimutasi oleh RPC transaction/transfer (ADR-013).
create or replace function public.update_wallet(
  p_wallet_id uuid,
  p_name      text,
  p_type      text,
  p_currency  text,
  p_is_active boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'unauthorized';
  end if;
  if not exists (
    select 1 from public.wallets
    where id = p_wallet_id and user_id = v_user_id
  ) then
    raise exception 'wallet not found';
  end if;
  if char_length(trim(p_name)) between 1 and 100 is false then
    raise exception 'invalid wallet name';
  end if;
  if p_type not in ('cash', 'bank', 'ewallet', 'other') then
    raise exception 'invalid wallet type';
  end if;

  update public.wallets
     set name       = trim(p_name),
         type       = p_type,
         currency   = upper(trim(coalesce(p_currency, 'IDR'))),
         is_active  = coalesce(p_is_active, is_active)
   where id = p_wallet_id and user_id = v_user_id;
end;
$$;

-- ---------- delete_wallet ----------
-- Menghapus wallet beserta transactions & transfers terkait (cascade).
-- Untuk MVP, preferensi UI adalah deactivate (is_active = false).
create or replace function public.delete_wallet(p_wallet_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'unauthorized';
  end if;
  if not exists (
    select 1 from public.wallets
    where id = p_wallet_id and user_id = v_user_id
  ) then
    raise exception 'wallet not found';
  end if;

  delete from public.wallets
   where id = p_wallet_id and user_id = v_user_id;
end;
$$;

-- ---------- Hak akses ----------
revoke execute on function public.create_wallet(text, text, text, numeric) from public, anon;
revoke execute on function public.update_wallet(uuid, text, text, text, boolean) from public, anon;
revoke execute on function public.delete_wallet(uuid) from public, anon;

grant execute on function public.create_wallet(text, text, text, numeric) to authenticated;
grant execute on function public.update_wallet(uuid, text, text, text, boolean) to authenticated;
grant execute on function public.delete_wallet(uuid) to authenticated;
