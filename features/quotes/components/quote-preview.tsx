"use client";

import { useState, useEffect } from "react";
import { useActiveQuote } from "@/features/quotes/store/quote-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { QuoteTemplate } from "@/features/quotes/components/quote-template";
import type { Quote } from "@/features/quotes/schemas/quote-schema";
import {
    User, MapPin, Eye, Printer, Download, Loader2, X, FileText
} from "lucide-react";
import { formatCOP, formatUSD, formatTRM } from "@/lib/utils";
import { calculateNacional, calculateInternacional } from "@/features/quotes/utils/calculator";
import { cn } from "@/lib/utils";

/**
 * QuotePreview — Panel lateral de previsualización de cotización en curso.
 * Muestra datos clave y abre el modal de vista completa A4.
 */
export function QuotePreview() {
    const activeQuote = useActiveQuote();
    const [open, setOpen] = useState(false);

    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const isNacional = activeQuote.destinationType === "nacional";
    const commPercent = activeQuote.providerCommissionPercent ?? 10;
    const agencyFeePercent = activeQuote.agencyFeePercent ?? 5;
    const trm = activeQuote.trmUsed || 4200;

    const calcNac = isNacional ? calculateNacional(activeQuote.netCostCOP || 0, commPercent, agencyFeePercent) : null;
    const calcInt = !isNacional ? calculateInternacional(activeQuote.netCostUSD || 0, commPercent, agencyFeePercent, trm) : null;

    const hasFinancials = isNacional
        ? (activeQuote.netCostCOP || 0) > 0
        : (activeQuote.netCostUSD || 0) > 0;

    const hasData = activeQuote.travelerName || activeQuote.destination;

    useEffect(() => {
        async function generatePDFBlob() {
            if (open && activeQuote) {
                setIsGeneratingPdf(true);
                try {
                    const { pdf } = await import("@react-pdf/renderer");
                    const { QuoteDocument } = await import("@/features/quotes/components/pdf-document");
                    const blob = await pdf(<QuoteDocument quote={activeQuote as unknown as Quote} />).toBlob();
                    setPdfUrl(URL.createObjectURL(blob));
                } catch (error) {
                    console.error("Error generating PDF", error);
                } finally {
                    setIsGeneratingPdf(false);
                }
            }
        }

        generatePDFBlob();

        return () => {
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeQuote, open]);

    // ── Estado vacío ──────────────────────────────────────────────────────────
    if (!hasData) {
        return (
            <Card className="border border-dashed border-border/60 bg-muted/20 rounded-2xl shadow-none">
                <CardContent className="py-16 text-center space-y-3">
                    <div className="h-12 w-12 bg-muted rounded-xl flex items-center justify-center mx-auto">
                        <FileText className="h-6 w-6 text-muted-foreground/30" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-muted-foreground/60">Sin datos para previsualizar</p>
                        <p className="text-xs text-muted-foreground/40 max-w-[180px] mx-auto leading-relaxed">
                            Completá los datos del viajero para ver la previsualización.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            {/* ── Panel lateral de resumen ─────────────────────────────────── */}
            <Card className="border border-border/60 bg-card rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:border-border">
                <CardContent className="p-6 space-y-6">

                    {/* Header del panel */}
                    <div className="flex items-center gap-2 border-b border-border/40 pb-4">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <h3 className="text-xxs font-bold uppercase tracking-[0.1em] text-muted-foreground/60">
                            Vista previa
                        </h3>
                    </div>

                    {/* Datos del viajero */}
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground/40 shrink-0">
                            <User className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-base font-bold text-foreground tracking-tight truncate">
                                {activeQuote.travelerName || "—"}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground/70 mt-0.5">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="truncate">{activeQuote.destination || "Sin destino"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Métricas */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted/40 p-4 rounded-xl border border-border/50">
                            <p className="text-xxs font-bold uppercase tracking-[0.1em] text-muted-foreground/50 mb-1">Pasajeros</p>
                            <div className="text-lg font-extrabold text-foreground tabular-nums">
                                {activeQuote.numberOfTravelers || 1}
                                <span className="text-xs font-medium text-muted-foreground/40 ml-1">PAX</span>
                            </div>
                        </div>
                        <div className="bg-muted/40 p-4 rounded-xl border border-border/50">
                            <p className="text-xxs font-bold uppercase tracking-[0.1em] text-muted-foreground/50 mb-1">Días</p>
                            <div className="text-lg font-extrabold text-foreground tabular-nums">
                                {activeQuote.itinerary?.length || 0}
                                <span className="text-xs font-medium text-muted-foreground/40 ml-1">Noches</span>
                            </div>
                        </div>
                    </div>

                    {/* Financiero (si aplica) */}
                    {hasFinancials && (
                        <div className="pt-4 border-t border-border/40 space-y-3">
                            {isNacional && calcNac ? (
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground/50">Precio total</p>
                                    <p className="text-2xl font-extrabold text-brand-primary tabular-nums tracking-tight">
                                        {formatCOP(calcNac.precioClienteCOP)}
                                        <span className="text-xs font-medium text-muted-foreground/40 ml-1.5">COP</span>
                                    </p>
                                    <p className="text-xxs text-muted-foreground/50">
                                        Utilidad: {formatCOP(calcNac.utilidadCOP)}
                                    </p>
                                </div>
                            ) : calcInt ? (
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground/50">Inversión estimada</p>
                                        <p className="text-xl font-extrabold text-foreground tabular-nums tracking-tight">
                                            {formatUSD(calcInt.precioClienteUSD)}
                                        </p>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="text-sm font-bold text-brand-primary tabular-nums">
                                            {formatCOP(calcInt.precioClienteCOP)}
                                        </p>
                                        <p className="text-xxs font-bold text-muted-foreground/40 uppercase tracking-[0.1em]">
                                            TRM {formatTRM(trm)}
                                        </p>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )}

                    {/* CTA Principal */}
                    <Button
                        data-testid="quote-preview-visualize"
                        onClick={() => setOpen(true)}
                        className="w-full h-10 rounded-xl bg-brand-primary text-white font-semibold text-sm gap-2 shadow-md shadow-brand-primary/20 hover:bg-brand-primary/90 active:scale-[0.97] transition-all"
                    >
                        <Eye className="h-4 w-4" />
                        Ver propuesta
                    </Button>
                </CardContent>
            </Card>

            {/* ── Slide-over Document ──────────────────────────────────────── */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="right" className="!w-screen !max-w-none p-0 gap-0 overflow-hidden flex flex-col bg-background border-none shadow-2xl">
                    <VisuallyHidden.Root>
                        <SheetTitle>Previsualización — {activeQuote.travelerName || "Cotización"}</SheetTitle>
                        <SheetDescription>Vista detallada de la propuesta de viaje en formato A4.</SheetDescription>
                    </VisuallyHidden.Root>

                    <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background/95 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-xxs font-extrabold uppercase tracking-[0.2em] text-brand-primary">
                                    Propuesta de viajes
                                </span>
                                <h2 className="text-sm font-bold text-foreground uppercase tracking-tight">
                                    {activeQuote.destination || "Sin Destino"}
                                </h2>
                            </div>

                            <div className="h-8 w-px bg-white/10 hidden md:block" />

                            <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xxs font-extrabold text-muted-foreground uppercase tracking-[0.1em]">
                                    Previsualización de documento PDF
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2 mr-4 px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                                <div className={cn("h-1.5 w-1.5 rounded-full", activeQuote.id ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-amber-500 animate-pulse")} />
                                <span className="text-xxs font-bold text-muted-foreground/60 uppercase tracking-wider">
                                    {activeQuote.id ? "Sincronizado con Servidor" : "Sesión Local / Borrador"}
                                </span>
                            </div>

                            <Button
                                asChild
                                variant="secondary"
                                size="sm"
                                className="h-9 px-5 rounded-xl bg-brand-primary text-white font-bold text-xxs uppercase tracking-wider hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20"
                            >
                                <a
                                    href={pdfUrl || "#"}
                                    download={`Propuesta-${activeQuote.travelerName || "Trappvel"}.pdf`}
                                >
                                    {isGeneratingPdf ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                                    ) : (
                                        <Download className="h-3.5 w-3.5 mr-2" />
                                    )}
                                    Exportar PDF
                                </a>
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setOpen(false)}
                                className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-muted/30 p-4 md:p-12 scrollbar-premium flex flex-col items-center">

                        {/* Status bar sutil sobre el documento */}
                        <div className="flex flex-col items-center gap-1.5 opacity-50 mb-4">
                            <div className="h-10 w-10 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                                <span className="text-xxs font-bold text-muted-foreground/40">TP</span>
                            </div>
                            <p className="text-xxs font-extrabold uppercase tracking-widest text-muted-foreground/40">TravelPro 2026</p>
                        </div>

                        <div className="w-[210mm] flex items-center justify-between px-1 mb-2">
                            <div className="flex items-center gap-2">
                                <FileText className="h-3 w-3 text-muted-foreground/40" />
                                <span className="text-xxs font-extrabold text-muted-foreground/50 uppercase tracking-[0.2em]">
                                    A4 Vertical · {isNacional ? 'Nacional' : 'Internacional'}
                                </span>
                            </div>
                            <span className="text-xxs font-extrabold text-muted-foreground/30 uppercase tracking-[0.2em]">
                                v3.0 · {new Date().toLocaleDateString()}
                            </span>
                        </div>

                        {/* Multi-Page Document Canvas (A4 Pages) */}
                        <div className="flex flex-col items-center gap-0 pb-20 w-full">
                            {/* Seamless integration of the Quote Template which contains multiple A4 pages */}
                            <QuoteTemplate />

                            {/* Signatures Page attached to the end */}
                            <div className="relative w-[210mm] bg-white shadow-2xl ring-1 ring-border/50 mx-auto overflow-hidden min-h-[150mm] flex flex-col print:shadow-none print:ring-0 print:break-after-page">
                                <div className="px-10 pb-20 pt-10 bg-white flex-1 flex flex-col justify-end">
                                    <div className="mt-auto pt-16 flex justify-between gap-16 border-t border-border">
                                        <div className="flex-1">
                                            <div className="h-px bg-border w-full mb-3" />
                                            <p className="text-xs font-bold text-foreground uppercase tracking-[0.1em]">Asesor Encargado</p>
                                            <p className="text-xxs text-muted-foreground/80 leading-relaxed">Trappvel</p>
                                        </div>
                                        <div className="flex-1">
                                            <div className="h-px bg-border w-full mb-3" />
                                            <p className="text-xs font-bold text-foreground uppercase tracking-[0.1em] text-right">Aceptación Cliente</p>
                                            <p className="text-xxs text-muted-foreground mt-1 text-right">Firma Digital / Escrita</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
