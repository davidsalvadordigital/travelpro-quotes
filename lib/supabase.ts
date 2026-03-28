/**
 * Supabase Client — Browser & Server
 *
 * This module initializes the Supabase clients for both browser-side
 * and server-side usage. Uses @supabase/ssr for cookie-based auth.
 *
 * TODO (Phase 1): Configure with real credentials from .env.local
 */

import { createBrowserClient } from "@supabase/ssr";

// Placeholder — will read from env in Phase 1
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * Browser client — use in Client Components
 */
export function createClient() {
    return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
