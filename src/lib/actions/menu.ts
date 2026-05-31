'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/actions/admin/_guard';
import type { MenuCategory, MenuItem, MenuItemWithCategory } from '@/types/database';

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
