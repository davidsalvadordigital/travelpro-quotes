"use client";
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { Quote } from '@/features/quotes/schemas/quote-schema';
import { quoteService } from '@/features/quotes/services/quote-service';
import { calculateQuote } from '@/features/quotes/utils/calculator';
import { toast } from 'sonner';

type SavedQuote = Partial<Quote> & { id: string; savedAt: string };

interface QuoteState {
    activeQuote: Partial<Quote> & { id?: string; savedAt?: string };
    isDirty: boolean;
    savedQuotes: SavedQuote[];
    isLoading: boolean;
    isSyncing: boolean;
    currentStep: number;
    userId: string | null;
    _hasHydrated: boolean;

    setHasHydrated: (state: boolean) => void;

    setQuoteField: <T extends keyof Quote>(field: T, value: Quote[T]) => void;
    setUserId: (userId: string | null) => void;
    setCurrentStep: (step: number) => void;
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
    netCostCOP: undefined,
    providerCommissionPercent: 10,
    agencyFeePercent: 5,
    trmUsed: 4200,
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
            currentStep: 0,
            userId: null,
            _hasHydrated: false,

            setHasHydrated: (state) => set({ _hasHydrated: state }),

            setQuoteField: (field, value) =>
                set((state) => ({
                    activeQuote: { ...state.activeQuote, [field]: value },
                    isDirty: true,
                })),

            setUserId: (userId) => {
                const currentUserId = get().userId;
                // SOLO reseteamos si ya había un usuario y el nuevo es distinto (cambio de cuenta)
                // Si currentUserId es null, es la carga inicial y no debemos tocar el progreso.
                if (currentUserId && userId && userId !== currentUserId) {
                    set({ activeQuote: { ...initialQuote }, userId, isDirty: false, currentStep: 0 });
                } else {
                    set({ userId });
                }
            },

            setCurrentStep: (step) =>
                set({ currentStep: step }),

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
                            ? { netCostUSD: undefined, trmUsed: undefined, netCostCOP: (state.activeQuote as any).netCostCOP || 0 }
                            : { netCostCOP: undefined, netCostUSD: (state.activeQuote as any).netCostUSD || 0, trmUsed: state.activeQuote.trmUsed || 4200 }),
                    } as Quote,
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
                                status: "Sujeto a Confirmar",
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
                    activeQuote: { ...state.activeQuote, ...quote } as any,
                    isDirty: true,
                })),

            // ── Local Save (kept for offline-first) ──────────────────────

            saveQuote: () =>
                set((state) => {
                    let id = (state.activeQuote as { id?: string }).id as string | undefined;
                    // Supabase requires UUIDs, not custom strings
                    if (!id || !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)) {
                        id = crypto.randomUUID();
                    }
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
                    // 🛡️ Pre-emptive UUID validation for legacy drafts stuck in LocalStorage
                    const payload = { ...state.activeQuote };
                    if (payload.id && !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(payload.id)) {
                        console.warn(`Sanitizing legacy ID format (${payload.id}) to valid UUID...`);
                        payload.id = crypto.randomUUID();
                    }

                    const result = await quoteService.save(payload);

                    // Update local state with the DB-generated ID
                    set((s) => {
                        const updatedQuote = { ...s.activeQuote, id: result.id, savedAt: (result as any).savedAt };
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
                    const quotes = await quoteService.getAll();
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
                    await quoteService.delete(id);
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
        { 
            name: 'quote-draft-storage',
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
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
export const useHasHydrated = () => useQuoteStore((s) => s._hasHydrated);

/** Actions-only selector — never triggers re-renders */
export const useQuoteActions = () =>
    useQuoteStore(
        useShallow((s) => ({
            setQuoteField: s.setQuoteField,
            setUserId: s.setUserId,
            setCurrentStep: s.setCurrentStep,
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

// ── Quote Wizard Hook (Orchestrator) ──────────────────────────────────

/**
 * Custom Hook to handle the Quote Wizard logic.
 * Integrates the Store with real-time financial calculations.
 */
export function useQuoteWizard() {
    const activeQuote = useActiveQuote();
    const actions = useQuoteActions();
    const currentStep = useQuoteStore((s) => s.currentStep);

    // Real-time calculation based on the current state of the active quote
    const totals = calculateQuote(
        activeQuote.destinationType || "internacional",
        {
            netCostUSD: activeQuote.netCostUSD,
            netCostCOP: activeQuote.netCostCOP,
            providerCommissionPercent: activeQuote.providerCommissionPercent || 10,
            agencyFeePercent: activeQuote.agencyFeePercent || 5,
            trm: activeQuote.trmUsed || 4200,
        }
    );

    return {
        quote: activeQuote,
        totals,
        currentStep,
        actions,
    };
}
