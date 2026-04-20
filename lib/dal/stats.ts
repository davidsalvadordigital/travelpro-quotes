/**
 * Data Access Layer (DAL) — Stats & Aggregates
 *
 * Provides computed data for KPI grids and Recharts visualizations.
 * Uses 'use cache' from Next.js 16 for sub-millisecond response times.
 *
 * 🚀 Cache Key Strategy (Vercel Best Practices):
 *    Functions receive `userId` (static, never expires) instead of
 *    `accessToken` (dynamic JWT, expires hourly) to prevent cache fragmentation.
 *    Data isolation is enforced via `.eq('created_by', userId)` filters with
 *    the Service Role client when needed.
 */

import { createServiceClient } from "@/lib/supabase-server";
import { cacheTag, cacheLife } from "next/cache";
import { withTenantIsolation } from "./isolation";

// ── Shared Aggregator ──────────────────────────────────────────────────────

/**
 * Main Data Aggregator — uses Service Role to bypass RLS.
 * Row-level isolation is enforced manually via `userId` filter for advisors.
 */
async function getRawStatsData(userId: string, isAdmin: boolean) {
    const supabase = createServiceClient();

    const quotesQuery = withTenantIsolation(
        supabase
            .from("quotes")
            .select("status, net_cost_usd, net_cost_cop, fee_percentage, trm_used, destination_type, created_at, created_by"),
        userId,
        isAdmin
    );

    const leadsQuery = withTenantIsolation(
        supabase
            .from("leads")
            .select("status, created_at"),
        userId,
        isAdmin
    );

    const [quotesRes, leadsRes, profilesRes] = await Promise.all([
        quotesQuery,
        leadsQuery,
        supabase.from("profiles").select("id, full_name"),
    ]);

    return {
        quotes: quotesRes.data ?? [],
        leads: leadsRes.data ?? [],
        profiles: profilesRes.data ?? [],
    };
}

// ── Dashboard KPIs (Advisor View) ──────────────────────────────────────────

export interface DashboardKpi {
    label: string;
    value: string;
    description: string;
    trend: "up" | "down" | "neutral";
}

export async function getDashboardKpis(userId: string): Promise<DashboardKpi[]> {
    'use cache';
    cacheTag(`dashboard-kpis-${userId}`);
    cacheTag(`stats-${userId}`);
    cacheLife("minutes");

    // SECURE: En lugar de usar la vista global, procesamos los datos brutos aislados
    // garantizando que el Asesor solo vea sus números reales.
    const { quotes, leads } = await getRawStatsData(userId, false);

    const activeLeads = leads.filter(l => ['nuevo', 'en_proceso', 'cotizado'].includes(l.status)).length;
    const totalQuotes = quotes.length;
    const totalLeads = leads.length;
    const wonLeads = leads.filter(l => l.status === 'ganado').length;
    const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

    return [
        {
            label: "Leads Activos",
            value: String(activeLeads),
            description: "Prospectos activos",
            trend: activeLeads > 0 ? "up" : "neutral",
        },
        {
            label: "Cotizaciones",
            value: String(totalQuotes),
            description: "Total generadas",
            trend: totalQuotes > 0 ? "up" : "neutral",
        },
        {
            label: "Tasa de Conversión",
            value: `${conversionRate}%`,
            description: "Leads ganados / total",
            trend: conversionRate >= 25 ? "up" : "neutral",
        },
        {
            label: "Ventas Totales",
            value: "$0",
            description: "Cotizaciones ganadas",
            trend: "neutral",
        },
    ];
}

// ── Admin KPIs ─────────────────────────────────────────────────────────────

export interface AdminKpi {
    label: string;
    value: string;
    sub: string;
    trend: "up" | "down" | "neutral";
    delta: string;
}

export async function getAdminKpis(userId: string): Promise<AdminKpi[]> {
    'use cache';

    const supabase = createServiceClient();

    cacheTag(`admin-kpis-${userId}`);
    cacheTag(`stats-${userId}`);
    cacheLife("minutes");

    const trm = await getTRM_Internal();

    const { data, error } = await supabase
        .from("dashboard_summary")
        .select("*")
        .single();

    if (error) throw new Error(`Error fetching Admin KPIs: ${error.message}`);

    const total = Number(data.total_quotes) || 0;
    const conversionRate = Number(data.quote_conversion_rate) || 0;
    const avgTicketUSD = Number(data.avg_ticket_usd) || 0;

    // Agregación bimonetaria optimizada
    const copFromFixedUSD = Number(data.usd_revenue_with_trm) || 0;
    const copFromCurrentUSD = (Number(data.usd_revenue_without_trm) || 0) * trm.valor;
    const copFromNational = Number(data.cop_revenue) || 0;
    const totalRevenueCOP = Math.round(copFromFixedUSD + copFromCurrentUSD + copFromNational);

    return [
        {
            label: "Cotizaciones Totales",
            value: String(total),
            sub: "Todos los asesores",
            trend: total > 0 ? "up" : "neutral",
            delta: total > 0 ? `${total}` : "—",
        },
        {
            label: "Tasa de Conversión",
            value: `${conversionRate}%`,
            sub: "Promedio del equipo",
            trend: conversionRate >= 25 ? "up" : "neutral",
            delta: conversionRate > 0 ? `${conversionRate}%` : "—",
        },
        {
            label: "Ticket Promedio",
            value: avgTicketUSD > 0 ? `$${avgTicketUSD.toLocaleString("en-US")} USD` : "—",
            sub: "Por cotización intl.",
            trend: "neutral",
            delta: "≈",
        },
        {
            label: "Volumen COP",
            value: totalRevenueCOP > 1_000_000
                ? `$${(totalRevenueCOP / 1_000_000).toFixed(1)}M`
                : totalRevenueCOP > 0
                    ? `$${totalRevenueCOP.toLocaleString("es-CO")}`
                    : "—",
            sub: "Valor total cotizado",
            trend: totalRevenueCOP > 0 ? "up" : "neutral",
            delta: totalRevenueCOP > 0 ? "+" : "—",
        },
    ];
}

// Helper para evitar múltiples llamadas a getTRM() si ya se tiene en el scope
async function getTRM_Internal() {
    return (await import("@/lib/trm")).getTRM();
}

export async function getAdvisorPerformance(userId: string, isAdmin = true) {
    'use cache';

    cacheTag(`advisor-performance-${userId}`);
    cacheTag(`stats-${userId}`);
    cacheLife("minutes");

    const { quotes, profiles } = await getRawStatsData(userId, isAdmin);

    const profileMap = new Map(profiles.map(p => [p.id, p.full_name]));

    const byAdvisor: Record<string, {
        name: string;
        cotizaciones: number;
        ganadas: number;
        perdidas: number;
        enProceso: number;
    }> = {};

    quotes.forEach((row: { created_by?: string; status?: string }) => {
        const uid = row.created_by ?? "unknown";
        const name = profileMap.get(uid) ?? "Unassigned";

        if (!byAdvisor[uid]) {
            byAdvisor[uid] = { name, cotizaciones: 0, ganadas: 0, perdidas: 0, enProceso: 0 };
        }

        byAdvisor[uid].cotizaciones++;
        if (row.status === "aprobada") byAdvisor[uid].ganadas++;
        else if (row.status === "rechazada") byAdvisor[uid].perdidas++;
        else byAdvisor[uid].enProceso++;
    });

    return Object.values(byAdvisor);
}

export async function getLeadDistribution(userId: string, isAdmin = true) {
    'use cache';

    cacheTag(`lead-distribution-${userId}`);
    cacheTag(`stats-${userId}`);
    cacheLife("minutes");

    const { leads } = await getRawStatsData(userId, isAdmin);

    const counts: Record<string, number> = {};
    leads.forEach((row: { status: string }) => {
        counts[row.status] = (counts[row.status] ?? 0) + 1;
    });

    const COLORS: Record<string, string> = {
        nuevo: "#3b82f6",
        cotizado: "#f59e0b",
        ganado: "#10b981",
        perdido: "#6b7280",
        en_proceso: "#8b5cf6",
    };

    return Object.entries(counts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: COLORS[name] ?? "#6b7280",
    }));
}

export async function getWeeklyTrend(userId: string, isAdmin = true) {
    'use cache';

    cacheTag(`weekly-trend-${userId}`);
    cacheTag(`stats-${userId}`);
    cacheLife("minutes");

    const { quotes } = await getRawStatsData(userId, isAdmin);
    if (quotes.length === 0) return [];

    const weeks: Record<string, { cotizaciones: number; ganadas: number }> = {};

    const sortedQuotes = [...quotes].sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    sortedQuotes.forEach((row: { created_at: string; status?: string }) => {
        const date = new Date(row.created_at);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const key = weekStart.toISOString().split("T")[0];

        if (!weeks[key]) weeks[key] = { cotizaciones: 0, ganadas: 0 };
        weeks[key].cotizaciones++;
        if (row.status === "aprobada") weeks[key].ganadas++;
    });

    return Object.entries(weeks)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-8)
        .map(([, values], idx) => ({
            semana: `Semana ${idx + 1}`,
            ...values,
        }));
}

// ── Activity Feed ──────────────────────────────────────────────────────────

export interface ActivityItem {
    text: string;
    time: string;
}

export async function getRecentActivity(userId: string, isAdmin = false): Promise<ActivityItem[]> {
    'use cache';

    const supabase = createServiceClient();

    cacheTag(`recent-activity-${userId}`);
    cacheTag(`stats-${userId}`);
    cacheLife("minutes");

    const quotesQuery = withTenantIsolation(
        supabase
            .from("quotes")
            .select("traveler_name, destination, status, updated_at")
            .order("updated_at", { ascending: false })
            .limit(3),
        userId,
        isAdmin
    );

    const leadsQuery = withTenantIsolation(
        supabase
            .from("leads")
            .select("traveler_name, destination, status, updated_at")
            .order("updated_at", { ascending: false })
            .limit(3),
        userId,
        isAdmin
    );

    const [quotesRes, leadsRes] = await Promise.all([quotesQuery, leadsQuery]);

    const STATUS_LABELS: Record<string, string> = {
        borrador: "Borrador guardado",
        enviada: "Cotización enviada",
        aprobada: "Cotización aprobada",
        rechazada: "Cotización rechazada",
        nuevo: "Nuevo prospecto",
        cotizado: "Prospecto cotizado",
        ganado: "Prospecto ganado",
        perdido: "Prospecto perdido",
    };

    const items: ActivityItem[] = [];

    (quotesRes.data ?? []).forEach((q: { status: string; destination?: string; updated_at: string; traveler_name: string }) => {
        items.push({
            text: `${STATUS_LABELS[q.status] ?? q.status}: ${q.destination ?? "Sin destino"}`,
            time: formatRelativeTime(q.updated_at) + ` • ${q.traveler_name}`,
        });
    });

    (leadsRes.data ?? []).forEach((l: { status: string; traveler_name: string; updated_at: string; destination?: string }) => {
        items.push({
            text: `${STATUS_LABELS[l.status] ?? l.status}: ${l.traveler_name}`,
            time: formatRelativeTime(l.updated_at) + ` • ${l.destination ?? ""}`,
        });
    });

    return items.slice(0, 5);
}

function formatRelativeTime(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffMs = now - then;
    const diffMin = Math.floor(diffMs / 60_000);
    const diffHrs = Math.floor(diffMs / 3_600_000);
    const diffDays = Math.floor(diffMs / 86_400_000);

    if (diffMin < 1) return "Ahora mismo";
    if (diffMin < 60) return `Hace ${diffMin} min`;
    if (diffHrs < 24) return `Hace ${diffHrs} h`;
    if (diffDays === 1) return "Ayer";
    return `Hace ${diffDays} días`;
}
