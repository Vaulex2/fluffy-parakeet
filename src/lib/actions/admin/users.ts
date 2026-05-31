'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from './_guard';
import type { ProfileWithStats } from '@/types/database';

export interface AdminUser extends ProfileWithStats {
  email: string;
}

export async function getUsers(): Promise<AdminUser[]> {
  await requireAdmin();
  const supabase = createAdminClient();

  // Fetch auth users
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers({
    perPage: 1000,
  });
  if (authError) throw authError;

  const authUsers = authData.users;
  const userIds = authUsers.map((u) => u.id);

  if (!userIds.length) return [];

  // Fetch profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', userIds);
  if (profilesError) throw profilesError;

  // Count orders per user
  const { data: orderCounts } = await supabase
    .from('orders')
    .select('user_id')
    .in('user_id', userIds)
    .not('user_id', 'is', null);

  // Count reservations per user
  const { data: resvCounts } = await supabase
    .from('reservations')
    .select('user_id')
    .in('user_id', userIds)
    .not('user_id', 'is', null);

  const orderMap: Record<string, number> = {};
  (orderCounts ?? []).forEach((r) => {
    if (r.user_id) orderMap[r.user_id] = (orderMap[r.user_id] ?? 0) + 1;
  });

  const resvMap: Record<string, number> = {};
  (resvCounts ?? []).forEach((r) => {
    if (r.user_id) resvMap[r.user_id] = (resvMap[r.user_id] ?? 0) + 1;
  });

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return authUsers.map((authUser) => {
    const profile = profileMap.get(authUser.id);
    return {
      id: authUser.id,
      email: authUser.email ?? '',
      full_name: profile?.full_name ?? null,
      phone: profile?.phone ?? null,
      avatar_url: profile?.avatar_url ?? null,
      loyalty_points: profile?.loyalty_points ?? 0,
      preferred_language: profile?.preferred_language ?? 'uz',
      role: profile?.role ?? 'customer',
      is_suspended: profile?.is_suspended ?? false,
      created_at: profile?.created_at ?? authUser.created_at,
      updated_at: profile?.updated_at ?? authUser.updated_at ?? authUser.created_at,
      order_count: orderMap[authUser.id] ?? 0,
      reservation_count: resvMap[authUser.id] ?? 0,
    } as AdminUser;
  });
}

export async function suspendUser(userId: string): Promise<void> {
  // actorId is derived from the verified session — never accepted from caller
  const { userId: actorId } = await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('profiles')
    .update({ is_suspended: true })
    .eq('id', userId);
  if (error) throw error;

  await supabase.from('audit_log').insert({
    actor_id: actorId,
    action: 'suspend_user',
    target_table: 'profiles',
    target_id: userId,
    payload: {},
  });
}

export async function unsuspendUser(userId: string): Promise<void> {
  // actorId is derived from the verified session — never accepted from caller
  const { userId: actorId } = await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('profiles')
    .update({ is_suspended: false })
    .eq('id', userId);
  if (error) throw error;

  await supabase.from('audit_log').insert({
    actor_id: actorId,
    action: 'unsuspend_user',
    target_table: 'profiles',
    target_id: userId,
    payload: {},
  });
}
