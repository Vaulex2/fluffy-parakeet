-- Per-item daily order limits.
-- daily_limit caps how many of an item can be ordered per local day.
-- NULL = unlimited. Default 30; existing rows backfilled to 30.

alter table public.menu_items
  add column if not exists daily_limit integer default 30;

update public.menu_items set daily_limit = 30 where daily_limit is null;

-- Today's sold quantity per item (Asia/Tashkent local day, excluding cancelled
-- orders). A live rolling count — resets automatically at local midnight.
create or replace function public.menu_sold_today()
returns table (menu_item_id uuid, sold bigint)
language sql
stable
as $$
  select oi.menu_item_id, coalesce(sum(oi.quantity), 0) as sold
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where o.status <> 'cancelled'
    and oi.menu_item_id is not null
    and (o.created_at at time zone 'Asia/Tashkent')::date
        = (now() at time zone 'Asia/Tashkent')::date
  group by oi.menu_item_id;
$$;

grant execute on function public.menu_sold_today() to anon, authenticated, service_role;
