"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActiveQuote, useQuoteActions } from "@/features/quotes/store/quote-store";
import { User, Mail, Phone, Search, Loader2, Check, X, MapPin, CalendarDays, Globe, Home } from "lucide-react";
import { searchLeads } from "@/lib/actions/leads";
import { cn } from "@/lib/utils";
import { AIExtractor } from "./ai-extractor";
import { ImageUploader } from "@/features/quotes/components/image-uploader";

interface StepTravelerProps {
    showErrors?: boolean;
}

export function StepTraveler({ showErrors = false }: StepTravelerProps) {
    const activeQuote = useActiveQuote();
    const { setQuoteField, setFullQuote, setDestinationType } = useQuoteActions();

    // Viajero Search State
    const [searchQuery, setSearchQuery] = useState(activeQuote.travelerName || "");
    const [searchResults, setSearchResults] = useState<{ id: string; traveler_name: string; email?: string | null; phone?: string | null; destination?: string | null }[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    // Validadors
    const nameError = showErrors && (!activeQuote.travelerName || activeQuote.travelerName.trim() === "");
    const emailError = showErrors && (!activeQuote.email || activeQuote.email.trim() === "");
    const destinationError = showErrors && (!activeQuote.destination || activeQuote.destination.trim() === "");
    const departureError = showErrors && !activeQuote.departureDate;
    const returnError = showErrors && !activeQuote.returnDate;

    // Destino State
    const isNacional = activeQuote.destinationType === "nacional";

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
            destination: lead.destination || activeQuote.destination,
        });
        setSearchQuery(lead.traveler_name);
        setShowDropdown(false);
        setHasSearched(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            {/* Contenedor Izquierdo: Combina Viajero y Estructura Base del Destino */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-12 pb-8">

                {/* 1. SECCIÓN VIAJERO */}
                <div className="space-y-8 relative">
                    <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                        <div className="h-6 w-6 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                            <User className="h-3.5 w-3.5 text-brand-primary" strokeWidth={3} />
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Perfil del Cliente</h4>
                    </div>

                    <div className="space-y-4 animate-slide-up" ref={dropdownRef}>
                        <Label
                            htmlFor="travelerName"
                            className={cn(
                                "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ml-0.5",
                                nameError ? "text-destructive" : "text-muted-foreground/60"
                            )}
                        >
                            Nombre Completo
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
                                    "h-10 pl-10 rounded-xl border border-border/60 bg-background/50 text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary/40 focus-visible:bg-background",
                                    nameError && "border-destructive/40 bg-destructive/5 focus-visible:border-destructive focus-visible:ring-destructive/10"
                                )}
                            />
                            <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 group-focus-within:text-brand-primary transition-all duration-300" strokeWidth={2.5} />

                            {/* Floating Search Results */}
                            {showDropdown && (isSearching || (hasSearched && searchQuery.length >= 3)) && (
                                <div className="absolute z-50 w-full mt-2 bg-card backdrop-blur-sm border border-border/60 shadow-lg rounded-xl overflow-hidden animate-scale-in">
                                    {isSearching ? (
                                        <div className="p-8 text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex flex-col items-center gap-3">
                                            <Loader2 className="h-5 w-5 animate-spin text-brand-secondary" />
                                            Buscando histórico...
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
                                                        <p className="text-[11px] font-medium text-muted-foreground/70">{lead.email || 'Sin correo'} • {lead.destination || 'Sin viaje histórico'}</p>
                                                    </div>
                                                    <Check className="h-4 w-4 text-brand-secondary opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-110" />
                                                </button>
                                            ))}
                                        </div>
                                    ) : hasSearched && searchQuery.length >= 3 ? (
                                        <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                                            <p className="font-semibold">Nuevo cliente.</p>
                                            <button
                                                onClick={() => setShowDropdown(false)}
                                                className="text-[10px] font-extrabold uppercase tracking-widest text-brand-secondary hover:underline"
                                            >
                                                Continuar registrando
                                            </button>
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Correo */}
                        <div className="space-y-4">
                            <Label htmlFor="email" className={cn("flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] ml-1", emailError ? "text-destructive" : "text-muted-foreground/60")}>
                                <Mail className={cn("h-4 w-4", emailError ? "text-destructive" : "text-brand-primary")} strokeWidth={3} /> Correo
                            </Label>
                            <Input
                                data-testid="quote-traveler-email"
                                id="email"
                                type="email"
                                placeholder="viajero@empresa.com"
                                value={activeQuote.email || ""}
                                onChange={(e) => setQuoteField("email", e.target.value)}
                                className={cn("h-10 rounded-xl border border-border/60 bg-background/50 text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-brand-primary/20", emailError && "border-destructive/40 bg-destructive/5")}
                            />
                        </div>
                        {/* Teléfono */}
                        <div className="space-y-4">
                            <Label htmlFor="phone" className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground/60">
                                <Phone className="h-4 w-4 text-brand-primary" strokeWidth={3} /> Teléfono
                            </Label>
                            <Input
                                data-testid="quote-traveler-phone"
                                id="phone"
                                type="tel"
                                placeholder="+57 310 234 5678"
                                value={activeQuote.phone || ""}
                                onChange={(e) => setQuoteField("phone", e.target.value)}
                                className="h-10 rounded-xl border border-border/60 bg-background/50 text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-brand-primary/20"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. SECCIÓN DEFINICIÓN DEL VIAJE */}
                <div className="space-y-8 animate-slide-up">
                    <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                        <h4 className="text-sm font-bold tracking-tight text-foreground">Definición del Viaje</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Estrategia: Nacional / Internacional */}
                        <div className="space-y-4 md:col-span-2">
                            <Label className="text-[11px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground/60">Cobertura</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setDestinationType("nacional")}
                                    className={cn(
                                        "relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 transition-all p-4 active:scale-95",
                                        isNacional ? "border-brand-primary/40 bg-brand-primary/5 text-brand-primary shadow-lg" : "border-glass-border bg-muted/20 text-muted-foreground/50 hover:bg-muted/40"
                                    )}
                                >
                                    <Home className="h-6 w-6 mb-1" strokeWidth={isNacional ? 2.5 : 2} />
                                    <span className="text-sm font-black tracking-tight">Nacional (COP)</span>
                                    {isNacional && (
                                        <div className="absolute right-3 top-3"><Check className="h-4 w-4 stroke-[4px]" /></div>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDestinationType("internacional")}
                                    className={cn(
                                        "relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 transition-all p-4 active:scale-95",
                                        !isNacional ? "border-brand-secondary/40 bg-brand-secondary/5 text-brand-secondary shadow-lg" : "border-glass-border bg-muted/20 text-muted-foreground/50 hover:bg-muted/40"
                                    )}
                                >
                                    <Globe className="h-6 w-6 mb-1" strokeWidth={!isNacional ? 2.5 : 2} />
                                    <span className="text-sm font-black tracking-tight">Internacional (USD)</span>
                                    {!isNacional && (
                                        <div className="absolute right-3 top-3"><Check className="h-4 w-4 stroke-[4px]" /></div>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 md:col-span-2">
                            <Label htmlFor="destination" className={cn("flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] ml-1", destinationError ? "text-destructive" : "text-muted-foreground/60")}>
                                <MapPin className={cn("h-4 w-4", destinationError ? "text-destructive" : "text-brand-primary")} strokeWidth={3} /> Destino
                            </Label>
                            <Input
                                data-testid="quote-dest-name"
                                id="destination"
                                placeholder={isNacional ? "Ej: San Andrés..." : "Ej: Capadocia..."}
                                value={activeQuote.destination || ""}
                                onChange={(e) => setQuoteField("destination", e.target.value)}
                                className={cn("h-10 rounded-xl border border-border/60 bg-background/50 text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-brand-primary/20", destinationError && "border-destructive/40 bg-destructive/5")}
                            />
                        </div>

                        <div className="space-y-4">
                            <Label htmlFor="departureDate" className={cn("flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] ml-1", departureError ? "text-destructive" : "text-muted-foreground/60")}>
                                <CalendarDays className={cn("h-4 w-4", departureError ? "text-destructive" : "text-brand-primary")} strokeWidth={3} /> Ida
                            </Label>
                            <Input
                                data-testid="quote-dest-departure"
                                id="departureDate"
                                type="date"
                                value={activeQuote.departureDate ? new Date(activeQuote.departureDate).toISOString().split("T")[0] : ""}
                                onChange={(e) => setQuoteField("departureDate", new Date(e.target.value))}
                                className={cn("h-10 rounded-xl border border-border/60 bg-background/50 text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-brand-primary/20", departureError && "border-destructive/40 bg-destructive/5")}
                            />
                        </div>

                        <div className="space-y-4">
                            <Label htmlFor="returnDate" className={cn("flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] ml-1", returnError ? "text-destructive" : "text-muted-foreground/60")}>
                                <CalendarDays className={cn("h-4 w-4", returnError ? "text-destructive" : "text-brand-primary")} strokeWidth={3} /> Regreso
                            </Label>
                            <Input
                                data-testid="quote-dest-return"
                                id="returnDate"
                                type="date"
                                value={activeQuote.returnDate ? new Date(activeQuote.returnDate).toISOString().split("T")[0] : ""}
                                onChange={(e) => setQuoteField("returnDate", new Date(e.target.value))}
                                className={cn("h-10 rounded-xl border border-border/60 bg-background/50 text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-brand-primary/20", returnError && "border-destructive/40 bg-destructive/5")}
                            />
                        </div>

                        <div className="space-y-4 md:col-span-2">
                            <Label className="text-[11px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground/60">Pasajeros</Label>
                            <div className="flex gap-4 items-center">
                                <Input
                                    data-testid="quote-traveler-count"
                                    id="numberOfTravelers"
                                    type="number"
                                    min={1}
                                    value={activeQuote.numberOfTravelers || 1}
                                    onChange={(e) => setQuoteField("numberOfTravelers", parseInt(e.target.value) || 1)}
                                    className="h-10 w-20 rounded-xl border border-border/60 bg-background/50 text-sm font-black text-center"
                                />
                                <span className="text-sm font-semibold text-muted-foreground/70">Pasajeros viajando juntos</span>
                            </div>
                        </div>
                    </div>

                    {/* Imagen de Portada del Destino */}
                    <div className="md:col-span-2 xl:pt-4">
                        <ImageUploader
                            value={activeQuote.destinationImage}
                            onChange={(base64) => setQuoteField("destinationImage", base64)}
                            label="Imagen de Portada (Opcional)"
                        />
                    </div>
                </div>
            </div>

            {/* Contenedor Derecho: AI Extractor / SmartFill */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col pt-8 lg:pt-0 animate-slide-up">
                <div className="sticky top-6">
                    <AIExtractor />
                </div>
            </div>
        </div>
    );
}
