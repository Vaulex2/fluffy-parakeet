"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import {
  LOCALES,
  LOCALE_LABELS,
  LOCALE_SHORT_LABELS,
  type Locale,
} from "@/lib/i18n/config";

/**
 * Language switcher. `dropdown` for the desktop navbar, `inline` for the
 * mobile menu. Both drive the shared LanguageProvider, so a change applies
 * instantly and persists (cookie + profile when logged in).
 */
export function LanguageSwitcher({
  variant = "dropdown",
  onSelect,
}: {
  variant?: "dropdown" | "inline";
  onSelect?: () => void;
}) {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function choose(next: Locale) {
    setLocale(next);
    setOpen(false);
    onSelect?.();
  }

  if (variant === "inline") {
    return (
      <div className="flex gap-2 flex-wrap">
        {LOCALES.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => choose(l)}
            className={`px-3 py-1.5 rounded-lg font-body text-sm transition-colors border ${
              locale === l
                ? "bg-primary text-white border-primary"
                : "bg-background border-surface-border text-text-muted hover:text-text-primary hover:border-primary/40"
            }`}
          >
            {LOCALE_LABELS[l]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Change language"
        className="flex items-center gap-1 text-text-muted hover:text-text-primary transition-colors font-body text-sm"
      >
        <span className="material-symbols-outlined text-[18px]">language</span>
        <span className="font-medium">{LOCALE_SHORT_LABELS[locale]}</span>
        <span className="material-symbols-outlined text-[16px]">
          {open ? "expand_less" : "expand_more"}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-surface border border-surface-border rounded-xl shadow-xl z-30 py-1 overflow-hidden">
          {LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => choose(l)}
              className={`flex items-center justify-between w-full px-4 py-2.5 font-body text-sm transition-colors ${
                locale === l
                  ? "text-primary"
                  : "text-text-muted hover:text-text-primary hover:bg-background"
              }`}
            >
              {LOCALE_LABELS[l]}
              {locale === l && (
                <span className="material-symbols-outlined text-[16px]">check</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
