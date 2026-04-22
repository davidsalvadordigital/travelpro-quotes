import { describe, it, expect } from "vitest";
import { quoteSchema } from "../features/quotes/schemas/quote-schema";
import { calculateNacional, calculateInternacional } from "../features/quotes/utils/calculator";

describe("Quote Foundation Integrity", () => {
    it("should accept a valid national quote", () => {
        const result = quoteSchema.safeParse({
            destinationType: "nacional",
            travelerName: "Pepe Test",
            email: "pepe@test.com",
            destination: "Cartagena",
            departureDate: "2026-05-01",
            returnDate: "2026-05-05",
            netCostCOP: 1000000,
            providerCommissionPercent: 10,
            agencyFeePercent: 5
        });
        expect(result.success).toBe(true);
    });

    it("should block TRM in national quotes", () => {
        const result = quoteSchema.safeParse({
            destinationType: "nacional",
            travelerName: "Pepe Test",
            email: "pepe@test.com",
            destination: "Cartagena",
            departureDate: "2026-05-01",
            returnDate: "2026-05-05",
            netCostCOP: 1000000,
            trmUsed: 4200
        });
        expect(result.success).toBe(false);
    });

    it("should calculate national prices correctly", () => {
        const calc = calculateNacional(1000000, 10, 5);
        expect(calc.precioClienteCOP).toBe(1150000);
        expect(calc.utilidadCOP).toBe(150000);
    });

    it("should calculate international prices correctly", () => {
        const calc = calculateInternacional(100, 10, 5, 4000);
        expect(calc.precioClienteUSD).toBe(115);
        expect(calc.precioClienteCOP).toBe(460000);
    });
});
