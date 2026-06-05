// ============================================================
// i18n configuration — single source of truth for locales.
// Mirrors profiles.preferred_language ('en' | 'uz' | 'ru').
// ============================================================

export type Locale = "uz" | "ru" | "en";

/** All supported locales, in display order. */
export const LOCALES: readonly Locale[] = ["uz", "ru", "en"] as const;

/** Default for anonymous/new visitors — a Namangan cafe leads with Uzbek. */
export const DEFAULT_LOCALE: Locale = "uz";

/** Cookie that carries the active locale across SSR + client. */
export const LANG_COOKIE = "sgo-lang";

/** ~1 year, in seconds. */
export const LANG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Human labels for the switcher UI. */
export const LOCALE_LABELS: Record<Locale, string> = {
  uz: "O'zbek",
  ru: "Русский",
  en: "English",
};

/** Short labels (e.g. compact navbar switcher). */
export const LOCALE_SHORT_LABELS: Record<Locale, string> = {
  uz: "UZ",
  ru: "RU",
  en: "EN",
};

/** BCP-47 tags for Intl APIs (date/number formatting). */
export const INTL_LOCALE: Record<Locale, string> = {
  uz: "uz",
  ru: "ru",
  en: "en-US",
};

/** Narrow an arbitrary string to a Locale, falling back to the default. */
export function normalizeLocale(value: string | null | undefined): Locale {
  return LOCALES.includes(value as Locale) ? (value as Locale) : DEFAULT_LOCALE;
}
