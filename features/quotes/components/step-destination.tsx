"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActiveQuote, useQuoteActions } from "@/features/quotes/store/quote-store";
import { MapPin, CalendarDays, Hotel, PlaneTakeoff, Globe, Home, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageUploader } from "@/features/quotes/components/image-uploader";

interface StepDestinationProps {
    showErrors?: boolean;
}

export function StepDestination({ showErrors = false }: StepDestinationProps) {
    const activeQuote = useActiveQuote();
    const { setQuoteField, setDestinationType } = useQuoteActions();
    const isNacional = activeQuote.destinationType === "nacional";

    const destinationError = showErrors && (!activeQuote.destination || activeQuote.destination.trim() === "");
    const departureError = showErrors && !activeQuote.departureDate;
    const returnError = showErrors && !activeQuote.returnDate;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Selector Nacional / Internacional (Pro Max UI) */}
            <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground/60">Estrategia de Destino</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <button
                        data-testid="quote-dest-type-nacional"
                        type="button"
                        onClick={() => setDestinationType("nacional")}
                        className={cn(
                            "relative flex flex-col items-center justify-center gap-4 rounded-[2rem] border-2 transition-all duration-500 ease-out active:scale-[0.96] p-8",
                            isNacional
                                ? "border-brand-primary/40 bg-brand-primary/5 text-brand-primary shadow-2xl shadow-brand-primary/10"
                                : "border-glass-border bg-muted/20 text-muted-foreground/40 hover:border-brand-primary/20 hover:bg-muted/40 hover:text-muted-foreground/60"
                        )}
                    >
                        <div className={cn(
                            "rounded-2xl p-4 transition-all duration-500",
                            isNacional ? "bg-brand-primary text-white shadow-xl shadow-brand-primary/20 scale-110" : "bg-muted text-muted-foreground/20"
                        )}>
                            <Home className="h-8 w-8" strokeWidth={2.5} />
                        </div>
                        <div className="space-y-1.5 text-center">
                            <span className="block text-xl font-black tracking-tight">Nacional</span>
                            <span className={cn(
                                "block text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500",
                                isNacional ? "text-brand-primary/80" : "text-muted-foreground/40"
                            )}>
                                Facturación COP
                            </span>
                        </div>
                        {isNacional && (
                            <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-white shadow-xl animate-in zoom-in duration-500">
                                <Check className="h-5 w-5 stroke-[4px]" />
                            </div>
                        )}
                    </button>

                    <button
                        data-testid="quote-dest-type-international"
                        type="button"
                        onClick={() => setDestinationType("internacional")}
                        className={cn(
                            "relative flex flex-col items-center justify-center gap-4 rounded-[2rem] border-2 transition-all duration-500 ease-out active:scale-[0.96] p-8",
                            !isNacional
                                ? "border-brand-secondary/40 bg-brand-secondary/5 text-brand-secondary shadow-2xl shadow-brand-secondary/10"
                                : "border-glass-border bg-muted/20 text-muted-foreground/40 hover:border-brand-secondary/20 hover:bg-muted/40 hover:text-muted-foreground/60"
                        )}
                    >
                        <div className={cn(
                            "rounded-2xl p-4 transition-all duration-500",
                            !isNacional ? "bg-brand-secondary text-white shadow-xl shadow-brand-secondary/20 scale-110" : "bg-muted text-muted-foreground/20"
                        )}>
                            <Globe className="h-8 w-8" strokeWidth={2.5} />
                        </div>
                        <div className="space-y-1.5 text-center">
                            <span className="block text-xl font-black tracking-tight">Global</span>
                            <span className={cn(
                                "block text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500",
                                !isNacional ? "text-brand-secondary/80" : "text-muted-foreground/40"
                            )}>
                                Conversión TRM
                            </span>
                        </div>
                        {!isNacional && (
                            <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-brand-secondary text-white shadow-xl animate-in zoom-in duration-500">
                                <Check className="h-5 w-5 stroke-[4px]" />
                            </div>
                        )}
                    </button>
                </div>
            </div>

            {/* Configuración Visual del Destino */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Nombre del Destino */}
                <div className="space-y-4">
                    <Label
                        htmlFor="destination"
                        className={cn(
                            "flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] ml-1",
                            destinationError ? "text-destructive" : "text-muted-foreground/60"
                        )}
                    >
                        <MapPin className={cn("h-4 w-4", destinationError ? "text-destructive" : "text-brand-primary")} strokeWidth={3} />
                        Destino Estratégico
                    </Label>
                    <Input
                        data-testid="quote-dest-name"
                        id="destination"
                        placeholder={isNacional ? "Ej: Cartagena, Medellín, San Andrés" : "Ej: Capadocia, Turquía"}
                        value={activeQuote.destination || ""}
                        onChange={(e) => setQuoteField("destination", e.target.value)}
                        className={cn(
                            "h-14 rounded-2xl border-2 border-glass-border bg-background/50 text-base font-medium transition-all duration-300 focus-visible:ring-8 focus-visible:ring-brand-primary/5 focus-visible:border-brand-primary/40",
                            destinationError && "border-destructive/40 bg-destructive/5 focus-visible:border-destructive focus-visible:ring-destructive/10"
                        )}
                    />
                </div>

                {/* Imagen del Destino */}
                <div className="h-full">
                    <ImageUploader 
                        value={activeQuote.destinationImage}
                        onChange={(base64) => setQuoteField("destinationImage", base64)}
                        label="Portada del Destino"
                        className="h-full"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <Label
                        htmlFor="departureDate"
                        className={cn(
                            "flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] ml-1",
                            departureError ? "text-destructive" : "text-muted-foreground/60"
                        )}
                    >
                        <CalendarDays className={cn("h-4 w-4", departureError ? "text-destructive" : "text-brand-primary")} strokeWidth={3} />
                        Salida
                    </Label>
                    <Input
                        data-testid="quote-dest-departure"
                        id="departureDate"
                        type="date"
                        value={activeQuote.departureDate
                            ? new Date(activeQuote.departureDate).toISOString().split("T")[0]
                            : ""}
                        onChange={(e) => setQuoteField("departureDate", new Date(e.target.value))}
                        className={cn(
                            "h-14 rounded-2xl border-2 border-glass-border bg-background/50 text-base font-medium transition-all duration-300 focus-visible:ring-8 focus-visible:ring-brand-primary/5 focus-visible:border-brand-primary/40",
                            departureError && "border-destructive/40 bg-destructive/5 focus-visible:border-destructive focus-visible:ring-destructive/10"
                        )}
                    />
                </div>
                <div className="space-y-4">
                    <Label
                        htmlFor="returnDate"
                        className={cn(
                            "flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] ml-1",
                            returnError ? "text-destructive" : "text-muted-foreground/60"
                        )}
                    >
                        <CalendarDays className={cn("h-4 w-4", returnError ? "text-destructive" : "text-brand-primary")} strokeWidth={3} />
                        Regreso
                    </Label>
                    <Input
                        data-testid="quote-dest-return"
                        id="returnDate"
                        type="date"
                        value={activeQuote.returnDate
                            ? new Date(activeQuote.returnDate).toISOString().split("T")[0]
                            : ""}
                        onChange={(e) => setQuoteField("returnDate", new Date(e.target.value))}
                        className={cn(
                            "h-14 rounded-2xl border-2 border-glass-border bg-background/50 text-base font-medium transition-all duration-300 focus-visible:ring-8 focus-visible:ring-brand-primary/5 focus-visible:border-brand-primary/40",
                            returnError && "border-destructive/40 bg-destructive/5 focus-visible:border-destructive focus-visible:ring-destructive/10"
                        )}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <Label htmlFor="hotelInfo" className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground/60">
                        <Hotel className="h-4 w-4 text-brand-primary" strokeWidth={3} />
                        Hospedaje Sugerido
                    </Label>
                    <Textarea
                        id="hotelInfo"
                        placeholder="Nombre del hotel, categoría, régimen..."
                        value={activeQuote.hotelInfo || ""}
                        onChange={(e) => setQuoteField("hotelInfo", e.target.value)}
                        className="min-h-[100px] rounded-2xl border-2 border-glass-border bg-background/50 text-base font-medium transition-all duration-300 focus-visible:ring-8 focus-visible:ring-brand-primary/5 focus-visible:border-brand-primary/40 resize-none"
                    />
                </div>

                <div className="space-y-4">
                    <Label htmlFor="airlineInfo" className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground/60">
                        <PlaneTakeoff className="h-4 w-4 text-brand-primary" strokeWidth={3} />
                        Ruta de Vuelos
                    </Label>
                    <Textarea
                        id="airlineInfo"
                        placeholder="Aerolínea, escalas, horarios..."
                        value={activeQuote.airlineInfo || ""}
                        onChange={(e) => setQuoteField("airlineInfo", e.target.value)}
                        className="min-h-[100px] rounded-2xl border-2 border-glass-border bg-background/50 text-base font-medium transition-all duration-300 focus-visible:ring-8 focus-visible:ring-brand-primary/5 focus-visible:border-brand-primary/40 resize-none"
                    />
                </div>
            </div>
        </div>
    );
}
