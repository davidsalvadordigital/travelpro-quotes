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
    notes: z.string().optional(),
    isRecommended: z.boolean().default(false)
});

/**
 * Quote Schema
 *
 * Modelo de Agencia (Comisión Cedida por Proveedor):
 * - "nacional"        → pvpCOP  - fee% = netCostCOP (pago mayorista) | +extraPercent% = precioCliente
 * - "internacional"  → pvpUSD  - fee% = netCostUSD | +extraPercent% = precioClienteUSD → ×TRM → COP
 *
 * El viajero NUNCA ve el desglose interno. Solo ve el precioCliente final.
 */
export const quoteSchema = z.object({
    // Lead / Traveler Info
    travelerName: z.string().min(1, "El nombre del viajero es requerido"),
    email: z.string().email("Correo electrónico inválido"),
    phone: z.string().optional(),

    // Trip Info
    destination: z.string().min(1, "El destino es requerido"),
    destinationImage: z.string().optional(), // Nueva URL de imagen (Storage)
    destinationType: z.enum(["nacional", "internacional"]).default("internacional"),
    departureDate: z.coerce.date({ message: "La fecha de salida es requerida" }),
    returnDate: z.coerce.date({ message: "La fecha de regreso es requerida" }),
    numberOfTravelers: z.number().int().positive().default(1),

    // Detailed Content
    sectionOrder: z.array(z.string()).default(["flights", "hotels", "itinerary", "pricing", "terms"]), // Drag & Drop Order
    flights: z.array(flightSchema).default([]),
    hotelOptions: z.array(hotelOptionSchema).default([]),
    itinerary: z.array(itineraryDaySchema).default([]),
    inclusions: z.array(z.string()).default([]),
    exclusions: z.array(z.string()).default([]),
    hotelInfo: z.string().optional(), // Retained for backwards compatibility or simple quotes
    airlineInfo: z.string().optional(), // Retained for backwards compatibility or simple quotes

    // Financials — Nacional (COP directo)
    /** PVP oficial del proveedor en COP */
    pvpCOP: z.coerce.number().nonnegative().default(0),

    // Financials — Internacional (USD + TRM)
    /** PVP oficial del proveedor en USD */
    pvpUSD: z.coerce.number().nonnegative().default(0),
    trmUsed: z.coerce.number().positive().optional(),

    // Comunes
    /** Comisión cedida por el mayorista en % (ej: 15). Se extrae del PVP. */
    feePercentage: z.coerce.number().min(0).max(100).default(15),
    /** Margen extra que la agencia suma encima del PVP (ej: 3). Invisible al cliente. Default 0. */
    extraMarginPercent: z.coerce.number().min(0).max(100).default(0),

    // Terms & Conditions
    paymentTerms: z.string().optional(),
    cancellationPolicy: z.string().optional(),
    requiredDocuments: z.string().optional(),
    legalConditions: z.string().optional(), // Retained for backwards compatibility

    // Meta
    validUntil: z.coerce.date().optional(),
    status: z.enum(["borrador", "enviada", "aprobada", "rechazada"]).default("borrador"),
});

export type Quote = z.infer<typeof quoteSchema>;
export type ItineraryDay = z.infer<typeof itineraryDaySchema>;
export type Flight = z.infer<typeof flightSchema>;
export type HotelOption = z.infer<typeof hotelOptionSchema>;
