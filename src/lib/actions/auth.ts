"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/ratelimit";
import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from "@/lib/validations/auth";
import type { Profile, UpdateProfile } from "@/types/database";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// ── Helpers ───────────────────────────────────────────────

function setRoleCookie(role: string) {
  cookies().set("sgo-role", role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production", // H-05: only send over HTTPS in production
    maxAge: 60 * 60 * 24, // 24h
    path: "/",
  });
}

function deleteRoleCookie() {
  cookies().delete("sgo-role");
}

// ── signIn ────────────────────────────────────────────────

export async function signIn(formData: FormData, next?: string) {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const rateLimitKey = parsed.data.email; // L-01: was misleadingly named 'ip'
  if (!(await checkRateLimit('signin', rateLimitKey))) {
    return { error: "Too many attempts. Please wait 30 minutes." };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) return { error: error.message };

  // Check suspension
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role, is_suspended")
    .eq("id", data.user.id)
    .single();

  if (profile?.is_suspended) {
    await supabase.auth.signOut();
    return { error: "Your account has been suspended. Please contact support." };
  }

  const role = profile?.role ?? "customer";
  setRoleCookie(role);
  revalidatePath("/", "layout");
  redirect(next ?? (role === "admin" ? "/admin" : "/profile"));
}

// ── signUp ────────────────────────────────────────────────

export async function signUp(formData: FormData) {
  const raw = {
    full_name: formData.get("full_name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirm_password: formData.get("confirm_password") as string,
  };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  if (!(await checkRateLimit('signup', parsed.data.email))) {
    return { error: "Too many sign-up attempts. Please try again in an hour." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name },
      emailRedirectTo: `${SITE_URL}/auth/callback`,
    },
  });

  if (error) return { error: error.message };

  return { success: true };
}

// ── forgotPassword ────────────────────────────────────────

export async function forgotPassword(formData: FormData) {
  const raw = { email: formData.get("email") as string };
  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  if (!(await checkRateLimit('forgot', parsed.data.email))) {
    return { success: true }; // silently succeed to avoid enumeration
  }

  const supabase = createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${SITE_URL}/auth/reset-password`,
  });

  return { success: true };
}

// ── resetPassword ─────────────────────────────────────────

export async function resetPassword(formData: FormData) {
  const raw = {
    password: formData.get("password") as string,
    confirm_password: formData.get("confirm_password") as string,
  };

  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: error.message };

  return { success: true };
}

// ── getUser ───────────────────────────────────────────────

export async function getUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ── getProfile ────────────────────────────────────────────

export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data ?? null;
}

// ── updateProfile ─────────────────────────────────────────

export async function updateProfile(formData: FormData) {
  const raw: Record<string, string> = {};
  for (const key of ["full_name", "phone", "preferred_language", "avatar_url"]) {
    const val = formData.get(key);
    if (val !== null) raw[key] = val as string;
  }

  const parsed = updateProfileSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const update: UpdateProfile = {};
  if (parsed.data.full_name !== undefined) update.full_name = parsed.data.full_name;
  if (parsed.data.phone !== undefined) update.phone = parsed.data.phone;
  if (parsed.data.preferred_language !== undefined) update.preferred_language = parsed.data.preferred_language;
  if (parsed.data.avatar_url !== undefined) update.avatar_url = parsed.data.avatar_url;

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/profile");
  return { success: true };
}

// ── signOut ───────────────────────────────────────────────

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  deleteRoleCookie();
  revalidatePath("/", "layout");
  redirect("/auth/login");
}
