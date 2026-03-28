/**
 * Data Access Layer — Leads
 *
 * 🚀 Cache Key Strategy (Vercel Best Practices):
 *    Functions receive `userId` (static UUID, never expires) instead of
 *    `accessToken` (dynamic JWT, expires hourly) to prevent cache fragmentation.
 *    Data isolation enforced via `.eq('created_by', userId)` with Service Role.
 *    RLS enforces multi-tenant: asesora only sees her own leads; admin sees all.
 */

import { createServerSupabaseClient, createServiceClient } from "@/lib/supabase-server";
import { cacheTag, cacheLife, revalidateTag } from "next/cache";
import { withTenantIsolation } from "./isolation";

// ── Types ───────────────────────────────────────────────────────────────

export interface LeadRow {
    id: string;
    created_by: string | null;
    traveler_name: string;
    email: string | null;
    phone: string | null;
    destination: string | null;
    status: "nuevo" | "cotizado" | "ganado" | "perdido" | "en_proceso";
    notes: string | null;
    agency_id: string | null;
    transaction_id: string | null;
    created_at: string;
    updated_at: string;
}

export type LeadInsert = Omit<LeadRow, "id" | "created_at" | "updated_at" | "transaction_id"> & { transaction_id?: string };
export type LeadUpdate = Partial<Omit<LeadRow, "id" | "created_at" | "created_by" | "agency_id">>;

// ── Queries ─────────────────────────────────────────────────────────────

/**
 * Fetch all leads visible to the current user.
 * 🚀 Keyed by stable `userId`, not JWT. Uses Service Role + manual filter.
 */
export async function getLeads(limit: number, userId: string, isAdmin = false) {
    'use cache';

    const supabase = createServiceClient();

    cacheTag(`leads-${userId}`);
    cacheLife("minutes");

    const query = withTenantIsolation(
        supabase
            .from("leads")
            .select("id, traveler_name, destination, status, created_at, updated_at")
            .order("created_at", { ascending: false })
            .limit(limit),
        userId,
        isAdmin
    );

    const { data, error } = await query;

    if (error) throw new Error(`Error fetching leads: ${error.message}`);
    return (data ?? []) as LeadRow[];
}

/**
 * Get a single lead by ID.
 * 🚀 Keyed by stable userId + leadId.
 */
export async function getLeadById(id: string, userId: string, isAdmin = false) {
    'use cache';

    const supabase = createServiceClient();

    cacheTag(`leads-${userId}`);
    cacheTag(`lead-${id}`);

    const query = withTenantIsolation(
        supabase
            .from("leads")
            .select("id, created_by, traveler_name, email, phone, destination, status, notes, agency_id, created_at, updated_at")
            .eq("id", id),
        userId,
        isAdmin
    );

    const { data, error } = await query.single();

    if (error) throw new Error(`Error fetching lead: ${error.message}`);
    return data as LeadRow;
}

// ── Mutations ───────────────────────────────────────────────────────────

/**
 * Create a new lead. Sets `created_by` to the current user's UID.
 */
export async function createLead(
    lead: Omit<LeadInsert, "created_by" | "agency_id">
) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const transactionId = lead.transaction_id || crypto.randomUUID();

    const { data, error } = await supabase
        .from("leads")
        .insert({ ...lead, transaction_id: transactionId, created_by: user.id })
        .select()
        .single();

    if (error) {
        // En Postgres Unique Violation error code es 23505
        if (error.code === '23505' && error.message.includes('transaction_id')) {
            throw new Error("duplicate_transaction");
        }
        throw new Error(`Error creating lead: ${error.message}`);
    }

    // 🔄 Purgar caché del DAL — purga inmediata con perfil 'max'
    revalidateTag(`leads-${user.id}`, "max");
    revalidateTag(`dashboard-kpis-${user.id}`, "max");
    revalidateTag(`admin-kpis-${user.id}`, "max");
    revalidateTag(`recent-activity-${user.id}`, "max");

    return data as LeadRow;
}

/**
 * Update an existing lead.
 */
export async function updateLead(id: string, updates: LeadUpdate) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
        .from("leads")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

    if (error) throw new Error(`Error updating lead: ${error.message}`);

    const { data: { user } } = await supabase.auth.getUser();

    // 🔄 Invalidar caché del listado de leads en el dashboard
    if (user) {
        revalidateTag(`leads-${user.id}`, "max");
        revalidateTag(`lead-${id}`, "max");
        revalidateTag(`dashboard-kpis-${user.id}`, "max");
        revalidateTag(`admin-kpis-${user.id}`, "max");
        revalidateTag(`recent-activity-${user.id}`, "max");
    }

    return data as LeadRow;
}

/**
 * Delete a lead by ID.
 */
export async function deleteLead(id: string) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
        .from("leads")
        .delete()
        .eq("id", id);

    if (error) throw new Error(`Error deleting lead: ${error.message}`);

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        revalidateTag(`leads-${user.id}`, "max");
        revalidateTag(`lead-${id}`, "max");
        revalidateTag(`dashboard-kpis-${user.id}`, "max");
        revalidateTag(`admin-kpis-${user.id}`, "max");
        revalidateTag(`recent-activity-${user.id}`, "max");
    }
}

/**
 * Search leads by name for the auto-fill feature.
 */
export async function searchLeads(query: string) {
    if (!query || query.length < 2) return [];

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
        .from("leads")
        .select("id, traveler_name, email, phone, destination")
        .ilike("traveler_name", `%${query}%`)
        .limit(5);

    if (error) throw new Error(`Error searching leads: ${error.message}`);
    return data as LeadRow[];
}

/**
 * Count leads grouped by status — for KPIs and charts.
 * 🚀 Keyed by stable `userId`.
 */
export async function getLeadCountsByStatus(userId: string, isAdmin = false) {
    'use cache';

    const supabase = createServiceClient();

    cacheTag(`stats-${userId}`);
    cacheLife("minutes");

    const query = withTenantIsolation(
        supabase.from("leads").select("status"),
        userId,
        isAdmin
    );

    const { data, error } = await query;

    if (error) throw new Error(`Error fetching lead counts: ${error.message}`);

    const counts: Record<string, number> = {
        nuevo: 0,
        cotizado: 0,
        ganado: 0,
        perdido: 0,
        en_proceso: 0,
    };

    (data ?? []).forEach((row: { status: string }) => {
        counts[row.status] = (counts[row.status] ?? 0) + 1;
    });

    return counts;
}
