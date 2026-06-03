# Deployment Guide — SushiGO

Target: **Vercel** (the repo already has `vercel.json` with a daily cron) + **Supabase** (live DB).
The production build passes (`npm run build` → 24 routes, 0 errors). Follow the steps below to go live.

---

## 1. Vercel — environment variables

Set these in **Vercel → Project → Settings → Environment Variables** (Production, and Preview if
you use preview deploys). Values come from your `.env.local` / provider dashboards. See
`.env.example` for the full annotated list.

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-only secret** — never expose client-side |
| `RESEND_API_KEY` | Resend dashboard (server-only) |
| `UPSTASH_REDIS_REST_URL` | Upstash console |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash console (server-only) |
| `NEXT_PUBLIC_SITE_URL` | ⚠️ **Set to your real production domain** (e.g. `https://sushigo.uz`). Used for OAuth redirects, password-reset links, reservation-manage links in emails, `robots.txt`, and `sitemap.xml`. Do **not** leave it as `localhost`. |
| `CRON_SECRET` | Strong random value (already rotated locally to `a5e754d0fb556374830544b0d871806a83517279550a56e2522b8890c3bd0840`). Vercel Cron auto-sends it as `Authorization: Bearer <CRON_SECRET>`. |

> Rate limiting is **disabled** if the Upstash vars are missing in a non-production env, and the app
> **throws on boot in production** if they're absent — so make sure both Upstash vars are set.

After setting/changing env vars, **redeploy** so they take effect.

---

## 2. Supabase — Auth URL configuration

In **Supabase → Authentication → URL Configuration**:

- **Site URL:** your production domain (e.g. `https://sushigo.uz`).
- **Redirect URLs (allowlist):** add
  - `https://<your-domain>/auth/callback`
  - your Vercel preview pattern if needed, e.g. `https://*-<your-team>.vercel.app/auth/callback`

Without this, Google OAuth and password-reset/email-confirmation links will fail in production.

### Google OAuth (only if you use "Sign in with Google")
In the **Google Cloud Console** OAuth client, add the authorized redirect URI Supabase gives you
(`https://<project-ref>.supabase.co/auth/v1/callback`) and your production origin.

---

## 3. Database

The security-hardening migrations are **already applied to the live DB**
(`security_hardening_advisors`, `revoke_trigger_fn_execute_from_public`). No further DB action is
required for deploy. `supabase/schema.sql` is stale — the live DB is the source of truth.

The image hostname in `next.config.mjs` is pinned to this project's Supabase host
(`vczkclhdepdvnbmggeax.supabase.co`) — correct for this project. If you ever migrate Supabase
projects, update that hostname too.

---

## 4. Cron (reservation reminders)

`vercel.json` runs `GET /api/cron/reminders` daily at `05:00 UTC` (~10:00 Asia/Tashkent). It only
works once `CRON_SECRET` is set in Vercel (step 1). Vercel Cron requires a deploy on a paid plan or
the Hobby cron allowance — confirm crons are enabled for your plan.

---

## 5. Optional hardening (post-launch)

- **Leaked-password protection** (HaveIBeenPwned) — Supabase → Auth → Attack Protection. Requires a
  **Pro** plan; currently accepted as a free-tier limitation (captcha + rate limiting already cover
  the same threat). See `SECURITY-HANDOFF.md`.
- **Captcha** is already enabled (Turnstile) on auth endpoints.
- Replace the legal-page placeholders (business name, address, email, phone) in
  `src/app/privacy/page.tsx` and `src/app/terms/page.tsx`, and update the footer contact block in
  `src/components/layout/Footer.tsx` (currently placeholder address/phone).

---

## 6. Pre-deploy checklist

- [ ] All 8 env vars set in Vercel (Production)
- [ ] `NEXT_PUBLIC_SITE_URL` = real domain (not localhost)
- [ ] `CRON_SECRET` set in Vercel
- [ ] Supabase Site URL + redirect allowlist include the production domain
- [ ] Google OAuth redirect URIs updated (if used)
- [ ] Legal-page + footer placeholders filled in
- [ ] `npm run build` passes locally (verified ✅)
