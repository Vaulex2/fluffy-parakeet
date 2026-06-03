# Security Review & Remediation — SushiGO

_Reviewed: 2026-06-03. Verified against the **live Supabase database** (security advisors +
live RLS / function inspection) and the **actual code** — not `supabase/schema.sql`, which is
stale and does not match the live DB._

This file replaces the earlier handoff. Most of that document's findings were **already fixed**
in the live system (see "Previously fixed" at the bottom). What follows is the verified current
state: what was fixed in this pass, and what is left for you to do manually.

---

## Summary

| ID | Severity | Issue | Status |
|----|----------|-------|--------|
| H1 | High | `createOrder` trusted a caller-supplied `user_id` | ✅ Fixed (code) |
| M2 | Medium | SECURITY DEFINER functions had mutable `search_path` | ✅ Fixed (migration) |
| M3 | Medium | `reservation_slots` view ran as SECURITY DEFINER (advisor ERROR) | ✅ Fixed (migration) |
| M5 | Medium | Trigger functions exposed on REST RPC surface | ✅ Fixed (migration) |
| L7 | Low | Public storage buckets allowed file listing/enumeration | ✅ Fixed (migration) |
| L8 | Low | `reservation_waitlist` INSERT policy was `WITH CHECK (true)` | ✅ Fixed (migration) |
| L9 | Low | `updateProfileSchema.phone` had no length/format bound | ✅ Fixed (code) |
| M4 | Medium | Weak `CRON_SECRET` (`!Vaulex0708`) | ◑ Rotated locally — set in Vercel + redeploy |
| M6 | Medium | Leaked-password protection disabled in Supabase Auth | ⏭️ Pro-plan only — accepted w/ compensating controls |
| L10 | Low | `btree_gist` extension in `public` schema | ⏭️ Skipped (see note) |

After the migration, the Supabase security advisor dropped from ~22 findings to 4 — and 3 of
those 4 are accepted-by-design (see "Accepted residual findings").

---

## Fixed in this pass — code

### H1 — `createOrder` no longer trusts a caller-supplied `user_id`
**File:** `src/lib/actions/orders.ts`
The action previously took `order: InsertOrder & { user_id?: string | null }` and inserted that
value via the **service-role client (RLS bypassed)**, so a caller could attribute an order to any
account — and, via the `award_loyalty_points` trigger (points credited to `NEW.user_id` when an
order is marked `delivered`), credit loyalty points to an arbitrary user. Now the action resolves
the user from the server session (`anonSupabase.auth.getUser()`) and inserts that verified id,
ignoring anything the caller sends. Guests with no session still get `user_id = null` (by design).
The `user_id` field was also removed from the checkout client (`src/app/checkout/page.tsx`) since
the server now owns it. This mirrors the existing pattern in `createReservation`.

### L9 — `updateProfileSchema.phone` is now bounded
**File:** `src/lib/validations/auth.ts`
`phone` was `z.string().optional()` (any length/content). It now uses the same
`/^\+?[0-9]{7,15}$/` rule as the reservation schema (empty string allowed to clear the field),
and `full_name` is capped at 100 chars.

**Verification:** `npx tsc --noEmit` and `next lint` both pass on the changed files.
> Note: `npm run build` was intentionally **not** run because a dev server was live on port 3000
> (running `build` against a running dev server can corrupt the `.next` cache). Type-checking via
> `tsc --noEmit` covers the type-safety of these changes without touching `.next`.

---

## Fixed in this pass — database migrations

Applied to the live DB via Supabase migrations
`security_hardening_advisors` and `revoke_trigger_fn_execute_from_public`.

- **M2 — mutable `search_path`.** Pinned `search_path = public, pg_temp` on `is_admin`,
  `set_updated_at`, `check_reservation_availability`, and `award_loyalty_points`. `is_admin()`
  gates every admin RLS policy, so a mutable search_path there was a real privilege-escalation
  (object-shadowing) vector.
- **M3 — `reservation_slots` SECURITY DEFINER view (advisor ERROR).** Set
  `security_invoker = on`. Safe because availability is read only through the service-role client
  (`queryAvailability` in `src/lib/actions/reservations.ts`), which bypasses RLS regardless.
- **M5 — trigger functions on the RPC surface.** `REVOKE EXECUTE … FROM PUBLIC` (and
  `anon, authenticated`) on `award_loyalty_points`, `handle_new_user`, `rls_auto_enable`. They
  fire via the trigger mechanism, so removing caller EXECUTE has no functional impact.
- **L7 — public bucket listing.** Dropped the broad `public_read_*` SELECT policies on
  `storage.objects` for `avatars`, `gallery`, `menu-images`. Public object URLs still serve files
  (the app only uses `getPublicUrl`, never `.list()`); anonymous enumeration of filenames is gone.
- **L8 — waitlist INSERT.** Changed `public_create_waitlist` to `WITH CHECK (auth.uid() IS NOT NULL)`.
  `joinWaitlist` inserts via the service-role client, so guest waitlist sign-ups are unaffected;
  this only blocks anonymous direct-REST spam against `/rest/v1/reservation_waitlist`.

---

## ⚠️ Manual actions required (need your Supabase/hosting access — I cannot do these)

1. **M4 — Finish the `CRON_SECRET` rotation.** Done locally: `.env.local` now holds a fresh
   32-byte random secret (the weak `!Vaulex0708` is gone). The cron is **Vercel Cron**
   (`vercel.json` → `/api/cron/reminders`, daily `0 5 * * *`); Vercel attaches
   `Authorization: Bearer <CRON_SECRET>` from the **project env var**, not the repo. So set
   `CRON_SECRET` in **Vercel → Settings → Environment Variables** to the new value and redeploy.
   (Until then, production uses whatever value is currently in Vercel — the local change alone
   does not affect prod.)
3. **(Optional) Rotate live secrets.** `.env.local` is correctly gitignored and **was never
   committed** (confirmed via `git check-ignore` and `git ls-files`), so there is no git leak.
   Only rotate `SUPABASE_SERVICE_ROLE_KEY` / `RESEND_API_KEY` / `UPSTASH_REDIS_REST_TOKEN` if that
   file was ever shared outside the team.

---

## M6 — Leaked-password protection (Pro-plan only — accepted)

Attempted to enable in Dashboard → Authentication → Attack Protection → "Prevent use of leaked
passwords", but Supabase rejects it on the **Free** plan: _"Configuring leaked password protection
via HaveIBeenPwned.org is available on Pro Plans and up."_ Accepted as a known free-tier limitation
because the same threat (weak/compromised passwords + credential stuffing) is already mitigated by
compensating controls: **Captcha (Turnstile) is enabled**, app-level rate limiting (5 sign-ins /
30 min, 3 sign-ups / hr), and an 8-char minimum in `signUpSchema`. Free hardening applied alongside:
raise the Auth **minimum password length** from 6 → 8+ and enable **Secure password change**.
Revisit if/when the project upgrades to Pro.

## Accepted residual findings (no action — documented rationale)

- **`is_admin()` executable by `anon`/`authenticated` (advisor WARN ×2).** Required: it is invoked
  inside RLS policy expressions, which need the querying role to retain EXECUTE. Revoking it would
  break row-level security. The function only reveals the caller's own admin boolean.
- **`btree_gist` in `public` schema (L10, advisor WARN).** Skipped deliberately: the `reservations`
  table's anti-double-booking `EXCLUDE` constraint depends on this extension. Relocating it risks
  breaking that constraint for no real security gain.

---

## Previously fixed (verified already-done before this review)

The earlier handoff's 7 items were already resolved in the live system and required no action:
admin-only storage upload policies; reservation PII no longer readable by anon
(`reservations_select` = own-or-admin); `createReservation` binds `user_id` to the session;
HTML-escaping `esc()` helper applied across email templates; `pageSize` capped at 100;
rate-limit key normalization; rate-limiter hard-fails in production when Upstash is unconfigured.

## What was already solid (no change needed)

RLS enabled on all public tables. `profiles_update_own` locks `role`/`is_suspended` in its
`WITH CHECK` (prevents self-privilege-escalation). Middleware verifies admin role from the DB, not
the forgeable `sgo-role` cookie. `requireAdmin()` guards every admin action. Orders recalculate
price server-side. Ownership filters (IDOR defense) are present even where RLS already protects.
Service-role key is server-only; no `dangerouslySetInnerHTML` anywhere in `src/`.
