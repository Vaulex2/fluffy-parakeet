"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { signUp } from "@/lib/actions/auth";

// Maps the user's email domain to its webmail inbox, so the confirmation screen
// can offer a one-tap "Open <provider>" button. Defaults to Gmail.
function webmailLink(email: string): { url: string; label: string } {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  const providers: Record<string, { url: string; label: string }> = {
    "gmail.com": { url: "https://mail.google.com/mail/u/0/#inbox", label: "Open Gmail" },
    "googlemail.com": { url: "https://mail.google.com/mail/u/0/#inbox", label: "Open Gmail" },
    "outlook.com": { url: "https://outlook.live.com/mail/0/", label: "Open Outlook" },
    "hotmail.com": { url: "https://outlook.live.com/mail/0/", label: "Open Outlook" },
    "live.com": { url: "https://outlook.live.com/mail/0/", label: "Open Outlook" },
    "msn.com": { url: "https://outlook.live.com/mail/0/", label: "Open Outlook" },
    "yahoo.com": { url: "https://mail.yahoo.com/", label: "Open Yahoo Mail" },
    "icloud.com": { url: "https://www.icloud.com/mail", label: "Open iCloud Mail" },
    "me.com": { url: "https://www.icloud.com/mail", label: "Open iCloud Mail" },
    "yandex.com": { url: "https://mail.yandex.com/", label: "Open Yandex Mail" },
    "yandex.ru": { url: "https://mail.yandex.ru/", label: "Open Yandex Mail" },
    "mail.ru": { url: "https://e.mail.ru/", label: "Open Mail.ru" },
  };
  return providers[domain] ?? { url: "https://mail.google.com/mail/u/0/#inbox", label: "Open Gmail" };
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "");
    startTransition(async () => {
      const result = await signUp(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSubmittedEmail(email);
        setSuccess(true);
      }
    });
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  }

  if (success) {
    const mail = webmailLink(submittedEmail);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-500/15 border border-green-500/40 flex items-center justify-center">
            <span className="material-symbols-outlined text-green-400 text-3xl">mark_email_read</span>
          </div>
          <div>
            <h2 className="font-headline text-3xl tracking-tight text-text-primary mb-2">
              Check your email
            </h2>
            <p className="text-text-muted font-body text-sm leading-relaxed">
              We&apos;ve sent a confirmation link to{" "}
              {submittedEmail ? (
                <strong className="text-text-primary">{submittedEmail}</strong>
              ) : (
                "your inbox"
              )}
              . Click it to activate your account and start ordering.
            </p>
          </div>

          <a
            href={mail.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white font-headline tracking-tight text-lg py-3 rounded-xl hover:bg-red-700 transition-colors duration-200"
          >
            <span className="material-symbols-outlined text-xl">open_in_new</span>
            {mail.label}
          </a>

          <p className="text-text-muted/70 font-body text-xs leading-relaxed">
            Didn&apos;t get it? Check your spam folder, or wait a minute and try again.
          </p>

          <Link
            href="/auth/login"
            className="inline-block text-primary hover:underline font-body text-sm"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="text-white font-headline font-black text-2xl leading-none">S</span>
            </div>
            <span className="text-3xl font-headline tracking-tighter text-primary leading-none">
              SUSHI GO
            </span>
          </Link>
          <p className="mt-4 text-text-muted font-body text-sm">
            Create your account
          </p>
        </div>

        <div className="bg-surface border border-surface-border rounded-2xl p-8">
          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || isPending}
            className="w-full flex items-center justify-center gap-3 bg-background border border-surface-border rounded-xl px-4 py-3 text-text-primary font-body text-sm hover:bg-surface-border/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-5"
          >
            <GoogleIcon />
            {googleLoading ? "Redirecting…" : "Sign up with Google"}
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-surface-border" />
            <span className="text-text-muted font-body text-xs uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-surface-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-text-muted text-xs font-body font-medium uppercase tracking-widest mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                required
                autoComplete="name"
                className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-text-primary font-body text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors"
                placeholder="Jasur Karimov"
              />
            </div>
            <div>
              <label className="block text-text-muted text-xs font-body font-medium uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-text-primary font-body text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-text-muted text-xs font-body font-medium uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                autoComplete="new-password"
                minLength={8}
                className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-text-primary font-body text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors"
                placeholder="Min. 8 characters"
              />
            </div>
            <div>
              <label className="block text-text-muted text-xs font-body font-medium uppercase tracking-widest mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirm_password"
                required
                autoComplete="new-password"
                className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-text-primary font-body text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors"
                placeholder="Re-enter your password"
              />
            </div>

            {error && (
              <p className="text-primary text-sm font-body bg-primary/10 border border-primary/20 rounded-lg px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending || googleLoading}
              className="w-full bg-primary text-white font-headline tracking-tight text-lg py-3 rounded-xl hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Creating account…" : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-text-muted font-body text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
        <p className="text-center mt-3 text-text-muted font-body text-xs">
          <Link href="/" className="hover:text-text-primary transition-colors">
            ← Back to restaurant
          </Link>
        </p>
      </div>
    </div>
  );
}
