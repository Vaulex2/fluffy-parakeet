"use client";

import { openCookieSettings } from "@/lib/cookies/consent";
import { useLanguage } from "@/components/i18n/LanguageProvider";

/** Footer link that re-opens the cookie preferences manager. */
export default function CookiePreferencesLink({ className }: { className?: string }) {
  const { t } = useLanguage();
  return (
    <button type="button" onClick={openCookieSettings} className={className}>
      {t("cookies.preferencesLink")}
    </button>
  );
}
