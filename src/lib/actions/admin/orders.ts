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

  // Fetch previous status for audit
  const { data: prev } = await supabase
    .from('orders')
    .select('status')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id);
  if (error) throw error;

  // Audit log with verified actor
  await supabase.from('audit_log').insert({
    actor_id: actorId,
    action: 'update_order_status',
    target_table: 'orders',
    target_id: id,
    payload: { from: prev?.status ?? null, to: status },
  });
}
