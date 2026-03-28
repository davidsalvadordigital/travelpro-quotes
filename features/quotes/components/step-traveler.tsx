"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActiveQuote, useQuoteActions } from "@/features/quotes/store/quote-store";
import { User, Mail, Phone, Search, Loader2, Check, X } from "lucide-react";
import { searchLeads } from "@/lib/actions/leads";
import { cn } from "@/lib/utils";
import { AIExtractor } from "./ai-extractor";

interface StepTravelerProps {
    showErrors?: boolean;
}

export function StepTraveler({ showErrors = false }: StepTravelerProps) {
    const activeQuote = useActiveQuote();
    const { setQuoteField, setFullQuote } = useQuoteActions();

    // Search state
    const [searchQuery, setSearchQuery] = useState(activeQuote.travelerName || "");
    const [searchResults, setSearchResults] = useState<{ id: string; traveler_name: string; email?: string | null; phone?: string | null; destination?: string | null }[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    const nameError = showErrors && (!activeQuote.travelerName || activeQuote.travelerName.trim() === "");
    const emailError = showErrors && (!activeQuote.email || activeQuote.email.trim() === "");

    // Click outside handler
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Intelligent Lookup Logic
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length >= 3 && showDropdown) {
                setIsSearching(true);
                setHasSearched(true);
                try {
                    const results = await searchLeads(searchQuery);
                    setSearchResults(results);
                } catch (error) {
                    console.error("Search failed", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
                setHasSearched(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, showDropdown]);

    const handleSelectLead = (lead: { traveler_name: string; email?: string | null; phone?: string | null; destination?: string | null }) => {
        setFullQuote({
            travelerName: lead.traveler_name,
            email: lead.email || "",
            phone: lead.phone || "",
            destination: lead.destination || activeQuote.destination
        });
        setSearchQuery(lead.traveler_name);
        setShowDropdown(false);
        setHasSearched(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contenedor Izquierdo: Formulario Manual */}
            <div className="space-y-10">
                <div className="space-y-4 relative animate-slide-up" ref={dropdownRef}>
                    <Label
                        htmlFor="travelerName"
                        className={cn(
                            "flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] ml-1",
                            nameError ? "text-destructive" : "text-muted-foreground/60"
                        )}
                    >
                        <User className={cn("h-4 w-4", nameError ? "text-destructive" : "text-brand-primary")} strokeWidth={3} />
                        Nombre Completo del Cliente
                    </Label>
                    <div className="relative group">
                        <Input
                            data-testid="quote-traveler-name"
                            id="travelerName"
                            placeholder="Busca por nombre o correo..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setQuoteField("travelerName", e.target.value);
                                setShowDropdown(true);
                            }}
                            onFocus={() => setShowDropdown(true)}
                            className={cn(
                                "h-14 pl-12 rounded-2xl border-2 border-glass-border bg-background/50 text-base font-medium transition-all duration-300 focus-visible:ring-8 focus-visible:ring-brand-primary/5 focus-visible:border-brand-primary/40 focus-visible:bg-background",
                                nameError && "border-destructive/40 bg-destructive/5 focus-visible:border-destructive focus-visible:ring-destructive/10"
                            )}
                        />
                        <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 group-focus-within:text-brand-primary transition-all duration-300" strokeWidth={2.5} />

                        {/* Floating Search Results (Combobox) - Estética Glass */}
                        {showDropdown && (isSearching || (hasSearched && searchQuery.length >= 3)) && (
                            <div className="absolute z-50 w-full mt-3 bg-glass backdrop-blur-2xl border border-glass-border shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-[1.5rem] overflow-hidden animate-scale-in">
                                {isSearching ? (
                                    <div className="p-8 text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex flex-col items-center gap-3">
                                        <Loader2 className="h-5 w-5 animate-spin text-brand-secondary" />
                                        Sincronizando base de datos...
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <div className="max-h-72 overflow-y-auto">
                                        <div className="p-3 border-b border-glass-border bg-muted/20 flex justify-between items-center">
                                            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground px-2">Registros Encontrados</p>
                                            <button onClick={() => setShowDropdown(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                        {searchResults.map((lead) => (
                                            <button
                                                key={lead.id}
                                                onClick={() => handleSelectLead(lead)}
                                                className="w-full text-left px-5 py-4 hover:bg-brand-secondary/5 transition-all flex items-center justify-between group border-b border-glass-border last:border-0"
                                            >
                                                <div>
                                                    <p className="text-sm font-extrabold group-hover:text-brand-secondary transition-colors">{lead.traveler_name}</p>
                                                    <p className="text-[11px] font-medium text-muted-foreground/70">{lead.email || 'Sin correo registrado'} • {lead.destination || 'Sin histórico'}</p>
                                                </div>
                                                <Check className="h-4 w-4 text-brand-secondary opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-110" />
                                            </button>
                                        ))}
                                    </div>
                                ) : hasSearched && searchQuery.length >= 3 ? (
                                    <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                                        <p className="font-semibold">Sin coincidencias estratégicas.</p>
                                        <button
                                            onClick={() => setShowDropdown(false)}
                                            className="text-[10px] font-extrabold uppercase tracking-widest text-brand-secondary hover:underline"
                                        >
                                            Continuar como nuevo registro
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>
                    {nameError && (
                        <p className="text-[11px] font-bold text-destructive animate-fade-in ml-1">
                            El nombre es vital para la personalización.
                        </p>
                    )}
                </div>

                <div className="space-y-8 animate-slide-up [animation-delay:200ms]">
                    {/* Correo Electrónico */}
                    <div className="space-y-4">
                        <Label
                            htmlFor="email"
                            className={cn(
                                "flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] ml-1",
                                emailError ? "text-destructive" : "text-muted-foreground/60"
                            )}
                        >
                            <Mail className={cn("h-4 w-4", emailError ? "text-destructive" : "text-brand-primary")} strokeWidth={3} />
                            Canal de Comunicación
                        </Label>
                        <Input
                            data-testid="quote-traveler-email"
                            id="email"
                            type="email"
                            placeholder="viajero@empresa.com"
                            value={activeQuote.email || ""}
                            onChange={(e) => setQuoteField("email", e.target.value)}
                            className={cn(
                                "h-14 rounded-2xl border-2 border-glass-border bg-background/50 text-base font-medium transition-all duration-300 focus-visible:ring-8 focus-visible:ring-brand-primary/5 focus-visible:border-brand-primary/40 focus-visible:bg-background",
                                emailError && "border-destructive/40 bg-destructive/5 focus-visible:border-destructive focus-visible:ring-destructive/10"
                            )}
                        />
                        {emailError && (
                            <p className="text-[11px] font-bold text-destructive animate-fade-in ml-1">
                                Ingresa una dirección válida.
                            </p>
                        )}
                    </div>

                    {/* Teléfono y Número de Viajeros */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <Label htmlFor="phone" className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground/60">
                                <Phone className="h-4 w-4 text-brand-primary" strokeWidth={3} />
                                Línea Directa
                            </Label>
                            <Input
                                data-testid="quote-traveler-phone"
                                id="phone"
                                type="tel"
                                placeholder="+57 300 000 0000"
                                value={activeQuote.phone || ""}
                                onChange={(e) => setQuoteField("phone", e.target.value)}
                                className="h-14 rounded-2xl border-2 border-glass-border bg-background/50 text-base font-medium transition-all duration-300 focus-visible:ring-8 focus-visible:ring-brand-primary/5 focus-visible:border-brand-primary/40 focus-visible:bg-background"
                            />
                        </div>
                        <div className="space-y-4">
                            <Label htmlFor="numberOfTravelers" className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground/60">
                                Volumen
                            </Label>
                            <Input
                                data-testid="quote-traveler-count"
                                id="numberOfTravelers"
                                type="number"
                                min={1}
                                value={activeQuote.numberOfTravelers || 1}
                                onChange={(e) => setQuoteField("numberOfTravelers", parseInt(e.target.value) || 1)}
                                className="h-14 rounded-2xl border-2 border-glass-border bg-background/50 text-base font-black transition-all duration-300 focus-visible:ring-8 focus-visible:ring-brand-primary/5 focus-visible:border-brand-primary/40 focus-visible:bg-background italic"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenedor Derecho: AI Extractor - Animación escalonada */}
            <div className="h-full flex flex-col justify-start animate-slide-up [animation-delay:300ms]">
                <AIExtractor />
            </div>
        </div>
    );
}
