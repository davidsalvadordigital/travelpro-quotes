import { describe, it, expect } from "vitest";
import { calculateNacional, calculateInternacional } from "../features/quotes/utils/calculator";

describe("Quote Foundation Integrity", () => {
    it("should calculate national prices correctly", () => {
        const calc = calculateNacional(1000000, 10, 5);
        expect(calc.precioClienteCOP).toBe(1050000);
        expect(calc.utilidadCOP).toBe(150000);
    });

    it("should calculate international prices correctly", () => {
        const calc = calculateInternacional(100, 10, 5, 4000);
        expect(calc.precioClienteUSD).toBe(105);
        expect(calc.precioClienteCOP).toBe(420000);
    });
});
