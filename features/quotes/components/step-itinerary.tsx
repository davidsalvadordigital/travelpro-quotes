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
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Itinerary Days */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-glass-border pb-4">
                    <div className="space-y-1">
                        <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Experiencia Paso a Paso</Label>
                        <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                            <Map className="h-5 w-5 text-brand-primary" />
                            Ruta del Viaje
                        </h3>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addItineraryDay}
                        data-testid="quote-itinerary-add-day"
                        className="rounded-2xl gap-2 px-5 h-11 font-black uppercase tracking-widest text-[10px] border-brand-primary/30 text-brand-primary hover:bg-brand-primary/5 active:scale-95 transition-all"
                    >
                        <Plus className="h-4 w-4" /> Agregar Día
                    </Button>
                </div>

                {(activeQuote.itinerary || []).length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-glass-border rounded-[2rem] bg-muted/5 animate-pulse-subtle">
                        <Sparkles className="h-10 w-10 text-muted-foreground/20 mb-4" />
                        <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Sin itinerario detectado</p>
                        <p className="text-[10px] text-slate-300 uppercase tracking-widest font-bold mt-2">Puedes agregarlos manualmente o usar la IA en el primer paso</p>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-8">
                    {(activeQuote.itinerary || []).map((day, idx) => (
                        <div key={idx} className="relative p-10 border border-glass-border/40 rounded-[2.5rem] bg-background/60 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.03)] backdrop-blur-2xl space-y-8 group hover:border-brand-primary/50 hover:shadow-2xl hover:shadow-brand-primary/10 transition-all duration-700 animate-in zoom-in-95">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-brand-primary text-white flex items-center justify-center font-black text-lg shadow-[0_10px_20px_-5px_rgba(227,58,122,0.4)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                        {day.day}
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-brand-primary drop-shadow-sm">Día de Operación</span>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 rounded-2xl transition-all active:scale-90"
                                    onClick={() => removeItineraryDay(idx)}
                                    data-testid={`quote-itinerary-remove-${idx}`}
                                >
                                    <Trash2 className="h-5 w-5" strokeWidth={2.5} />
                                </Button>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <Label className={cn(
                                        "text-[9px] font-black uppercase tracking-[0.2em] ml-1 mb-2 block",
                                        showErrors && !day.title ? "text-destructive" : "text-muted-foreground/50"
                                    )}>Identificador de la Experiencia</Label>
                                    <Input
                                        placeholder="Ej: Amanecer en el Desierto"
                                        value={day.title}
                                        onChange={(e) => updateItineraryDay(idx, { ...day, title: e.target.value })}
                                        data-testid={`quote-itinerary-title-${idx}`}
                                        className={cn(
                                            "h-14 border-2 border-transparent bg-muted/30 focus-visible:border-brand-primary/40 focus-visible:bg-transparent focus-visible:ring-8 focus-visible:ring-brand-primary/5 rounded-[1.5rem] text-xl font-black tracking-tight px-6 transition-all placeholder:text-muted-foreground/30 shadow-inner",
                                            showErrors && !day.title && "border-destructive/40 bg-destructive/5"
                                        )}
                                    />
                                </div>
                                <div>
                                    <Label className={cn(
                                        "text-[9px] font-black uppercase tracking-[0.2em] ml-1 mb-2 block",
                                        showErrors && !day.description ? "text-destructive" : "text-muted-foreground/50"
                                    )}>Narrativa del Servicio</Label>
                                    <Textarea
                                        placeholder="Describe los detalles estratégicos, horarios y sensaciones de este día..."
                                        value={day.description}
                                        onChange={(e) => updateItineraryDay(idx, { ...day, description: e.target.value })}
                                        data-testid={`quote-itinerary-desc-${idx}`}
                                        className={cn(
                                            "min-h-[140px] resize-none border-2 border-transparent focus-visible:border-brand-primary/40 focus-visible:bg-transparent focus-visible:ring-8 focus-visible:ring-brand-primary/5 bg-muted/30 rounded-[1.5rem] p-6 font-medium leading-loose shadow-inner transition-all placeholder:text-muted-foreground/30",
                                            showErrors && !day.description && "border-destructive/40 bg-destructive/5"
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
