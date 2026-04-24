/**
 * Unit Tests — Zod Schemas
 */
import { describe, it, expect } from "vitest";
import { quoteSchema } from "@/features/quotes/schemas/quote-schema";
import { leadSchema } from "@/features/leads/schemas/lead-schema";

describe("quoteSchema", () => {
    const validQuote = {
        travelerName: "María García",
        email: "maria@example.com",
        destination: "Cancún",
        destinationType: "internacional" as const,
        departureDate: new Date("2026-06-15"),
        returnDate: new Date("2026-06-22"),
        numberOfTravelers: 2,
        netCostUSD: 1500,
        providerCommissionPercent: 10,
        agencyFeePercent: 5,
        trmUsed: 4200
    };

    it("should accept a valid quote", () => {
        const result = quoteSchema.safeParse(validQuote);
        expect(result.success).toBe(true);
    });

    it("should reject missing traveler name", () => {
        const result = quoteSchema.safeParse({ ...validQuote, travelerName: "" });
        expect(result.success).toBe(false);
    });

    it("should reject invalid email", () => {
        const result = quoteSchema.safeParse({ ...validQuote, email: "not-an-email" });
        expect(result.success).toBe(false);
    });

    it("should apply default values", () => {
        const result = quoteSchema.safeParse(validQuote);
        if (result.success) {
            expect(result.data.status).toBe("borrador");
            expect(result.data.itinerary).toEqual([]);
        }
    });

    it("should reject negative net cost", () => {
        const result = quoteSchema.safeParse({ ...validQuote, netCostUSD: -100 });
        expect(result.success).toBe(false);
    });

    it("should accept nacional type with netCostCOP", () => {
        const { netCostUSD, trmUsed, ...base } = validQuote;
        const nacionalQuote = {
            ...base,
            destinationType: "nacional" as const,
            netCostCOP: 3000000,
        };
        const result = quoteSchema.safeParse(nacionalQuote);
        expect(result.success).toBe(true);
    });
});

describe("leadSchema", () => {
    const validLead = {
        travelerName: "Carlos López",
        destination: "Bogotá",
    };

    it("should accept a valid lead", () => {
        const result = leadSchema.safeParse(validLead);
        expect(result.success).toBe(true);
    });

    it("should apply default status 'nuevo'", () => {
        const result = leadSchema.safeParse(validLead);
        if (result.success) {
            expect(result.data.status).toBe("nuevo");
        }
    });
});
