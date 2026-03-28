"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuoteActions } from "@/features/quotes/store/quote-store";
import { toast } from "sonner";

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

            if (!res.ok) {
                const err = await res.json();
                toast.error("Error de IA", { description: err.error || "No se pudo procesar el texto" });
                setIsProcessing(false);
                return;
            }

            const data = await res.json();

            // Prepare the quote object for atomic update
            const updates: Partial<import("@/features/quotes/schemas/quote-schema").Quote> = {};

            if (data.travelerName) updates.travelerName = data.travelerName;
            if (data.email) updates.email = data.email;
            if (data.phone) updates.phone = data.phone;
            if (data.destination) updates.destination = data.destination;
            if (data.destinationType) updates.destinationType = data.destinationType;
            if (data.numberOfTravelers) updates.numberOfTravelers = data.numberOfTravelers;
            if (data.inclusions) updates.inclusions = data.inclusions;
            if (data.exclusions) updates.exclusions = data.exclusions;
            if (data.hotelInfo) updates.hotelInfo = data.hotelInfo;
            if (data.airlineInfo) updates.airlineInfo = data.airlineInfo;
            if (data.netCostUSD) updates.netCostUSD = data.netCostUSD;
            if (data.netCostCOP) updates.netCostCOP = data.netCostCOP;

            // Date parsing (safely)
            if (data.departureDate) updates.departureDate = new Date(data.departureDate);
            if (data.returnDate) updates.returnDate = new Date(data.returnDate);

            // Trayectos de vuelo mapping
            if (data.flights && Array.isArray(data.flights)) {
                updates.flights = data.flights.map((f: any) => ({
                    ...f,
                    date: f.date ? new Date(f.date) : new Date()
                }));
            }

            // Hotel options mapping
            if (data.hotelOptions && Array.isArray(data.hotelOptions)) {
                updates.hotelOptions = data.hotelOptions.map((h: any) => ({
                    ...h,
                    price: Number(h.price) || 0,
                    isRecommended: !!h.isRecommended
                }));
            }

            // Itinerary mapping
            if (data.itinerary && Array.isArray(data.itinerary)) {
                updates.itinerary = data.itinerary.map((day: { day?: number, title?: string, description?: string, activities?: string[] }, idx: number) => ({
                    day: day.day || idx + 1,
                    title: day.title || "",
                    description: day.description || "",
                    activities: day.activities || []
                }));
            }

            // Perform atomic update
            setFullQuote(updates);

            toast.success("¡Datos extraídos!", {
                description: `Se han rellenado los campos para el viaje a ${data.destination || 'el destino'}.`
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
        <div className="relative rounded-[2rem] border border-glass-border bg-glass backdrop-blur-xl p-8 flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-brand-secondary/10 group overflow-hidden">
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
                <p className="text-[13px] font-semibold text-muted-foreground mt-2 leading-relaxed max-w-[280px]">
                    Optimiza tu flujo pegando el itinerario crudo. Nuestra IA estructurará cada detalle por ti.
                </p>
            </div>

            <div className="flex-1 flex flex-col space-y-5">
                <div className="relative">
                    <textarea
                        data-testid="ai-extractor-textarea"
                        className="flex-1 min-h-[180px] w-full bg-white/40 dark:bg-black/20 border border-glass-border shadow-inner rounded-2xl p-6 text-sm font-medium placeholder:text-muted-foreground/50 focus:ring-4 focus:ring-brand-secondary/5 focus:border-brand-secondary/40 focus:outline-none transition-all resize-none leading-relaxed"
                        placeholder="Pega aquí el texto del itinerario, correos o notas de WhatsApp..."
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                    />
                    {/* Indicador visual de 'Listo para procesar' */}
                    {rawText.trim() && (
                        <div className="absolute bottom-4 right-4 animate-fade-in">
                            <div className="h-2 w-2 rounded-full bg-brand-secondary animate-pulse" />
                        </div>
                    )}
                </div>

                <Button
                    data-testid="ai-extractor-button"
                    onClick={handleExtract}
                    disabled={isProcessing || !rawText.trim()}
                    className="w-full h-13 rounded-2xl text-base font-extrabold transition-all bg-brand-secondary text-primary-foreground hover:bg-brand-secondary/90 hover:-translate-y-0.5 active:scale-[0.98] shadow-lg shadow-brand-secondary/20 relative overflow-hidden group/btn"
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
