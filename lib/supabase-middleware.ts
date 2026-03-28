/**
 * Supabase Middleware Helper — optimized for Next.js 16.1+
 * Avoids heavy network calls during the proxy/middleware phase.
 */
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    // ⚡ Fast path: Only run middleware on app routes, skip static assets
    const { pathname } = request.nextUrl;
    if (pathname.includes(".") || pathname.startsWith("/_next") || pathname.startsWith("/api")) {
        return supabaseResponse;
    }

    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        cookies: {
            getAll() { return request.cookies.getAll(); },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) =>
                    request.cookies.set(name, value)
                );
                supabaseResponse = NextResponse.next({ request });
                cookiesToSet.forEach(({ name, value, options }) =>
                    supabaseResponse.cookies.set(name, value, options)
                );
            },
        },
    });

    // OPTIMIZATION: We check for the session cookie directly first to avoid full SDK init
    const sessionCookie = request.cookies.get(`sb-${new URL(SUPABASE_URL).hostname.split('.')[0]}-auth-token`);
    const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
    const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname === "/";

    // If no cookie and route is protected -> simple redirect (0 network latency)
    if (!sessionCookie && isProtected) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // Full validation only if strictly necessary or for session refreshing
    const { data: { session } } = await supabase.auth.getSession();

    // Has session + login page → dashboard
    if (session && isAuthPage) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}
