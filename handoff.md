# SushiGO — Handoff Notes

## Session changes (2026-05-26)

### 1. Background consistency
Applied the main page background (`bg-background bg-seigaiha` + red radial glow `bg-primary/20 blur-[120px] mix-blend-screen`) to every page that was plain black:
- `src/app/reservations/page.tsx`
- `src/components/home/ReservationCTA.tsx`
- `src/app/checkout/page.tsx` (all three render states: empty cart, form, confirmation)

### 2. Order creation RLS fix
`src/lib/actions/orders.ts` was using the anon Supabase client (`createClient`), which hit an RLS policy violation on the `orders` table. Switched both `createOrder` and `getOrderById` to `createAdminClient` (service role key), which bypasses RLS. Guest orders now go through without errors.

### 3. Order confirmation total was 0 UZS
`clearCart()` was called before the success screen rendered, zeroing out `total` from `useCart`. Fixed in `src/app/checkout/page.tsx` by snapshotting the total into `confirmedTotal` state before clearing the cart.

### 4. Order success animation
Replaced the plain `check_circle` Material icon with a sequenced CSS animation on the order confirmation screen (`src/app/checkout/page.tsx`). Keyframes defined in `src/app/globals.css`:
- **Circle pop** — bouncy spring scale-in with rotation wobble (0.0s)
- **Checkmark draw** — SVG stroke draws itself left-to-right (0.5s)
- **Burst dots** — 8 green particles radiate outward (0.7s)
- **Two ripple rings** — expand and fade like sonar pings (0.3s, 0.5s)
- Full sequence completes in ~2 seconds.

## Architecture reminders
- Admin mutations → `createAdminClient()` (`src/lib/supabase/admin.ts`)
- Public reads / auth → `createClient()` (`src/lib/supabase/server.ts`)
- All animations use `transform`/`opacity` only and the `--expo` easing (`cubic-bezier(0.16, 1, 0.3, 1)`)
- Prices are stored and displayed in UZS

## Known gaps
- The `total_amount` field name in `orders.ts` insert payload may not match the DB column `total_amount_uzs` — verify against the actual Supabase schema if order totals look wrong in the admin dashboard.
- `order_items` insert passes `item_name` / `unit_price` / `subtotal` but the schema defines `name_snapshot` / `unit_price_uzs` / `subtotal_uzs` — check that the TypeScript types in `src/types/database.ts` reflect the actual columns.

---

## Planned — Customer Auth & Account System (NOT YET IMPLEMENTED)

Full plan approved but not started. Everything below is the next implementation session.

### Step 0 — Install packages
```
npm install zod resend
```

### Step 1 — Database migration
Create and apply `supabase/migrations/001_customer_auth.sql` via Supabase Dashboard → SQL Editor. Contains:

- **`profiles` table** — `id` (FK → auth.users), `full_name`, `phone`, `avatar_url`, `preferred_language` (en/uz/ru), `loyalty_points`, `role` (customer/admin), `is_suspended`, timestamps
- **`handle_new_user()` trigger** — auto-creates a profile row `AFTER INSERT ON auth.users` using `raw_user_meta_data->>'full_name'`
- **Backfill** — `INSERT INTO profiles SELECT id, email, 'admin' FROM auth.users ON CONFLICT DO NOTHING` (critical: existing admin has no profile row)
- **`user_id` nullable FK** added to `orders` and `reservations` tables (guest flow preserved — stays null)
- **RLS policies** — `profiles_select_own`, `profiles_update_own` (WITH CHECK prevents role self-escalation), `orders_select_own`, `reservations_select_own`
- **`award_loyalty_points()` trigger** — fires on `orders.status → 'delivered'`; awards `FLOOR(total_amount_uzs / 1000)` points to `profiles` row
- **`audit_log` table** — `actor_id`, `action`, `target_table`, `target_id`, `payload`, `created_at`
- **`avatars` storage bucket** — public read, users can upload to their own folder

### Step 2 — Types (`src/types/database.ts`)
Add `Profile`, `UpdateProfile`, `ProfileWithStats`, `AuditLog`, `UserRole`, `PreferredLanguage` interfaces at the bottom.

### Step 3 — Zod schemas (`src/lib/validations/auth.ts`) — new file
`signUpSchema`, `signInSchema`, `forgotPasswordSchema`, `resetPasswordSchema`, `updateProfileSchema`.

### Step 4 — Rate limiter (`src/lib/ratelimit.ts`) — new file
In-memory Map-based limiter. `rateLimit(key, max, windowMs)` + `clearRateLimit(key)`. Used: 5 attempts/15 min for sign-in, 3/hour for sign-up and forgot-password.

### Step 5 — Auth actions (`src/lib/actions/auth.ts`) — major update
- **`signIn`** — add Zod validation, rate limiting, suspension check, set `sgo-role` cookie, role-aware redirect (admin→`/admin`, customer→`/profile`)
- **`signUp`** — new: validate, rate-limit, `supabase.auth.signUp` with `full_name` in metadata; trigger creates profile
- **`forgotPassword`** — new: rate-limit, `supabase.auth.resetPasswordForEmail`, always returns success
- **`resetPassword`** — new: `supabase.auth.updateUser({ password })`, redirect to login
- **`getProfile`** — new: fetch own `profiles` row via session client
- **`updateProfile`** — new: validate with Zod, update `profiles` row, `revalidatePath`
- **`signOut`** — add `cookies().delete('sgo-role')`

### Step 6 — Middleware (`middleware.ts`) — update
- `/admin/*` — requires auth AND `sgo-role === 'admin'` cookie (non-admin authenticated users redirected to `/`)
- `/profile`, `/orders` — requires auth (unauthenticated → `/auth/login?next=...`)
- `/auth/login`, `/auth/signup` when authenticated → role-aware redirect (admin→`/admin`, customer→`/profile`)
- Suspension is NOT checked in middleware (avoids per-request DB query); checked in page Server Components instead

### Step 7 — OAuth callback (`src/app/auth/callback/route.ts`) — update
After `exchangeCodeForSession`: upsert profile (safety net for OAuth re-logins), check `is_suspended`, set `sgo-role` cookie on the response, redirect admin→`/admin` / customer→`/profile`.

### Step 8 — Auth pages
| File | Status | Notes |
|---|---|---|
| `src/app/auth/login/page.tsx` | modify | Remove "staff only" text; add Google OAuth button (browser client), forgot-password link, sign-up link; handle `?error=suspended` |
| `src/app/auth/signup/page.tsx` | new | Full Name + Email + Password + Confirm; Google OAuth button; "Check your email" success state |
| `src/app/auth/forgot-password/page.tsx` | new | Single email field; always shows success state |
| `src/app/auth/reset-password/page.tsx` | new | `"use client"` — exchanges `?code=` on mount, then shows new-password form |

**Google OAuth is browser-side only** — call `createBrowserClient().auth.signInWithOAuth(...)` directly in the client component, not a Server Action.

### Step 9 — Update order/reservation actions
- `src/lib/actions/orders.ts` — `createOrder` accepts `user_id?: string | null`, passes it to insert
- `src/lib/actions/reservations.ts` — `createReservation` passes `user_id` through to insert

### Step 10 — Customer server actions (new files)
- `src/lib/actions/customer/orders.ts` — `getMyOrders(page, pageSize)`: queries `orders` + `order_items` filtered by `user_id`, paginated
- `src/lib/actions/customer/reservations.ts` — `getMyReservations(page, pageSize)`: queries `reservations` + `restaurant_tables` filtered by `user_id`

### Step 11 — Profile components (new files)
- `src/components/profile/ProfileEditForm.tsx` — client component; Full Name, Phone, Language (pill buttons); calls `updateProfile`
- `src/components/profile/CustomerReservations.tsx` — reservation history list; reuses `RES_CLS` status badge pattern from `ReservationsClient.tsx`

### Step 12 — Profile pages (new)
- `src/app/profile/layout.tsx` — wraps with `<Navbar>` + `<Footer>`
- `src/app/profile/page.tsx` — Server Component; calls `getUser` + `getProfile`; renders avatar/name/email, loyalty badge, `<ProfileEditForm>`, `<CustomerReservations>`; shows suspension notice if `is_suspended`

### Step 13 — Orders pages (new)
- `src/app/orders/layout.tsx` — wraps with `<Navbar>` + `<Footer>`
- `src/app/orders/page.tsx` — Server Component; calls `getMyOrders(page)`; paginated order cards showing ID, date, status badge, items, total

### Step 14 — Checkout update (`src/app/checkout/page.tsx`)
Convert to Server Component outer shell + Client Component inner form. Outer shell calls `getUser()` + `getProfile()` and passes `initialUserId`, `initialName`, `initialEmail` props to the client form, which passes `user_id` to `createOrder`.

### Step 15 — Reservation form update (`src/components/reservation/ReservationForm.tsx`)
Add `useEffect` to get user from browser client on mount; store `userId` in state; pass to `createReservation`; pre-fill name/email if profile available.

### Step 16 — Admin users management (new)
- `src/lib/actions/admin/users.ts` — `getUsers()` (merges `auth.admin.listUsers()` + profiles + counts), `suspendUser(userId, actorId)`, `unsuspendUser(userId, actorId)` — both write audit_log
- `src/app/admin/users/page.tsx` — Server Component, calls `getUsers()`
- `src/components/admin/UsersClient.tsx` — table with Name/Email/Orders/Reservations/Loyalty/Status/Actions; suspend/unsuspend buttons; client-side search

### Step 17 — Admin nav + audit logging
- `src/components/admin/AdminNav.tsx` — add `{ href: "/admin/users", label: "Users", icon: "people" }`
- `src/lib/actions/admin/reservations.ts` — `updateReservationStatus` writes to `audit_log`
- `src/lib/actions/admin/orders.ts` — `updateOrderStatus` writes to `audit_log`
- Admin layout passes `user.id` down as `actorId` prop to client components

### Step 18 — Navbar auth state
- `src/components/layout/Navbar.tsx` — convert to Server Component; calls `getUser()` + `getProfile()`; renders `<NavbarClient user={user} profile={profile} />`
- `src/components/layout/NavbarClient.tsx` — new file (existing Navbar client logic moved here); adds authenticated dropdown (Profile / My Orders / Sign Out) and loyalty points chip

### Step 19 — Supabase Dashboard config (manual steps)
1. Authentication → Providers → Google: enable, add Client ID + Secret, set redirect URI `{SUPABASE_URL}/auth/v1/callback`
2. Authentication → URL Configuration: Site URL + allow-list `http://localhost:3000/auth/callback`
3. Authentication → Email Templates: brand the confirmation and reset emails
4. Authentication → Settings: enable "Confirm email", min password length 8

### Architecture notes for this feature
- **Role cookie `sgo-role`** (HttpOnly, SameSite=Lax, 24h) — set at sign-in and OAuth callback so middleware can check role without a DB query on every request
- **Guest flow untouched** — `user_id` is nullable on orders/reservations; existing guest checkout works exactly as before
- **Loyalty points are DB-level** — `award_loyalty_points()` trigger fires on any `orders.status` update to `'delivered'`, regardless of which code path triggered it
- **Suspension enforcement** — blocked at sign-in + OAuth callback; pages show notice inline (no per-request middleware DB query needed)
