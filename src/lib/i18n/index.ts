// ============================================================
// Pure i18n helpers — safe to import from both Server and Client
// Components (no next/headers, no React).
// ============================================================

import { translations, type Dictionary } from "@/data/translations";
import { type Locale, DEFAULT_LOCALE } from "@/lib/i18n/config";

/** Recursive dot-path of a nested string tree, e.g. "nav.menu". */
type DotPaths<T> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? `${K}.${DotPaths<T[K]>}`
    : K;
}[keyof T & string];

export type TranslationKey = DotPaths<Dictionary>;

export type TFunction = (
  key: TranslationKey,
  vars?: Record<string, string | number>,
) => string;

/** Replace {placeholders} with values; leaves unknown placeholders intact. */
export function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

/** Walk a dot-path against a dictionary object. Returns undefined if absent. */
function resolve(dict: unknown, key: string): string | undefined {
  const value = key
    .split(".")
    .reduce<unknown>(
      (acc, part) =>
        acc && typeof acc === "object"
          ? (acc as Record<string, unknown>)[part]
          : undefined,
      dict,
    );
  return typeof value === "string" ? value : undefined;
}

export function getDict(locale: Locale): Dictionary {
  return translations[locale] ?? translations[DEFAULT_LOCALE];
}

/** Build a translator bound to a locale, with English fallback per-key. */
export function makeT(locale: Locale): TFunction {
  return (key, vars) => {
    const raw =
      resolve(translations[locale], key) ??
      resolve(translations[DEFAULT_LOCALE], key) ??
      key;
    return interpolate(raw, vars);
  };
}

/**
 * Pick a localized DB column with graceful fallback to the base column.
 * e.g. localizedField(item, "name", "ru") -> item.name_ru || item.name
 */
export function localizedField<T>(row: T, base: string, locale: Locale): string {
  const r = row as Record<string, unknown>;
  const localized = r[`${base}_${locale}`];
  if (typeof localized === "string" && localized.trim()) return localized;
  const fallback = r[base];
  return typeof fallback === "string" ? fallback : "";
}
