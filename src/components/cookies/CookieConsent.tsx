"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CONSENT_EVENT,
  readConsent,
  writeConsent,
  type ConsentCategory,
} from "@/lib/cookies/consent";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n";

type CategoryDef = {
  id: ConsentCategory;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  locked?: boolean;
};

const CATEGORIES: CategoryDef[] = [
  { id: "necessary", titleKey: "cookies.necessaryTitle", descKey: "cookies.necessaryDesc", locked: true },
  { id: "analytics", titleKey: "cookies.analyticsTitle", descKey: "cookies.analyticsDesc" },
  { id: "marketing", titleKey: "cookies.marketingTitle", descKey: "cookies.marketingDesc" },
];

export default function CookieConsent() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // drives the enter transition
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const show = useCallback((forceCustomize: boolean) => {
    const existing = readConsent();
    setAnalytics(existing?.analytics ?? false);
    setMarketing(existing?.marketing ?? false);
    setCustomizing(forceCustomize);
    setOpen(true);
    // next frame → trigger the transform/opacity transition
    requestAnimationFrame(() => setMounted(true));
  }, []);

  // First-visit: show the banner only if no valid choice is stored yet.
  useEffect(() => {
    if (!readConsent()) show(false);
  }, [show]);

  // Allow re-opening from anywhere (footer "Cookie Preferences" link).
  useEffect(() => {
    const handler = () => show(true);
    window.addEventListener(CONSENT_EVENT, handler);
    return () => window.removeEventListener(CONSENT_EVENT, handler);
  }, [show]);

  const close = useCallback(() => {
    setMounted(false);
    window.setTimeout(() => setOpen(false), 300); // match transition duration
  }, []);

  const persist = useCallback(
    (choice: { analytics: boolean; marketing: boolean }) => {
      writeConsent(choice);
      close();
    },
    [close]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4 sm:px-6 sm:pb-6 pointer-events-none"
      role="dialog"
      aria-modal="false"
      aria-label={t("cookies.ariaLabel")}
    >
      <div
        className="pointer-events-auto mx-auto max-w-3xl rounded-2xl border border-surface-border bg-[#101010] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] will-change-transform"
        style={{
          transition: "transform 0.3s var(--expo), opacity 0.3s var(--expo)",
          transform: mounted ? "translateY(0)" : "translateY(16px)",
          opacity: mounted ? 1 : 0,
        }}
      >
        <div className="p-6 sm:p-7">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-[22px] mt-0.5">
              cookie
            </span>
            <div>
              <h2 className="font-headline text-xl tracking-tight text-text-primary">
                {t("cookies.title")}
              </h2>
              <p className="mt-2 font-body text-sm leading-relaxed text-text-muted">
                {t("cookies.body")}{" "}
                <Link href="/privacy" className="text-primary underline-reveal">
                  {t("cookies.privacyPolicy")}
                </Link>
                .
              </p>
            </div>
          </div>

          {/* Category toggles */}
          {customizing && (
            <ul className="mt-6 space-y-4 border-t border-surface-border pt-6">
              {CATEGORIES.map((cat) => {
                const checked =
                  cat.id === "necessary"
                    ? true
                    : cat.id === "analytics"
                    ? analytics
                    : marketing;
                const onToggle = () => {
                  if (cat.id === "analytics") setAnalytics((v) => !v);
                  if (cat.id === "marketing") setMarketing((v) => !v);
                };
                return (
                  <li key={cat.id} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-body text-sm font-semibold text-text-primary">
                        {t(cat.titleKey)}
                      </p>
                      <p className="mt-1 font-body text-xs leading-relaxed text-text-muted">
                        {t(cat.descKey)}
                      </p>
                    </div>
                    <Toggle
                      checked={checked}
                      disabled={cat.locked}
                      onChange={onToggle}
                      label={t(cat.titleKey)}
                    />
                  </li>
                );
              })}
            </ul>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setCustomizing((v) => !v)}
              className="font-body text-sm text-text-muted underline-reveal self-start transition-colors hover:text-text-primary"
            >
              {customizing ? t("cookies.hideOptions") : t("cookies.customize")}
            </button>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => persist({ analytics: false, marketing: false })}
                className="rounded-full border border-surface-border px-5 py-2.5 font-body text-sm font-semibold text-text-primary transition-colors hover:border-text-muted"
              >
                {t("cookies.rejectNonEssential")}
              </button>
              {customizing ? (
                <button
                  type="button"
                  onClick={() => persist({ analytics, marketing })}
                  className="btn-hover-lift rounded-full bg-primary px-5 py-2.5 font-body text-sm font-semibold text-white"
                >
                  {t("cookies.savePreferences")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => persist({ analytics: true, marketing: true })}
                  className="btn-hover-lift rounded-full bg-primary px-5 py-2.5 font-body text-sm font-semibold text-white"
                >
                  {t("cookies.acceptAll")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
        checked ? "border-primary bg-primary" : "border-surface-border bg-surface"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <span
        className="absolute top-1/2 h-4 w-4 rounded-full bg-white will-change-transform"
        style={{
          transition: "transform 0.25s var(--expo)",
          transform: `translateY(-50%) translateX(${checked ? "22px" : "4px"})`,
        }}
      />
    </button>
  );
}
