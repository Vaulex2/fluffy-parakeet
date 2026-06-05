'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/actions/admin/_guard';
import type {
  MenuCategory,
  MenuItem,
  MenuItemWithCategory,
  MenuItemWithAvailability,
} from '@/types/database';

/** Map of menu_item_id → quantity sold today (Asia/Tashkent), excluding cancelled. */
export async function getSoldToday(): Promise<Record<string, number>> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('menu_sold_today');
  if (error) {
    // Availability is best-effort — never block the menu if the count fails.
    console.error('[getSoldToday] rpc error:', error);
    return {};
  }
  const map: Record<string, number> = {};
  for (const row of (data ?? []) as { menu_item_id: string; sold: number }[]) {
    map[row.menu_item_id] = Number(row.sold);
  }
  return map;
}

/** Available menu items enriched with today's sold count + remaining capacity. */
export async function getMenuItemsWithAvailability(
  categoryId?: string,
): Promise<MenuItemWithAvailability[]> {
  const [items, sold] = await Promise.all([getMenuItems(categoryId), getSoldToday()]);
  return items.map((item) => {
    const soldToday = sold[item.id] ?? 0;
    const remaining =
      item.daily_limit == null ? null : Math.max(0, item.daily_limit - soldToday);
    return { ...item, soldToday, remaining };
  });
}

export async function getCategories(): Promise<MenuCategory[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('menu_categories')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}

export async function getMenuItems(categoryId?: string): Promise<MenuItemWithCategory[]> {
  const supabase = createClient();
  let query = supabase
    .from('menu_items')
    .select('*, menu_categories(*)')
    .eq('is_available', true)
    .order('sort_order');

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as MenuItemWithCategory[];
}

export async function getMenuItemById(id: string): Promise<MenuItem | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', id)
    .eq('is_available', true)
    .single();
  if (error) return null;
  return data;
}

// M-06: getAllMenuItems returns hidden items — admin access only
export async function getAllMenuItems(): Promise<MenuItemWithCategory[]> {
  await requireAdmin();
  const supabase = createClient();
  const { data, error } = await supabase
    .from('menu_items')
    .select('*, menu_categories(*)')
    .order('sort_order');
  if (error) throw error;
  return (data ?? []) as MenuItemWithCategory[];
}
