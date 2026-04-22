import { Quote } from "../schemas/quote-schema";
import { upsertQuote, getQuotes, deleteQuoteFromDb, getQuoteById } from "@/lib/actions/quotes";

/**
 * Frontend Service for Quotes
 * Acts as a bridge between the Zustand Store and the Server Actions (DAL).
 */
export const quoteService = {
    /**
     * Saves or updates a quote in the database.
     */
    async save(quote: Partial<Quote> & { id?: string; transactionId?: string }) {
        return await upsertQuote(quote);
    },

    /**
     * Fetches all quotes for the current user.
     */
    async getAll() {
        return await getQuotes();
    },

    /**
     * Fetches a single quote by ID.
     */
    async getById(id: string) {
        return await getQuoteById(id);
    },

    /**
     * Deletes a quote from the database.
     */
    async delete(id: string) {
        return await deleteQuoteFromDb(id);
    }
};
