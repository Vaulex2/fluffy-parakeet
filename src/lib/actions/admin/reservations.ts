'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from './_guard';
import type { ReservationStatus, ReservationWithTable } from '@/types/database';

export async function getReservations(filters?: {
  date?: string;
  status?: ReservationStatus;
}): Promise<ReservationWithTable[]> {
  await requireAdmin();
  const supabase = createAdminClient();
  let query = supabase
    .from('reservations')
    .select('*, restaurant_tables(*)')
    .order('start_time');

  if (filters?.date) {
    query = query.eq('reservation_date', filters.date);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ReservationWithTable[];
}

export async function updateReservationStatus(
  id: string,
  status: ReservationStatus
): Promise<void> {
  // actorId is now derived from the verified session — never accepted from caller
  const { userId: actorId } = await requireAdmin();
  const supabase = createAdminClient();

  // Fetch previous status for audit
  const { data: prev } = await supabase
    .from('reservations')
    .select('status')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('reservations')
    .update({ status })
    .eq('id', id);
  if (error) throw error;

  // Audit log with verified actor
  await supabase.from('audit_log').insert({
    actor_id: actorId,
    action: 'update_reservation_status',
    target_table: 'reservations',
    target_id: id,
    payload: { from: prev?.status ?? null, to: status },
  });
}

export async function rescheduleReservation(
  id: string,
  tableId: string,
  startTime: string,
  endTime: string,
  date: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('reservations')
    .update({
      table_id: tableId,
      start_time: startTime,
      end_time: endTime,
      reservation_date: date,
    })
    .eq('id', id);

  if (error) {
    if (error.code === '23P01') return { success: false, error: 'slot_taken' };
    console.error('[rescheduleReservation] DB error:', error);
    return { success: false, error: 'An error occurred. Please try again.' };
  }
  return { success: true };
}
