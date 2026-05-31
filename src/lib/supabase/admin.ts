import { createClient } from '@supabase/supabase-js';

// Service role client — bypasses RLS entirely.
// NEVER expose this on the client side.
// Only import in Server Components, Server Actions, or Route Handlers.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
