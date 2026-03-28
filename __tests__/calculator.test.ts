/**
 * Unit Tests — Quote Calculator
 *
 * Tests for calculateInternacional, calculateNacional, and calculateQuote.
 * Pure functions with zero side effects — ideal for unit testing.
 */
import { describe, it, expect } from "vitest";
import {
    calculateInternacional,
    calculateNacional,
    calculateQuote,
} from "@/features/quotes/utils/calculator";

describe("calculateInternacional", () => {
    it("should calculate fees and totals correctly", () => {
        const result = calculateInternacional(1000, 15, 4200);

        expect(result.type).toBe("internacional");
        expect(result.netCostUSD).toBe(1000);
        expect(result.feePercent).toBe(15);
        expect(result.feeAmountUSD).toBe(150);
        expect(result.totalUSD).toBe(1150);
        expect(result.totalCOP).toBe(4830000); // 1150 * 4200
        expect(result.profitCOP).toBe(630000); // 150 * 4200
        expect(result.trm).toBe(4200);
    });

    it("should handle zero cost", () => {
        const result = calculateInternacional(0, 15, 4200);

        expect(result.feeAmountUSD).toBe(0);
        expect(result.totalUSD).toBe(0);
        expect(result.totalCOP).toBe(0);
        expect(result.profitCOP).toBe(0);
    });

    it("should handle zero fee", () => {
        const result = calculateInternacional(1000, 0, 4200);

        expect(result.feeAmountUSD).toBe(0);
        expect(result.totalUSD).toBe(1000);
        expect(result.totalCOP).toBe(4200000);
        expect(result.profitCOP).toBe(0);
    });

    it("should round COP values to integers", () => {
        const result = calculateInternacional(333, 7, 4150);

        expect(Number.isInteger(result.totalCOP)).toBe(true);
        expect(Number.isInteger(result.profitCOP)).toBe(true);
    });

    it("should handle high TRM values", () => {
        const result = calculateInternacional(500, 10, 5000);

        expect(result.feeAmountUSD).toBe(50);
        expect(result.totalUSD).toBe(550);
        expect(result.totalCOP).toBe(2750000);
        expect(result.profitCOP).toBe(250000);
    });
});

describe("calculateNacional", () => {
    it("should calculate fees and totals in COP", () => {
        const result = calculateNacional(2000000, 15);

        expect(result.type).toBe("nacional");
        expect(result.netCostCOP).toBe(2000000);
        expect(result.feePercent).toBe(15);
        expect(result.feeAmountCOP).toBe(300000);
        expect(result.totalCOP).toBe(2300000);
        expect(result.profitCOP).toBe(300000);
    });

    it("should handle zero cost", () => {
        const result = calculateNacional(0, 15);

        expect(result.feeAmountCOP).toBe(0);
        expect(result.totalCOP).toBe(0);
        expect(result.profitCOP).toBe(0);
    });

    it("should handle zero fee", () => {
        const result = calculateNacional(1500000, 0);

        expect(result.feeAmountCOP).toBe(0);
        expect(result.totalCOP).toBe(1500000);
        expect(result.profitCOP).toBe(0);
    });

    it("should round fee to integer", () => {
        const result = calculateNacional(1000001, 7);

        expect(Number.isInteger(result.feeAmountCOP)).toBe(true);
        expect(Number.isInteger(result.totalCOP)).toBe(true);
    });
});

describe("calculateQuote (unified)", () => {
    it("should delegate to calculateNacional for nacional type", () => {
        const result = calculateQuote("nacional", {
            netCostCOP: 1000000,
            feePercent: 10,
        });

        expect(result.type).toBe("nacional");
        if (result.type === "nacional") {
            expect(result.totalCOP).toBe(1100000);
        }
    });

    it("should delegate to calculateInternacional for internacional type", () => {
        const result = calculateQuote("internacional", {
            netCostUSD: 800,
            feePercent: 12,
            trm: 4300,
        });

        expect(result.type).toBe("internacional");
        if (result.type === "internacional") {
            expect(result.totalUSD).toBe(896);
            expect(result.totalCOP).toBe(Math.round(896 * 4300));
        }
    });

    it("should default to 0 for missing cost values", () => {
        const result = calculateQuote("nacional", { feePercent: 15 });
        if (result.type === "nacional") {
            expect(result.netCostCOP).toBe(0);
            expect(result.totalCOP).toBe(0);
        }
    });

    it("should default TRM to 4200 when not provided", () => {
        const result = calculateQuote("internacional", {
            netCostUSD: 100,
            feePercent: 10,
        });

        if (result.type === "internacional") {
            expect(result.trm).toBe(4200);
            expect(result.totalCOP).toBe(Math.round(110 * 4200));
        }
    });
});
