"use client";

import { useState } from "react";
import { z } from "zod";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuoteActions } from "@/features/quotes/store/quote-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * AIExtractor — Inteligencia artificial para extracción de datos de itinerarios.
 * Permite pegar texto crudo y transformarlo en una cotización estructurada.
 */
export function AIExtractor() {
    const [rawText, setRawText] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const { setFullQuote } = useQuoteActions();

    const handleExtract = async () => {
        if (!rawText.trim()) return;
        setIsProcessing(true);

        try {
            const res = await fetch("/api/extract-lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: rawText })
            });

            let data;
            try {
                data = await res.json();
            } catch (err) {
                toast.error("Error del servidor", { description: "Respuesta inválida del servicio de IA." });
                setIsProcessing(false);
                return;
            }

            if (!res.ok) {
                toast.error("Error de IA", { description: data?.error || "No se pudo procesar el texto" });
                setIsProcessing(false);
                return;
            }

            // Definimos el esquema de lo que esperamos que la IA devuelva
            const ExtractorSchema = z.object({
                travelerName: z.string().optional(),
                email: z.string().optional(),
                phone: z.string().optional(),
                destination: z.string().optional(),
                destinationType: z.enum(["nacional", "internacional"]).optional(),
                numberOfTravelers: z.number().optional(),
                inclusions: z.array(z.string()).optional(),
                exclusions: z.array(z.string()).optional(),
                // Estos campos son para mapeo financiero interno
                pvpUSD: z.number().optional(),
                pvpCOP: z.number().optional(),
                departureDate: z.string().optional(),
                returnDate: z.string().optional(),
                flights: z.array(z.any()).optional(),
                hotelOptions: z.array(z.any()).optional(),
                itinerary: z.array(z.any()).optional(),
            }).passthrough();
            
            const validation = ExtractorSchema.safeParse(data);
            if (!validation.success) {
                toast.error("Datos inválidos", { description: "La IA devolvió un formato no reconocido." });
                setIsProcessing(false);
                return;
            }
            
            const rawData = validation.data;

            // Preparamos el objeto de actualización atómica
            // Usamos any para manejar la unión discriminada de forma dinámica durante la construcción
            const updates: any = {};

            if (rawData.travelerName) updates.travelerName = rawData.travelerName;
            if (rawData.email) updates.email = rawData.email;
            if (rawData.phone) updates.phone = rawData.phone;
            if (rawData.destination) updates.destination = rawData.destination;
            if (rawData.destinationType) updates.destinationType = rawData.destinationType;
            if (rawData.numberOfTravelers) updates.numberOfTravelers = rawData.numberOfTravelers;
            if (rawData.inclusions) updates.inclusions = rawData.inclusions;
            if (rawData.exclusions) updates.exclusions = rawData.exclusions;

            // Mapeo financiero inteligente
            if (rawData.destinationType === "nacional" && rawData.pvpCOP) {
                updates.netCostCOP = rawData.pvpCOP;
            } else if (rawData.destinationType === "internacional" && rawData.pvpUSD) {
                updates.netCostUSD = rawData.pvpUSD;
            }

            // Date parsing (safely)
            if (rawData.departureDate) updates.departureDate = new Date(rawData.departureDate);
            if (rawData.returnDate) updates.returnDate = new Date(rawData.returnDate);

            // Trayectos de vuelo mapping
            if (rawData.flights && Array.isArray(rawData.flights)) {
                updates.flights = rawData.flights.map((f: any) => ({
                    ...f,
                    date: f.date ? new Date(f.date) : new Date()
                }));
            }

            // Hotel options mapping
            if (rawData.hotelOptions && Array.isArray(rawData.hotelOptions)) {
                updates.hotelOptions = rawData.hotelOptions.map((h: any) => ({
                    ...h,
                    price: Number(h.price) || 0,
                    isRecommended: !!h.isRecommended
                }));
            }

            // Itinerary mapping
            if (rawData.itinerary && Array.isArray(rawData.itinerary)) {
                updates.itinerary = rawData.itinerary.map((day: { day?: number, title?: string, description?: string, activities?: string[] }, idx: number) => ({
                    day: day.day || idx + 1,
                    title: day.title || "",
                    description: day.description || "",
                    activities: day.activities || []
                }));
            }

            // Perform atomic update
            setFullQuote(updates);

            toast.success("¡Datos extraídos!", {
                description: `Se han rellenado los campos para el viaje a ${rawData.destination || 'el destino'}.`
            });
            setRawText(""); // Clear text area on success

        } catch (error) {
            console.error("Extraction failed", error);
            toast.error("Fallo de red", { description: "Hubo un error de conexión con el servicio de IA." });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="relative rounded-[2rem] border border-border/50 bg-card/50 shadow-sm p-6">
            {/* Elemento decorativo: Halo de luz dinámico */}
            <div className="absolute -top-12 -right-12 h-32 w-32 bg-brand-secondary/10 blur-3xl group-hover:bg-brand-secondary/20 transition-all duration-700" />
            
            {/* Icono flotante Cian en la esquina */}
            <div className="absolute top-6 right-6 p-2.5 bg-brand-secondary/10 border border-brand-secondary/20 rounded-xl text-brand-secondary animate-pulse-subtle">
                <Sparkles className="h-5 w-5" />
            </div>

            <div className="mb-6">
                <h3 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
                    Asistente Predictivo
                </h3>
                <p className="text-xs font-semibold text-muted-foreground mt-2 leading-relaxed max-w-[280px]">
                    Optimiza tu flujo pegando el itinerario crudo. Nuestra IA estructurará cada detalle por ti.
                </p>
            </div>

            <div className="flex-1 flex flex-col space-y-5">
                <div className="relative">
                    <textarea
                        data-testid="ai-extractor-textarea"
                        placeholder="Pega aquí el texto del itinerario, correos o notas de WhatsApp..."
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        className={cn(
                            "flex-1 min-h-[180px] w-full p-4 rounded-2xl bg-background/50 border border-border focus:ring-2 focus:ring-brand-secondary/20 transition-all outline-none text-sm font-medium shadow-inner resize-none",
                            isProcessing && "opacity-50 pointer-events-none"
                        )}
                    />
                    {/* Indicador visual de 'Listo para procesar' */}
                    {rawText.trim() && !isProcessing && (
                        <div className="absolute bottom-4 right-4 animate-fade-in">
                            <div className="h-2 w-2 rounded-full bg-brand-secondary animate-pulse" />
                        </div>
                    )}
                </div>

                <Button
                    data-testid="ai-extractor-button"
                    onClick={handleExtract}
                    disabled={isProcessing || !rawText.trim()}
                    className="w-full h-12 rounded-2xl text-base font-extrabold transition-all bg-brand-secondary text-white hover:bg-brand-secondary/90 hover:-translate-y-0.5 active:scale-[0.98] shadow-lg shadow-brand-secondary/20 relative overflow-hidden group/btn"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2.5" />
                            Sincronizando Datos...
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-5 w-5 mr-2.5 group-hover/btn:rotate-12 transition-transform" />
                            Ejecutar Extracción IA
                            {/* Shimmer Effect */}
                            <div className="absolute inset-0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
