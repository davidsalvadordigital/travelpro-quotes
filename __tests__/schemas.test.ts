/**
 * Unit Tests — Zod Schemas
 *
 * Tests for quoteSchema and leadSchema validation.
 * Ensures data integrity for forms and Server Actions.
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
        pvpUSD: 1500,
        feePercentage: 15,
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

    it("should reject missing destination", () => {
        const result = quoteSchema.safeParse({ ...validQuote, destination: "" });
        expect(result.success).toBe(false);
    });

    it("should apply default values", () => {
        const result = quoteSchema.safeParse(validQuote);
        if (result.success) {
            expect(result.data.status).toBe("borrador");
            expect(result.data.itinerary).toEqual([]);
            expect(result.data.inclusions).toEqual([]);
            expect(result.data.exclusions).toEqual([]);
        }
    });

    it("should reject negative cost", () => {
        const result = quoteSchema.safeParse({ ...validQuote, pvpUSD: -100 });
        expect(result.success).toBe(false);
    });

    it("should reject fee > 100%", () => {
        const result = quoteSchema.safeParse({ ...validQuote, feePercentage: 150 });
        expect(result.success).toBe(false);
    });

    it("should accept nacional type with COP", () => {
        const nacionalQuote = {
            ...validQuote,
            destinationType: "nacional" as const,
            pvpCOP: 3000000,
        };
        const result = quoteSchema.safeParse(nacionalQuote);
        expect(result.success).toBe(true);
    });

    it("should reject invalid status", () => {
        const result = quoteSchema.safeParse({ ...validQuote, status: "invalid" });
        expect(result.success).toBe(false);
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

    it("should reject missing traveler name", () => {
        const result = leadSchema.safeParse({ ...validLead, travelerName: "" });
        expect(result.success).toBe(false);
    });

    it("should reject missing destination", () => {
        const result = leadSchema.safeParse({ ...validLead, destination: "" });
        expect(result.success).toBe(false);
    });

    it("should apply default status 'nuevo'", () => {
        const result = leadSchema.safeParse(validLead);
        if (result.success) {
            expect(result.data.status).toBe("nuevo");
        }
    });

    it("should accept optional fields", () => {
        const result = leadSchema.safeParse({
            ...validLead,
            phone: "+573001234567",
            email: "carlos@example.com",
            notes: "Interesado en grupo familiar",
        });
        expect(result.success).toBe(true);
    });

    it("should reject invalid email format", () => {
        const result = leadSchema.safeParse({ ...validLead, email: "bad-email" });
        expect(result.success).toBe(false);
    });

    it("should reject invalid status", () => {
        const result = leadSchema.safeParse({ ...validLead, status: "invalid" });
        expect(result.success).toBe(false);
    });

    it("should accept valid status values", () => {
        for (const status of ["nuevo", "cotizado", "ganado", "perdido"]) {
            const result = leadSchema.safeParse({ ...validLead, status });
            expect(result.success).toBe(true);
        }
    });
});
