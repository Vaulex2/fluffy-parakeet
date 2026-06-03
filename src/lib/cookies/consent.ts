// Client-side cookie-consent helpers.
//
// SushiGO only sets strictly-necessary cookies today (Supabase auth session,
// the `sgo-role` UI hint, and this consent record). The Analytics/Marketing
// categories are pre-wired so that if such scripts are added later, they can
// gate themselves on `hasConsent('analytics' | 'marketing')` — no consent UI
// rework required.

export type ConsentCategory = "necessary" | "analytics" | "marketing";

export interface CookieConsent {
  necessary: true; // always granted — required for the site to function
  analytics: boolean;
  marketing: boolean;
  v: number; // schema version, so we can re-prompt if categories change
  ts: number; // epoch ms the choice was saved
}

export const CONSENT_COOKIE = "sgo-cookie-consent";
export const CONSENT_VERSION = 1;
/** Dispatched on `window` to (re)open the preferences manager, e.g. from the footer. */
export const CONSENT_EVENT = "sgo:open-cookie-settings";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Read and validate the stored consent. Returns null if absent, malformed, or stale-version. */
export function readConsent(): CookieConsent | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CONSENT_COOKIE}=`));
  if (!match) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(match.split("=").slice(1).join("="))) as CookieConsent;
    if (parsed.v !== CONSENT_VERSION) return null; // categories changed — re-prompt
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      v: CONSENT_VERSION,
      ts: typeof parsed.ts === "number" ? parsed.ts : Date.now(),
    };
  } catch {
    return null;
  }
}

/** Persist the user's choice. `necessary` is forced on. Not httpOnly — the client must read it. */
export function writeConsent(choice: { analytics: boolean; marketing: boolean }): CookieConsent {
  const value: CookieConsent = {
    necessary: true,
    analytics: choice.analytics,
    marketing: choice.marketing,
    v: CONSENT_VERSION,
    ts: Date.now(),
  };
  if (typeof document !== "undefined") {
    const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
    document.cookie =
      `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(value))}` +
      `; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax${secure}`;
  }
  return value;
}

/** Whether a given category is currently consented to. `necessary` is always true. */
export function hasConsent(category: ConsentCategory): boolean {
  if (category === "necessary") return true;
  const consent = readConsent();
  return consent ? Boolean(consent[category]) : false;
}

/** Open the cookie preferences manager from anywhere (e.g. a footer "Cookie Preferences" link). */
export function openCookieSettings(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CONSENT_EVENT));
  }
}
