"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  LANG_COOKIE,
  LANG_COOKIE_MAX_AGE,
  normalizeLocale,
} from "@/lib/i18n/config";

/**
 * Persist the chosen language: always sets the sgo-lang cookie, and — if the
 * user is logged in — syncs profiles.preferred_language so it follows them
 * across devices and sessions.
 */
export async function setLanguagePreference(value: string) {
  const locale = normalizeLocale(value);

  cookies().set(LANG_COOKIE, locale, {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: LANG_COOKIE_MAX_AGE,
    path: "/",
  });

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase
      .from("profiles")
      .update({ preferred_language: locale })
      .eq("id", user.id);
  }

  return { locale };
}
