# Sushi GO — Project Summary

Full-stack restaurant platform built with Next.js 14 + Supabase. Sushi cafe based in Namangan, Uzbekistan with multi-language support, ordering, reservations, and an admin dashboard.

---

## Frontend

### Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14.2.29 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 3.4 + CSS Custom Properties |
| Animation | Framer Motion 12 |
| State | React Context API (cart, auth) |

### Design Tokens

Defined as CSS custom properties in `src/app/globals.css`, consumed via Tailwind theme extensions.

**Colors**

| Token | Light | Dark | Description |
|---|---|---|---|
| `--sg-ink` | `#0B0B0B` | — | Primary text |
| `--sg-red` | `#E11D2A` | — | Brand accent |
| `--sg-cream` | `#F4ECD8` | — | Background |
| `--bg` | `#F4ECD8` | `#0B0B0B` | Page background |
| `--text` | `#0B0B0B` | `#F4ECD8` | Body text |
| `--accent` | `#E11D2A` | `#E11D2A` | Interactive accent |

**Typography**

| Token | Value | Usage |
|---|---|---|
| `--fd` | `Anton`, Archivo Black, Impact | Display / headings |
| `--fb` | `Manrope` (300–800) | Body copy |
| `--brush` | `Caveat Brush` | Decorative accents |

Fonts loaded via Google Fonts `@import`. Scale uses `clamp()`-based responsive sizing.

**Other Tokens**

| Token | Value |
|---|---|
| `--r` | `10px` (border radius) |
| `--expo` | `cubic-bezier(0.16, 1, 0.3, 1)` (easing) |

### Theming

- **Mode switching:** `data-theme="dark"` attribute on `<html>` (Tailwind selector strategy)
- **No component library** — all UI hand-crafted with Tailwind + CSS variables

### Typography Rules

- Tight tracking (`-0.03em`) on large display headings
- Generous line-height (`1.7`) on body text
- Body line length capped at 65–75ch
- Minimum 1.25× scale ratio between type hierarchy steps

### Motion Rules

- Only animate `transform` and `opacity`
- Never `transition-all`
- Ease-out with `--expo` — no bounce or elastic
- No animation of CSS layout properties

### Component Structure

```
src/components/
├── cart/
│   ├── CartContext.tsx       # useCart hook, localStorage persistence
│   └── CartDrawer.tsx        # Slide-out cart panel
├── layout/
│   ├── Navbar.tsx            # Nav, theme toggle, user menu, i18n switcher
│   └── Footer.tsx
├── menu/
│   └── MenuCard.tsx          # Product card with customization panel
├── reservation/
├── ui/
│   ├── falling-pattern.tsx   # Animated brand pattern
│   └── nav-header.tsx        # Mobile slide nav
```

### Internationalization

3 languages supported via `src/data/translations.ts`:
- Uzbek (`uz`)
- English (`en`)
- Russian (`ru`)

### App Routes

**Public**
- `/` — Homepage: hero, featured menu, about, team
- `/menu` — Full menu with category filter + search
- `/auth/login` — Email/password + Google OAuth
- `/auth/signup` — Registration
- `/auth/callback` — OAuth redirect handler

**Protected (requires auth)**
- `/profile` — User profile, preferences, loyalty points
- `/reservations` — Make & view reservations
- `/orders` — Order history

**Admin (requires `admin` role)**
- `/admin` — Dashboard: stats, pending orders/reservations
- `/admin/menu` — Edit menu items & categories
- `/admin/orders` — Manage order status
- `/admin/reservations` — Manage reservations

---

## Backend

### Stack

| Layer | Choice |
|---|---|
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email + Google OAuth) |
| Server Logic | Next.js Server Actions |
| Email | Resend |
| Session | Cookie-based via `@supabase/ssr` |

### Database Schema

**Enums**

| Enum | Values |
|---|---|
| `user_role` | `customer`, `staff`, `admin` |
| `order_status` | `pending`, `preparing`, `ready`, `delivered`, `cancelled` |
| `order_type` | `dine_in`, `pickup`, `delivery` |
| `reservation_status` | `pending`, `confirmed`, `cancelled`, `completed`, `no_show` |
| `table_type` | `indoor`, `outdoor`, `vip`, `bar` |
| `payment_status` | `pending`, `paid`, `refunded`, `failed` |
| `payment_method` | `cash`, `card`, `payme`, `click`, `uzum` |

**Tables**

| Table | Key Columns |
|---|---|
| `profiles` | `id` (FK → auth.users), `full_name`, `phone`, `role`, `loyalty_points`, `preferred_language` |
| `menu_categories` | `id`, `name`, `slug` (unique), `sort_order`, `is_active` |
| `menu_items` | `id`, `category_id`, `name`, `price` (UZS), `calories`, `is_featured`, `is_customizable`, `is_available` |
| `restaurant_tables` | `id`, `table_number` (unique), `seat_count`, `table_type`, `is_available` |
| `reservations` | `id`, `user_id`, `table_id`, `reservation_date`, `start_time`, `end_time`, `guest_count`, `status` — EXCLUDE constraint prevents double-booking |
| `orders` | `id`, `user_id`, `order_type`, `status`, `total_amount` |

Schema file: `supabase/schema.sql`

### Auth & Middleware

`middleware.ts` runs on every request:
1. Refreshes Supabase session from cookies
2. Redirects unauthenticated users away from protected routes
3. Checks `profiles.role = 'admin'` for `/admin/*` access

### Server Actions

```
src/lib/actions/
├── auth.ts          # signUp, signIn, signInWithGoogle, signOut, getUser, getProfile, updateProfile
├── orders.ts        # createOrder, getOrders
└── reservations.ts  # createReservation, getReservations, updateReservation
```

### Supabase Clients

| File | Usage |
|---|---|
| `src/lib/supabase/server.ts` | SSR client with cookie handling (Server Components, Actions) |
| `src/lib/supabase/client.ts` | Browser client (Client Components) |

---

## Configuration Files

| File | Purpose |
|---|---|
| `next.config.mjs` | Transpiles framer-motion; allows remote images from Unsplash, `*.supabase.co`, Google avatars |
| `tailwind.config.ts` | Dark mode selector strategy; theme extends CSS custom properties |
| `tsconfig.json` | Strict mode; path alias `@/*` → `./src/*` |
| `postcss.config.mjs` | Tailwind → Autoprefixer |
| `middleware.ts` | Auth refresh + protected route enforcement |

---

## Environment Variables

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anon key for browser client |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Supabase service role for server actions |
| `RESEND_API_KEY` | Server only | Email notifications via Resend |
| `GOOGLE_STITCH_API_KEY` | Server only | Google Stitch MCP design tool |
| `NEXT_PUBLIC_SITE_URL` | Public | Base URL (localhost in dev, production domain in prod) |

---

## Brand Assets

```
brand-assets/
├── logo-full.svg
├── logo-mark.svg
├── logo-wordmark.svg
├── lockup-tagline.svg
├── pattern-seigaiha.svg   # Japanese wave pattern
├── brush-divider.svg      # Decorative divider
├── icons/
└── products/              # Product photography
```

---

## Key Dependencies

```json
{
  "@supabase/ssr": "^0.6.1",
  "@supabase/supabase-js": "^2.49.4",
  "framer-motion": "^12.40.0",
  "next": "14.2.29",
  "react": "^18"
}
```

Dev: `typescript ^5`, `tailwindcss ^3.4.17`, `postcss ^8`, `autoprefixer ^10`

---

## Dev Scripts

```bash
npm run dev    # Next.js dev server
npm run build  # Production build
npm run start  # Production server
npm run lint   # Next.js linter
```
