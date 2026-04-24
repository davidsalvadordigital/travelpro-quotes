"use server";

import { z } from "zod";

/**
 * TRM (Tasa Representativa del Mercado) — Colombia
 *
 * Consulta la TRM oficial del Banco de la República
 * a través de la API pública de datos.gov.co.
 * 
 * Refactored: Next.js 16.2 "use cache" implementation.
 */

const TRM_API_URL =
    "https://www.datos.gov.co/resource/32sa-8pi3.json?$order=vigenciadesde%20DESC&$limit=1";

export interface TRMData {
    valor: number;
    fecha: string;
    fuente: string;
}

const TrmResponseSchema = z.array(
    z.object({
        valor: z.string(),
        vigenciadesde: z.string(),
    })
).min(1);

export async function fetchTRMFromAPI(): Promise<TRMData> {
    const response = await fetch(TRM_API_URL);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const parsed = TrmResponseSchema.parse(data);

    return {
        valor: parseFloat(parsed[0].valor),
        fecha: parsed[0].vigenciadesde,
        fuente: "Banco de la República (datos.gov.co)",
    };
}

async function fetchCachedTRM(): Promise<TRMData> {
    "use cache";
    return fetchTRMFromAPI();
}

/**
 * Get today's TRM with function-level cache.
 * Avoids repeated calls to the external API within the same session.
 */
export async function getTRM(): Promise<TRMData> {
    try {
        return await fetchCachedTRM();
    } catch (error) {
        console.error("Error fetching TRM:", error);
        // Fallback — not cached
        return {
            valor: 4200,
            fecha: new Date().toISOString(),
            fuente: "fallback",
        };
    }
}
