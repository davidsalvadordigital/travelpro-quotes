/**
 * Data Access Layer — Quotes
 *
 * 🚀 Cache Key Strategy (Vercel Best Practices):
 *    Functions receive `userId` (static UUID, never expires) instead of
 *    `accessToken` (dynamic JWT, expires hourly) to prevent cache fragmentation.
 *    Data isolation is enforced via `.eq('created_by', userId)` with the Service
 *    Role client when the user is not an admin.
 *
 * Handles camelCase ↔ snake_case mapping between the Zod schema
 * (frontend) and the Supabase table (database).
 */

import { createServerSupabaseClient, createServiceClient } from "@/lib/supabase-server";
import { quoteSchema, type Quote } from "@/features/quotes/schemas/quote-schema";
import { getTRM } from "@/lib/trm";
import { revalidateTag, cacheTag, cacheLife } from "next/cache";
import { withTenantIsolation } from "./isolation";

// ── Types ───────────────────────────────────────────────────────────────

export interface QuoteRow {
    id: string;
    lead_id: string | null;
    created_by: string | null;
    traveler_name: string;
    email: string | null;
    phone: string | null;
    number_of_travelers: number;
    destination: string | null;
    destination_type: "nacional" | "internacional";
    departure_date: string | null;
    return_date: string | null;
    hotel_info: string | null;
    airline_info: string | null;
    itinerary: Record<string, unknown>[] | null;
    inclusions: string[] | null;
    exclusions: string[] | null;
    net_cost_usd: number | null;
    net_cost_cop: number | null;
    fee_percentage: number | null;
    trm_used: number | null;
    status: "borrador" | "enviada" | "aprobada" | "rechazada";
    legal_conditions: string | null;
    agency_id: string | null;
    transaction_id: string | null;
    created_at: string;
    updated_at: string;
}

// ── Mappers ─────────────────────────────────────────────────────────────

/**
 * Frontend (camelCase Quote) → Database (snake_case QuoteRow).
 */
function toDbRow(
    quote: Partial<Quote> & { id?: string },
    userId: string
): Partial<QuoteRow> {
    return {
        ...(quote.id ? { id: quote.id } : {}),
        created_by: userId,
        traveler_name: quote.travelerName ?? "",
        email: quote.email ?? null,
        phone: quote.phone ?? null,
        number_of_travelers: quote.numberOfTravelers ?? 1,
        destination: quote.destination ?? null,
        destination_type: quote.destinationType ?? "internacional",
        departure_date: quote.departureDate
            ? quote.departureDate instanceof Date
                ? quote.departureDate.toISOString().split("T")[0]
                : String(quote.departureDate)
            : null,
        return_date: quote.returnDate
            ? quote.returnDate instanceof Date
                ? quote.returnDate.toISOString().split("T")[0]
                : String(quote.returnDate)
            : null,
        hotel_info: quote.hotelInfo ?? null,
        airline_info: quote.airlineInfo ?? null,
        itinerary: quote.itinerary ?? [],
        inclusions: quote.inclusions ?? [],
        exclusions: quote.exclusions ?? [],
        net_cost_usd: quote.netCostUSD ?? 0,
        net_cost_cop: quote.netCostCOP ?? 0,
        fee_percentage: quote.feePercentage ?? 15,
        trm_used: quote.trmUsed ?? null,
        status: quote.status ?? "borrador",
        legal_conditions: quote.legalConditions ?? null,
    };
}

/**
 * Database (snake_case QuoteRow) → Frontend (camelCase Quote + meta).
 */
function fromDbRow(
    row: QuoteRow
): Partial<Quote> & { id: string; savedAt: string } {
    return {
        id: row.id,
        savedAt: row.updated_at ?? row.created_at,
        travelerName: row.traveler_name,
        email: row.email ?? "",
        phone: row.phone ?? undefined,
        numberOfTravelers: row.number_of_travelers,
        destination: row.destination ?? "",
        destinationType: row.destination_type,
        departureDate: row.departure_date ? new Date(row.departure_date) : undefined,
        returnDate: row.return_date ? new Date(row.return_date) : undefined,
        hotelInfo: row.hotel_info ?? undefined,
        airlineInfo: row.airline_info ?? undefined,
        itinerary: (row.itinerary as { day: number; title: string; description: string; activities: string[]; image?: string }[]) ?? [],
        inclusions: row.inclusions ?? [],
        exclusions: row.exclusions ?? [],
        netCostUSD: Number(row.net_cost_usd) || 0,
        netCostCOP: Number(row.net_cost_cop) || 0,
        feePercentage: Number(row.fee_percentage) || 15,
        trmUsed: row.trm_used ? Number(row.trm_used) : undefined,
        status: row.status,
        legalConditions: row.legal_conditions ?? undefined,
    };
}

// ── Queries ─────────────────────────────────────────────────────────────

/**
 * Fetch all quotes visible to the current user.
 * 🚀 Next.js 16 'use cache' — keyed by stable `userId`, not JWT.
 */
export async function getQuotes(limit = 100, userId: string, isAdmin = false) {
    'use cache';

    const supabase = createServiceClient();

    cacheTag(`quotes-${userId}`);
    cacheLife("minutes");

    const query = withTenantIsolation(
        supabase
            .from("quotes")
            .select("id, traveler_name, destination, destination_type, status, created_at, updated_at")
            .order("updated_at", { ascending: false })
            .limit(limit),
        userId,
        isAdmin
    );

    const { data, error } = await query;

    if (error) throw new Error(`Error fetching quotes: ${error.message}`);

    return (data ?? []).map((row: Partial<QuoteRow>) => ({
        id: row.id!,
        savedAt: row.updated_at ?? row.created_at!,
        travelerName: row.traveler_name!,
        destination: row.destination ?? "",
        destinationType: row.destination_type!,
        status: row.status!,
    }));
}

/**
 * Get a single quote by ID.
 * 🚀 Keyed by stable userId + quoteId.
 */
export async function getQuoteById(id: string, userId: string, isAdmin = false) {
    'use cache';

    const supabase = createServiceClient();

    cacheTag(`quotes-${userId}`);
    cacheTag(`quote-${id}`);
    cacheLife("minutes");

    const query = withTenantIsolation(
        supabase
            .from("quotes")
            .select("id, lead_id, created_by, traveler_name, email, phone, number_of_travelers, destination, destination_type, departure_date, return_date, hotel_info, airline_info, itinerary, inclusions, exclusions, net_cost_usd, net_cost_cop, fee_percentage, trm_used, status, legal_conditions, agency_id, created_at, updated_at")
            .eq("id", id),
        userId,
        isAdmin
    );

    const { data, error } = await query.single();

    if (error) throw new Error(`Error fetching quote: ${error.message}`);
    return fromDbRow(data as QuoteRow);
}

// ── Mutations ───────────────────────────────────────────────────────────

/**
 * Upsert a quote — insert if new, update if ID exists.
 * Returns the mapped frontend-friendly quote.
 */
export async function upsertQuote(
    quote: Partial<Quote> & { id?: string; transactionId?: string }
) {
    // 🚀 Lenient validation for drafts: only strictly validate if sending
    if (quote.status === "enviada") {
        const validation = quoteSchema.safeParse(quote);
        if (!validation.success) {
            throw new Error(`Validación fallida: ${validation.error.message}`);
        }
    } else {
        if (!quote.travelerName || quote.travelerName.trim() === "") {
            throw new Error("El nombre del viajero es necesario incluso para borradores.");
        }
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const row = toDbRow(quote, user.id);

    // 🆔 Idempotencia: Generar o usar transaction_id único
    const transactionId = quote.transactionId || crypto.randomUUID();

    const { data, error } = await supabase
        .rpc('save_complete_quote_v2', {
            payload: { ...row, transaction_id: transactionId }
        });

    if (error) throw new Error(`Error saving quote via RPC: ${error.message}`);

    // 🛡️ Manejo de error de duplicidad idempotente desde el RPC
    if (data && (data as { error?: string }).error === "duplicate_transaction") {
        throw new Error("duplicate_transaction");
    }

    // 🔄 Purgar caché granular por usuario (purga inmediata con perfil 'max')
    revalidateTag(`quotes-${user.id}`, "max");
    revalidateTag(`dashboard-kpis-${user.id}`, "max");
    revalidateTag(`admin-kpis-${user.id}`, "max");
    revalidateTag(`recent-activity-${user.id}`, "max");

    return fromDbRow(data as QuoteRow);
}

/**
 * Delete a quote by ID.
 */
export async function deleteQuoteFromDb(id: string) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
        .from("quotes")
        .delete()
        .eq("id", id);

    if (error) throw new Error(`Error deleting quote: ${error.message}`);

    if (user) {
        revalidateTag(`quotes-${user.id}`, "max");
        revalidateTag(`quote-${id}`, "max");
        revalidateTag(`dashboard-kpis-${user.id}`, "max");
        revalidateTag(`admin-kpis-${user.id}`, "max");
        revalidateTag(`recent-activity-${user.id}`, "max");
    }
}

// ── Aggregates ──────────────────────────────────────────────────────────

/**
 * Count quotes grouped by status — for KPIs and charts.
 * 🚀 Keyed by stable `userId`.
 */
export async function getQuoteCountsByStatus(userId: string, isAdmin = false) {
    'use cache';

    const supabase = createServiceClient();

    cacheTag(`stats-${userId}`);
    cacheLife("minutes");

    const query = supabase
        .from("dashboard_summary")
        .select("count_borrador, count_enviada, count_aprobada, count_rechazada");

    const { data, error } = await (isAdmin ? query.single() : query.single());

    if (error) throw new Error(`Error fetching quote counts from view: ${error.message}`);

    return {
        borrador: Number(data?.count_borrador) || 0,
        enviada: Number(data?.count_enviada) || 0,
        aprobada: Number(data?.count_aprobada) || 0,
        rechazada: Number(data?.count_rechazada) || 0,
    };
}

/**
 * Get total quotes and financial summary for KPIs.
 * 🚀 Keyed by stable `userId`.
 */
export async function getQuoteFinancialSummary(userId: string) {
    'use cache';

    const trm = await getTRM();
    const supabase = createServiceClient();

    cacheTag(`stats-${userId}`);
    cacheLife("minutes");

    const { data, error } = await supabase
        .from("dashboard_summary")
        .select("*")
        .single();

    if (error) throw new Error(`Error fetching financial summary from view: ${error.message}`);

    const copFromFixedUSD = Number(data?.usd_revenue_with_trm) || 0;
    const copFromCurrentUSD = (Number(data?.usd_revenue_without_trm) || 0) * trm.valor;
    const copFromNational = Number(data?.cop_revenue) || 0;

    const totalRevenueCOP = Math.round(copFromFixedUSD + copFromCurrentUSD + copFromNational);

    return {
        totalQuotes: Number(data?.total_quotes) || 0,
        conversionRate: Number(data?.quote_conversion_rate) || 0,
        avgTicketUSD: Number(data?.avg_ticket_usd) || 0,
        totalRevenueCOP,
    };
}
