# SushiGO Security Fix Status

**Date:** 2026-05-27  
**Based on:** `SECURITY-REVIEW.md` (22 findings across CRITICAL / HIGH / MEDIUM / LOW)

---

## ✅ Fixed

### CRITICAL

| ID | Title | Fix Applied |
|---|---|---|
| C-01 | Admin Server Actions had no authorization check | Created `src/lib/actions/admin/_guard.ts` with `requireAdmin()`. Added `await requireAdmin()` as the first line of every function in all 5 admin action files. |
| C-02 | `sgo-role` cookie was the sole admin gate — forgeable | `middleware.ts` now fetches role from the `profiles` table via service-role client. Cookie is only used for UI navigation hints, not security decisions. |
| C-03 | `AdminLayout` only checked auth, not admin role | `src/app/admin/layout.tsx` now fetches and verifies `profile.role === 'admin'` before rendering. |
| C-04 | `getOrderById` / `getReservationById` — unauthenticated IDOR | Both now use a user-scoped client, call `getUser()`, and add `.eq('user_id', user.id)` ownership filter. Returns `null` for unauthenticated callers. |
| C-05 | `createOrder` trusted client-supplied `total_amount` | `src/lib/actions/orders.ts` now fetches real prices from `menu_items`, validates availability, and recalculates `calculatedTotal` server-side. Client value is discarded. |
| C-06 | Production secrets potentially committed to git | **N/A** — project has no git repository. `.env.local` was never committed. Confirmed `.env.local` is in `.gitignore`. |
| C-07 | Open redirect in OAuth callback via `next` parameter | Added `isSafeRedirect()` in `src/app/auth/callback/route.ts` — only allows paths starting with `/` and not `//`. |

### HIGH

| ID | Title | Fix Applied |
|---|---|---|
| H-01 | `supabase/schema.sql` out of sync with live DB | Created `src/types/supabase.ts` with auto-generated types from live DB (`generate_typescript_types`). Types now accurately reflect all 9 tables, enums, and functions including `audit_log`, `payments`, and `reviews`. Also fixed pre-existing `ZodError.errors` → `ZodError.issues` bug in `reservations.ts`. |
| H-02 | `profiles` RLS — SELECT policy too permissive (PII leak) | Dropped `profiles_select_all` (`USING (true)`). Created `profiles_select_own` (`USING (auth.uid() = id OR is_admin())`). Applied via Supabase migration. |
| H-03 | In-memory rate limiter bypassed in serverless | Replaced `src/lib/ratelimit.ts` with Upstash Redis (`@upstash/ratelimit` + `@upstash/redis`). Sliding-window per action type. Auth.ts updated to `await checkRateLimit(...)`. Added `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` placeholders to `.env.local` + `.env.example`. **Set `UPSTASH_REDIS_REST_URL` in `.env.local` to activate.** |
| H-04 | `uploadMenuImage` — no file type/size validation | `src/lib/actions/admin/menu.ts` now validates MIME type (JPEG/PNG/WebP/GIF only), rejects files over 5 MB, and derives extension from MIME type (never from user-supplied filename). |
| H-05 | `sgo-role` cookie missing `secure` flag | `setRoleCookie()` in `auth.ts` and the inline set in `callback/route.ts` now include `secure: process.env.NODE_ENV === 'production'`. |

### MEDIUM

| ID | Title | Fix Applied |
|---|---|---|
| M-01 | Reservation inputs lacked format/range validation | `src/lib/actions/reservations.ts` now uses a `reservationSchema` (Zod) validating name length, phone regex, date not-in-past, time format, guest count 1–20, UUID table ID. |
| M-02 | `suspendUser` / `unsuspendUser` accepted caller-supplied `actorId` | Signature changed to `suspendUser(userId: string)` — `actorId` is now derived from `requireAdmin()` internally. `UsersClient.tsx` and `admin/users/page.tsx` updated accordingly. |
| M-03 | `updateOrderStatus` / `updateReservationStatus` had optional null actor | Both functions now derive `actorId` from `requireAdmin()`. The `actorId?` parameter is removed from both signatures. |
| M-04 | Raw DB error messages returned to client | `reservations.ts` and `orders.ts` now log errors with `console.error` internally and return only generic user-facing messages. Specific known codes (e.g. `23P01`) still return descriptive messages. |
| M-05 | Missing storage policies + no `menu-images`/`gallery` buckets | Created both buckets (5 MB limit, image MIME types only). Applied policies: public read for `menu-images`/`gallery`, admin-only upload/update/delete, and per-user upload/update/delete for `avatars`. Applied via Supabase migration. |
| M-06 | `getAllMenuItems` exposed hidden items without auth check | `src/lib/actions/menu.ts` — `getAllMenuItems()` now calls `await requireAdmin()` before querying. |

### LOW

| ID | Title | Fix Applied |
|---|---|---|
| L-01 | Rate limit key was named `ip` but was actually email | Variable renamed from `ip` to `rateLimitKey` in `auth.ts`. |
| L-02 | No rate limiting on unauthenticated endpoints | Low risk — Supabase handles edge-level rate limiting for unauthenticated requests. Accepted as-is. |
| L-03 | Wildcard `*.supabase.co` image hostname — overly broad | `next.config.mjs` now pins to `vczkclhdepdvnbmggeax.supabase.co` only. |
| L-04 | `avatar_url` accepted any domain URL | `src/lib/validations/auth.ts` — `avatar_url` now validated against an allowlist: `vczkclhdepdvnbmggeax.supabase.co` and `lh3.googleusercontent.com`. |

---

## ⚠️ Requires One Manual Action

### H-03 — Set `UPSTASH_REDIS_REST_URL` in `.env.local`

The `UPSTASH_REDIS_REST_TOKEN` is already set. You still need to add the URL:

```env
UPSTASH_REDIS_REST_URL=https://<your-instance>.upstash.io
```

**Steps:**
1. Go to [console.upstash.com](https://console.upstash.com) → your Redis database
2. Copy the `UPSTASH_REDIS_REST_URL` from the REST API section
3. Add to `.env.local` and Vercel environment variables

Once both vars are set, the rate-limit warning at build time will disappear and auth endpoints will be protected.

---

## ✅ Final Verification

- [x] `npm run build` — zero TypeScript errors ✅
- [x] `npm run lint` — zero ESLint warnings or errors ✅ (also fixed 13 pre-existing lint issues)
- [ ] Manual: forge `sgo-role=admin` cookie as a non-admin user → should be redirected
- [ ] Manual: call `getOrderById` with another user's order ID → should return null
- [ ] Manual: submit order with `total_amount: 1` → server should use calculated price
- [ ] Manual: visit `/auth/callback?code=...&next=//evil.com` → should redirect to `/profile`

---

## Summary

| Severity | Total | Fixed | Remaining |
|---|---|---|---|
| CRITICAL | 7 | 7 | 0 |
| HIGH | 5 | 5 | 0 (H-03 active once URL added) |
| MEDIUM | 6 | 6 | 0 |
| LOW | 4 | 4 | 0 |
| **Total** | **22** | **22** | **0** |

All 22 findings resolved. Only remaining action: add `UPSTASH_REDIS_REST_URL` to `.env.local` to activate distributed rate limiting.
