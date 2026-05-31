# SushiGO Security Review

**Date:** 2026-05-27  
**Reviewer:** Claude (Sonnet 4.6) — Adversarial Security Audit  
**Sources Consulted:**
- Next.js Authentication docs (https://nextjs.org/docs/app/building-your-application/authentication)
- Next.js Server Components & Actions Security blog (https://nextjs.org/blog/security-nextjs-server-components-actions)
- Supabase Row Level Security guide (https://supabase.com/docs/guides/database/postgres/row-level-security)
- Supabase SSR Auth for Next.js (https://supabase.com/docs/guides/auth/server-side/nextjs)
- OWASP Top 10 (https://owasp.org/www-project-top-ten/)
- OWASP Input Validation Cheat Sheet (https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)

---

## Executive Summary

**Overall Risk Rating: CRITICAL**

SushiGO contains multiple critical vulnerabilities that, taken together, allow a completely unauthenticated attacker to perform full admin-level operations on the database. The most severe issue is that every admin Server Action (create/update/delete menu items, update order status, reschedule reservations, suspend users) uses the service-role Supabase client but performs **zero caller identity verification** — the middleware `sgo-role` cookie that guards the route layer is trivially forgeable, and the Server Actions themselves never re-validate the caller's role from the database. Any regular user (or unauthenticated user who directly invokes a Server Action endpoint) can call these functions. Additionally, live production credentials — including the `SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY` — are committed to the repository in `.env.local`.

---

## Findings

---

### CRITICAL

---

#### C-01: Admin Server Actions perform no authorization check — any caller can invoke them

**File:** `src/lib/actions/admin/menu.ts` (all functions), `src/lib/actions/admin/orders.ts` (all functions), `src/lib/actions/admin/reservations.ts` (all functions), `src/lib/actions/admin/tables.ts` (all functions), `src/lib/actions/admin/users.ts:77–109`

**Risk:**  
Next.js Server Actions are exposed as HTTP POST endpoints. The middleware only redirects browser navigation — it does not block direct POST requests to `/_next/action` endpoints. Every admin action (delete a menu item, change an order's status to `cancelled`, suspend any user, reschedule any reservation, create/delete tables) uses `createAdminClient()` which bypasses RLS entirely and has no `getUser()` + role check before executing. A regular authenticated user — or a script making a direct POST — can invoke any of these functions with arbitrary parameters. This is a full authorization bypass.

**Fix:**  
Add an auth guard at the top of every admin action (or in a shared helper `requireAdmin()`):

```typescript
// src/lib/actions/admin/_guard.ts
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function requireAdmin(): Promise<{ userId: string }> {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
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
```

Then in every admin action:

```typescript
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const { userId } = await requireAdmin(); // throws if not admin
  // ... rest of function, use userId for audit log
}
```

---

#### C-02: `sgo-role` cookie is the sole admin gate in middleware — it is forgeable by any user

**File:** `middleware.ts:30–43`

**Risk:**  
The middleware reads `request.cookies.get("sgo-role")?.value` to decide whether to allow access to `/admin/*`. This cookie is set server-side with `httpOnly: true`, which prevents JavaScript from reading it in the browser — but it does not prevent a user from setting it manually in their browser (e.g., via DevTools > Application > Cookies, or via `curl --cookie "sgo-role=admin"`). Any authenticated user can add `sgo-role=admin` to their request and bypass the middleware redirect gate into the admin UI. Because the admin pages call Server Actions that also do no auth check (C-01), this provides full admin access.

```
request.cookies.get("sgo-role")?.value  // ← an attacker just sends Cookie: sgo-role=admin
```

**Fix:**  
The middleware must verify the real session role from the database, not a client-influenced cookie. Since the middleware already calls `supabase.auth.getUser()`, the user's JWT is available. Fetch the role from the database:

```typescript
// In middleware, after getting the verified user:
if (pathname.startsWith("/admin")) {
  if (!user) { /* redirect to login */ }

  // Verify role from DB — do NOT trust the cookie
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }
}
```

Alternatively, store the role as a custom JWT claim via a Supabase Auth Hook so the JWT itself carries the role, and read it from `user.user_metadata.role` — no extra DB call needed and it cannot be forged.

---

#### C-03: `AdminLayout` only checks authentication, not admin role

**File:** `src/app/admin/layout.tsx:14–16`

**Risk:**  
The server-side layout for all `/admin/*` pages calls `getUser()` and redirects if not logged in, but does **not** check whether the user is an admin. Any authenticated regular user who bypasses middleware (e.g., by direct navigation or by forging the `sgo-role` cookie as in C-02) will be allowed through the layout with full access to all admin page UI and the data it loads.

```typescript
const user = await getUser();
if (!user) redirect("/auth/login"); // only checks auth, not role
```

**Fix:**  
```typescript
export default async function AdminLayout({ children }) {
  const supabase = createClient(); // server client
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect('/');

  return ( /* ... */ );
}
```

---

#### C-04: `getOrderById` and `getReservationById` are unauthenticated IDOR vulnerabilities

**File:** `src/lib/actions/orders.ts:58–67`, `src/lib/actions/reservations.ts:81–90`

**Risk:**  
Both functions accept an arbitrary `id` string, use the service-role client (bypassing RLS), and return the full record — including customer name, phone number, email address, delivery address, and payment total — with no authentication or ownership check. Any caller who can invoke the Server Action (which is any HTTP client) can enumerate any order or reservation by ID (UUIDs are not secret — they can be logged, leaked in emails, or guessed via timing). This is a classic IDOR (Insecure Direct Object Reference) exposing PII.

**Fix:**  
Require authentication and enforce ownership:

```typescript
export async function getOrderById(id: string): Promise<OrderWithItems | null> {
  const supabase = createClient(); // user-scoped client
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // RLS policy on orders must enforce user_id = auth.uid()
  // Use user-scoped client, not admin client
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .eq('user_id', user.id) // explicit ownership check as defense in depth
    .single();
  if (error) return null;
  return data as OrderWithItems;
}
```

For guest orders (no user_id), consider returning only a receipt-style subset of fields, not the full record.

---

#### C-05: `createOrder` uses the admin client (bypasses RLS) and performs no input sanitization on `total_amount`

**File:** `src/lib/actions/orders.ts:11–56`

**Risk:**  
The `createOrder` function accepts `total_amount` directly from the caller and inserts it via the service-role client. A user calling this Server Action can pass any `total_amount` they choose (e.g., 1 UZS for a 100,000 UZS order). The server never recalculates the total from the actual menu item prices. This allows customers to place orders for arbitrary low prices. Combined with the fact that the admin client bypasses RLS, a crafted call can also write `user_id` values pointing to any other user.

**Fix:**  
Recalculate `total_amount` server-side from the submitted item IDs and quantities against the actual `menu_items` table prices. Never trust the client-supplied total:

```typescript
export async function createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<OrderResult> {
  // Fetch real prices from DB
  const supabase = createClient(); // use anon client for RLS-protected menu read
  const itemIds = items.map(i => i.menu_item_id).filter(Boolean);
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('id, price_uzs, is_available')
    .in('id', itemIds);

  // Validate all items exist, are available, and recalculate total
  let calculatedTotal = 0;
  for (const item of items) {
    const dbItem = menuItems?.find(m => m.id === item.menu_item_id);
    if (!dbItem || !dbItem.is_available) {
      return { success: false, error: 'Invalid or unavailable menu item.' };
    }
    calculatedTotal += dbItem.price_uzs * item.quantity;
  }
  // Use calculatedTotal, discard order.total_amount from caller
}
```

---

#### C-06: Production secrets committed to the repository in `.env.local`

**File:** `.env.local:3–7`

**Risk:**  
The `.env.local` file contains live production credentials:
- `SUPABASE_SERVICE_ROLE_KEY` — full admin access to the Supabase database, bypasses all RLS, can read/write/delete any data for any user
- `RESEND_API_KEY` — can send emails from the application's domain, enabling phishing/spam abuse
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — the anon key is not a secret (it's public), but its presence confirms these are real production values

While `.env.local` is in `.gitignore`, the file is present on disk and was included in this review, indicating it may have been committed to the repository at some point or shared in ways that expose it. If the git history contains this file, all secrets must be rotated immediately.

**Fix:**  
1. Rotate all three credentials immediately (new Supabase service role key, new Resend API key).
2. Run `git log --all --full-history -- .env.local` to check if this file was ever committed. If so, use `git filter-repo` to purge it from history.
3. Use a secrets manager (e.g., Vercel environment variables, Doppler) for production — never store secrets in files that could be accidentally committed.

---

#### C-07: Open redirect in OAuth callback allows phishing via `next` parameter

**File:** `src/app/auth/callback/route.ts:9,60`

**Risk:**  
The `next` query parameter is taken directly from the URL and used in a redirect without validating that the destination is on the same origin. An attacker can craft a link like:
```
https://sushigo.com/auth/callback?code=VALID_CODE&next=https://evil.com/steal-session
```
After a legitimate OAuth sign-in, the user is redirected to `evil.com`. The current code uses `${origin}${next}` which does prevent fully absolute URLs — but if `next` starts with `//evil.com`, `origin//evil.com` becomes a valid redirect to `evil.com` in some browser/framework combinations. More importantly, the non-admin path is `next === "/" ? "/profile" : next`, meaning any non-`/` value of `next` is used verbatim as a path appended to `origin`.

**Fix:**  
Validate that `next` is a safe relative path before using it:

```typescript
function isSafeRedirect(next: string): boolean {
  // Must start with / and not start with // (protocol-relative)
  return next.startsWith('/') && !next.startsWith('//');
}

const safePath = isSafeRedirect(next) ? next : '/profile';
const response = NextResponse.redirect(`${origin}${safePath}`);
```

---

### HIGH

---

#### H-01: Schema in `supabase/schema.sql` is critically out of sync with the application code

**File:** `supabase/schema.sql` vs `src/types/database.ts`, `src/lib/actions/`

**Risk:**  
The committed schema is missing entire tables that the application code depends on:
- **`profiles`** — referenced in `auth.ts`, `admin/users.ts`, `callback/route.ts`, and the middleware. This table stores `role`, `is_suspended`, `loyalty_points`, etc. It is the entire basis for auth decisions.
- **`audit_log`** — referenced in `admin/users.ts`, `admin/orders.ts`, `admin/reservations.ts`

Additionally, the schema column names do not match the TypeScript types and action code:

| Table | Schema column | Code expects |
|---|---|---|
| `reservations` | `client_name`, `phone` | `guest_name`, `guest_phone` |
| `orders` | `total_amount_uzs` | `total_amount` |
| `order_items` | `name_snapshot`, `unit_price_uzs`, `subtotal_uzs` | `item_name`, `unit_price`, `subtotal` |
| `restaurant_tables` | `number`, `capacity`, `is_available` (but used as `is_active`) | `table_number`, `seat_count`, `is_available` |
| `menu_categories` | `name_uz/en/ru` (no `name`, `slug`) | `name`, `slug` |
| `menu_items` | `name_uz/en/ru`, `price_uzs` | `name`, `price` |

This means either the schema.sql is wrong (the real DB has different columns), or the code is wrong, or there is an unpublished migration. Either way, the schema committed to the repository cannot be used to audit RLS policies — which policies are actually protecting the live database is unknown.

**Fix:**  
Run `supabase db dump --schema public` against the real project and commit the actual schema. Ensure the TypeScript types are generated from that schema using `supabase gen types typescript`.

---

#### H-02: `profiles`, `audit_log`, `orders` (user_id), and `reservations` (user_id) have no RLS policies in the committed schema

**File:** `supabase/schema.sql:149–170`

**Risk:**  
The committed schema enables RLS on `orders` and `reservations` but only creates public insert policies. There are no policies for:
- Users reading their own orders (the `customer/orders.ts` action that queries by `user_id` may work without it because it's using the anon key with a user JWT — but if no SELECT policy exists for authenticated users, these queries silently return empty results OR the RLS is misconfigured and returns all rows)
- Users being prevented from reading other users' orders
- Any protection on `profiles` — no SELECT, UPDATE, or DELETE policies are committed
- Any protection on `audit_log` — if this table exists, there are no RLS policies, meaning any authenticated user can insert fake audit entries or read all admin activity

**Fix:**  
Add explicit RLS policies for all user-facing tables. Minimum required:

```sql
-- Users can read their own orders
CREATE POLICY "users_read_own_orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Users can read their own reservations  
CREATE POLICY "users_read_own_reservations" ON reservations
  FOR SELECT USING (auth.uid() = user_id);

-- Users can read and update their own profile
CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid())); -- prevent role self-elevation

-- Audit log: no direct user access
CREATE POLICY "no_user_audit_access" ON audit_log
  FOR ALL USING (false); -- service role bypasses this
```

---

#### H-03: In-memory rate limiter is ineffective — reset on every deployment, bypassed in serverless

**File:** `src/lib/ratelimit.ts:3`

**Risk:**  
The `store` is a module-level `Map`. In serverless/edge environments (Vercel, which is the implied deployment target for Next.js), each Lambda cold start gets a fresh empty Map. An attacker can exhaust 5 sign-in attempts, wait seconds for a new Lambda instance to spin up (cold start), and get 5 more attempts — indefinitely. This makes the rate limiter effectively a no-op for a determined attacker. It also means all `signin`, `signup`, and `forgotPassword` rate limits can be bypassed by simply making many parallel requests that hit different instances.

**Fix:**  
Replace the in-memory store with a durable, low-latency key-value store. Options:
- **Vercel KV** (Redis): Use `@vercel/kv` with a sliding window algorithm
- **Upstash Redis**: Use `@upstash/ratelimit` which is designed for serverless
- **Supabase**: Use a `rate_limits` table with a cron job to clean up (higher latency)

Example with Upstash:
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '15 m'),
});
```

---

#### H-04: `uploadMenuImage` has no file type or size validation — arbitrary file upload

**File:** `src/lib/actions/admin/menu.ts:81–99`

**Risk:**  
The image upload server action accepts any `File` object, uses the original extension (`file.name.split('.').pop()`), and uploads it directly to Supabase Storage without checking:
- File MIME type (an attacker could upload `.html`, `.js`, `.svg` files containing XSS payloads)
- File size (no size limit means the bucket can be filled with huge files, costing money and potentially causing denial of service)
- That the extension matches the MIME type

Since the storage bucket is public (`public: true`), any uploaded file is immediately accessible via a public URL. An SVG upload can contain embedded `<script>` tags that execute in browsers that render SVGs inline.

Note: This action currently has no auth check (it relies on C-01's vulnerability), but even once auth is fixed, the file validation must be added.

**Fix:**  
```typescript
export async function uploadMenuImage(formData: FormData): Promise<{ url: string } | { error: string }> {
  await requireAdmin(); // add auth check
  
  const file = formData.get('file') as File | null;
  if (!file) return { error: 'No file provided.' };

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_SIZE) return { error: 'File too large. Maximum 5MB.' };

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' };
  }

  const EXT_MAP: Record<string, string> = {
    'image/jpeg': 'jpg', 'image/png': 'png',
    'image/webp': 'webp', 'image/gif': 'gif',
  };
  const ext = EXT_MAP[file.type];
  const path = `${Date.now()}-${crypto.randomUUID()}.${ext}`; // don't use user-supplied name
  // ... upload
}
```

---

#### H-05: `sgo-role` cookie is missing the `secure` flag

**File:** `src/lib/actions/auth.ts:23–28`, `src/app/auth/callback/route.ts:62–67`

**Risk:**  
The `sgo-role` cookie is set with `httpOnly: true` and `sameSite: "lax"` but lacks `secure: true`. Without `secure: true`, the cookie will be sent over plain HTTP connections. In a non-HTTPS deployment (local development or misconfigured staging), this cookie can be intercepted by a network attacker (MITM). While production should always be HTTPS, the `secure` flag is a defense-in-depth measure that should always be set.

**Fix:**  
```typescript
function setRoleCookie(role: string) {
  cookies().set("sgo-role", role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production", // true in prod, false for local dev
    maxAge: 60 * 60 * 24,
    path: "/",
  });
}
```

---

### MEDIUM

---

#### M-01: `createReservation` and `getAvailableTables` use the admin client for guest-accessible operations — no input validation beyond nullity checks

**File:** `src/lib/actions/reservations.ts:10–90`

**Risk:**  
Both public-facing reservation functions use `createAdminClient()` (service role, bypasses RLS) instead of the anon client. The `createReservation` function only checks that `guest_name`, `guest_phone`, `start_time`, and `end_time` are non-empty strings — there is no validation of format, length, or content. A user can submit:
- A `guest_name` of 10,000 characters
- A `start_time` that is a past date
- A `table_id` that does not exist (FK constraint will catch it, but the error message from Supabase is returned verbatim — see M-04)
- A `guest_count` of 0 or negative (the DB CHECK prevents it, but at the cost of a round-trip)
- A `reservation_date` in the past, allowing "ghost" reservations cluttering the admin view

Using the admin client here is also unnecessary — the public create policy exists specifically for this use case.

**Fix:**  
Add Zod validation for all reservation inputs:

```typescript
const reservationSchema = z.object({
  guest_name: z.string().min(2).max(100),
  guest_phone: z.string().regex(/^\+?[0-9]{7,15}$/),
  guest_email: z.string().email().optional().nullable(),
  reservation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(
    d => new Date(d) >= new Date(new Date().toDateString()), // not in the past
    'Reservation date cannot be in the past'
  ),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  guest_count: z.number().int().min(1).max(20),
  table_id: z.string().uuid(),
  special_requests: z.string().max(500).optional().nullable(),
});
```

Switch to the anon client for the insert (RLS public create policy covers it).

---

#### M-02: `suspendUser` and `unsuspendUser` accept a caller-supplied `actorId` — the audit log can be falsified

**File:** `src/lib/actions/admin/users.ts:77–109`

**Risk:**  
The `actorId` parameter used in audit log entries is passed in by the caller (the admin page via `actorId={actor?.id ?? ""}`). In the admin page, it comes from `getUser()` which is server-side and correct. However, because these are Server Actions callable directly, an attacker who has somehow obtained admin access could pass any UUID as `actorId`, attributing their actions to a different administrator in the audit log.

**Fix:**  
Never accept `actorId` as a parameter. Always derive it from the verified session inside the action:

```typescript
export async function suspendUser(userId: string): Promise<void> {
  const { userId: actorId } = await requireAdmin(); // get actor from verified session
  // ...audit log uses actorId derived server-side
}
```

---

#### M-03: `updateOrderStatus` and `updateReservationStatus` accept `actorId` as optional — audit log entries can have null actor

**File:** `src/lib/actions/admin/orders.ts:27`, `src/lib/actions/admin/reservations.ts:31`

**Risk:**  
Both functions declare `actorId?: string` as optional. If called without this parameter (or with `undefined`), the audit log entry records `actor_id: null`, making the action untraceable. Since these are exported Server Actions callable from any client, a malicious admin could intentionally omit the actor ID to avoid audit traceability.

**Fix:**  
Same as M-02 — derive `actorId` from the verified session inside the function, not from the caller.

---

#### M-04: Supabase error messages are returned verbatim to the client — potential internal detail leakage

**File:** `src/lib/actions/reservations.ts:75`, `src/lib/actions/orders.ts:39,43`

**Risk:**  
When a database error occurs (other than the known `23P01` exclusion constraint), the raw `error.message` from Supabase/PostgreSQL is returned directly:
```typescript
return { success: false, error: 'unknown', message: error.message };
```
PostgreSQL error messages can expose table names, column names, constraint names, data types, and internal system details useful for SQL injection reconnaissance and social engineering.

**Fix:**  
Log the full error server-side and return only a generic message:
```typescript
if (error) {
  if (error.code === '23P01') {
    return { success: false, error: 'slot_taken', message: 'This table is no longer available.' };
  }
  console.error('[createReservation] DB error:', error); // log internally
  return { success: false, error: 'unknown', message: 'An error occurred. Please try again.' };
}
```

---

#### M-05: Storage upload policies allow any authenticated user to upload to `menu-images` and `gallery` buckets — not just admins

**File:** `supabase/schema.sql:131–143`

**Risk:**  
The storage policies for insert are:
```sql
CREATE POLICY "admin_upload_menu_images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'menu-images');
```

The name says "admin" but `TO authenticated` means any logged-in user (including regular customers) can upload files to `menu-images` and `gallery`. This allows any user to fill up the storage bucket with arbitrary files, incurring costs and potentially uploading malicious content that gets served publicly.

**Fix:**  
Restrict to users with admin role using a custom JWT claim or a subquery:
```sql
CREATE POLICY "admin_upload_menu_images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'menu-images'
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
```

---

#### M-06: `getAllMenuItems` in `src/lib/actions/menu.ts` returns unavailable menu items — intended for admins but has no auth check

**File:** `src/lib/actions/menu.ts:45–53`

**Risk:**  
`getAllMenuItems()` fetches all items without the `is_available = true` filter, explicitly intended to show hidden items in the admin menu management UI. However, this Server Action has no authentication check — any client can call it and retrieve items that the admin has deliberately hidden from the public menu (e.g., items being prepared for launch, seasonal items not yet available).

**Fix:**  
Add `await requireAdmin()` at the top of `getAllMenuItems()`, or restructure so the admin menu page uses the admin action from `src/lib/actions/admin/menu.ts` and the public menu uses the filtered version.

---

### LOW

---

#### L-01: `signIn` uses email as the rate-limit key, not IP address — comment is misleading

**File:** `src/lib/actions/auth.ts:48–50`

**Risk:**  
The code comment says `// use email as rate-limit key` and the variable is named `ip`. Using email as the key means an attacker can try the same email/password 5 times per 15 minutes — but they can also attack many different accounts in parallel without hitting any limit, since each email gets its own bucket. A true IP-based limit would cap total attempts regardless of target account. The naming (`const ip = raw.email`) is actively confusing for future maintainers who might think IP rate-limiting is in place.

**Fix:**  
- Rename the variable: `const rateLimitKey = parsed.data.email;`
- Consider adding a secondary IP-based rate limit (requires access to the real client IP in the Server Action context, which requires a middleware-injected header or using `headers()` from Next.js).

---

#### L-02: Password reset (`resetPassword`) does not verify the user is in a valid password-reset session

**File:** `src/lib/actions/auth.ts:135–149`

**Risk:**  
The `resetPassword` action calls `supabase.auth.updateUser({ password })` on whatever session is currently active. Supabase handles the reset token verification through the session established by the `PKCE` flow in the reset link — this is correct behavior. However, if a user is already logged into a normal session and somehow navigates to `/auth/reset-password`, this action would update their password without re-verifying their current password. This is a lower risk because the reset link would typically be accessed in a fresh browser context, but it is worth noting.

**Fix:**  
Verify that the current session was established via a recovery token before allowing the password update. Check `user.aud` or use Supabase's `verifyOtp` approach for the reset flow.

---

#### L-03: `next.config.mjs` uses wildcard `*.supabase.co` for image hostname — overly broad

**File:** `next.config.mjs:11–13`

**Risk:**  
The hostname pattern `*.supabase.co` allows Next.js Image Optimization to proxy images from any Supabase project, not just the application's own project. If an attacker can inject a Supabase storage URL from a different project into `avatar_url` or `image_url` fields, those images will be proxied (and cached) by the application's Next.js server. This can be abused for SSRF-lite (forcing the Next.js server to fetch attacker-controlled content) or to cause the image optimization service to cache unwanted content.

**Fix:**  
Restrict to the specific project hostname:
```javascript
{ protocol: "https", hostname: "vczkclhdepdvnbmggeax.supabase.co" }
```

---

#### L-04: `avatar_url` in `updateProfileSchema` accepts any URL without domain restriction

**File:** `src/lib/validations/auth.ts:32`

**Risk:**  
`avatar_url: z.string().url().optional()` accepts any valid URL. Combined with the wildcard `*.supabase.co` image hostname, a user could set their avatar to any URL on the internet. When this avatar is rendered with `<Image>` from Next.js with an unallowed domain, it would throw an error. But if the URL is from an allowed domain (Google, Supabase, Unsplash), it is proxied. A user could set an avatar URL from a competitor's Supabase project.

**Fix:**  
Validate that `avatar_url` is from an allowed set of domains (Supabase project URL, Google avatars):
```typescript
avatar_url: z.string().url().refine(url => {
  const allowed = ['vczkclhdepdvnbmggeax.supabase.co', 'lh3.googleusercontent.com'];
  try { return allowed.some(h => new URL(url).hostname === h); }
  catch { return false; }
}).optional(),
```

---

### PASS (working correctly)

---

#### P-01: No `dangerouslySetInnerHTML` usage found

Grep across all source files confirmed there are no uses of `dangerouslySetInnerHTML` or `innerHTML`. User-supplied content (names, phone numbers, addresses) rendered in JSX is automatically escaped by React. XSS via rendered content is not a concern.

---

#### P-02: Supabase client correctly uses parameterized queries

All database operations use the Supabase JS client's chainable query builder, which internally uses parameterized PostgREST queries. No raw SQL string concatenation was found in any action file. SQL injection is not a concern for the query layer.

---

#### P-03: `getUser()` uses `supabase.auth.getUser()` (cryptographically verified), not `getSession()`

`src/lib/actions/auth.ts:154–157` and throughout the codebase correctly uses `supabase.auth.getUser()` which verifies the JWT against Supabase's auth server on every call, rather than `getSession()` which only reads from the cookie and can return stale/forged session data. This is the correct pattern per Next.js and Supabase documentation.

---

#### P-04: CSRF protection is provided by Next.js Server Actions

Next.js Server Actions automatically include CSRF protection by requiring requests to have the `Next-Action` header and matching the `Origin` header to the deployment URL. Custom API routes are not used for mutations, so CSRF is handled at the framework level.

---

#### P-05: Auth Zod schemas are present and applied before DB calls for auth flows

`signIn`, `signUp`, `forgotPassword`, `resetPassword`, and `updateProfile` all parse input through Zod schemas before any database operation. The schemas enforce email format, minimum password length (8 chars), and language enum values. This is correct for auth input validation.

---

## Summary Table

| ID | Severity | Title |
|---|---|---|
| C-01 | CRITICAL | Admin Server Actions have no authorization check |
| C-02 | CRITICAL | `sgo-role` cookie is forgeable — sole admin gate in middleware |
| C-03 | CRITICAL | AdminLayout only checks auth, not admin role |
| C-04 | CRITICAL | `getOrderById`/`getReservationById` are unauthenticated IDORs |
| C-05 | CRITICAL | `createOrder` trusts client-supplied `total_amount` |
| C-06 | CRITICAL | Production secrets committed to repository |
| C-07 | CRITICAL | Open redirect in OAuth callback via `next` parameter |
| H-01 | HIGH | Schema in `schema.sql` is critically out of sync with code |
| H-02 | HIGH | Missing RLS policies for `profiles`, `audit_log`, user-scoped order/reservation reads |
| H-03 | HIGH | In-memory rate limiter is bypassed in serverless environments |
| H-04 | HIGH | `uploadMenuImage` has no file type or size validation |
| H-05 | HIGH | `sgo-role` cookie missing `secure` flag |
| M-01 | MEDIUM | Reservation inputs lack format/range validation; admin client used unnecessarily |
| M-02 | MEDIUM | Audit log `actorId` accepted from caller — can be falsified |
| M-03 | MEDIUM | Audit log actor can be null — untraceable admin actions |
| M-04 | MEDIUM | Raw DB error messages returned to client |
| M-05 | MEDIUM | Storage upload policies allow any authenticated user, not just admins |
| M-06 | MEDIUM | `getAllMenuItems` exposes hidden items without auth check |
| L-01 | LOW | Rate limit key named `ip` but is actually email |
| L-02 | LOW | Password reset does not verify reset-session context |
| L-03 | LOW | Wildcard `*.supabase.co` image hostname is overly broad |
| L-04 | LOW | `avatar_url` accepts any domain URL |
