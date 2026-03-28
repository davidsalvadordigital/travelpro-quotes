"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, ArrowLeft, Save, Send, Loader2, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";
import { useQuoteStore } from "@/features/quotes/store/quote-store";
import { StepTraveler } from "@/features/quotes/components/step-traveler";
import { StepDestination } from "@/features/quotes/components/step-destination";
import { StepFlights } from "@/features/quotes/components/step-flights";
import { StepHotels } from "@/features/quotes/components/step-hotels";
import { StepItinerary } from "@/features/quotes/components/step-itinerary";
import { StepDesign } from "@/features/quotes/components/step-design";
import { StepFinances } from "@/features/quotes/components/step-finances";
import { QuotePreview } from "@/features/quotes/components/quote-preview";
import { toast } from "sonner";

import { useRouter } from "next/navigation";
import { z } from "zod";
import { quoteSchema } from "@/features/quotes/schemas/quote-schema";
import { cn } from "@/lib/utils";

const STEP_COMPONENTS = [
    StepTraveler, 
    StepDestination, 
    StepFlights, 
    StepHotels, 
    StepItinerary, 
    StepDesign, 
    StepFinances
];

export default function QuotePage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [hasAttemptedNext, setHasAttemptedNext] = useState(false);
    const { activeQuote, resetQuote, saveQuote, syncToSupabase } = useQuoteStore();
    const hasInitialized = useRef(false);

    // 🚀 Fresh start: Only reset if it's a completely new session, exactly once on mount
    useEffect(() => {
        if (!hasInitialized.current) {
            const isNew = !(activeQuote as { id?: string }).id;
            if (isNew) {
                resetQuote();
            }
            setCurrentStep(0);
            hasInitialized.current = true;
        }
    }, [activeQuote, resetQuote]);

    const steps = ["Viajero", "Destino", "Transporte", "Hospedaje", "Itinerario", "Diseño", "Finanzas"];
    const progress = ((currentStep + 1) / steps.length) * 100;

    const CurrentStepComponent = STEP_COMPONENTS[currentStep];

    const validateCurrentStep = () => {
        try {
            switch (currentStep) {
                case 0: // Viajero
                    quoteSchema.pick({ travelerName: true, email: true }).parse(activeQuote);
                    break;
                case 1: // Destino
                    quoteSchema.pick({ destination: true, departureDate: true, returnDate: true }).parse(activeQuote);
                    break;
                case 2: // Transporte
                    z.object({ flights: quoteSchema.shape.flights }).parse(activeQuote);
                    break;
                case 3: // Hospedaje
                    z.object({ hotelOptions: quoteSchema.shape.hotelOptions }).parse(activeQuote);
                    break;
                case 4: // Itinerario
                    z.object({ itinerary: quoteSchema.shape.itinerary }).parse(activeQuote);
                    break;
                case 5: // Diseño
                    // No hay campos estrictamente requeridos para avanzar
                    break;
                case 6: // Finanzas
                    z.object({ netCostCOP: quoteSchema.shape.netCostCOP, netCostUSD: quoteSchema.shape.netCostUSD }).parse(activeQuote);
                    break;
            }
            return true;
        } catch (error: any) {
            if (error.errors && error.errors.length > 0) {
                toast.error("Datos incompletos", { description: error.errors[0].message });
            } else {
                toast.error("Datos inválidos", { description: "Revisa la información ingresada en este paso." });
            }
            return false;
        }
    };

    const handleNext = () => {
        if (validateCurrentStep()) {
            setHasAttemptedNext(false);
            setCurrentStep(prev => Math.min(steps.length - 1, prev + 1));
        } else {
            setHasAttemptedNext(true);
        }
    };

    const handleBack = () => {
        setHasAttemptedNext(false);
        setCurrentStep(prev => Math.max(0, prev - 1));
    };

    const handleReset = () => {
        if (window.confirm("¿Estás seguro de que deseas limpiar todo el formulario? Esta acción no se puede deshacer.")) {
            resetQuote();
            setCurrentStep(0);
            setHasAttemptedNext(false);
            toast.info("Formulario reiniciado");
        }
    };

    const handleSaveDraft = async () => {
        if (!activeQuote.travelerName) {
            toast.error("Nombre requerido", { description: "Se requiere al menos el nombre para guardar un borrador." });
            setHasAttemptedNext(true);
            return;
        }

        setIsSaving(true);
        try {
            saveQuote();
            await syncToSupabase();
            toast.success("Borrador guardado en la nube ☁️");
        } catch (error) {
            toast.error("Error al guardar", { description: error instanceof Error ? error.message : "Error desconocido" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleFinalize = async () => {
        const result = quoteSchema.safeParse(activeQuote);

        if (!result.success) {
            setHasAttemptedNext(true);
            const firstError = result.error.issues?.[0] || (result.error as { errors?: { message: string }[] }).errors?.[0];
            toast.error("Datos incompletos", {
                description: `${firstError?.message || "Revisa que todos los campos requeridos estén llenos."}`
            });
            return;
        }

        setIsSaving(true);
        try {
            useQuoteStore.getState().setQuoteField("status", "enviada");
            saveQuote();
            await syncToSupabase();

            toast.success("¡Cotización finalizada!", {
                description: `Cotización para ${activeQuote.travelerName} enviada.`,
            });

            setTimeout(() => {
                router.push("/dashboard");
            }, 1000);
        } catch (error) {
            toast.error("Error al finalizar", { description: error instanceof Error ? error.message : "Error desconocido" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="mx-auto max-w-7xl flex-1 space-y-10 p-8 pb-24 pt-10 animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-border/40 pb-10">
                <div className="space-y-3">
                    <div className="inline-flex items-center rounded-full bg-brand-secondary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-brand-secondary border border-brand-secondary/20">
                        Configuración de Propuesta
                    </div>
                    <h2 className="text-5xl font-extrabold tracking-tight text-foreground">
                        Crear Cotización
                    </h2>
                    <p className="text-lg font-medium text-muted-foreground max-w-2xl leading-relaxed">
                        Transforma los datos de tu cliente en una propuesta de viaje de alto impacto en minutos.
                    </p>
                </div>

                {/* Refined Stepper */}
                <div className="flex flex-col items-end gap-4 bg-muted/20 p-5 rounded-2xl border border-border/40">
                    <div className="text-[10px] font-extrabold text-muted-foreground/60 uppercase tracking-[0.25em]">
                        Estado del Progreso
                    </div>
                    <div className="flex items-center gap-3">
                        {steps.map((step, idx) => (
                            <div key={idx} className="flex items-center">
                                <div className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center text-sm font-extrabold transition-all duration-500",
                                    idx === currentStep ? "bg-brand-primary text-primary-foreground shadow-xl shadow-brand-primary/20 scale-110" :
                                        idx < currentStep ? "bg-brand-secondary text-primary-foreground" :
                                            "bg-background text-muted-foreground border border-border/60"
                                )}>
                                    {idx < currentStep ? <Check className="h-5 w-5 stroke-[3px]" /> : idx + 1}
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className={cn(
                                        "h-[2px] w-10 mx-1 transition-colors duration-500 rounded-full",
                                        idx < currentStep ? "bg-brand-secondary" : "bg-border/60"
                                    )} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="text-[11px] font-bold text-brand-primary uppercase tracking-widest">
                        {steps[currentStep]}
                    </div>
                </div>
            </div>

            <div className="space-y-10">
                {/* Main Form Area */}
                <div className="w-full">
                    <Card className="overflow-hidden rounded-[3rem] border border-glass-border bg-glass backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all duration-700">
                        <CardHeader className="border-b border-glass-border bg-muted/20 px-10 py-10 flex flex-row items-center justify-between">
                            <div className="space-y-1.5">
                                <CardTitle className="text-4xl font-black tracking-tighter text-foreground uppercase italic-pro-max">
                                    {steps[currentStep]}
                                </CardTitle>
                                <CardDescription className="text-sm font-bold text-muted-foreground/60 tracking-wide uppercase">
                                    Fase {currentStep + 1} de {steps.length} — Configuración Estratégica
                                </CardDescription>
                            </div>
                            <div className="hidden sm:block h-16 w-16 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary animate-pulse-subtle">
                                <Check className="h-8 w-8 stroke-[3.5px]" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 sm:p-12">
                            <CurrentStepComponent showErrors={hasAttemptedNext} />
                        </CardContent>
                        <div className="flex flex-col-reverse justify-between gap-6 border-t border-glass-border bg-muted/30 px-10 py-10 sm:flex-row sm:items-center">
                            <div className="flex gap-5">
                                <Button
                                    data-testid="quote-wizard-back"
                                    variant="outline"
                                    onClick={handleBack}
                                    disabled={currentStep === 0 || isSaving}
                                    className="h-14 rounded-2xl gap-3 px-8 font-black uppercase tracking-widest text-[10px] border-glass-border transition-all hover:bg-background active:scale-[0.95] shadow-sm"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Regresar
                                </Button>

                                <Button
                                    data-testid="quote-wizard-reset"
                                    variant="ghost"
                                    onClick={handleReset}
                                    disabled={isSaving}
                                    className="h-14 rounded-2xl gap-3 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground/40 transition-all hover:bg-destructive/10 hover:text-destructive active:scale-[0.95]"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Reset
                                </Button>
                            </div>

                            <div className="flex gap-5">
                                <Button
                                    data-testid="quote-wizard-draft"
                                    variant="outline"
                                    className="h-14 rounded-2xl gap-3 border-brand-secondary/30 bg-background/50 px-8 font-black uppercase tracking-widest text-[10px] transition-all hover:border-brand-secondary/60 hover:text-brand-secondary active:scale-[0.95] text-brand-secondary"
                                    onClick={handleSaveDraft}
                                    disabled={isSaving}
                                >
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Borrador
                                </Button>

                                {currentStep < steps.length - 1 ? (
                                    <Button
                                        data-testid="quote-wizard-next"
                                        onClick={handleNext}
                                        disabled={isSaving}
                                        className="h-14 rounded-2xl gap-4 px-12 font-black uppercase tracking-widest text-[10px] bg-brand-primary text-white shadow-2xl shadow-brand-primary/30 transition-all hover:shadow-brand-primary/50 active:scale-[0.95] border-t border-white/20"
                                    >
                                        Continuar
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        data-testid="quote-wizard-submit"
                                        className="h-14 rounded-2xl gap-4 bg-brand-primary px-14 font-black uppercase tracking-widest text-[10px] text-white shadow-2xl shadow-brand-primary/40 transition-all hover:shadow-brand-primary/60 active:scale-[0.95] border-t border-white/20 animate-pulse-subtle"
                                        onClick={handleFinalize}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                        Emitir Propuesta
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Show Preview only on the final step (Finanzas - index 6) */}
                {currentStep === 6 && (
                    <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <QuotePreview />
                    </div>
                )}
            </div>
        </div>
    );
}
