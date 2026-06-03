"use client";

import { openCookieSettings } from "@/lib/cookies/consent";

/** Footer link that re-opens the cookie preferences manager. */
export default function CookiePreferencesLink({ className }: { className?: string }) {
  return (
    <button type="button" onClick={openCookieSettings} className={className}>
      Cookie Preferences
    </button>
  );
}
