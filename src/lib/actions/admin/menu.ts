'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from './_guard';
import type {
  InsertMenuCategory,
  InsertMenuItem,
  MenuCategory,
  MenuItem,
} from '@/types/database';

// ── Categories ────────────────────────────────────────────

export async function createCategory(data: InsertMenuCategory): Promise<MenuCategory> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: cat, error } = await supabase
    .from('menu_categories')
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return cat;
}

export async function updateCategory(
  id: string,
  data: Partial<InsertMenuCategory>
): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from('menu_categories').update(data).eq('id', id);
  if (error) throw error;
}

export async function deleteCategory(id: string): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from('menu_categories').delete().eq('id', id);
  if (error) throw error;
}

// ── Menu Items ────────────────────────────────────────────

export async function createMenuItem(data: InsertMenuItem): Promise<MenuItem> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: item, error } = await supabase
    .from('menu_items')
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return item;
}

export async function updateMenuItem(
  id: string,
  data: Partial<InsertMenuItem>
): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from('menu_items').update(data).eq('id', id);
  if (error) throw error;
}

export async function deleteMenuItem(id: string): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleItemAvailability(
  id: string,
  available: boolean
): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('menu_items')
    .update({ is_available: available })
    .eq('id', id);
  if (error) throw error;
}

// ── Image Upload ──────────────────────────────────────────

export async function uploadMenuImage(
  formData: FormData
): Promise<{ url: string } | { error: string }> {
  await requireAdmin();

  const file = formData.get('file') as File | null;
  if (!file) return { error: 'No file provided.' };

  // File size validation (5 MB max)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) return { error: 'File must be under 5 MB.' };

  // File type validation — only safe image formats
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: 'Only JPEG, PNG, WebP, and GIF files are allowed.' };
  }

  // Use a server-derived extension from the MIME type — never trust the filename
  const EXT_MAP: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  const ext = EXT_MAP[file.type];
  const path = `${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from('menu-images')
    .upload(path, file, { upsert: false });

  if (error) return { error: 'Upload failed. Please try again.' };

  const { data } = supabase.storage.from('menu-images').getPublicUrl(path);
  return { url: data.publicUrl };
}
