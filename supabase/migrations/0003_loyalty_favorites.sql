-- Loyalty loop (earn/redeem audit) + favorites.

-- Per-order loyalty audit. points_earned doubles as an idempotency guard so
-- re-marking an order delivered never double-credits.
alter table public.orders
  add column if not exists points_earned    integer not null default 0,
  add column if not exists points_redeemed  integer not null default 0,
  add column if not exists discount_amount  integer not null default 0;

-- Favorited menu items, per user.
create table if not exists public.favorites (
  user_id      uuid not null references auth.users (id) on delete cascade,
  menu_item_id uuid not null references public.menu_items (id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (user_id, menu_item_id)
);

alter table public.favorites enable row level security;

-- A user can only see and manage their own favorites.
drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own" on public.favorites
  for select using (auth.uid() = user_id);

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own" on public.favorites
  for insert with check (auth.uid() = user_id);

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own" on public.favorites
  for delete using (auth.uid() = user_id);

-- Atomically spend (or, with a negative amount, refund) loyalty points.
-- Returns true only when the deduction succeeded (balance still covered it),
-- which prevents double-spend under concurrent checkouts.
create or replace function public.redeem_loyalty_points(p_user uuid, p_points integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated integer;
begin
  update public.profiles
    set loyalty_points = loyalty_points - p_points
    where id = p_user and loyalty_points >= p_points;
  get diagnostics updated = row_count;
  return updated > 0;
end;
$$;

revoke all on function public.redeem_loyalty_points(uuid, integer) from public, anon, authenticated;
grant execute on function public.redeem_loyalty_points(uuid, integer) to service_role;

-- Harden the daily-limit aggregate from the previous migration (pin search_path).
alter function public.menu_sold_today() set search_path = public;
