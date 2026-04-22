/**
 * Quote Calculator — Financial Logic (TravelPro Net-Centric Model)
 *
 * MODELO DE AGENCIA (Costo Neto + Margen):
 * ─────────────────────────────────────────────────
 * El asesor ingresa el costo neto pactado con el mayorista.
 * Sobre ese neto se aplican dos márgenes:
 * 1. Comisión Proveedor %: Margen estándar cedido.
 * 2. Fee Agencia %: Margen adicional propio.
 *
 * FÓRMULAS CANÓNICAS (Comisión Cedida):
 *   commAmount       = netCost * (commPercent / 100)  ← Utilidad cedida por el proveedor
 *   pvpBase          = netCost                        ← El neto ingresado es el precio base
 *   agencyFeeAmount  = netCost * (feePercent / 100)   ← Fee adicional sobre el neto
 *   precioClientePAX = netCost + agencyFeeAmount
 *   utilidadPAX      = commAmount + agencyFeeAmount
 *
 * FLUJO MULTI-MONEDA:
 *   NACIONAL:        netCostCOP + Márgenes → precioClienteCOP
 *   INTERNACIONAL:   netCostUSD + Márgenes → precioClienteUSD → ×TRM → precioClienteCOP
 */

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface QuoteCalculationInternacional {
  type: "internacional";
  /** Costo neto base en USD */
  netCostUSD: number;
  /** Porcentaje de comisión del proveedor (ej. 10) */
  providerCommissionPercent: number;
  /** Monto de comisión en USD */
  commissionAmountUSD: number;
  /** Porcentaje de fee adicional de la agencia (ej. 5) */
  agencyFeePercent: number;
  /** Monto del fee de agencia en USD */
  agencyFeeAmountUSD: number;
  /** PVP Base (Neto + Comisión Proveedor) en USD */
  pvpUSD: number;
  /** Precio final que paga el viajero en USD (por persona) */
  precioClienteUSD: number;
  /** Precio final en COP (redondeado) */
  precioClienteCOP: number;
  /** Utilidad total de la agencia en USD (comm + fee) */
  utilidadUSD: number;
  /** Utilidad total en COP (redondeada) */
  utilidadCOP: number;
  /** TRM usada para la conversión */
  trm: number;
}

export interface QuoteCalculationNacional {
  type: "nacional";
  /** Costo neto base en COP */
  netCostCOP: number;
  /** Porcentaje de comisión del proveedor (ej. 10) */
  providerCommissionPercent: number;
  /** Monto de comisión en COP */
  commissionAmountCOP: number;
  /** Porcentaje de fee adicional de la agencia (ej. 5) */
  agencyFeePercent: number;
  /** Monto del fee de agencia en COP */
  agencyFeeAmountCOP: number;
  /** PVP Base (Neto + Comisión Proveedor) en COP */
  pvpCOP: number;
  /** Precio final que paga el viajero en COP (por persona) */
  precioClienteCOP: number;
  /** Utilidad total de la agencia en COP (comm + fee) */
  utilidadCOP: number;
}

export type QuoteCalculation =
  | QuoteCalculationInternacional
  | QuoteCalculationNacional;

// ─── Calculadoras ─────────────────────────────────────────────────────────────

/**
 * Calcula una cotización INTERNACIONAL basada en Costo Neto.
 *
 * @param netCostUSD                Costo neto del proveedor en USD
 * @param providerCommissionPercent % de comisión del proveedor
 * @param agencyFeePercent          % de fee extra de la agencia
 * @param trm                       TRM del día
 */
export function calculateInternacional(
  netCostUSD: number,
  providerCommissionPercent: number,
  agencyFeePercent: number,
  trm: number
): QuoteCalculationInternacional {
  const commissionAmountUSD = netCostUSD * (providerCommissionPercent / 100);
  const agencyFeeAmountUSD = netCostUSD * (agencyFeePercent / 100);
  
  const pvpUSD = netCostUSD;
  const precioClienteUSD = netCostUSD + agencyFeeAmountUSD;
  const utilidadUSD = commissionAmountUSD + agencyFeeAmountUSD;

  return {
    type: "internacional",
    netCostUSD,
    providerCommissionPercent,
    commissionAmountUSD,
    agencyFeePercent,
    agencyFeeAmountUSD,
    pvpUSD,
    precioClienteUSD,
    precioClienteCOP: Math.round(precioClienteUSD * trm),
    utilidadUSD,
    utilidadCOP: Math.round(utilidadUSD * trm),
    trm,
  };
}

/**
 * Calcula una cotización NACIONAL basada en Costo Neto.
 *
 * @param netCostCOP                Costo neto del proveedor en COP
 * @param providerCommissionPercent % de comisión del proveedor
 * @param agencyFeePercent          % de fee extra de la agencia
 */
export function calculateNacional(
  netCostCOP: number,
  providerCommissionPercent: number,
  agencyFeePercent: number
): QuoteCalculationNacional {
  const commissionAmountCOP = Math.round(netCostCOP * (providerCommissionPercent / 100));
  const agencyFeeAmountCOP = Math.round(netCostCOP * (agencyFeePercent / 100));
  
  const pvpCOP = netCostCOP;
  const precioClienteCOP = netCostCOP + agencyFeeAmountCOP;
  const utilidadCOP = commissionAmountCOP + agencyFeeAmountCOP;

  return {
    type: "nacional",
    netCostCOP,
    providerCommissionPercent,
    commissionAmountCOP,
    agencyFeePercent,
    agencyFeeAmountCOP,
    pvpCOP,
    precioClienteCOP,
    utilidadCOP,
  };
}

/**
 * Función unificada — selecciona la lógica según tipo de destino.
 */
export function calculateQuote(
  destinationType: "nacional" | "internacional",
  opts: {
    netCostUSD?: number;
    netCostCOP?: number;
    providerCommissionPercent: number;
    agencyFeePercent: number;
    trm?: number;
  }
): QuoteCalculation {
  if (destinationType === "nacional") {
    return calculateNacional(
      opts.netCostCOP ?? 0,
      opts.providerCommissionPercent,
      opts.agencyFeePercent
    );
  }
  return calculateInternacional(
    opts.netCostUSD ?? 0,
    opts.providerCommissionPercent,
    opts.agencyFeePercent,
    opts.trm ?? 4200
  );
}
