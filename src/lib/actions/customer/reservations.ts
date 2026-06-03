'use server';

import { createClient } from '@/lib/supabase/server';
import type { ReservationWithTable } from '@/types/database';

const PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

export interface PaginatedReservations {
  reservations: ReservationWithTable[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getMyReservations(page = 1, pageSize = PAGE_SIZE): Promise<PaginatedReservations> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const safePage = Math.max(1, Math.floor(page));
  const safePageSize = Math.min(Math.max(1, Math.floor(pageSize)), MAX_PAGE_SIZE);

  if (!user) return { reservations: [], total: 0, page: safePage, pageSize: safePageSize, totalPages: 0 };

  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  const { data, error, count } = await supabase
    .from('reservations')
    .select('*, restaurant_tables(*)', { count: 'exact' })
    .eq('user_id', user.id)
    .order('reservation_date', { ascending: false })
    .order('start_time', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    reservations: (data ?? []) as ReservationWithTable[],
    total: count ?? 0,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.ceil((count ?? 0) / safePageSize),
  };
}

/**
 * Active, future reservations (pending/confirmed, date >= today) for the
 * signed-in user, soonest first. Used to highlight the next booking and
 * power the "Upcoming" tab on the profile page.
 */
export async function getUpcomingReservations(): Promise<ReservationWithTable[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const { data, error } = await supabase
    .from('reservations')
    .select('*, restaurant_tables(*)')
    .eq('user_id', user.id)
    .in('status', ['pending', 'confirmed'])
    .gte('reservation_date', today)
    .order('reservation_date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) throw error;

  return (data ?? []) as ReservationWithTable[];
}
