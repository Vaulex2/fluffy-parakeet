"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * The current user's favorited menu-item ids.
 * Returns null when not signed in (favorites require an account).
 */
export async function getFavoriteIds(): Promise<string[] | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("favorites")
    .select("menu_item_id")
    .eq("user_id", user.id);

  return (data ?? []).map((r) => r.menu_item_id as string);
}

export type ToggleFavoriteResult =
  | { favorited: boolean }
  | { error: "auth" };

/** Add/remove a menu item from the signed-in user's favorites (RLS-scoped). */
export async function toggleFavorite(menuItemId: string): Promise<ToggleFavoriteResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "auth" };

  const { data: existing } = await supabase
    .from("favorites")
    .select("menu_item_id")
    .eq("user_id", user.id)
    .eq("menu_item_id", menuItemId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("menu_item_id", menuItemId);
    return { favorited: false };
  }

  await supabase.from("favorites").insert({ user_id: user.id, menu_item_id: menuItemId });
  return { favorited: true };
}
