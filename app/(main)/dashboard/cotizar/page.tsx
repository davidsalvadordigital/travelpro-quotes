"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, ArrowLeft, Save, Send, Loader2, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase";

import { Progress } from "@/components/ui/progress";
import { useQuoteStore } from "@/features/quotes/store/quote-store";
import { StepTraveler } from "@/features/quotes/components/step-traveler";
import { StepFlights } from "@/features/quotes/components/step-flights";
import { StepHotels } from "@/features/quotes/components/step-hotels";
import { StepItinerary } from "@/features/quotes/components/step-itinerary";
import { StepFinances } from "@/features/quotes/components/step-finances";
import { StepTerms } from "@/features/quotes/components/step-terms";
import { QuotePreview } from "@/features/quotes/components/quote-preview";
import { toast } from "sonner";

import { useRouter } from "next/navigation";
import { z } from "zod";
import { quoteSchema } from "@/features/quotes/schemas/quote-schema";
import { cn } from "@/lib/utils";

const STEP_COMPONENTS = [
    StepTraveler, 
    StepItinerary, 
    StepHotels, 
    StepFlights, 
    StepTerms, 
    StepFinances
];

export default function QuotePage() {
    const router = useRouter();
    const isSaving = useQuoteStore(s => s.isSyncing);
    const [hasAttemptedNext, setHasAttemptedNext] = useState(false);
    const { activeQuote, resetQuote, saveQuote, syncToSupabase, currentStep, setCurrentStep, setUserId } = useQuoteStore();
    const hasInitialized = useRef(false);

    // 🚀 Sync User Identity with the store
    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.id) {
                setUserId(user.id);
            }
        };
        fetchUser();
    }, [setUserId]);

    // 🚀 Session management
    useEffect(() => {
        hasInitialized.current = true;
    }, []);

    const steps = ["Datos del viajero", "Itinerario", "Hospedaje", "Transporte", "Condiciones", "Tarifas"];
    const safeStep = typeof currentStep === 'number' && currentStep >= 0 && currentStep < steps.length ? currentStep : 0;
    const progress = ((safeStep + 1) / steps.length) * 100;

    const CurrentStepComponent = STEP_COMPONENTS[safeStep];

    const validateCurrentStep = () => {
        try {
            switch (safeStep) {
                case 0: // Inicio (Viajero + Destino)
                    quoteSchema.pick({ 
                        travelerName: true, 
                        email: true, 
                        destination: true, 
                        departureDate: true, 
                        returnDate: true 
                    }).parse(activeQuote);
                    break;
                case 1: // El Viaje (Itinerario)
                    z.object({ itinerary: quoteSchema.shape.itinerary }).parse(activeQuote);
                    break;
                case 2: // Hospedaje
                    z.object({ hotelOptions: quoteSchema.shape.hotelOptions }).parse(activeQuote);
                    break;
                case 3: // Transporte (Vuelos)
                    z.object({ flights: quoteSchema.shape.flights }).parse(activeQuote);
                    break;
                case 4: // Condiciones
                    // (Validación de plantilla)
                    break;
                case 5: // Inversión (Finanzas + Diseño)
                    z.object({ pvpCOP: quoteSchema.shape.pvpCOP, pvpUSD: quoteSchema.shape.pvpUSD }).parse(activeQuote);
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

    const handleNext = async () => {
        if (validateCurrentStep()) {
            setHasAttemptedNext(false);
            const nextStep = Math.min(steps.length - 1, safeStep + 1);
            setCurrentStep(nextStep);
            
            // ☁️ Auto-sync to cloud on step progression
            if (activeQuote.travelerName) {
                saveQuote();
                syncToSupabase(); 
            }
        } else {
            setHasAttemptedNext(true);
        }
    };

    const handleBack = () => {
        setHasAttemptedNext(false);
        const prevStep = Math.max(0, safeStep - 1);
        setCurrentStep(prevStep);
        
        // ☁️ Auto-sync on back too
        if (activeQuote.travelerName) {
            saveQuote();
            syncToSupabase();
        }
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

        try {
            saveQuote();
            await syncToSupabase();
            toast.success("Borrador guardado en la nube ☁️");
        } catch (error) {
            toast.error("Error al guardar", { description: error instanceof Error ? error.message : "Error desconocido" });
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

        try {
            useQuoteStore.getState().setQuoteField("status", "enviada");
            saveQuote();
            await syncToSupabase();

            toast.success("¡Cotización finalizada!", {
                description: `Cotización para ${activeQuote.travelerName} enviada.`,
            });

            // Reset step and possibly store on success redirect
            setCurrentStep(0);

            setTimeout(() => {
                router.push("/dashboard");
            }, 1000);
        } catch (error) {
            toast.error("Error al finalizar", { description: error instanceof Error ? error.message : "Error desconocido" });
        }
    };

    return (
        <div className="mx-auto max-w-6xl flex-1 space-y-8 p-6 pb-24 pt-8 animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/40 pb-8">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black tracking-tighter text-foreground">
                        Nueva Cotización
                    </h2>
                    <p className="text-sm font-medium text-muted-foreground">
                        Paso {safeStep + 1} de {steps.length} — {steps[safeStep]}
                    </p>
                </div>

                {/* Stepper limpio — sin labels, solo números y conectores */}
                <div className="flex items-center gap-2">
                    {steps.map((step, idx) => (
                        <div key={idx} className="flex items-center">
                            <div className={cn(
                                "h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300",
                                idx === safeStep ? "bg-brand-primary text-white shadow-md shadow-brand-primary/25 scale-110" :
                                    idx < safeStep ? "bg-brand-secondary/20 text-brand-secondary border border-brand-secondary/30" :
                                        "bg-muted/50 text-muted-foreground border border-border/50"
                            )}>
                                {idx < safeStep ? <Check className="h-3.5 w-3.5 stroke-[3px]" /> : idx + 1}
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={cn(
                                    "h-[1.5px] w-6 mx-1 transition-colors duration-500 rounded-full",
                                    idx < safeStep ? "bg-brand-secondary/40" : "bg-border/50"
                                )} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                {/* Main Form Area */}
                <div className="w-full">
                    <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-500">
                        <CardHeader className="border-b border-border/40 bg-muted/20 px-8 py-6 flex flex-row items-center justify-between">
                            <div className="space-y-0.5">
                                <CardTitle className="text-lg font-bold tracking-tight text-foreground">
                                    {steps[safeStep]}
                                </CardTitle>
                                <CardDescription className="text-xs font-medium text-muted-foreground/70">
                                    Paso {safeStep + 1} de {steps.length}
                                </CardDescription>
                            </div>
                            {/* Progress bar visual */}
                            <div className="hidden sm:flex items-center gap-3">
                                <Progress value={progress} className="w-32 h-1.5 bg-border/40" />
                                <span className="text-xs text-muted-foreground/60 tabular-nums">{Math.round(progress)}%</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 sm:p-8">
                            <CurrentStepComponent showErrors={hasAttemptedNext} />
                        </CardContent>
                        <div className="flex flex-col-reverse justify-between gap-4 border-t border-border/40 bg-muted/20 px-8 py-5 sm:flex-row sm:items-center">
                            <div className="flex gap-3">
                                <Button
                                    data-testid="quote-wizard-back"
                                    variant="outline"
                                    onClick={handleBack}
                                    disabled={safeStep === 0 || isSaving}
                                    className="h-10 rounded-xl gap-2 px-5 font-medium text-sm border-border/60 transition-all hover:bg-background active:scale-[0.97]"
                                >
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    Atrás
                                </Button>

                                <Button
                                    data-testid="quote-wizard-reset"
                                    variant="ghost"
                                    onClick={handleReset}
                                    disabled={isSaving}
                                    className="h-10 rounded-xl gap-2 px-4 font-medium text-sm text-muted-foreground/50 transition-all hover:bg-destructive/10 hover:text-destructive active:scale-[0.97]"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Limpiar
                                </Button>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    data-testid="quote-wizard-draft"
                                    variant="outline"
                                    className="h-10 rounded-xl gap-2 border-brand-secondary/30 bg-background/50 px-5 font-medium text-sm transition-all hover:border-brand-secondary/50 hover:text-brand-secondary active:scale-[0.97] text-brand-secondary"
                                    onClick={handleSaveDraft}
                                    disabled={isSaving}
                                >
                                    {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                    Guardar borrador
                                </Button>

                                {safeStep < steps.length - 1 ? (
                                    <Button
                                        data-testid="quote-wizard-next"
                                        onClick={handleNext}
                                        disabled={isSaving}
                                        className="h-10 rounded-xl gap-2 px-6 font-semibold text-sm bg-brand-primary text-white shadow-md shadow-brand-primary/20 transition-all hover:shadow-brand-primary/30 hover:bg-brand-primary/90 active:scale-[0.97]"
                                    >
                                        Continuar
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Button>
                                ) : (
                                    <Button
                                        data-testid="quote-wizard-submit"
                                        className="h-10 rounded-xl gap-2 bg-brand-primary px-6 font-semibold text-sm text-white shadow-md shadow-brand-primary/25 transition-all hover:shadow-brand-primary/40 hover:bg-brand-primary/90 active:scale-[0.97]"
                                        onClick={handleFinalize}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                                        Finalizar cotización
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Preview disponible en el paso final (Tarifas - index 5) */}
                {safeStep === 5 && (
                    <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <QuotePreview />
                    </div>
                )}
            </div>
        </div>
    );
}
