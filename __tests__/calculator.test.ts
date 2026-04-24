/**
 * Unit Tests — Quote Calculator (TravelPro Net-Centric Model)
 *
 * MODELO DE AGENCIA (Costo Neto + Margen):
 * ─────────────────────────────────────────────────
 * netCost + providerCommission (pactada) + agencyFee (adicional)
 */
import { describe, it, expect } from "vitest";
import {
    calculateInternacional,
    calculateNacional,
    calculateQuote,
} from "@/features/quotes/utils/calculator";

describe("calculateInternacional", () => {
    it("calcula el precio cliente y utilidad correctamente", () => {
        // netCost=1000, comm=10%, agencyFee=5% (sobre el neto)
        const result = calculateInternacional(1000, 10, 5, 4000);

        expect(result.type).toBe("internacional");
        expect(result.netCostUSD).toBe(1000);
        expect(result.commissionAmountUSD).toBe(100);
        expect(result.agencyFeeAmountUSD).toBe(50);
        expect(result.precioClienteUSD).toBe(1050); // 1000 + 50
        expect(result.precioClienteCOP).toBe(1050 * 4000);
        expect(result.utilidadUSD).toBe(150); // 100 + 50
        expect(result.utilidadCOP).toBe(150 * 4000);
        expect(result.trm).toBe(4000);
    });

    it("maneja costo cero", () => {
        const result = calculateInternacional(0, 10, 5, 4200);
        expect(result.precioClienteUSD).toBe(0);
        expect(result.utilidadUSD).toBe(0);
    });

    it("redondea valores COP a enteros", () => {
        const result = calculateInternacional(333.33, 7, 5, 4150.5);
        expect(Number.isInteger(result.precioClienteCOP)).toBe(true);
        expect(Number.isInteger(result.utilidadCOP)).toBe(true);
    });
});

describe("calculateNacional", () => {
    it("calcula precios nacionales correctamente", () => {
        // netCost=1_000_000, comm=10%, agencyFee=5%
        const result = calculateNacional(1_000_000, 10, 5);

        expect(result.type).toBe("nacional");
        expect(result.netCostCOP).toBe(1_000_000);
        expect(result.commissionAmountCOP).toBe(100_000);
        expect(result.agencyFeeAmountCOP).toBe(50_000);
        expect(result.precioClienteCOP).toBe(1_050_000);
        expect(result.utilidadCOP).toBe(150_000);
    });
});

describe("calculateQuote (unificada)", () => {
    it("delega a calculateNacional para destinos nacionales", () => {
        const result = calculateQuote("nacional", {
            netCostCOP: 1_000_000,
            providerCommissionPercent: 10,
            agencyFeePercent: 5,
        });

        expect(result.type).toBe("nacional");
        if (result.type === "nacional") {
            expect(result.precioClienteCOP).toBe(1_050_000);
            expect(result.utilidadCOP).toBe(150_000);
        }
    });

    it("delega a calculateInternacional para destinos internacionales", () => {
        const result = calculateQuote("internacional", {
            netCostUSD: 1000,
            providerCommissionPercent: 10,
            agencyFeePercent: 5,
            trm: 4200,
        });

        expect(result.type).toBe("internacional");
        if (result.type === "internacional") {
            expect(result.precioClienteUSD).toBe(1050);
            expect(result.precioClienteCOP).toBe(1050 * 4200);
        }
    });
});
