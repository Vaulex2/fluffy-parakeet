'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import type { InsertOrder, InsertOrderItem, OrderWithItems } from '@/types/database';
import { sendOrderConfirmation } from '@/lib/email/send';
import { getT } from '@/lib/i18n/server';

export type OrderResult =
  | { success: true; id: string }
  | { success: false; error: string };

export async function createOrder(
  order: InsertOrder,
  items: InsertOrderItem[],
  pointsToRedeem = 0
): Promise<OrderResult> {
  if (!order.customer_name || !order.customer_phone || !items.length) {
    return { success: false, error: 'Missing required fields.' };
  }
  if (order.order_type === 'delivery' && !order.delivery_address) {
    return { success: false, error: 'Delivery address is required.' };
  }

  // ── Server-side price recalculation (C-05) ────────────────────────────────
  // Never trust the client-supplied total_amount — recalculate from DB prices.
  const itemIds = items
    .map((i) => i.menu_item_id)
    .filter((id): id is string => Boolean(id));

  if (itemIds.length !== items.length) {
    return { success: false, error: 'All items must have a valid menu item ID.' };
  }

  // Use the anon client — the public_read_items RLS policy allows reading
  // available items without authentication.
  const anonSupabase = createClient();
  const { data: menuItems, error: menuError } = await anonSupabase
    .from('menu_items')
    .select('id, price, is_available, daily_limit')
    .in('id', itemIds);

  if (menuError || !menuItems) {
    return { success: false, error: 'Failed to validate order items. Please try again.' };
  }

  let calculatedTotal = 0;
  for (const item of items) {
    const dbItem = menuItems.find((m) => m.id === item.menu_item_id);
    if (!dbItem) {
      return { success: false, error: 'One or more items are no longer on the menu.' };
    }
    if (!dbItem.is_available) {
      return { success: false, error: 'One or more items are currently unavailable.' };
    }
    calculatedTotal += dbItem.price * item.quantity;
  }
  // ─────────────────────────────────────────────────────────────────────────

  // ── Daily limit enforcement ───────────────────────────────────────────────
  // Authoritative server-side cap: reject items whose today's tally + requested
  // quantity would exceed their daily_limit (null = unlimited). Localized message.
  const { data: soldRows } = await anonSupabase.rpc('menu_sold_today');
  const soldMap: Record<string, number> = {};
  for (const row of (soldRows ?? []) as { menu_item_id: string; sold: number }[]) {
    soldMap[row.menu_item_id] = Number(row.sold);
  }
  const { t } = getT();
  for (const item of items) {
    const dbItem = menuItems.find((m) => m.id === item.menu_item_id);
    const limit = dbItem?.daily_limit;
    if (limit == null) continue; // unlimited
    const sold = soldMap[item.menu_item_id as string] ?? 0;
    if (sold + item.quantity > limit) {
      return { success: false, error: t('checkout.limitError', { item: item.item_name }) };
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  // Resolve authenticated user server-side — never trust a caller-supplied user_id.
  // Guests checking out without a session get a null user_id (allowed by design).
  const {
    data: { user },
  } = await anonSupabase.auth.getUser();
  const verifiedUserId = user?.id ?? null;

  const supabase = createAdminClient();

  // ── Loyalty redemption (1 pt = 1 UZS, min 100, max 50% of order) ───────────
  // Only signed-in users can redeem. `redeem_loyalty_points` deducts atomically
  // (guarded UPDATE) and returns true only if the balance covered it.
  let discount = 0;
  if (pointsToRedeem > 0 && verifiedUserId) {
    const maxByOrder = Math.floor(calculatedTotal * 0.5);
    const desired = Math.min(Math.floor(pointsToRedeem), maxByOrder);
    if (desired >= 100) {
      const { data: ok, error: decErr } = await supabase.rpc('redeem_loyalty_points', {
        p_user: verifiedUserId,
        p_points: desired,
      });
      if (!decErr && ok === true) discount = desired;
    }
  }
  const finalTotal = calculatedTotal - discount;

  const { data: newOrder, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      customer_email: order.customer_email ?? null,
      order_type: order.order_type,
      delivery_address: order.delivery_address ?? null,
      total_amount: finalTotal, // server-calculated total, less any points discount
      points_redeemed: discount,
      discount_amount: discount,
      notes: order.notes ?? null,
      user_id: verifiedUserId, // server-verified session id, never caller-supplied
    })
    .select('id')
    .single();

  if (orderError) {
    console.error('[createOrder] DB error:', orderError);
    // Refund any points we deducted, since the order didn't persist.
    if (discount > 0 && verifiedUserId) {
      await supabase.rpc('redeem_loyalty_points', { p_user: verifiedUserId, p_points: -discount });
    }
    return { success: false, error: 'Could not place order. Please try again.' };
  }

  const orderItems = items.map((item) => ({ ...item, order_id: newOrder.id }));
  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) {
    console.error('[createOrder] items insert error:', itemsError);
    return { success: false, error: 'Could not save order items. Please try again.' };
  }

  if (order.customer_email) {
    await sendOrderConfirmation(order.customer_email, {
      orderId: newOrder.id,
      items: items.map((i) => ({ name: i.item_name, quantity: i.quantity, price: i.unit_price })),
      total: finalTotal,
      type: order.order_type === 'dine_in' ? 'pickup' : order.order_type,
      address: order.delivery_address ?? undefined,
    }).catch(() => {});
  }

  // Redeeming points changed the balance — bust the cached layout so the
  // navbar loyalty chip refreshes on the next navigation.
  if (discount > 0) {
    revalidatePath('/', 'layout');
  }

  return { success: true, id: newOrder.id };
}

export async function getOrderById(id: string): Promise<OrderWithItems | null> {
  // ── Auth + ownership check (C-04) ─────────────────────────────────────────
  // Use the user-scoped client so RLS enforces row-level ownership.
  // The explicit .eq('user_id') filter is a second layer of defense.
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .eq('user_id', user.id) // ownership check — prevents IDOR
    .single();

  if (error) return null;
  return data as OrderWithItems;
}
