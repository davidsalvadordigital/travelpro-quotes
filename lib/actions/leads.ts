"use server";

import * as dal from "@/lib/dal/leads";
import { leadSchema, LeadFormData } from "@/features/leads/schemas/lead-schema";
import type { LeadInsert } from "@/lib/dal/leads";

export async function searchLeads(query: string) {
    return dal.searchLeads(query);
}

export async function createLead(lead: LeadFormData) {
    // Validación Zod: guard clause antes de el DAL
    const parsed = leadSchema.safeParse(lead);
    if (!parsed.success) {
        return { error: parsed.error.flatten().fieldErrors };
    }

    // Mapping camelCase (form) → snake_case (DAL/DB)
    const dbLead: Omit<LeadInsert, "created_by" | "agency_id"> = {
        traveler_name: parsed.data.travelerName,
        email: parsed.data.email ?? null,
        phone: parsed.data.phone ?? null,
        destination: parsed.data.destination,
        status: parsed.data.status,
        notes: parsed.data.notes ?? null,
        transaction_id: (lead as any).transactionId ?? null,
    };

    const result = await dal.createLead(dbLead as LeadInsert);
    return result;
}

export async function updateLead(id: string, updates: Partial<LeadFormData>) {
    // Map only sent fields (partial update)
    const dbUpdates: Partial<LeadInsert> = {};
    if (updates.travelerName !== undefined) dbUpdates.traveler_name = updates.travelerName;
    if (updates.email !== undefined) dbUpdates.email = updates.email ?? null;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone ?? null;
    if (updates.destination !== undefined) dbUpdates.destination = updates.destination;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes ?? null;

    const result = await dal.updateLead(id, dbUpdates);
    return result;
}

export async function deleteLead(id: string) {
    const result = await dal.deleteLead(id);
    return result;
}

