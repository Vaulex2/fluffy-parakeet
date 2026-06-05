# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Next.js dev server
npm run build    # Production build
npm run start    # Production server
npm run lint     # Next.js ESLint
```

No test runner is configured — validate changes by running `npm run build` (type errors surface here) and `npm run lint`.

## Architecture

Full-stack restaurant platform: **Next.js 14 App Router + Supabase**. A sushi cafe in Namangan, Uzbekistan with ordering, reservations, and an admin dashboard.

### Key conventions

- **Path alias:** `@/*` → `./src/*`
- **TypeScript strict mode** throughout
- **Dark mode** via `data-theme="dark"` on `<html>` (Tailwind selector strategy), not `prefers-color-scheme`
- **No component library** — all UI is hand-crafted with Tailwind + CSS custom properties defined in `src/app/globals.css`

### Supabase clients — use the right one

| File | When to use |
|---|---|
| `src/lib/supabase/server.ts` | Server Components, Server Actions, middleware |
| `src/lib/supabase/client.ts` | Client Components only |

### Server Actions (`src/lib/actions/`)

All mutations go through Next.js Server Actions here, not API routes:
- `auth.ts` — sign-up/in/out, Google OAuth, profile read/update
- `orders.ts` — create and fetch orders
- `reservations.ts` — create, fetch, update reservations

### Auth & route protection

`middleware.ts` runs on every request: refreshes the Supabase session, redirects unauthenticated users from protected routes (`/profile`, `/reservations`, `/orders`), and enforces `profiles.role = 'admin'` for `/admin/*`.

### Internationalization

Static UI strings live in `src/data/translations.ts` (Uzbek `uz`, English `en`, Russian `ru`), keyed by namespace. `en` is the canonical shape — a `satisfies Record<Locale, Dictionary>` guard fails the build if `uz`/`ru` miss a key.

- **Active locale** is a cookie (`sgo-lang`), defaulted to `uz` by `middleware.ts`. There is no i18n routing.
- **Server Components** read it via `getT()` / `getLocale()` from `src/lib/i18n/server.ts`.
- **Client Components** read it via `useLanguage()` from `src/components/i18n/LanguageProvider.tsx` (provider mounted in the root layout with the server-resolved locale).
- **Switching** goes through `setLanguagePreference` (`src/lib/actions/i18n.ts`): sets the cookie and, when logged in, syncs `profiles.preferred_language`. `<LanguageSwitcher>` lives in the navbar + profile form. `signIn`/`updateProfile` keep the cookie in sync.
- **Translated DB content**: `menu_items` / `menu_categories` have `name_{uz,ru,en}` + `description_{uz,ru,en}` columns (nullable; base `name`/`description` are the fallback). Resolve with `localizedField(row, "name", locale)` from `src/lib/i18n`.
- Helpers: `t("ns.key", { var })` supports `{var}` interpolation; `INTL_LOCALE` maps a `Locale` to a BCP-47 tag for `Intl`/`toLocaleDateString`.
- **Not localized:** the `/admin` dashboard (staff-only) and the long-form legal body copy in `/privacy` and `/terms` (chrome only) — that legal text still needs professional uz/ru translation.

### Design tokens

CSS custom properties are the source of truth (defined in `globals.css`), consumed by Tailwind theme extensions in `tailwind.config.ts`:

- Brand colors: `--sg-ink` (#0B0B0B), `--sg-red` (#E11D2A), `--sg-cream` (#F4ECD8)
- Fonts: `--fd` (Anton/display), `--fb` (Manrope/body), `--brush` (Caveat Brush/decorative)
- Easing: `--expo` `cubic-bezier(0.16, 1, 0.3, 1)` — use this for all animations
- Only animate `transform` and `opacity`; never `transition-all` or CSS layout properties

### Database

Schema is in `supabase/schema.sql`. Prices are stored in UZS (Uzbek som). The `reservations` table uses a PostgreSQL `EXCLUDE` constraint to prevent double-booking.

### Environment variables

| Variable | Scope |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only |
| `RESEND_API_KEY` | Server only |
| `NEXT_PUBLIC_SITE_URL` | Public |

### Remote images

`next.config.mjs` allowlists Unsplash, `*.supabase.co`, and Google avatar domains.
