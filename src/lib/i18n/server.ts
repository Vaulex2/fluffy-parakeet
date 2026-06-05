// ============================================================
// Server-side i18n — for Server Components, Server Actions, layouts.
// Reads the active locale from the sgo-lang cookie.
// ============================================================

import { cookies } from "next/headers";
import { LANG_COOKIE, normalizeLocale, type Locale } from "@/lib/i18n/config";
import { makeT, type TFunction } from "@/lib/i18n";

/** Active locale from the request cookie (defaults to Uzbek). */
export function getLocale(): Locale {
  const raw = cookies().get(LANG_COOKIE)?.value;
  return normalizeLocale(raw);
}

/** Translator bound to the current request's locale. */
export function getT(): { locale: Locale; t: TFunction } {
  const locale = getLocale();
  return { locale, t: makeT(locale) };
}
