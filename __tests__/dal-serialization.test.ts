/**
 * Test de Serialización del DAL — Requisito para 'use cache'
 *
 * Next.js 16 serializa los resultados de las funciones con 'use cache'.
 * Si una función retorna un valor no serializable (Date, undefined, clase
 * con métodos, Symbol, etc.), Next.js fallará en producción.
 *
 * Este test garantiza que todas las funciones de lectura del DAL devuelvan
 * objetos que sobrevivan a JSON.stringify → JSON.parse sin pérdida de datos.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Helpers ───────────────────────────────────────────────────────────────────

function isJsonSerializable(value: unknown): boolean {
    try {
        JSON.parse(JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
}

// ── Datos de prueba ───────────────────────────────────────────────────────────

const MOCK_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.mock";

const MOCK_LEAD_ROWS = [
    {
        id: "lead-uuid-1",
        created_by: "user-uuid-1",
        traveler_name: "Ana García",
        email: "ana@test.com",
        phone: "+57 300 123 4567",
        destination: "París",
        status: "nuevo",
        notes: "Viaje de luna de miel",
        agency_id: "agency-uuid-1",
        created_at: "2026-03-01T10:00:00.000Z",
        updated_at: "2026-03-15T14:30:00.000Z",
    },
];

const MOCK_LEADS_STATUS = [
    { status: "nuevo" },
    { status: "nuevo" },
    { status: "propuesta_enviada" },
    { status: "ganado" },
];

const MOCK_DASHBOARD_SUMMARY = {
    total_quotes: 10,
    total_leads: 25,
    active_leads: 8,
    lead_conversion_rate: 32,
    quote_conversion_rate: 40,
    avg_ticket_usd: 1200,
    usd_revenue_with_trm: 20000000,
    usd_revenue_without_trm: 5000,
    cop_revenue: 0,
    count_borrador: 3,
    count_enviada: 4,
    count_aprobada: 2,
    count_rechazada: 1,
};

// ── Builder del mock de Supabase ──────────────────────────────────────────────
//
// Crea la cadena de query builders de forma explícita:
//   client.from(x).select(y).order(z).limit(n) → Promise<{ data, error }>
//   client.from(x).select(y).single()          → Promise<{ data, error }>
//   client.from(x).select(y)                   → Promise<{ data, error }>  (leads status)

function makeSupabaseMock(arrayData: unknown, singleData: unknown) {
    const resolveArray = { data: arrayData, error: null };
    const resolveSingle = { data: singleData, error: null };

    // Objeto base que actúa como QueryBuilder
    const builder: any = {
        select: vi.fn().mockImplementation(() => builder),
        order: vi.fn().mockImplementation(() => builder),
        limit: vi.fn().mockImplementation(() => builder),
        eq: vi.fn().mockImplementation(() => builder),
        single: vi.fn().mockImplementation(() => {
            // Retornamos un "sub-builder" que resuelve a singleData
            const singleBuilder: any = {
                then: (cb: any) => Promise.resolve(resolveSingle).then(cb)
            };
            return singleBuilder;
        }),
        // El builder principal resuelve a arrayData
        then: (cb: any) => Promise.resolve(resolveArray).then(cb)
    };

    return {
        auth: {
            getUser: vi.fn().mockResolvedValue({
                data: { user: { id: "user-uuid-1" } },
                error: null,
            }),
        },
        from: vi.fn().mockReturnValue(builder),
    };
}

// ── Mocks globales ────────────────────────────────────────────────────────────

vi.mock("next/cache", () => ({
    cacheTag: vi.fn(),
    cacheLife: vi.fn(),
    revalidateTag: vi.fn(),
}));

vi.mock("@/lib/trm", () => ({
    getTRM: vi.fn().mockResolvedValue({ valor: 4200 }),
}));

// ── Tests: Leads DAL ──────────────────────────────────────────────────────────

describe("DAL Serialización — Leads", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
    });

    it("getLeads → array de objetos sin fechas nativas (sólo strings ISO)", async () => {
        vi.doMock("@/lib/supabase-server", () => ({
            createSessionClient: vi.fn().mockReturnValue(
                makeSupabaseMock(MOCK_LEAD_ROWS, null)
            ),
            createServiceClient: vi.fn().mockReturnValue(
                makeSupabaseMock(MOCK_LEAD_ROWS, null)
            ),
        }));

        const { getLeads } = await import("@/lib/dal/leads");
        const result = await getLeads(50, MOCK_ACCESS_TOKEN);

        expect(Array.isArray(result)).toBe(true);
        expect(isJsonSerializable(result)).toBe(true);

        result.forEach((lead) => {
            // Las fechas deben ser strings ISO, nunca objetos Date
            expect(typeof lead.created_at).toBe("string");
            expect(typeof lead.updated_at).toBe("string");
            expect(lead.created_at).not.toBeInstanceOf(Date);
        });
    });

    it("getLeadCountsByStatus → contadores como números finitos", async () => {
        vi.doMock("@/lib/supabase-server", () => ({
            createSessionClient: vi.fn().mockReturnValue(
                makeSupabaseMock(MOCK_LEADS_STATUS, null)
            ),
            createServiceClient: vi.fn().mockReturnValue(
                makeSupabaseMock(MOCK_LEADS_STATUS, null)
            ),
        }));

        const { getLeadCountsByStatus } = await import("@/lib/dal/leads");
        const result = await getLeadCountsByStatus(MOCK_ACCESS_TOKEN);

        expect(isJsonSerializable(result)).toBe(true);
        const keys = ["nuevo", "contactado", "cualificado", "propuesta_enviada", "negociacion", "ganado", "perdido"];
        keys.forEach((k) => {
            expect(typeof result[k]).toBe("number");
            expect(Number.isFinite(result[k])).toBe(true);
        });
        expect(result.nuevo).toBe(2);
        expect(result.propuesta_enviada).toBe(1);
        expect(result.ganado).toBe(1);
    });
});

// ── Tests: Quotes DAL ─────────────────────────────────────────────────────────

describe("DAL Serialización — Quotes", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
    });

    it("getQuoteCountsByStatus → contadores como números finitos", async () => {
        vi.doMock("@/lib/supabase-server", () => ({
            createSessionClient: vi.fn().mockReturnValue(
                makeSupabaseMock(null, MOCK_DASHBOARD_SUMMARY)
            ),
            createServiceClient: vi.fn().mockReturnValue(
                makeSupabaseMock(null, MOCK_DASHBOARD_SUMMARY)
            ),
        }));

        const { getQuoteCountsByStatus } = await import("@/lib/dal/quotes");
        const result = await getQuoteCountsByStatus(MOCK_ACCESS_TOKEN);

        expect(isJsonSerializable(result)).toBe(true);
        expect(typeof result.borrador).toBe("number");
        expect(typeof result.enviada).toBe("number");
        expect(typeof result.aprobada).toBe("number");
        expect(typeof result.rechazada).toBe("number");
        Object.values(result).forEach((v) => expect(Number.isFinite(v)).toBe(true));
    });

    it("getQuoteFinancialSummary → métricas financieras serializables con enteros", async () => {
        vi.doMock("@/lib/supabase-server", () => ({
            createSessionClient: vi.fn().mockReturnValue(
                makeSupabaseMock(null, MOCK_DASHBOARD_SUMMARY)
            ),
            createServiceClient: vi.fn().mockReturnValue(
                makeSupabaseMock(null, MOCK_DASHBOARD_SUMMARY)
            ),
        }));

        const { getQuoteFinancialSummary } = await import("@/lib/dal/quotes");
        const result = await getQuoteFinancialSummary(MOCK_ACCESS_TOKEN);

        expect(isJsonSerializable(result)).toBe(true);
        expect(typeof result.totalQuotes).toBe("number");
        expect(typeof result.conversionRate).toBe("number");
        expect(typeof result.avgTicketUSD).toBe("number");
        expect(typeof result.totalRevenueCOP).toBe("number");
        // totalRevenueCOP debe ser entero (Math.round en la implementación)
        expect(Number.isInteger(result.totalRevenueCOP)).toBe(true);
        Object.values(result).forEach((v) => expect(Number.isFinite(v)).toBe(true));
    });
});

// ── Tests: Stats DAL ──────────────────────────────────────────────────────────

describe("DAL Serialización — Stats", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
    });

    it("getDashboardKpis → array serializable con trend válido ('up'|'down'|'neutral')", async () => {
        vi.doMock("@/lib/supabase-server", () => ({
            createSessionClient: vi.fn().mockReturnValue(
                makeSupabaseMock(null, MOCK_DASHBOARD_SUMMARY)
            ),
            createServiceClient: vi.fn().mockReturnValue(
                makeSupabaseMock(null, MOCK_DASHBOARD_SUMMARY)
            ),
        }));

        const { getDashboardKpis } = await import("@/lib/dal/stats");
        const result = await getDashboardKpis(MOCK_ACCESS_TOKEN);

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
        expect(isJsonSerializable(result)).toBe(true);

        const validTrends = ["up", "down", "neutral"];
        result.forEach((kpi) => {
            expect(typeof kpi.label).toBe("string");
            expect(typeof kpi.value).toBe("string");
            expect(typeof kpi.description).toBe("string");
            expect(validTrends).toContain(kpi.trend);
        });
    });

    it("getAdminKpis → array serializable con todos los campos requeridos", async () => {
        vi.doMock("@/lib/supabase-server", () => ({
            createSessionClient: vi.fn().mockReturnValue(
                makeSupabaseMock(null, MOCK_DASHBOARD_SUMMARY)
            ),
            createServiceClient: vi.fn().mockReturnValue(
                makeSupabaseMock(null, MOCK_DASHBOARD_SUMMARY)
            ),
        }));

        const { getAdminKpis } = await import("@/lib/dal/stats");
        const result = await getAdminKpis(MOCK_ACCESS_TOKEN);

        expect(Array.isArray(result)).toBe(true);
        expect(isJsonSerializable(result)).toBe(true);

        const validTrends = ["up", "down", "neutral"];
        result.forEach((kpi) => {
            expect(typeof kpi.label).toBe("string");
            expect(typeof kpi.value).toBe("string");
            expect(typeof kpi.sub).toBe("string");
            expect(typeof kpi.delta).toBe("string");
            expect(validTrends).toContain(kpi.trend);
        });
    });
});
