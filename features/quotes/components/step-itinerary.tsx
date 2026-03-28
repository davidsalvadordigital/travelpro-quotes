"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useActiveQuote, useQuoteActions } from "@/features/quotes/store/quote-store";
import { Plus, Trash2, CheckCircle, XCircle, Sparkles, Map } from "lucide-react";
import { cn } from "@/lib/utils";

export function StepItinerary() {
    const activeQuote = useActiveQuote();
    const { updateItineraryDay, addItineraryDay, removeItineraryDay, setQuoteField } = useQuoteActions();
    const [newInclusion, setNewInclusion] = useState("");
    const [newExclusion, setNewExclusion] = useState("");

    const handleAddInclusion = () => {
        if (!newInclusion.trim()) return;
        setQuoteField("inclusions", [...(activeQuote.inclusions || []), newInclusion.trim()]);
        setNewInclusion("");
    };

    const handleAddExclusion = () => {
        if (!newExclusion.trim()) return;
        setQuoteField("exclusions", [...(activeQuote.exclusions || []), newExclusion.trim()]);
        setNewExclusion("");
    };

    const removeInclusion = (idx: number) => {
        setQuoteField("inclusions", (activeQuote.inclusions || []).filter((_, i) => i !== idx));
    };

    const removeExclusion = (idx: number) => {
        setQuoteField("exclusions", (activeQuote.exclusions || []).filter((_, i) => i !== idx));
    };

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

                <div className="grid grid-cols-1 gap-6">
                    {(activeQuote.itinerary || []).map((day, idx) => (
                        <div key={idx} className="relative p-8 border border-glass-border rounded-[2rem] bg-background/40 backdrop-blur-xl space-y-6 group hover:border-brand-primary/30 hover:shadow-2xl hover:shadow-brand-primary/5 transition-all duration-500 animate-in zoom-in-95">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-brand-primary text-white flex items-center justify-center font-black text-sm shadow-lg shadow-brand-primary/20">
                                        {day.day}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-primary">Día de Operación</span>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-muted-foreground/20 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all active:scale-90"
                                    onClick={() => removeItineraryDay(idx)}
                                    data-testid={`quote-itinerary-remove-${idx}`}
                                >
                                    <Trash2 className="h-4.5 w-4.5" />
                                </Button>
                            </div>
                            <div className="space-y-4">
                                <Input
                                    placeholder="Título de la Experiencia (ej: Amanecer en el Desierto)"
                                    value={day.title}
                                    onChange={(e) => updateItineraryDay(idx, { ...day, title: e.target.value })}
                                    data-testid={`quote-itinerary-title-${idx}`}
                                    className="h-12 border-0 border-b-2 border-glass-border focus-visible:border-brand-primary focus-visible:ring-0 bg-transparent rounded-none text-xl font-black tracking-tight px-0 transition-all placeholder:text-muted-foreground/20"
                                />
                                <Textarea
                                    placeholder="Describe los detalles estratégicos, horarios y sensaciones de este día..."
                                    value={day.description}
                                    onChange={(e) => updateItineraryDay(idx, { ...day, description: e.target.value })}
                                    data-testid={`quote-itinerary-desc-${idx}`}
                                    className="min-h-[100px] resize-none border-2 border-glass-border/50 focus-visible:border-brand-primary/40 focus-visible:ring-8 focus-visible:ring-brand-primary/5 bg-muted/20 rounded-[1.5rem] p-5 font-medium leading-relaxed"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Inclusions & Exclusions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Inclusions */}
                <div className="space-y-6">
                    <Label className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground/60">
                        <CheckCircle className="h-4 w-4 text-emerald-500" strokeWidth={3} /> Componentes Incluidos
                    </Label>
                    <div className="flex gap-3">
                        <Input
                            placeholder="Ej: Desayunos diarios buffet"
                            value={newInclusion}
                            onChange={(e) => setNewInclusion(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddInclusion())}
                            data-testid="quote-itinerary-incl-input"
                            className="h-14 flex-1 rounded-2xl border-2 border-glass-border bg-background/50 text-base font-medium transition-all duration-300 focus-visible:ring-8 focus-visible:ring-brand-primary/5 focus-visible:border-brand-primary/40"
                        />
                        <Button type="button" variant="outline" onClick={handleAddInclusion} data-testid="quote-itinerary-incl-add" className="h-14 w-14 rounded-2xl border-glass-border hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all active:scale-90">
                            <Plus className="h-6 w-6" />
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        {(activeQuote.inclusions || []).map((item, idx) => (
                            <span key={idx} className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-black border border-emerald-500/20 animate-in zoom-in-95 uppercase tracking-tight">
                                {item}
                                <button type="button" onClick={() => removeInclusion(idx)} data-testid={`quote-itinerary-incl-remove-${idx}`} className="hover:text-destructive transition-colors p-0.5">
                                    <XCircle className="h-4 w-4" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Exclusions */}
                <div className="space-y-6">
                    <Label className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground/60">
                        <XCircle className="h-4 w-4 text-rose-500" strokeWidth={3} /> No Incluye (Exclusiones)
                    </Label>
                    <div className="flex gap-3">
                        <Input
                            placeholder="Ej: Propinas y gastos personales"
                            value={newExclusion}
                            onChange={(e) => setNewExclusion(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddExclusion())}
                            data-testid="quote-itinerary-excl-input"
                            className="h-14 flex-1 rounded-2xl border-2 border-glass-border bg-background/50 text-base font-medium transition-all duration-300 focus-visible:ring-8 focus-visible:ring-brand-primary/5 focus-visible:border-brand-primary/40"
                        />
                        <Button type="button" variant="outline" onClick={handleAddExclusion} data-testid="quote-itinerary-excl-add" className="h-14 w-14 rounded-2xl border-glass-border hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all active:scale-90">
                            <Plus className="h-6 w-6" />
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        {(activeQuote.exclusions || []).map((item, idx) => (
                            <span key={idx} className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs font-black border border-rose-500/20 animate-in zoom-in-95 uppercase tracking-tight">
                                {item}
                                <button type="button" onClick={() => removeExclusion(idx)} data-testid={`quote-itinerary-excl-remove-${idx}`} className="hover:text-destructive transition-colors p-0.5">
                                    <XCircle className="h-4 w-4" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
