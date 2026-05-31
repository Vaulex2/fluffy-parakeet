'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Verifies the caller is an authenticated, non-suspended admin.
 * Throws 'Unauthorized' if not logged in, 'Forbidden' if not admin.
 * Call this at the top of every admin Server Action.
 */
export async function requireAdmin(): Promise<{ userId: string }> {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) throw new Error('Unauthorized');

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('role, is_suspended')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin' || profile.is_suspended) {
    throw new Error('Forbidden');
  }

  return { userId: user.id };
}
