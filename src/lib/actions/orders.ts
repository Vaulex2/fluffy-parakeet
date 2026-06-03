'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import type { InsertOrder, InsertOrderItem, OrderWithItems } from '@/types/database';
import { sendOrderConfirmation } from '@/lib/email/send';

export type OrderResult =
  | { success: true; id: string }
  | { success: false; error: string };

export async function createOrder(
  order: InsertOrder,
  items: InsertOrderItem[]
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
    .select('id, price, is_available')
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

  // Resolve authenticated user server-side — never trust a caller-supplied user_id.
  // Guests checking out without a session get a null user_id (allowed by design).
  const {
    data: { user },
  } = await anonSupabase.auth.getUser();
  const verifiedUserId = user?.id ?? null;

  const supabase = createAdminClient();

  const { data: newOrder, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      customer_email: order.customer_email ?? null,
      order_type: order.order_type,
      delivery_address: order.delivery_address ?? null,
      total_amount: calculatedTotal, // use server-calculated total
      notes: order.notes ?? null,
      user_id: verifiedUserId, // server-verified session id, never caller-supplied
    })
    .select('id')
    .single();

  if (orderError) {
    console.error('[createOrder] DB error:', orderError);
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
      total: calculatedTotal,
      type: order.order_type === 'dine_in' ? 'pickup' : order.order_type,
      address: order.delivery_address ?? undefined,
    }).catch(() => {});
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
