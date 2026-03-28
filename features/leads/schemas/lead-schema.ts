/**
 * Lead Schema — Zod v4
 *
 * Validation schema for lead/prospect data.
 *
 * TODO (Phase 2): Expand with all lead fields
 */

import { z } from "zod";

export const leadSchema = z.object({
    travelerName: z.string().min(1, { message: "El nombre es requerido" }),
    phone: z.string().optional(),
    email: z.string().email({ message: "Email inválido" }).optional(),
    destination: z.string().min(1, { message: "El destino es requerido" }),
    status: z.enum(["nuevo", "cotizado", "ganado", "perdido"]).default("nuevo"),
    notes: z.string().optional(),
});

export type LeadFormData = z.infer<typeof leadSchema>;
