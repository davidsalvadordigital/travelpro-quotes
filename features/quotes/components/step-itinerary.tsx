"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useActiveQuote, useQuoteActions } from "@/features/quotes/store/quote-store";
import { Plus, Trash2, CheckCircle, XCircle, Sparkles, Map } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepItineraryProps {
    showErrors?: boolean;
}

export function StepItinerary({ showErrors = false }: StepItineraryProps) {
    const activeQuote = useActiveQuote();
    const { updateItineraryDay, addItineraryDay, removeItineraryDay } = useQuoteActions();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shadow-sm ring-1 ring-brand-primary/20">
                        <Map className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                        <h3 className="text-base font-bold tracking-tight text-foreground">Itinerario Detallado</h3>
                        <p className="text-xs text-muted-foreground">Describe las actividades día por día del viaje.</p>
                    </div>
                </div>
                <Button
                    type="button"
                    onClick={addItineraryDay}
                    data-testid="quote-itinerary-add-day"
                    className="h-10 rounded-xl gap-2 px-5 font-semibold text-sm bg-brand-primary text-white shadow-md shadow-brand-primary/20 hover:bg-brand-primary/90 active:scale-[0.97] transition-all"
                >
                    <Plus className="h-3.5 w-3.5" /> Agregar Día
                </Button>
            </div>

            <div className="space-y-6">
                {(activeQuote.itinerary || []).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-border/50 rounded-2xl bg-muted/20 text-center space-y-3">
                        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                            <Map className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Sin itinerario</p>
                            <p className="text-xs text-subtle-foreground">Usa extracción IA en el paso anterior o agrega días manualmente.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {(activeQuote.itinerary || []).map((day, idx) => (
                            <div key={idx} className="group relative p-6 border border-border/60 rounded-2xl bg-card transition-all duration-300 hover:border-brand-primary/30 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-brand-primary/10 rounded-full">
                                        <span className="text-xs font-semibold text-brand-primary">Día {day.day}</span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        onClick={() => removeItineraryDay(idx)}
                                        data-testid={`quote-itinerary-remove-${idx}`}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-1.5">
                                        <Label 
                                            htmlFor={`itinerary-title-${idx}`}
                                            className={cn(
                                                "text-xs font-semibold tracking-wide block pl-0.5 cursor-pointer hover:text-brand-primary transition-colors",
                                                showErrors && !day.title ? "text-destructive" : "text-muted-foreground"
                                            )}
                                        >
                                            Título del Día
                                        </Label>
                                        <Input
                                            id={`day-title-${idx}`}
                                            placeholder="Ej: Llegada a Cartagena y City Tour"
                                            value={day.title || ""}
                                            onChange={(e) => updateItineraryDay(idx, { ...day, title: e.target.value })}
                                            data-testid={`quote-itinerary-title-${idx}`}
                                            className={cn(
                                                "h-11 rounded-xl border-border bg-background px-4 text-sm font-semibold transition-all focus-visible:ring-brand-primary/20",
                                                showErrors && !day.title && "border-destructive/40 bg-destructive/5"
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label 
                                            htmlFor={`itinerary-desc-${idx}`}
                                            className={cn(
                                                "text-xs font-semibold tracking-wide block pl-0.5 cursor-pointer hover:text-brand-primary transition-colors",
                                                showErrors && !day.description ? "text-destructive" : "text-muted-foreground"
                                            )}
                                        >
                                            Descripción de Actividades
                                        </Label>
                                        <Textarea
                                            id={`itinerary-desc-${idx}`}
                                            placeholder="Detalle los servicios, traslados y actividades incluidas..."
                                            value={day.description}
                                            onChange={(e) => updateItineraryDay(idx, { ...day, description: e.target.value })}
                                            data-testid={`quote-itinerary-desc-${idx}`}
                                            className={cn(
                                                "min-h-[100px] resize-none border-border/60 focus-visible:ring-brand-primary/20 bg-background/50 rounded-xl p-3 text-sm font-medium leading-relaxed",
                                                showErrors && !day.description && "border-destructive/40 bg-destructive/5"
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
