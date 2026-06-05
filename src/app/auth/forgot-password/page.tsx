"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/actions/auth";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await forgotPassword(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSent(true);
      }
    });
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-500/15 border border-green-500/40 flex items-center justify-center">
            <span className="material-symbols-outlined text-green-400 text-3xl">mail</span>
          </div>
          <div>
            <h2 className="font-headline text-3xl tracking-tight text-text-primary mb-2">
              {t("auth.checkEmail")}
            </h2>
            <p className="text-text-muted font-body text-sm leading-relaxed">
              {t("auth.resetSent")}
            </p>
          </div>
          <Link
            href="/auth/login"
            className="inline-block text-primary hover:underline font-body text-sm"
          >
            {t("auth.backToSignIn")}
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
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="text-white font-headline font-black text-2xl leading-none">S</span>
            </div>
            <span className="text-3xl font-headline tracking-tighter text-primary leading-none">
              SUSHI GO
            </span>
          </Link>
          <p className="mt-4 text-text-muted font-body text-sm">
            {t("auth.resetSubtitle")}
          </p>
        </div>

        <div className="bg-surface border border-surface-border rounded-2xl p-8">
          <p className="text-text-muted font-body text-sm mb-6">
            {t("auth.forgotIntro")}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-text-muted text-xs font-body font-medium uppercase tracking-widest mb-2">
                {t("auth.email")}
              </label>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-text-primary font-body text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors"
                placeholder={t("auth.emailPlaceholder")}
              />
            </div>

            {error && (
              <p className="text-primary text-sm font-body bg-primary/10 border border-primary/20 rounded-lg px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary text-white font-headline tracking-tight text-lg py-3 rounded-xl hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? t("auth.sending") : t("auth.sendResetLink")}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-text-muted font-body text-sm">
          <Link href="/auth/login" className="hover:text-text-primary transition-colors">
            {t("auth.backToSignIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
