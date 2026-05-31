"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/lib/actions/auth";
import type { Profile, PreferredLanguage } from "@/types/database";

const LANGUAGES: { value: PreferredLanguage; label: string }[] = [
  { value: "uz", label: "O'zbek" },
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
];

export default function ProfileEditForm({ profile }: { profile: Profile }) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<PreferredLanguage>(profile.preferred_language);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    formData.set("preferred_language", lang);

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
          Full Name
        </label>
        <input
          type="text"
          name="full_name"
          defaultValue={profile.full_name ?? ""}
          autoComplete="name"
          className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-text-primary font-body text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors"
          placeholder="Your full name"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-text-muted text-xs font-body font-medium uppercase tracking-widest mb-2">
          Phone
        </label>
        <input
          type="tel"
          name="phone"
          defaultValue={profile.phone ?? ""}
          autoComplete="tel"
          className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-text-primary font-body text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors"
          placeholder="+998 90 123 45 67"
        />
      </div>

      {/* Language */}
      <div>
        <label className="block text-text-muted text-xs font-body font-medium uppercase tracking-widest mb-2">
          Language
        </label>
        <div className="flex gap-2 flex-wrap">
          {LANGUAGES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setLang(value)}
              className={`px-4 py-2 rounded-lg font-body text-sm transition-colors border ${
                lang === value
                  ? "bg-primary text-white border-primary"
                  : "bg-background border-surface-border text-text-muted hover:text-text-primary hover:border-primary/40"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-primary text-sm font-body bg-primary/10 border border-primary/20 rounded-lg px-4 py-2.5">
          {error}
        </p>
      )}

      {success && (
        <p className="text-green-400 text-sm font-body bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2.5">
          Profile saved successfully.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="bg-primary text-white font-headline tracking-tight px-6 py-2.5 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
