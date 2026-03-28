import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';

/**
 * Security Guardrail
 * Centralizes the tenant data isolation filter. By wrapping all DAL reads that use
 * `createServiceClient()` (Service Role) inside `use cache`, we guarantee that
 * no developer forgets to isolate the tenant data for non-admin users.
 */
export function withTenantIsolation<
    T extends PostgrestFilterBuilder<any, any, any, any, any, any, any>
>(
    query: T,
    userId: string,
    isAdmin = false
): T {
    if (!isAdmin) {
        // Al usar el tipo nativo, obtenemos intelisense total y cero problemas de TS recursivo.
        // Forzamos el cast a any para el llamado de .eq() y retornamos como T para preservar tipos.
        return (query as any).eq("created_by", userId) as unknown as T;
    }
    return query;
}
