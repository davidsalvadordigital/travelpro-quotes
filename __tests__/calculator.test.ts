/**
 * Unit Tests — Quote Calculator (Modelo de Agencia — Comisión Cedida)
 *
 * MODELO CANÓNICO:
 *   comision      = pvp * (feePercent / 100)     ← cedida por el mayorista
 *   costoNeto     = pvp - comision               ← lo que se le paga al proveedor
 *   extraAmount   = pvp * (extraPercent / 100)   ← margen opcional de la agencia
 *   precioCliente = pvp + extraAmount            ← lo que paga el viajero
 *   utilidad      = comision + extraAmount       ← ganancia total de la agencia
 */
import { describe, it, expect } from "vitest";
import {
    calculateInternacional,
    calculateNacional,
    calculateQuote,
} from "@/features/quotes/utils/calculator";

// ─── calculateInternacional ───────────────────────────────────────────────────

describe("calculateInternacional", () => {
    it("extrae la comisión del PVP y calcula el costo neto correctamente", () => {
        // pvp=1000, fee=15% → comision=150, costoNeto=850
        const result = calculateInternacional(1000, 15, 4200);

        expect(result.type).toBe("internacional");
        expect(result.pvpUSD).toBe(1000);
        expect(result.feePercent).toBe(15);
        expect(result.feeAmountUSD).toBe(150);
        expect(result.netCostUSD).toBe(850);        // costoNeto = pvp - comision
        expect(result.extraPercent).toBe(0);
        expect(result.extraAmountUSD).toBe(0);
        expect(result.precioClienteUSD).toBe(1000); // sin extra → precio = pvp
        expect(result.precioClienteCOP).toBe(4200000); // 1000 * 4200
        expect(result.utilidadUSD).toBe(150);
        expect(result.utilidadCOP).toBe(630000);    // 150 * 4200
        expect(result.trm).toBe(4200);
    });

    it("aplica el margen extra correctamente encima del PVP", () => {
        // pvp=1000, fee=15%, extra=3% → precioCliente=1030, utilidad=180
        const result = calculateInternacional(1000, 15, 4200, 3);

        expect(result.extraPercent).toBe(3);
        expect(result.extraAmountUSD).toBe(30);
        expect(result.precioClienteUSD).toBe(1030); // pvp + extra
        expect(result.utilidadUSD).toBe(180);       // comision + extra
        expect(result.precioClienteCOP).toBe(4326000); // 1030 * 4200
    });

    it("maneja costo cero", () => {
        const result = calculateInternacional(0, 15, 4200);

        expect(result.feeAmountUSD).toBe(0);
        expect(result.netCostUSD).toBe(0);
        expect(result.precioClienteUSD).toBe(0);
        expect(result.precioClienteCOP).toBe(0);
        expect(result.utilidadCOP).toBe(0);
    });

    it("maneja fee cero (pass-through sin comisión)", () => {
        const result = calculateInternacional(1000, 0, 4200);

        expect(result.feeAmountUSD).toBe(0);
        expect(result.netCostUSD).toBe(1000);       // toda la plata va al proveedor
        expect(result.precioClienteUSD).toBe(1000);
        expect(result.utilidadUSD).toBe(0);
    });

    it("redondea valores COP a enteros", () => {
        const result = calculateInternacional(333, 7, 4150);

        expect(Number.isInteger(result.precioClienteCOP)).toBe(true);
        expect(Number.isInteger(result.utilidadCOP)).toBe(true);
    });
});

// ─── calculateNacional ────────────────────────────────────────────────────────

describe("calculateNacional", () => {
    it("extrae comisión del PVP en COP", () => {
        // pvp=2_000_000, fee=15% → comision=300_000, costoNeto=1_700_000
        const result = calculateNacional(2_000_000, 15);

        expect(result.type).toBe("nacional");
        expect(result.pvpCOP).toBe(2_000_000);
        expect(result.feePercent).toBe(15);
        expect(result.feeAmountCOP).toBe(300_000);
        expect(result.netCostCOP).toBe(1_700_000);  // costoNeto = pvp - comision
        expect(result.extraPercent).toBe(0);
        expect(result.extraAmountCOP).toBe(0);
        expect(result.precioClienteCOP).toBe(2_000_000); // sin extra = pvp
        expect(result.utilidadCOP).toBe(300_000);
    });

    it("aplica margen extra nacional", () => {
        // pvp=2_000_000, fee=15%, extra=3%
        const result = calculateNacional(2_000_000, 15, 3);

        expect(result.extraAmountCOP).toBe(60_000);
        expect(result.precioClienteCOP).toBe(2_060_000);
        expect(result.utilidadCOP).toBe(360_000);
    });

    it("maneja costo cero", () => {
        const result = calculateNacional(0, 15);

        expect(result.feeAmountCOP).toBe(0);
        expect(result.precioClienteCOP).toBe(0);
        expect(result.utilidadCOP).toBe(0);
    });

    it("maneja fee cero", () => {
        const result = calculateNacional(1_500_000, 0);

        expect(result.feeAmountCOP).toBe(0);
        expect(result.netCostCOP).toBe(1_500_000);
        expect(result.precioClienteCOP).toBe(1_500_000);
    });

    it("redondea a enteros", () => {
        const result = calculateNacional(1_000_001, 7);

        expect(Number.isInteger(result.feeAmountCOP)).toBe(true);
        expect(Number.isInteger(result.precioClienteCOP)).toBe(true);
    });
});

// ─── calculateQuote (unificada) ───────────────────────────────────────────────

describe("calculateQuote (unificada)", () => {
    it("delega a calculateNacional para destinos nacionales", () => {
        const result = calculateQuote("nacional", {
            pvpCOP: 1_000_000,
            feePercent: 10,
        });

        expect(result.type).toBe("nacional");
        if (result.type === "nacional") {
            expect(result.precioClienteCOP).toBe(1_000_000); // sin extra = pvp
            expect(result.netCostCOP).toBe(900_000);          // 1M - 10%
            expect(result.utilidadCOP).toBe(100_000);
        }
    });

    it("delega a calculateInternacional para destinos internacionales", () => {
        const result = calculateQuote("internacional", {
            pvpUSD: 800,
            feePercent: 15,
            trm: 4300,
        });

        expect(result.type).toBe("internacional");
        if (result.type === "internacional") {
            expect(result.feeAmountUSD).toBe(120);            // 800 * 15%
            expect(result.netCostUSD).toBe(680);              // 800 - 120
            expect(result.precioClienteUSD).toBe(800);        // sin extra
            expect(result.precioClienteCOP).toBe(3_440_000);  // 800 * 4300
        }
    });

    it("aplica extra margin en la función unificada", () => {
        const result = calculateQuote("internacional", {
            pvpUSD: 1000,
            feePercent: 15,
            extraPercent: 3,
            trm: 4200,
        });

        if (result.type === "internacional") {
            expect(result.precioClienteUSD).toBe(1030);
            expect(result.utilidadUSD).toBe(180);
        }
    });

    it("defaultea pvp a 0 si no se provee", () => {
        const result = calculateQuote("nacional", { feePercent: 15 });
        if (result.type === "nacional") {
            expect(result.pvpCOP).toBe(0);
            expect(result.precioClienteCOP).toBe(0);
        }
    });

    it("defaultea TRM a 4200 cuando no se provee", () => {
        const result = calculateQuote("internacional", {
            pvpUSD: 100,
            feePercent: 10,
        });

        if (result.type === "internacional") {
            expect(result.trm).toBe(4200);
            expect(result.precioClienteUSD).toBe(100);
            expect(result.precioClienteCOP).toBe(420_000);
        }
    });
});
