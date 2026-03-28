/**
 * Unit Tests — TRM (Tasa Representativa del Mercado)
 *
 * Tests for getTRM cache behavior, fallback, and invalidation.
 * Uses vi.fn() to mock the global fetch.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getTRM, invalidateTRMCache } from "@/lib/trm";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
    invalidateTRMCache();
    mockFetch.mockReset();
});

describe("getTRM", () => {
    it("should fetch and return TRM data from the API", async () => {
        mockFetch.mockResolvedValueOnce({
            json: async () => [{ valor: "4250.50", vigenciadesde: "2026-03-03" }],
        });

        const result = await getTRM();

        expect(result.valor).toBe(4250.50);
        expect(result.fecha).toBe("2026-03-03");
        expect(result.fuente).toBe("Banco de la República (datos.gov.co)");
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should return cached value on second call (no extra fetch)", async () => {
        mockFetch.mockResolvedValueOnce({
            json: async () => [{ valor: "4300", vigenciadesde: "2026-03-03" }],
        });

        const first = await getTRM();
        const second = await getTRM();

        expect(first.valor).toBe(second.valor);
        expect(mockFetch).toHaveBeenCalledTimes(1); // Only 1 fetch!
    });

    it("should return fallback (4200) when API fails", async () => {
        mockFetch.mockRejectedValueOnce(new Error("Network error"));

        const result = await getTRM();

        expect(result.valor).toBe(4200);
        expect(result.fuente).toBe("fallback");
    });

    it("should return fallback when API returns empty array", async () => {
        mockFetch.mockResolvedValueOnce({
            json: async () => [],
        });

        const result = await getTRM();

        expect(result.valor).toBe(4200);
        expect(result.fuente).toBe("fallback");
    });

    it("should invalidate cache and re-fetch", async () => {
        mockFetch
            .mockResolvedValueOnce({
                json: async () => [{ valor: "4100", vigenciadesde: "2026-03-01" }],
            })
            .mockResolvedValueOnce({
                json: async () => [{ valor: "4200", vigenciadesde: "2026-03-02" }],
            });

        const first = await getTRM();
        expect(first.valor).toBe(4100);

        invalidateTRMCache();

        const second = await getTRM();
        expect(second.valor).toBe(4200);
        expect(mockFetch).toHaveBeenCalledTimes(2);
    });
});

describe("invalidateTRMCache", () => {
    it("should force a new fetch after invalidation", async () => {
        mockFetch.mockResolvedValue({
            json: async () => [{ valor: "4500", vigenciadesde: "2026-03-03" }],
        });

        await getTRM();
        expect(mockFetch).toHaveBeenCalledTimes(1);

        invalidateTRMCache();
        await getTRM();
        expect(mockFetch).toHaveBeenCalledTimes(2);
    });
});
