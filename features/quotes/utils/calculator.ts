/**
 * Quote Calculator — Financial Logic
 *
 * NACIONAL:       netCostCOP + fee% → totalCOP (cobro al cliente, sin TRM)
 * INTERNACIONAL:  netCostUSD + fee% → totalUSD → ×TRM → totalCOP
 */

export interface QuoteCalculationInternacional {
    type: "internacional";
    netCostUSD: number;
    feePercent: number;
    feeAmountUSD: number;
    totalUSD: number;
    totalCOP: number;
    profitCOP: number;
    trm: number;
}

export interface QuoteCalculationNacional {
    type: "nacional";
    netCostCOP: number;
    feePercent: number;
    feeAmountCOP: number;
    totalCOP: number;
    profitCOP: number;
}

export type QuoteCalculation = QuoteCalculationInternacional | QuoteCalculationNacional;

/**
 * Calcula la cotización internacional.
 * El fee es invisible al viajero — solo se muestra el totalUSD y totalCOP.
 */
export function calculateInternacional(
    netCostUSD: number,
    feePercent: number,
    trm: number
): QuoteCalculationInternacional {
    const feeAmountUSD = netCostUSD * (feePercent / 100);
    const totalUSD = netCostUSD + feeAmountUSD;
    const totalCOP = Math.round(totalUSD * trm);
    const profitCOP = Math.round(feeAmountUSD * trm);

    return { type: "internacional", netCostUSD, feePercent, feeAmountUSD, totalUSD, totalCOP, profitCOP, trm };
}

/**
 * Calcula la cotización nacional.
 * Todo en COP — no se requiere TRM.
 */
export function calculateNacional(
    netCostCOP: number,
    feePercent: number
): QuoteCalculationNacional {
    const feeAmountCOP = Math.round(netCostCOP * (feePercent / 100));
    const totalCOP = netCostCOP + feeAmountCOP;

    return { type: "nacional", netCostCOP, feePercent, feeAmountCOP, totalCOP, profitCOP: feeAmountCOP };
}

/**
 * Función unificada — selecciona la lógica según tipo.
 */
export function calculateQuote(
    destinationType: "nacional" | "internacional",
    opts: { netCostUSD?: number; netCostCOP?: number; feePercent: number; trm?: number }
): QuoteCalculation {
    if (destinationType === "nacional") {
        return calculateNacional(opts.netCostCOP ?? 0, opts.feePercent);
    }
    return calculateInternacional(opts.netCostUSD ?? 0, opts.feePercent, opts.trm ?? 4200);
}
