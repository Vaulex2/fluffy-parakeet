# Supabase Auth email templates

These are the **branded** HTML templates for Supabase's authentication emails (confirm
signup, password reset, magic link). They match the app's Resend templates in
[`src/lib/email/templates.ts`](../../src/lib/email/templates.ts) — dark background, red
`#E11D2A` header, cream `#F4ECD8` text.

> ⚠️ These are **not** applied by code. Supabase auth emails are configured in the
> dashboard. This folder just keeps the HTML in version control so it isn't lost.

## How to apply

Supabase Dashboard → **Authentication → Emails** → pick a template → paste the matching
HTML into the **Message body** field → **Save**.

| Dashboard template | File | Suggested subject | Variable |
|---|---|---|---|
| Confirm signup | `confirm-signup.html` | `Confirm your email — SushiGO` | `{{ .ConfirmationURL }}` |
| Reset Password | `reset-password.html` | `Reset your password — SushiGO` | `{{ .ConfirmationURL }}` |
| Magic Link | `magic-link.html` | `Your sign-in link — SushiGO` | `{{ .ConfirmationURL }}` |

After saving, use **Send test email** (or trigger a real signup / password reset) to verify.

## Recommended: send auth emails through your own domain (custom SMTP)

By default these emails come from `noreply@mail.app.supabase.io` and Supabase's built-in
service is **rate-limited to a few emails per hour** — not enough for production.

Since you already use **Resend**, point Supabase at Resend's SMTP so auth emails come from
your domain and aren't throttled:

1. Resend → add & verify your sending domain (DNS records).
2. Resend → **SMTP** → get host `smtp.resend.com`, port `465`, user `resend`, password =
   your `RESEND_API_KEY`.
3. Supabase → **Authentication → Emails → SMTP Settings** → enable custom SMTP, enter
   those values, set sender to e.g. `no-reply@yourdomain.com`.

This is optional for testing but **strongly recommended before real launch**.
