import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Validates that a redirect path is a safe relative URL on this origin.
 * Prevents open redirect via the `next` query parameter (C-07).
 */
function isSafeRedirect(path: string): boolean {
  // Must start with / and must NOT start with // (protocol-relative URL)
  return path.startsWith("/") && !path.startsWith("//");
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const admin = createAdminClient();

      // Upsert profile (safety net for OAuth users)
      await admin.from("profiles").upsert(
        {
          id: data.user.id,
          full_name:
            data.user.user_metadata?.full_name ??
            data.user.email?.split("@")[0] ??
            null,
        },
        { onConflict: "id", ignoreDuplicates: true }
      );

      const { data: profile } = await admin
        .from("profiles")
        .select("role, is_suspended")
        .eq("id", data.user.id)
        .single();

      if (profile?.is_suspended) {
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/auth/login?error=suspended`);
      }

      const role = profile?.role ?? "customer";

      // C-07: validate the `next` param before using it in a redirect
      const safePath = isSafeRedirect(next) ? next : "/profile";
      const redirectTarget =
        role === "admin" ? "/admin" : safePath === "/" ? "/profile" : safePath;

      const response = NextResponse.redirect(`${origin}${redirectTarget}`);
      response.cookies.set("sgo-role", role, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production", // H-05
        maxAge: 60 * 60 * 24,
        path: "/",
      });
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
