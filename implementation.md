# SushiGO — Customer Auth Implementation Status

## Completed

### Database (Supabase)
The DB was already more advanced than the handoff.md described. What was found and what was added:

**Already existed:**
- `profiles` table — `id`, `full_name`, `phone`, `avatar_url`, `loyalty_points`, `preferred_language`, `role` (enum: customer/staff/admin), `created_at`, `updated_at`
- `on_auth_user_created` trigger on `auth.users` — auto-creates profile row on signup
- `order_loyalty_points` trigger on `orders` — awards points on status → delivered
- `user_id` nullable FKs on both `orders` and `reservations` → `profiles`
- `is_admin()` SQL function
- Per-user RLS policies on orders, order_items, reservations, profiles

**Added via migration (`customer_auth_additions`):**
- `profiles.is_suspended` boolean column (default false)
- `audit_log` table — `id`, `actor_id`, `action`, `target_table`, `target_id`, `payload`, `created_at`
- `avatars` storage bucket
- Fixed `reservations_select` policy to allow public read (needed for guest availability checking)

---

### TypeScript Types (`src/types/database.ts`)
Added at bottom of file:
- `UserRole` — `'customer' | 'staff' | 'admin'`
- `PreferredLanguage` — `'en' | 'uz' | 'ru'`
- `Profile` interface — full column mapping including `is_suspended`
- `UpdateProfile` — partial pick of editable fields
- `ProfileWithStats` — extends Profile with `order_count`, `reservation_count`
- `AuditLog` interface

---

### Zod Schemas (`src/lib/validations/auth.ts`) — new file
- `signUpSchema` — full_name, email, password, confirm_password (with match refinement)
- `signInSchema` — email, password
- `forgotPasswordSchema` — email
- `resetPasswordSchema` — password + confirm (with match refinement)
- `updateProfileSchema` — partial: full_name, phone, preferred_language, avatar_url
- Exported input types for all schemas

---

### Rate Limiter (`src/lib/ratelimit.ts`) — new file
- In-memory Map-based implementation
- `rateLimit(key, max, windowMs)` → returns boolean (true = allowed)
- `clearRateLimit(key)` — for testing/reset

---

### Auth Actions (`src/lib/actions/auth.ts`) — major rewrite
- `signIn` — Zod validation, rate-limit (5/15min), suspension check, sets `sgo-role` cookie (HttpOnly, SameSite=Lax, 24h), role-aware redirect (admin→/admin, customer→/profile)
- `signUp` — Zod validation, rate-limit (3/hour), `supabase.auth.signUp` with full_name in metadata, returns `{ success: true }` for email-confirmation flow
- `forgotPassword` — rate-limit (3/hour), always returns success (prevents email enumeration)
- `resetPassword` — `supabase.auth.updateUser({ password })`, returns success/error
- `getUser` — returns current auth user or null
- `getProfile` — fetches own `profiles` row via session client
- `updateProfile` — Zod validation, updates profiles row, revalidatePath
- `signOut` — signs out, deletes `sgo-role` cookie, redirects to login

---

### Middleware (`middleware.ts`) — updated
- `/admin/*` — requires auth AND `sgo-role === 'admin'` cookie; non-admin auth users redirected to `/`
- `/profile`, `/orders` — requires auth; unauthenticated → `/auth/login?next=...`
- `/auth/login` and `/auth/signup` when authenticated → role-aware redirect
- Suspension NOT checked in middleware (checked in page Server Components instead)

---

### OAuth Callback (`src/app/auth/callback/route.ts`) — updated
After `exchangeCodeForSession`:
1. Upserts profile row (safety net for OAuth re-logins; ignoreDuplicates=true so existing profile unchanged)
2. Checks `is_suspended` → signs out and redirects to `/auth/login?error=suspended`
3. Sets `sgo-role` cookie on the response
4. Redirects admin→`/admin`, customer→`/profile` (or original `next` param)

---

## Remaining Work

### Step 8 — Auth Pages
| File | Status | What to do |
|---|---|---|
| `src/app/auth/login/page.tsx` | modify | Remove "staff only" text; add Google OAuth button, forgot-password link, sign-up link; handle `?error=suspended` |
| `src/app/auth/signup/page.tsx` | new | Full Name + Email + Password + Confirm; Google OAuth button; "Check your email" success state |
| `src/app/auth/forgot-password/page.tsx` | new | Single email field; always shows success state after submit |
| `src/app/auth/reset-password/page.tsx` | new | `"use client"` — exchanges `?code=` on mount via Supabase, then shows new-password form |

Google OAuth is browser-side only — call `createBrowserClient().auth.signInWithOAuth(...)` directly in the client component.

---

### Step 9 — Update Order/Reservation Actions
- `src/lib/actions/orders.ts` — `createOrder` accept `user_id?: string | null`, pass to insert
- `src/lib/actions/reservations.ts` — switch `getAvailableTables` and `createReservation` to use `createAdminClient()` (current anon client can't read reservations for unauthenticated guests due to RLS); pass `user_id` through `createReservation`

---

### Step 10 — Customer Server Actions (new files)
- `src/lib/actions/customer/orders.ts` — `getMyOrders(page, pageSize)`: queries `orders` + `order_items` filtered by session user_id, paginated
- `src/lib/actions/customer/reservations.ts` — `getMyReservations(page, pageSize)`: queries `reservations` + `restaurant_tables` filtered by session user_id

---

### Step 11 — Profile Components (new files)
- `src/components/profile/ProfileEditForm.tsx` — client component; Full Name, Phone, Language (pill buttons); calls `updateProfile` server action
- `src/components/profile/CustomerReservations.tsx` — reservation history list; reuse `RES_CLS` status badge pattern from `ReservationsClient.tsx`

---

### Step 12 — Profile Pages (new)
- `src/app/profile/layout.tsx` — wraps with `<Navbar>` + `<Footer>`
- `src/app/profile/page.tsx` — Server Component; calls `getUser` + `getProfile`; renders avatar/name/email, loyalty badge, `<ProfileEditForm>`, `<CustomerReservations>`; shows suspension notice if `is_suspended`

---

### Step 13 — Orders Pages (new)
- `src/app/orders/layout.tsx` — wraps with `<Navbar>` + `<Footer>`
- `src/app/orders/page.tsx` — Server Component; calls `getMyOrders(page)`; paginated order cards showing ID, date, status badge, items, total

---

### Step 14 — Checkout Update (`src/app/checkout/page.tsx`)
Add a `useEffect` (or pass via Server Component props) to get the logged-in user on mount; pre-fill name/email from profile; pass `user_id` to `createOrder`.

Note: checkout is currently a pure client component. Simplest approach: add a `useEffect` that calls `createBrowserClient().auth.getUser()` on mount and pre-fills the form. Pass `user_id` to `createOrder` in the submit handler.

---

### Step 15 — Reservation Form Update (`src/components/reservation/ReservationForm.tsx`)
Add `useEffect` to get user from browser client on mount; store `userId` in state; pass to `createReservation`; pre-fill name/email if profile available.

---

### Step 16 — Admin Users Management (new files)
- `src/lib/actions/admin/users.ts` — `getUsers()` (merges `auth.admin.listUsers()` from Supabase Auth + profiles table + order/reservation counts), `suspendUser(userId, actorId)`, `unsuspendUser(userId, actorId)` — both write to `audit_log`
- `src/app/admin/users/page.tsx` — Server Component, calls `getUsers()`
- `src/components/admin/UsersClient.tsx` — table with Name/Email/Orders/Reservations/Loyalty/Status/Actions; suspend/unsuspend buttons that call server actions; client-side search by name/email

---

### Step 17 — Admin Nav + Audit Logging
- `src/components/admin/AdminNav.tsx` — add `{ href: "/admin/users", label: "Users", icon: "people" }` to nav links
- `src/lib/actions/admin/reservations.ts` — `updateReservationStatus` writes entry to `audit_log`
- `src/lib/actions/admin/orders.ts` — `updateOrderStatus` writes entry to `audit_log`
- Admin layout passes `user.id` down as `actorId` prop to client components

---

### Step 18 — Navbar Auth State
- `src/components/layout/Navbar.tsx` — convert to Server Component; calls `getUser()` + `getProfile()`; renders `<NavbarClient user={user} profile={profile} />`
- `src/components/layout/NavbarClient.tsx` — new file (existing Navbar client logic moved here); adds authenticated dropdown (Profile / My Orders / Sign Out) and loyalty points chip when user is logged in

---

### Step 19 — Supabase Dashboard Config (manual steps)
1. Authentication → Providers → Google: enable, add Client ID + Secret, set redirect URI `{SUPABASE_URL}/auth/v1/callback`
2. Authentication → URL Configuration: Site URL + allow-list `http://localhost:3000/auth/callback`
3. Authentication → Email Templates: brand the confirmation and reset emails
4. Authentication → Settings: enable "Confirm email", min password length 8

---

## Architecture Notes
- All admin mutations use `createAdminClient()` (service role, bypasses RLS)
- Guest orders/reservations flow is preserved — `user_id` stays null for unauthenticated users
- `sgo-role` cookie (HttpOnly, SameSite=Lax, 24h) enables middleware role checks without a DB query per request
- Loyalty points awarded by DB trigger (`order_loyalty_points`) on `orders.status → 'delivered'`
- Suspension enforced at sign-in + OAuth callback; pages show inline notice (no per-request middleware DB query)
