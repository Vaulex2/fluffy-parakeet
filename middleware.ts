import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import {
  LANG_COOKIE,
  LANG_COOKIE_MAX_AGE,
  DEFAULT_LOCALE,
} from "@/lib/i18n/config";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // Admin routes: require auth + verified admin role from the database
  // NOTE: the sgo-role cookie is intentionally NOT used for this check — it is
  // client-influenced and forgeable. The real role comes from the profiles table.
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    // Fetch the real role from the database (service role client bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Customer protected routes: require auth
  if (pathname.startsWith("/profile") || pathname.startsWith("/orders")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from auth pages
  // The sgo-role cookie is still used here for navigation UX only (not security)
  if ((pathname === "/auth/login" || pathname === "/auth/signup") && user) {
    const uiRole = request.cookies.get("sgo-role")?.value;
    const dest = uiRole === "admin" ? "/admin" : "/profile";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Ensure an explicit locale cookie exists so SSR and client agree from the
  // very first request (anonymous visitors default to Uzbek).
  if (!request.cookies.get(LANG_COOKIE)) {
    supabaseResponse.cookies.set(LANG_COOKIE, DEFAULT_LOCALE, {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: LANG_COOKIE_MAX_AGE,
      path: "/",
    });
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
