"use server";

import * as dal from "@/lib/dal/quotes";
import { Quote } from "@/features/quotes/schemas/quote-schema";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function upsertQuote(quote: Partial<Quote> & { id?: string; transactionId?: string }) {
    // Validations, mutation and cache revalidation happen in the DAL.
    const result = await dal.upsertQuote(quote);
    return result;
}

export async function getQuotes(limit = 100) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id ?? "";
    return dal.getQuotes(limit, userId);
}

export async function deleteQuoteFromDb(id: string) {
    // Cache revalidation is handled inside dal.deleteQuoteFromDb.
    const result = await dal.deleteQuoteFromDb(id);
    return result;
}

export async function getQuoteById(id: string) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id ?? "";
    return dal.getQuoteById(id, userId);
}
