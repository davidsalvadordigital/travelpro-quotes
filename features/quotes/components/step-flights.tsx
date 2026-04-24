"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Plane, Clock, MapPin, Calendar as CalendarIcon, ArrowRightLeft, Navigation } from "lucide-react";
import { useActiveQuote, useQuoteActions } from "@/features/quotes/store/quote-store";
import { cn } from "@/lib/utils";

interface StepFlightsProps {
    showErrors?: boolean;
}

export function StepFlights({ showErrors = false }: StepFlightsProps) {
    const activeQuote = useActiveQuote();
    const { addFlight, removeFlight, updateFlight } = useQuoteActions();
    const flights = activeQuote.flights || [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shadow-sm ring-1 ring-brand-primary/20">
                        <Plane className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                        <h3 className="text-base font-bold tracking-tight text-foreground">Trayectos Aéreos</h3>
                        <p className="text-xs text-muted-foreground">Define los vuelos del itinerario.</p>
                    </div>
                </div>
                <Button
                    data-testid="quote-flight-add"
                    onClick={addFlight}
                    className="h-10 rounded-xl gap-2 px-5 font-semibold text-sm bg-brand-primary text-white shadow-md shadow-brand-primary/20 hover:bg-brand-primary/90 active:scale-[0.97] transition-all"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Agregar trayecto
                </Button>
            </div>

            <div className="space-y-3">
                {flights.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 rounded-2xl border-2 border-dashed border-border/50 bg-muted/20 text-center space-y-3">
                        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                            <Plane className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-subtle-foreground">Sin trayectos definidos</p>
                    </div>
                ) : (
                    flights.map((flight, index) => (
                        <div
                            key={index}
                            className="group relative bg-card border border-border/60 rounded-xl p-4 transition-all duration-300 hover:border-brand-primary/30"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                {/* Ruta: Origen -> Destino */}
                                <div className="md:col-span-3 space-y-1.5">
                                    <Label 
                                        htmlFor={`flight-origin-${index}`}
                                        className={cn(
                                            "text-xs font-semibold tracking-wide block cursor-pointer hover:text-brand-primary transition-colors",
                                            showErrors && (!flight.origin || !flight.destination) ? "text-danger" : "text-muted-foreground"
                                        )}
                                    >
                                        Ruta (Origen - Destino)
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id={`flight-origin-${index}`}
                                            data-testid={`quote-flight-origin-${index}`}
                                            placeholder="BOG"
                                            value={flight.origin || ""}
                                            onChange={(e) => updateFlight(index, { ...flight, origin: e.target.value.toUpperCase() })}
                                            className="h-9 rounded-lg border-border/60 bg-background/50 font-bold text-xs text-center tabular-nums uppercase focus-visible:ring-brand-primary/20"
                                        />
                                        <ArrowRightLeft className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />
                                        <Input
                                            id={`flight-dest-${index}`}
                                            data-testid={`quote-flight-target-${index}`}
                                            placeholder="JFK"
                                            value={flight.destination || ""}
                                            onChange={(e) => updateFlight(index, { ...flight, destination: e.target.value.toUpperCase() })}
                                            className="h-9 rounded-lg border-border/60 bg-background/50 font-bold text-xs text-center tabular-nums uppercase focus-visible:ring-brand-primary/20"
                                        />
                                    </div>
                                </div>

                                {/* Aerolínea y Vuelo */}
                                <div className="md:col-span-3 space-y-1.5">
                                    <Label 
                                        htmlFor={`flight-airline-${index}`}
                                        className={cn(
                                            "text-xs font-semibold tracking-wide block cursor-pointer hover:text-brand-primary transition-colors",
                                            showErrors && !flight.airline ? "text-destructive" : "text-muted-foreground"
                                        )}
                                    >
                                        Carrier / Nro. Vuelo
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id={`flight-airline-${index}`}
                                            data-testid={`quote-flight-airline-${index}`}
                                            placeholder="Aerolínea"
                                            value={flight.airline || ""}
                                            onChange={(e) => updateFlight(index, { ...flight, airline: e.target.value })}
                                            className="h-9 rounded-lg border-border/60 bg-background/50 text-xs font-semibold focus-visible:ring-brand-primary/20"
                                        />
                                        <Input
                                            id={`flight-num-${index}`}
                                            data-testid={`quote-flight-number-${index}`}
                                            placeholder="Nro"
                                            value={flight.flightNumber || ""}
                                            onChange={(e) => updateFlight(index, { ...flight, flightNumber: e.target.value.toUpperCase() })}
                                            className="h-9 w-24 rounded-lg border-border/60 bg-background/50 text-xs font-bold tabular-nums focus-visible:ring-brand-primary/20"
                                        />
                                    </div>
                                </div>

                                {/* Fecha */}
                                <div className="md:col-span-2 space-y-1.5">
                                    <Label 
                                        htmlFor={`flight-date-${index}`}
                                        className="text-xs font-semibold tracking-wide text-muted-foreground block cursor-pointer hover:text-brand-primary transition-colors"
                                    >
                                        Fecha
                                    </Label>
                                    <Input
                                        id={`flight-date-${index}`}
                                        data-testid={`quote-flight-date-${index}`}
                                        type="date"
                                        value={flight.date ? new Date(flight.date).toISOString().split('T')[0] : ""}
                                        onChange={(e) => updateFlight(index, { ...flight, date: new Date(e.target.value) })}
                                        className="h-9 rounded-lg border-border/60 bg-background/50 text-xs font-medium focus-visible:ring-brand-primary/20"
                                    />
                                </div>

                                {/* Horarios */}
                                <div className="md:col-span-3 space-y-1.5">
                                    <Label 
                                        htmlFor={`flight-dep-${index}`}
                                        className={cn(
                                            "text-xs font-semibold tracking-wide block cursor-pointer hover:text-brand-primary transition-colors",
                                            showErrors && (!flight.departureTime || !flight.arrivalTime) ? "text-destructive" : "text-muted-foreground"
                                        )}
                                    >
                                        Horarios (DEP - ARR)
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id={`flight-dep-${index}`}
                                            data-testid={`quote-flight-time-dep-${index}`}
                                            placeholder="00:00"
                                            value={flight.departureTime || ""}
                                            onChange={(e) => updateFlight(index, { ...flight, departureTime: e.target.value })}
                                            className="h-9 rounded-lg border-border/60 bg-background/50 font-bold text-xs text-center tabular-nums focus-visible:ring-brand-primary/20"
                                        />
                                        <Clock className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />
                                        <Input
                                            id={`flight-arr-${index}`}
                                            data-testid={`quote-flight-time-arr-${index}`}
                                            placeholder="00:00"
                                            value={flight.arrivalTime || ""}
                                            onChange={(e) => updateFlight(index, { ...flight, arrivalTime: e.target.value })}
                                            className="h-9 rounded-lg border-border/60 bg-background/50 font-bold text-xs text-center tabular-nums focus-visible:ring-brand-primary/20"
                                        />
                                    </div>
                                </div>

                                {/* Acciones */}
                                <div className="md:col-span-1 flex justify-end">
                                    <Button
                                        data-testid={`quote-flight-remove-${index}`}
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeFlight(index)}
                                        className="h-9 w-9 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
