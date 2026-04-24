"use server";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { revalidateTag, revalidatePath } from "next/cache";
import * as dal from "@/lib/dal/quotes";
import { Quote } from "@/features/quotes/schemas/quote-schema";

/**
 * 🛡️ SERVER ACTIONS - QUOTES
 * Estas funciones actúan como puente seguro entre el cliente y el DAL.
 * Obtienen la sesión del usuario para inyectar el userId automáticamente.
 */

export async function upsertQuote(quote: Partial<Quote> & { id?: string; transactionId?: string }) {
    return await dal.upsertQuote(quote);
}

export async function getQuotes(limit = 100) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");
    
    return await dal.getQuotes(limit, user.id);
}

export async function getQuoteById(id: string) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");
    
    return await dal.getQuoteById(id, user.id);
}

export async function deleteQuoteFromDb(id: string) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const result = await dal.deleteQuoteFromDb(id);
    
    // 🔄 Revalidar para que desaparezca de la UI
    revalidateTag(`quotes-${user.id}`);
    revalidatePath("/dashboard");
    
    return result;
}
