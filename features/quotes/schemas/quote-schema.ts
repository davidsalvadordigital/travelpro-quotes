import { z } from "zod";

export const itineraryDaySchema = z.object({
    day: z.number(),
    title: z.string().min(1, "El título del día es requerido"),
    description: z.string().min(1, "La descripción es requerida"),
    activities: z.array(z.string()).default([]),
    image: z.string().optional(),
});

export const flightSchema = z.object({
    date: z.coerce.date({ message: "La fecha del vuelo es requerida" }),
    origin: z.string().min(1, "Origen requerido (ej. BOG)"),
    destination: z.string().min(1, "Destino requerido (ej. LIM)"),
    airline: z.string().min(1, "La aerolínea es requerida"),
    flightNumber: z.string().optional(),
    departureTime: z.string().min(1, "Hora de salida requerida"),
    arrivalTime: z.string().min(1, "Hora de llegada requerida")
});

export const hotelOptionSchema = z.object({
    location: z.string().min(1, "El destino es requerido (ej. Lima, Cuzco)"),
    name: z.string().min(1, "El nombre del hotel es requerido"),
    category: z.string().min(1, "La categoría es requerida (ej. Turista, Lujo)"),
    roomType: z.string().min(1, "Tipo de habitación (ej. Junior Suite)"),
    price: z.coerce.number().nonnegative(),
    isCOP: z.boolean().default(false),
    status: z.string().optional(),
    notes: z.string().optional(),
    isRecommended: z.boolean().default(false)
});

/**
 * Esquema Base para campos comunes
 */
export const baseQuoteSchema = z.object({
    // Lead / Traveler Info
    travelerName: z.string().min(1, "El nombre del viajero es requerido"),
    email: z.string().email("Correo electrónico inválido"),
    phone: z.string().optional(),

    // Trip Info
    destination: z.string().min(1, "El destino es requerido"),
    destinationImage: z.string().optional(), 
    departureDate: z.coerce.date({ message: "La fecha de salida es requerida" }),
    returnDate: z.coerce.date({ message: "La fecha de regreso es requerida" }),
    numberOfTravelers: z.number().int().positive().default(1),

    // Detailed Content
    sectionOrder: z.array(z.string()).default(["flights", "hotels", "itinerary", "pricing", "terms"]),
    flights: z.array(flightSchema).default([]),
    hotelOptions: z.array(hotelOptionSchema).default([]),
    itinerary: z.array(itineraryDaySchema).default([]),
    inclusions: z.array(z.string()).default([]),
    exclusions: z.array(z.string()).default([]),
    
    // Config Común de Comisiones
    /** Comisión que el proveedor nos asigna en % (ej: 10) */
    providerCommissionPercent: z.coerce.number().min(0).max(100).default(10),
    /** Fee adicional que nuestra agencia cobra en % (ej: 5) */
    agencyFeePercent: z.coerce.number().min(0).max(100).default(5),

    // Terms & Conditions
    paymentTerms: z.string().optional(),
    cancellationPolicy: z.string().optional(),
    requiredDocuments: z.string().optional(),
    legalConditions: z.string().optional(),

    // Meta
    validUntil: z.coerce.date().optional(),
    status: z.enum(["borrador", "enviada", "aprobada", "rechazada"]).default("borrador"),
    locatorCode: z.string().optional(),
});

/**
 * Quote Schema — Unión Discriminada (Diamond Standard)
 *
 * Modelo de Costo Neto:
 * - El asesor ingresa el costo que le da el mayorista.
 * - Se suma la comisión pactada y el fee de la agencia.
 */
export const quoteSchema = z.discriminatedUnion("destinationType", [
    // Opción NACIONAL
    baseQuoteSchema.extend({
        destinationType: z.literal("nacional"),
        /** Costo neto del proveedor en COP (por persona) */
        netCostCOP: z.coerce.number().nonnegative().default(0),
        // Campos excluidos en nacional
        netCostUSD: z.undefined().optional(),
        trmUsed: z.undefined().optional(),
    }),
    // Opción INTERNACIONAL
    baseQuoteSchema.extend({
        destinationType: z.literal("internacional"),
        /** Costo neto del proveedor en USD (por persona) */
        netCostUSD: z.coerce.number().nonnegative().default(0),
        /** TRM capturada para la conversión a COP */
        trmUsed: z.coerce.number().positive().default(4200),
        // Campos excluidos en internacional
        netCostCOP: z.undefined().optional(),
    })
]);

export type Quote = z.infer<typeof quoteSchema>;
export type ItineraryDay = z.infer<typeof itineraryDaySchema>;
export type Flight = z.infer<typeof flightSchema>;
export type HotelOption = z.infer<typeof hotelOptionSchema>;

