/**
 * Quote Calculator — Financial Logic (TravelPro Agency Commission Model)
 *
 * MODELO DE AGENCIA (Comisión Cedida por Proveedor):
 * ─────────────────────────────────────────────────
 * El mayorista fija un PVP oficial. La agencia puede vender a ese precio
 * y retiene internamente su comisión. El cliente nunca ve el desglose.
 *
 * FÓRMULAS CANÓNICAS:
 *   comision         = pvp * (feePercent / 100)
 *   costoNeto        = pvp - comision              ← lo que se paga al mayorista
 *   extraAmount      = pvp * (extraPercent / 100)  ← margen adicional (opcional)
 *   precioCliente    = pvp + extraAmount            ← lo que paga el viajero
 *   utilidadAgencia  = comision + extraAmount       ← ganancia total
 *
 * FLUJO MULTI-MONEDA:
 *   NACIONAL:        pvpCOP  + extraPercent% → precioClienteCOP
 *   INTERNACIONAL:   pvpUSD  + extraPercent% → precioClienteUSD → ×TRM → COP
 */

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface QuoteCalculationInternacional {
  type: "internacional";
  /** PVP oficial del mayorista en USD */
  pvpUSD: number;
  /** Porcentaje de comisión cedido por el proveedor (ej. 15) */
  feePercent: number;
  /** Monto de comisión estándar en USD */
  feeAmountUSD: number;
  /** Costo neto que la agencia paga al mayorista */
  netCostUSD: number;
  /** Porcentaje de margen extra que agrega la agencia (ej. 3). Default 0. */
  extraPercent: number;
  /** Monto extra en USD */
  extraAmountUSD: number;
  /** Precio final que paga el viajero en USD */
  precioClienteUSD: number;
  /** Precio final en COP (redondeado) */
  precioClienteCOP: number;
  /** Utilidad total de la agencia en USD (fee + extra) */
  utilidadUSD: number;
  /** Utilidad total en COP (redondeada) */
  utilidadCOP: number;
  /** TRM usada para la conversión */
  trm: number;
}

export interface QuoteCalculationNacional {
  type: "nacional";
  /** PVP oficial del mayorista en COP */
  pvpCOP: number;
  /** Porcentaje de comisión cedido por el proveedor (ej. 15) */
  feePercent: number;
  /** Monto de comisión en COP */
  feeAmountCOP: number;
  /** Costo neto que la agencia paga al mayorista */
  netCostCOP: number;
  /** Porcentaje de margen extra (opcional) */
  extraPercent: number;
  /** Monto extra en COP */
  extraAmountCOP: number;
  /** Precio final que paga el viajero en COP */
  precioClienteCOP: number;
  /** Utilidad total de la agencia en COP */
  utilidadCOP: number;
}

export type QuoteCalculation =
  | QuoteCalculationInternacional
  | QuoteCalculationNacional;

// ─── Calculadoras ─────────────────────────────────────────────────────────────

/**
 * Calcula una cotización INTERNACIONAL.
 *
 * @param pvpUSD       PVP oficial del mayorista en USD
 * @param feePercent   Comisión del proveedor en % (ej. 15)
 * @param trm          TRM del día (COP por 1 USD)
 * @param extraPercent Margen adicional de la agencia en % (default 0)
 */
export function calculateInternacional(
  pvpUSD: number,
  feePercent: number,
  trm: number,
  extraPercent = 0
): QuoteCalculationInternacional {
  const feeAmountUSD = pvpUSD * (feePercent / 100);
  const netCostUSD = pvpUSD - feeAmountUSD;
  const extraAmountUSD = pvpUSD * (extraPercent / 100);
  const precioClienteUSD = pvpUSD + extraAmountUSD;
  const utilidadUSD = feeAmountUSD + extraAmountUSD;

  return {
    type: "internacional",
    pvpUSD,
    feePercent,
    feeAmountUSD,
    netCostUSD,
    extraPercent,
    extraAmountUSD,
    precioClienteUSD,
    precioClienteCOP: Math.round(precioClienteUSD * trm),
    utilidadUSD,
    utilidadCOP: Math.round(utilidadUSD * trm),
    trm,
  };
}

/**
 * Calcula una cotización NACIONAL.
 *
 * @param pvpCOP       PVP oficial del mayorista en COP
 * @param feePercent   Comisión del proveedor en % (ej. 15)
 * @param extraPercent Margen adicional de la agencia en % (default 0)
 */
export function calculateNacional(
  pvpCOP: number,
  feePercent: number,
  extraPercent = 0
): QuoteCalculationNacional {
  const feeAmountCOP = Math.round(pvpCOP * (feePercent / 100));
  const netCostCOP = pvpCOP - feeAmountCOP;
  const extraAmountCOP = Math.round(pvpCOP * (extraPercent / 100));
  const precioClienteCOP = pvpCOP + extraAmountCOP;
  const utilidadCOP = feeAmountCOP + extraAmountCOP;

  return {
    type: "nacional",
    pvpCOP,
    feePercent,
    feeAmountCOP,
    netCostCOP,
    extraPercent,
    extraAmountCOP,
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
    pvpUSD?: number;
    pvpCOP?: number;
    feePercent: number;
    extraPercent?: number;
    trm?: number;
  }
): QuoteCalculation {
  if (destinationType === "nacional") {
    return calculateNacional(
      opts.pvpCOP ?? 0,
      opts.feePercent,
      opts.extraPercent ?? 0
    );
  }
  return calculateInternacional(
    opts.pvpUSD ?? 0,
    opts.feePercent,
    opts.trm ?? 4200,
    opts.extraPercent ?? 0
  );
}
