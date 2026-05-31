'use server';

import { createClient } from '@/lib/supabase/server';
import type { ReservationWithTable } from '@/types/database';

const PAGE_SIZE = 10;

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

  if (!user) return { reservations: [], total: 0, page, pageSize, totalPages: 0 };

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

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
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}
