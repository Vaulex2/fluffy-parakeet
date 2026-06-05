'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from './_guard';
import type { OrderStatus, OrderWithItems } from '@/types/database';

export async function getOrders(filters?: {
  status?: OrderStatus;
}): Promise<OrderWithItems[]> {
  await requireAdmin();
  const supabase = createAdminClient();
  let query = supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as OrderWithItems[];
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<void> {
  // actorId is now derived from the verified session — never accepted from caller
  const { userId: actorId } = await requireAdmin();
  const supabase = createAdminClient();

  // Fetch previous status + loyalty fields for audit and point awarding
  const { data: prev } = await supabase
    .from('orders')
    .select('status, user_id, total_amount, points_earned')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id);
  if (error) throw error;

  // ── Loyalty: award 1 pt per 1,000 UZS once, when an order is delivered ─────
  // points_earned acts as an idempotency guard so re-marking delivered never
  // double-credits.
  if (
    status === 'delivered' &&
    prev?.user_id &&
    (prev.points_earned ?? 0) === 0
  ) {
    const earned = Math.floor((prev.total_amount ?? 0) / 1000);
    if (earned > 0) {
      await supabase.from('orders').update({ points_earned: earned }).eq('id', id);
      const { data: profile } = await supabase
        .from('profiles')
        .select('loyalty_points')
        .eq('id', prev.user_id)
        .single();
      await supabase
        .from('profiles')
        .update({ loyalty_points: (profile?.loyalty_points ?? 0) + earned })
        .eq('id', prev.user_id);
    }
  }

  // Audit log with verified actor
  await supabase.from('audit_log').insert({
    actor_id: actorId,
    action: 'update_order_status',
    target_table: 'orders',
    target_id: id,
    payload: { from: prev?.status ?? null, to: status },
  });
}
