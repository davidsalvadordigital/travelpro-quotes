import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase-middleware";

/**
 * Next.js Proxy — Official 16.1+ Standard
 * 
 * Replaces the deprecated middleware.ts.
 * It handles Supabase session refreshing and route protection.
 */
export async function proxy(request: NextRequest) {
    return await updateSession(request);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public/ (public files)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
