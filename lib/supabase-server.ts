import "server-only";
import { createServerClient as _createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Standard Server Client (Cookie-based)
 */
export async function createServerSupabaseClient() {
    const cookieStore = await cookies();

    return _createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        cookies: {
            getAll() { return cookieStore.getAll(); },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                } catch { }
            },
        },
    });
}

/**
 * Static Client (Token-based)
 * Safe for use inside "use cache" as it doesn't access cookies().
 */
export function createSessionClient(accessToken: string) {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: {
            headers: { Authorization: `Bearer ${accessToken}` },
        },
    });
}

/**
 * Administrative Service Client
 * ⛔ BE CAREFUL: This bypasses RLS. Only use for backend aggregations.
 */
export function createServiceClient() {
    return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

export async function getUser() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}
