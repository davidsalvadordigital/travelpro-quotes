/**
 * Unit Tests — TRM (Tasa Representativa del Mercado)
 *
 * Tests for fetchTRMFromAPI core logic.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchTRMFromAPI } from "@/lib/trm";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
    mockFetch.mockReset();
});

describe("fetchTRMFromAPI", () => {
    it("should fetch and return TRM data from the API", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [{ valor: "4250.50", vigenciadesde: "2026-03-03" }],
        });

        const result = await fetchTRMFromAPI();

        expect(result.valor).toBe(4250.50);
        expect(result.fecha).toBe("2026-03-03");
        expect(result.fuente).toBe("Banco de la República (datos.gov.co)");
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should throw error when API fails", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500
        });

        await expect(fetchTRMFromAPI()).rejects.toThrow("HTTP error! status: 500");
    });

    it("should throw error when API returns empty array", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        await expect(fetchTRMFromAPI()).rejects.toThrow();
    });
});
