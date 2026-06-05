"use client";

import {
  createContext,
  useContext,
  useState,
  useTransition,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { type Locale } from "@/lib/i18n/config";
import { makeT, type TFunction } from "@/lib/i18n";
import { setLanguagePreference } from "@/lib/actions/i18n";

interface LanguageContextValue {
  locale: Locale;
  /** Switch language: instant client update, then persist (cookie + profile). */
  setLocale: (locale: Locale) => void;
  /** True while the switch is being persisted / server components re-render. */
  isPending: boolean;
  t: TFunction;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  locale: initialLocale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [isPending, startTransition] = useTransition();

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      setLocaleState(next); // optimistic — client text updates immediately
      startTransition(async () => {
        await setLanguagePreference(next); // cookie + (if logged in) DB
        router.refresh(); // re-render Server Components in the new locale
      });
    },
    [locale, router],
  );

  const t = useMemo(() => makeT(locale), [locale]);

  const value = useMemo(
    () => ({ locale, setLocale, isPending, t }),
    [locale, setLocale, isPending, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return ctx;
}
