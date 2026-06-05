"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/lib/actions/auth";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import type { Profile } from "@/types/database";

export default function ProfileEditForm({ profile }: { profile: Profile }) {
  const { locale, t } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    // The language is applied live via the switcher; persist current choice too.
    formData.set("preferred_language", locale);

    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Full Name */}
      <div>
        <label className="block text-text-muted text-xs font-body font-medium uppercase tracking-widest mb-2">
          {t("profileSettings.fullName")}
        </label>
        <input
          type="text"
          name="full_name"
          defaultValue={profile.full_name ?? ""}
          autoComplete="name"
          className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-text-primary font-body text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors"
          placeholder={t("profileSettings.fullNamePlaceholder")}
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-text-muted text-xs font-body font-medium uppercase tracking-widest mb-2">
          {t("profileSettings.phone")}
        </label>
        <input
          type="tel"
          name="phone"
          defaultValue={profile.phone ?? ""}
          autoComplete="tel"
          className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-text-primary font-body text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors"
          placeholder={t("profileSettings.phonePlaceholder")}
        />
      </div>

      {/* Language — applies instantly across the site */}
      <div>
        <label className="block text-text-muted text-xs font-body font-medium uppercase tracking-widest mb-2">
          {t("profileSettings.language")}
        </label>
        <LanguageSwitcher variant="inline" />
      </div>

      {error && (
        <p className="text-primary text-sm font-body bg-primary/10 border border-primary/20 rounded-lg px-4 py-2.5">
          {error}
        </p>
      )}

      {success && (
        <p className="text-green-400 text-sm font-body bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2.5">
          {t("profileSettings.saved")}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="bg-primary text-white font-headline tracking-tight px-6 py-2.5 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? t("common.saving") : t("common.save")}
      </button>
    </form>
  );
}
