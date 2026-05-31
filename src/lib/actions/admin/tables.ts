'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from './_guard';
import type { InsertRestaurantTable, RestaurantTable } from '@/types/database';

export async function getTables(): Promise<RestaurantTable[]> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('restaurant_tables')
    .select('*')
    .order('table_number');
  if (error) throw error;
  return data ?? [];
}

export async function createTable(data: InsertRestaurantTable): Promise<RestaurantTable> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: table, error } = await supabase
    .from('restaurant_tables')
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return table;
}

export async function updateTable(
  id: string,
  data: Partial<InsertRestaurantTable>
): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from('restaurant_tables').update(data).eq('id', id);
  if (error) throw error;
}

export async function toggleTableActive(id: string, active: boolean): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('restaurant_tables')
    .update({ is_available: active })
    .eq('id', id);
  if (error) throw error;
}
