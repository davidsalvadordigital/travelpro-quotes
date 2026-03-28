"use client";
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { Quote } from '@/features/quotes/schemas/quote-schema';
import { upsertQuote, getQuotes, deleteQuoteFromDb } from '@/lib/actions/quotes';
import { toast } from 'sonner';

type SavedQuote = Partial<Quote> & { id: string; savedAt: string };

interface QuoteState {
    activeQuote: Partial<Quote> & { id?: string; savedAt?: string };
    isDirty: boolean;
    savedQuotes: SavedQuote[];
    isLoading: boolean;
    isSyncing: boolean;

    setQuoteField: <T extends keyof Quote>(field: T, value: Quote[T]) => void;
    setSectionOrder: (order: string[]) => void;
    /** Cambia el tipo de destino y limpia los campos financieros del tipo anterior */
    setDestinationType: (type: "nacional" | "internacional") => void;
    updateItineraryDay: (index: number, day: NonNullable<Quote["itinerary"]>[number]) => void;
    addItineraryDay: () => void;
    removeItineraryDay: (index: number) => void;
    
    // Flights helpers
    addFlight: () => void;
    removeFlight: (index: number) => void;
    updateFlight: (index: number, flight: NonNullable<Quote["flights"]>[number]) => void;

    // Hotels helpers
    addHotelOption: () => void;
    removeHotelOption: (index: number) => void;
    updateHotelOption: (index: number, hotel: NonNullable<Quote["hotelOptions"]>[number]) => void;

    resetQuote: () => void;
    setFullQuote: (quote: Partial<Quote>) => void;
    saveQuote: () => void;
    loadQuote: (id: string) => void;
    deleteQuote: (id: string) => void;

    // ── Supabase Sync ────────────────────────────────────────────────
    syncToSupabase: () => Promise<void>;
    loadQuotesFromSupabase: () => Promise<void>;
    deleteQuoteWithSync: (id: string) => Promise<void>;
}

const initialQuote: Partial<Quote> = {
    travelerName: '',
    email: '',
    numberOfTravelers: 1,
    destinationType: 'internacional',
    itinerary: [],
    inclusions: [],
    exclusions: [],
    netCostUSD: 0,
    netCostCOP: 0,
    feePercentage: 15,
    status: 'borrador',
    sectionOrder: ['flights', 'hotelOptions', 'itinerary', 'pricing', 'terms'],
};

export const useQuoteStore = create<QuoteState>()(
    persist(
        (set, get) => ({
            activeQuote: { ...initialQuote },
            isDirty: false,
            savedQuotes: [],
            isLoading: false,
            isSyncing: false,

            setQuoteField: (field, value) =>
                set((state) => ({
                    activeQuote: { ...state.activeQuote, [field]: value },
                    isDirty: true,
                })),

            setSectionOrder: (order) =>
                set((state) => ({
                    activeQuote: { ...state.activeQuote, sectionOrder: order },
                    isDirty: true,
                })),

            setDestinationType: (type) =>
                set((state) => ({
                    activeQuote: {
                        ...state.activeQuote,
                        destinationType: type,
                        ...(type === 'nacional'
                            ? { netCostUSD: 0, trmUsed: undefined }
                            : { netCostCOP: 0 }),
                    },
                    isDirty: true,
                })),

            updateItineraryDay: (index, day) =>
                set((state) => {
                    const newItinerary = [...(state.activeQuote.itinerary || [])];
                    newItinerary[index] = day;
                    return {
                        activeQuote: { ...state.activeQuote, itinerary: newItinerary },
                        isDirty: true,
                    };
                }),

            addItineraryDay: () =>
                set((state) => ({
                    activeQuote: {
                        ...state.activeQuote,
                        itinerary: [
                            ...(state.activeQuote.itinerary || []),
                            {
                                day: (state.activeQuote.itinerary?.length || 0) + 1,
                                title: '',
                                description: '',
                                activities: [],
                            },
                        ],
                    },
                    isDirty: true,
                })),

            removeItineraryDay: (index) =>
                set((state) => ({
                    activeQuote: {
                        ...state.activeQuote,
                        itinerary: (state.activeQuote.itinerary || []).filter((_, i) => i !== index),
                    },
                    isDirty: true,
                })),

            // Flights Implementation
            addFlight: () =>
                set((state) => ({
                    activeQuote: {
                        ...state.activeQuote,
                        flights: [
                            ...(state.activeQuote.flights || []),
                            {
                                date: new Date(),
                                origin: "",
                                destination: "",
                                airline: "",
                                departureTime: "",
                                arrivalTime: "",
                            },
                        ],
                    },
                    isDirty: true,
                })),

            removeFlight: (index) =>
                set((state) => ({
                    activeQuote: {
                        ...state.activeQuote,
                        flights: (state.activeQuote.flights || []).filter((_, i) => i !== index),
                    },
                    isDirty: true,
                })),

            updateFlight: (index, flight) =>
                set((state) => {
                    const newFlights = [...(state.activeQuote.flights || [])];
                    newFlights[index] = flight;
                    return {
                        activeQuote: { ...state.activeQuote, flights: newFlights },
                        isDirty: true,
                    };
                }),

            // Hotels Implementation
            addHotelOption: () =>
                set((state) => ({
                    activeQuote: {
                        ...state.activeQuote,
                        hotelOptions: [
                            ...(state.activeQuote.hotelOptions || []),
                            {
                                location: "",
                                name: "",
                                category: "",
                                roomType: "",
                                price: 0,
                                isCOP: false,
                                isRecommended: false,
                            },
                        ],
                    },
                    isDirty: true,
                })),

            removeHotelOption: (index) =>
                set((state) => ({
                    activeQuote: {
                        ...state.activeQuote,
                        hotelOptions: (state.activeQuote.hotelOptions || []).filter((_, i) => i !== index),
                    },
                    isDirty: true,
                })),

            updateHotelOption: (index, hotel) =>
                set((state) => {
                    const newHotels = [...(state.activeQuote.hotelOptions || [])];
                    newHotels[index] = hotel;
                    return {
                        activeQuote: { ...state.activeQuote, hotelOptions: newHotels },
                        isDirty: true,
                    };
                }),

            resetQuote: () => set({ activeQuote: { ...initialQuote }, isDirty: false }),

            /** 🚀 Atomic update for the entire quote - used by AI Extractor */
            setFullQuote: (quote: Partial<Quote>) =>
                set((state) => ({
                    activeQuote: { ...state.activeQuote, ...quote },
                    isDirty: true,
                })),

            // ── Local Save (kept for offline-first) ──────────────────────

            saveQuote: () =>
                set((state) => {
                    const existingId = (state.activeQuote as { id?: string }).id as string | undefined;
                    const id = existingId || `quote-${Date.now()}`;
                    const savedAt = new Date().toISOString();
                    const saved: SavedQuote = { ...state.activeQuote, id, savedAt };

                    const existingIdx = state.savedQuotes.findIndex((q) => q.id === id);
                    const savedQuotes =
                        existingIdx >= 0
                            ? state.savedQuotes.map((q, i) => (i === existingIdx ? saved : q))
                            : [saved, ...state.savedQuotes];

                    return { savedQuotes, activeQuote: saved, isDirty: false };
                }),

            loadQuote: (id) =>
                set((state) => {
                    const quote = state.savedQuotes.find((q) => q.id === id);
                    return quote ? { activeQuote: quote, isDirty: false } : {};
                }),

            deleteQuote: (id) =>
                set((state) => ({
                    savedQuotes: state.savedQuotes.filter((q) => q.id !== id),
                })),

            // ── Supabase Sync Methods ────────────────────────────────────

            syncToSupabase: async () => {
                const state = get();
                if (state.isSyncing) return;

                set({ isSyncing: true });

                try {
                    const result = await upsertQuote(state.activeQuote);

                    // Update local state with the DB-generated ID
                    set((s) => {
                        const updatedQuote = { ...s.activeQuote, id: result.id, savedAt: result.savedAt };
                        const existingIdx = s.savedQuotes.findIndex((q) => q.id === result.id);
                        const savedQuotes =
                            existingIdx >= 0
                                ? s.savedQuotes.map((q, i) =>
                                    i === existingIdx ? (updatedQuote as SavedQuote) : q
                                )
                                : [updatedQuote as SavedQuote, ...s.savedQuotes];

                        return {
                            activeQuote: updatedQuote,
                            savedQuotes,
                            isDirty: false,
                            isSyncing: false,
                        };
                    });

                    toast.success("Cotización guardada en la nube ☁️", {
                        description: "Los datos se han sincronizado con Supabase.",
                    });
                } catch (error) {
                    set({ isSyncing: false });
                    const message = error instanceof Error ? error.message : "Error desconocido";

                    if (message === "duplicate_transaction") {
                        toast.warning("Operación ignorada", {
                            description: "Esta cotización ya fue procesada previamente.",
                        });
                    } else {
                        toast.error("Error al sincronizar con Supabase", {
                            description: message,
                        });
                    }
                }
            },

            loadQuotesFromSupabase: async () => {
                set({ isLoading: true });

                try {
                    const quotes = await getQuotes();
                    set({
                        savedQuotes: quotes as SavedQuote[],
                        isLoading: false,
                    });
                } catch (error) {
                    set({ isLoading: false });
                    console.error("Error loading quotes from Supabase:", error);
                }
            },

            deleteQuoteWithSync: async (id: string) => {
                const state = get();
                const quote = state.savedQuotes.find((q) => q.id === id);
                const name = quote?.travelerName || "Sin nombre";

                // Optimistic: remove locally first
                set((s) => ({
                    savedQuotes: s.savedQuotes.filter((q) => q.id !== id),
                }));

                try {
                    await deleteQuoteFromDb(id);
                    toast.success("Borrador eliminado ☁️", {
                        description: `Cotización de ${name} eliminada de la nube.`,
                    });
                } catch {
                    // Rollback: restore locally
                    if (quote) {
                        set((s) => ({
                            savedQuotes: [quote as SavedQuote, ...s.savedQuotes],
                        }));
                    }
                    toast.error("Error al eliminar", {
                        description: "No se pudo eliminar de Supabase.",
                    });
                }
            },
        }),
        { name: 'quote-draft-storage' }
    )
);

// ── Fine-grained Selectors ──────────────────────────────────────────────
// Use these instead of `useQuoteStore()` to avoid full-page re-renders.

/** Active quote data only — used by form step components */
export const useActiveQuote = () => useQuoteStore((s) => s.activeQuote);

/** Single field selector — ultra-precise for individual inputs */
export const useQuoteField = <T extends keyof Quote>(field: T) =>
    useQuoteStore((s) => s.activeQuote[field] as Quote[T] | undefined);

/** Dirty flag — used for save button state */
export const useIsDirty = () => useQuoteStore((s) => s.isDirty);

/** Saved quotes list — used by drafts-list component */
export const useSavedQuotes = () => useQuoteStore((s) => s.savedQuotes);

/** Loading/syncing flags — used for UI indicators */
export const useIsLoading = () => useQuoteStore((s) => s.isLoading);
export const useIsSyncing = () => useQuoteStore((s) => s.isSyncing);

/** Actions-only selector — never triggers re-renders */
export const useQuoteActions = () =>
    useQuoteStore(
        useShallow((s) => ({
            setQuoteField: s.setQuoteField,
            setSectionOrder: s.setSectionOrder,
            setDestinationType: s.setDestinationType,
            updateItineraryDay: s.updateItineraryDay,
            addItineraryDay: s.addItineraryDay,
            removeItineraryDay: s.removeItineraryDay,
            resetQuote: s.resetQuote,
            setFullQuote: s.setFullQuote,
            addFlight: s.addFlight,
            removeFlight: s.removeFlight,
            updateFlight: s.updateFlight,
            addHotelOption: s.addHotelOption,
            removeHotelOption: s.removeHotelOption,
            updateHotelOption: s.updateHotelOption,
            saveQuote: s.saveQuote,
            loadQuote: s.loadQuote,
            deleteQuote: s.deleteQuote,
            syncToSupabase: s.syncToSupabase,
            loadQuotesFromSupabase: s.loadQuotesFromSupabase,
            deleteQuoteWithSync: s.deleteQuoteWithSync,
        }))
    );
