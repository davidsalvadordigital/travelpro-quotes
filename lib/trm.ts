/**
 * TRM (Tasa Representativa del Mercado) — Colombia
 *
 * Consulta la TRM oficial del Banco de la República
 * a través de la API pública de datos.gov.co.
 *
 * In-memory cache with 1-hour TTL to avoid repeated
 * external API calls during the same session.
 */

const TRM_API_URL =
    "https://www.datos.gov.co/resource/32sa-8pi3.json?$order=vigenciadesde%20DESC&$limit=1";

export interface TRMData {
    valor: number;
    fecha: string;
    fuente: string;
}

// ── In-Memory Session Cache ─────────────────────────────────────────────

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

let _cachedTRM: TRMData | null = null;
let _cachedAt = 0;

/**
 * Get today's TRM with 1-hour in-memory cache.
 * Avoids repeated calls to the external API within the same session.
 *
 * Cache saves ~200-400ms per subsequent call.
 */
export async function getTRM(): Promise<TRMData> {
    // Return cached value if still valid
    if (_cachedTRM && Date.now() - _cachedAt < CACHE_TTL_MS) {
        return _cachedTRM;
    }

    try {
        const response = await fetch(TRM_API_URL);
        const data = await response.json();

        if (data && data.length > 0) {
            _cachedTRM = {
                valor: parseFloat(data[0].valor),
                fecha: data[0].vigenciadesde,
                fuente: "Banco de la República (datos.gov.co)",
            };
            _cachedAt = Date.now();
            return _cachedTRM;
        }
    } catch (error) {
        console.error("Error fetching TRM:", error);
    }

    // Fallback — also cached to avoid repeated failures
    const fallback: TRMData = {
        valor: 4200,
        fecha: new Date().toISOString(),
        fuente: "fallback",
    };
    _cachedTRM = fallback;
    _cachedAt = Date.now();
    return fallback;
}

/**
 * Force-refresh the TRM cache (for admin use or manual refresh).
 */
export function invalidateTRMCache() {
    _cachedTRM = null;
    _cachedAt = 0;
}
