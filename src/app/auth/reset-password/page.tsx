"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { resetPassword } from "@/lib/actions/auth";
import { useLanguage } from "@/components/i18n/LanguageProvider";

function ResetPasswordForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [exchangeError, setExchangeError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Exchange the code for a session on mount
  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setExchangeError(t("auth.invalidLink"));
      return;
    }
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setExchangeError(t("auth.expiredLink"));
      } else {
        setReady(true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await resetPassword(formData);
      if (result?.error) {
        setFormError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/auth/login"), 2000);
      }
    });
  }

  if (success) {
    return (
      <div className="w-full max-w-md text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-green-500/15 border border-green-500/40 flex items-center justify-center">
          <span className="material-symbols-outlined text-green-400 text-3xl">check_circle</span>
        </div>
        <div>
          <h2 className="font-headline text-3xl tracking-tight text-text-primary mb-2">
            {t("auth.passwordUpdated")}
          </h2>
          <p className="text-text-muted font-body text-sm">
            {t("auth.redirectingSignIn")}
          </p>
        </div>
      </div>
    );
  }

  if (exchangeError) {
    return (
      <div className="w-full max-w-md text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-3xl">link_off</span>
        </div>
        <div>
          <h2 className="font-headline text-3xl tracking-tight text-text-primary mb-2">
            {t("auth.linkExpired")}
          </h2>
          <p className="text-text-muted font-body text-sm">{exchangeError}</p>
        </div>
        <Link
          href="/auth/forgot-password"
          className="inline-block bg-primary text-white font-headline tracking-tight px-6 py-2.5 rounded-xl hover:bg-red-700 transition-colors"
        >
          {t("auth.requestNewLink")}
        </Link>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="w-full max-w-md text-center">
        <p className="text-text-muted font-body text-sm animate-pulse">{t("auth.verifyingLink")}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="text-center mb-10">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="text-white font-headline font-black text-2xl leading-none">S</span>
          </div>
          <span className="text-3xl font-headline tracking-tighter text-primary leading-none">
            SUSHI GO
          </span>
        </Link>
        <p className="mt-4 text-text-muted font-body text-sm">{t("auth.setNewSubtitle")}</p>
      </div>

      <div className="bg-surface border border-surface-border rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-text-muted text-xs font-body font-medium uppercase tracking-widest mb-2">
              {t("auth.newPassword")}
            </label>
            <input
              type="password"
              name="password"
              required
              autoComplete="new-password"
              minLength={8}
              className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-text-primary font-body text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors"
              placeholder={t("auth.passwordMin")}
            />
          </div>
          <div>
            <label className="block text-text-muted text-xs font-body font-medium uppercase tracking-widest mb-2">
              {t("auth.confirmNewPassword")}
            </label>
            <input
              type="password"
              name="confirm_password"
              required
              autoComplete="new-password"
              className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-text-primary font-body text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors"
              placeholder={t("auth.passwordPlaceholder")}
            />
          </div>

          {formError && (
            <p className="text-primary text-sm font-body bg-primary/10 border border-primary/20 rounded-lg px-4 py-2.5">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary text-white font-headline tracking-tight text-lg py-3 rounded-xl hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? t("auth.updating") : t("auth.updatePassword")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <Suspense fallback={<p className="text-text-muted font-body text-sm animate-pulse">{t("auth.loading")}</p>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
