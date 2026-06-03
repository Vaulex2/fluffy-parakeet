# SushiGO — Reservation & Delivery System Improvement Handoff

This document maps every gap in the current reservation and delivery/ordering system, explains why it matters, and describes exactly what to build — ordered by priority.

---

## Current System — Quick Summary

### What already works
- Reservation form with Zod validation, date/time conflict checking, and PostgreSQL `EXCLUDE` constraint for race-condition-safe double-booking prevention
- Order creation with server-side price recalculation (client can never manipulate totals)
- Order confirmation email via Resend (`src/lib/email/templates.ts`) — fires after checkout if customer provided an email
- Email template for reservation confirmation exists (`reservationConfirmationHtml`) but **is never called**
- Paginated customer order history (`/orders`) and reservation history (`/reservations`)
- Admin dashboard for viewing orders and reservations

### What is missing
Everything below.

---

## Gap 1 — Reservation Confirmation Email Is Never Sent

**File:** `src/lib/actions/reservations.ts` → `createReservation()`

**Problem:** The email template `reservationConfirmationHtml` exists in `src/lib/email/templates.ts` and is well-designed, but `createReservation()` never calls it. Customers get no confirmation after booking a table.

**Fix:** After the successful `INSERT`, call `sendReservationConfirmation()` — the same pattern already used in `createOrder()`:

```ts
// At the bottom of createReservation(), after: return { success: true, id: reservation.id }
if (parsed.data.guest_email) {
  await sendReservationConfirmation(parsed.data.guest_email, {
    name: parsed.data.guest_name,
    date: parsed.data.reservation_date,
    startTime: parsed.data.start_time,
    endTime: parsed.data.end_time,
    guestCount: parsed.data.guest_count,
    phone: parsed.data.guest_phone,
  }).catch(() => {});
}
```

You also need to create `sendReservationConfirmation()` in `src/lib/email/send.ts` (copy the pattern of `sendOrderConfirmation` already there).

**Effort:** 30 minutes.

---

## Gap 2 — No Admin Notification on New Orders / Reservations

**Problem:** When a customer places an order or books a table, the admin has no alert. They must refresh the admin dashboard manually or notice it by chance.

**Fix — Option A (simplest): Email alert to admin**

In both `createOrder()` and `createReservation()`, after the successful insert, send a plain notification email to the restaurant's own address:

```ts
await sendAdminAlert('New order received', `Order #${newOrder.id} — ${order.customer_name} — ${calculatedTotal} UZS`).catch(() => {});
```

Add `ADMIN_EMAIL=your@email.com` to `.env.local` and use the existing Resend setup.

**Fix — Option B (better): Supabase Realtime in the admin dashboard**

In `src/components/admin/OrdersClient.tsx`, subscribe to the `orders` table inserts:

```ts
useEffect(() => {
  const channel = supabase
    .channel('new-orders')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => {
      router.refresh(); // or re-fetch orders
    })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}, []);
```

This gives the admin a live-updating table without polling. Same pattern for reservations.

**Effort:** Option A = 1 hour. Option B = 2 hours.

---

## Gap 3 — Order Status Has No Customer-Facing Tracking

**Problem:** The `orders` table has a `status` column with values `pending → preparing → ready → delivered → canceled`. The admin can change this status. But customers have no way to see it — `/orders` shows the order list but not real-time status.

**What to build:**

1. **Order status badge** on the customer `/orders` page — color-coded pill showing current status.
2. **Live status update** — subscribe to Supabase Realtime on the specific order row so the badge updates without a page refresh when the admin changes it.
3. **Status-change email** — when admin moves an order to `preparing`, `ready`, or `delivered`, trigger an email to the customer.

The status-change email requires a Supabase Database Webhook (or a Supabase Edge Function triggered on row update) since the admin update happens server-side and needs to fire an email side-effect.

**Effort:** Status badge = 1 hour. Realtime = 2 hours. Status-change email = 3 hours (needs Edge Function).

---

## Gap 4 — No Reservation Cancellation for Customers

**Problem:** Customers can view their reservations at `/reservations` but cannot cancel them. The email template even says "call us to cancel" — a poor experience.

**What to build:**

1. Add `cancelReservation(id)` Server Action in `src/lib/actions/reservations.ts`:
   - Fetch reservation, verify `user_id = auth.uid()` (ownership check)
   - Only allow cancellation if `status = 'pending'` or `'confirmed'` AND the reservation is at least 2 hours in the future
   - Set `status = 'canceled_by_customer'` (add this to the CHECK constraint in schema)
   - Send cancellation confirmation email

2. Add a Cancel button to the reservation card in the customer `/reservations` page with a confirmation dialog.

**Schema change needed:**
```sql
ALTER TABLE reservations DROP CONSTRAINT reservations_status_check;
ALTER TABLE reservations ADD CONSTRAINT reservations_status_check
  CHECK (status IN ('pending', 'confirmed', 'completed', 'canceled_by_admin', 'canceled_by_customer', 'no_show'));
```

Also update the `EXCLUDE` constraint to exclude `canceled_by_customer` from conflict checks (already excludes `canceled_by_admin` and `no_show`).

**Effort:** 3 hours.

---

## Gap 5 — Schema / Code Mismatch (Silent Bug)

**Problem:** The schema in `supabase/schema.sql` does not match the TypeScript code in several places:

| Schema column | Code uses | Impact |
|---|---|---|
| `client_name` | `guest_name` | Inserts fail silently or hit a null constraint |
| `phone` | `guest_phone` | Same |
| `total_amount_uzs` | `total_amount` | Order total may not be saved |
| No `user_id` column on reservations in schema | Code inserts `user_id` | Insert may fail |
| No `user_id` column on orders in schema | Code queries by `user_id` | `getMyOrders()` always returns empty |

**Fix:** Either update `supabase/schema.sql` to match the code column names, or update the code to match the schema. The schema should be the source of truth. Run the corrected SQL via Supabase Dashboard → SQL Editor.

**This is the highest-priority fix — it may be causing orders and reservations to silently fail right now.**

**Effort:** 1 hour to audit, 2 hours to align and test.

---

## Gap 6 — No SMS Notifications (Uzbekistan-specific)

**Problem:** Many customers in Namangan will not check email but will immediately read an SMS. Confirmation emails are going to spam or being ignored.

**Recommended service:** [Eskiz.uz](https://eskiz.uz) — the standard Uzbek SMS gateway. Supports Cyrillic and Latin. Pay-per-SMS, ~50–100 UZS per message.

**What to send:**
- Reservation confirmed → SMS to `guest_phone`
- Order confirmed → SMS to `customer_phone`
- Order ready for pickup → SMS
- Reservation reminder 1 hour before

**Integration pattern** (add to `src/lib/sms/eskiz.ts`):

```ts
export async function sendSms(phone: string, message: string) {
  const res = await fetch('https://notify.eskiz.uz/api/message/sms/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.ESKIZ_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mobile_phone: phone, message, from: '4546' }),
  });
  if (!res.ok) console.error('[sendSms] failed:', await res.text());
}
```

Call `sendSms()` in the same place you call `sendOrderConfirmation()`.

**Effort:** 2 hours (auth token setup + integration + testing).

---

## Gap 7 — No Delivery Tracking

**Problem:** For delivery orders, the customer has no way to track their order after placing it. The admin has no driver assignment tool.

**Recommended service:** [Shipday](https://shipday.com) — free up to ~300 deliveries/month, works internationally, has a driver app.

**Integration flow:**

```
createOrder() succeeds
  → POST to Shipday API: create dispatch
  → Shipday notifies nearest driver (or admin assigns)
  → Driver accepts → customer gets SMS tracking link from Shipday
  → Order delivered → Shipday calls your webhook → you update orders.status = 'delivered'
```

**Files to create:**
- `src/lib/shipday/client.ts` — Shipday API wrapper
- `src/app/api/webhooks/shipday/route.ts` — webhook endpoint to receive delivery status updates

**Shipday API call on order creation:**

```ts
// In createOrder(), after successful INSERT, if order_type === 'delivery':
await createShipdayDispatch({
  orderId: newOrder.id,
  customerName: order.customer_name,
  customerPhone: order.customer_phone,
  deliveryAddress: order.delivery_address!,
  items: items.map(i => ({ name: i.item_name, quantity: i.quantity })),
  totalAmount: calculatedTotal,
}).catch(() => {}); // fire-and-forget
```

**Effort:** 4–6 hours (API integration + webhook + driver flow testing).

---

## Gap 8 — No Online Payment

**Problem:** All orders are cash on delivery or cash at pickup. No online payment option exists.

**Recommended for Uzbekistan:** [Payme](https://payme.uz) or [Click](https://click.uz) — both are dominant Uzbek payment gateways, support card and mobile payments, and have REST APIs.

**Integration flow:**
```
Checkout → create order in DB with status 'payment_pending'
  → redirect to Payme/Click payment page
  → on success callback → update order status to 'pending'
  → on failure → delete order or mark as 'canceled'
```

**Effort:** 6–10 hours per gateway (each has their own integration docs).

---

## Priority Order

| # | Gap | Effort | Impact |
|---|---|---|---|
| 1 | Schema/code mismatch (Gap 5) | 3h | Critical — may be silently breaking inserts |
| 2 | Reservation confirmation email (Gap 1) | 30min | High — customers get no booking proof |
| 3 | Admin notification on new orders (Gap 2) | 1–2h | High — admin misses orders |
| 4 | SMS via Eskiz.uz (Gap 6) | 2h | High — most impactful for Uzbek customers |
| 5 | Customer reservation cancellation (Gap 4) | 3h | Medium |
| 6 | Order status tracking for customers (Gap 3) | 4–6h | Medium |
| 7 | Shipday delivery tracking (Gap 7) | 5–7h | Medium — needed for delivery to feel real |
| 8 | Online payment via Payme/Click (Gap 8) | 8–12h | High business value but most complex |

---

## Environment Variables Needed

Add these to `.env.local` as you implement each gap:

```env
# Admin email alerts (Gap 2)
ADMIN_EMAIL=your-restaurant-email@gmail.com

# Eskiz SMS (Gap 6)
ESKIZ_EMAIL=your-eskiz-account@email.com
ESKIZ_PASSWORD=your-eskiz-password
ESKIZ_TOKEN=           # fetched programmatically via /api/auth/login

# Shipday delivery (Gap 7)
SHIPDAY_API_KEY=your-shipday-api-key

# Payme payment (Gap 8)
PAYME_MERCHANT_ID=
PAYME_SECRET_KEY=
NEXT_PUBLIC_PAYME_CHECKOUT_URL=https://checkout.paycom.uz
```

---

## Files to Touch Per Gap

| Gap | Files |
|---|---|
| 1 — Reservation email | `src/lib/actions/reservations.ts`, `src/lib/email/send.ts` |
| 2 — Admin alert | `src/lib/actions/orders.ts`, `src/lib/actions/reservations.ts`, `src/lib/email/send.ts`, `src/components/admin/OrdersClient.tsx` |
| 3 — Order status tracking | `src/app/orders/page.tsx`, `src/components/admin/OrdersClient.tsx`, new `src/app/api/webhooks/` |
| 4 — Reservation cancellation | `src/lib/actions/reservations.ts`, `src/app/reservations/page.tsx`, `supabase/schema.sql` |
| 5 — Schema mismatch | `supabase/schema.sql`, run migration in Supabase SQL Editor |
| 6 — SMS | new `src/lib/sms/eskiz.ts`, `src/lib/actions/orders.ts`, `src/lib/actions/reservations.ts` |
| 7 — Shipday | new `src/lib/shipday/client.ts`, new `src/app/api/webhooks/shipday/route.ts`, `src/lib/actions/orders.ts` |
| 8 — Payment | new `src/lib/payment/payme.ts`, `src/app/checkout/page.tsx`, new `src/app/api/webhooks/payme/route.ts` |
