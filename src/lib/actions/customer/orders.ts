'use server';

import { createClient } from '@/lib/supabase/server';
import type { OrderWithItems } from '@/types/database';

const PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

export interface PaginatedOrders {
  orders: OrderWithItems[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getMyOrders(page = 1, pageSize = PAGE_SIZE): Promise<PaginatedOrders> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const safePage = Math.max(1, Math.floor(page));
  const safePageSize = Math.min(Math.max(1, Math.floor(pageSize)), MAX_PAGE_SIZE);

  if (!user) return { orders: [], total: 0, page: safePage, pageSize: safePageSize, totalPages: 0 };

  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  const { data, error, count } = await supabase
    .from('orders')
    .select('*, order_items(*)', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    orders: (data ?? []) as OrderWithItems[],
    total: count ?? 0,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.ceil((count ?? 0) / safePageSize),
  };
}
