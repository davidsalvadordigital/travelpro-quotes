"use client";

import { useState, useEffect } from "react";
import { useActiveQuote } from "@/features/quotes/store/quote-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { QuoteTemplate } from "@/features/quotes/components/quote-template";
import type { Quote } from "@/features/quotes/schemas/quote-schema";
import {
    User, MapPin, Eye, Printer, Download, Loader2, ArrowRight, X, Sparkles, ShieldCheck
} from "lucide-react";
import { formatCOP, formatUSD, formatTRM } from "@/lib/utils";
import { calculateNacional, calculateInternacional } from "@/features/quotes/utils/calculator";
import { cn } from "@/lib/utils";

/**
 * QuotePreview — Diamond Standard Edition (2026)
 * Previsualización lateral con estilo Glassmorphism Premium.
 * Modal de visualización "Modo Magazine" a pantalla completa.
 */
export function QuotePreview() {
    const activeQuote = useActiveQuote();
    const [open, setOpen] = useState(false);

    // Estados para PDF dinámico
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const isNacional = activeQuote.destinationType === "nacional";
    const fee = activeQuote.feePercentage ?? 15;
    const trm = activeQuote.trmUsed || 4200;

    const calcNac = isNacional ? calculateNacional(activeQuote.netCostCOP || 0, fee) : null;
    const calcInt = !isNacional ? calculateInternacional(activeQuote.netCostUSD || 0, fee, trm) : null;

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
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeQuote, open]);

    const handlePrint = () => { window.print(); };

    if (!hasData) {
        return (
            <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-[2.5rem] shadow-none">
                <CardContent className="py-20 text-center space-y-4">
                    <div className="h-16 w-16 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm border border-slate-100">
                        <Sparkles className="h-8 w-8 text-slate-300" />
                    </div>
                    <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Tu obra maestra se está creando...</p>
                    <p className="text-[10px] font-bold text-slate-300 max-w-[200px] mx-auto uppercase tracking-widest leading-relaxed">Completa los detalles para ver la magia.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            {/* Glassmorphism Preview Card */}
            <Card className="border-none ring-1 ring-white/20 bg-white/60 dark:bg-slate-900/40 backdrop-blur-3xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] rounded-[3rem] overflow-hidden transition-all duration-700 hover:shadow-[0_60px_100px_-20px_rgba(227,58,122,0.15)] group relative">
                {/* Accent glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#E33A7A]/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-[#E33A7A]/20 transition-all duration-700" />
                
                <CardContent className="p-10 space-y-8 relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Live Proposal Editor</h3>
                        </div>
                        <Badge variant="outline" className="rounded-full bg-slate-900 text-white border-none text-[8px] font-black tracking-widest px-4 py-1.5 uppercase italic">
                            Diamond v2.8
                        </Badge>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-6">
                            <div className="h-20 w-20 rounded-[2rem] bg-slate-900 flex items-center justify-center text-[#E33A7A] shadow-2xl transition-transform group-hover:rotate-6 duration-500">
                                <User className="h-10 w-10" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none truncate max-w-[150px]">
                                    {activeQuote.travelerName || "Elite Guest"}
                                </p>
                                <div className="flex items-center gap-2 text-[10px] font-black text-[#E33A7A] uppercase tracking-widest">
                                    <MapPin className="h-3 w-3" /> {activeQuote.destination || "Pendiente"}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50/80 p-5 rounded-[2rem] border border-slate-100/50 backdrop-blur-sm">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-2">Pasajeros</p>
                                <div className="text-xl font-black text-slate-800 tabular-nums italic">
                                    {activeQuote.numberOfTravelers || 1} <span className="text-[10px] font-bold opacity-30 not-italic">PAX</span>
                                </div>
                            </div>
                            <div className="bg-slate-50/80 p-5 rounded-[2rem] border border-slate-100/50 backdrop-blur-sm">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-2">Expedición</p>
                                <div className="text-xl font-black text-slate-800 tabular-nums italic">
                                    {activeQuote.itinerary?.length || 0} <span className="text-[10px] font-bold opacity-30 not-italic">DÍAS</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {hasFinancials && (
                        <div className="pt-8 border-t border-slate-100/50 flex flex-col gap-6">
                            {isNacional && calcNac ? (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <span>Total Inversión</span>
                                        <div className="flex items-center gap-1.5 text-emerald-500">
                                            <ShieldCheck className="h-3 w-3" /> Seguro
                                        </div>
                                    </div>
                                    <div className="text-4xl font-black text-[#E33A7A] tracking-tighter tabular-nums leading-none italic">
                                        {formatCOP(calcNac.totalCOP)} <span className="text-sm font-bold opacity-20 not-italic">COP</span>
                                    </div>
                                </div>
                            ) : calcInt ? (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total USD</p>
                                            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums leading-none italic">
                                                {formatUSD(calcInt.totalUSD)}
                                            </p>
                                        </div>
                                        <div className="text-right space-y-2">
                                            <p className="text-sm font-black text-[#E33A7A] tabular-nums leading-none">
                                                {formatCOP(calcInt.totalCOP)}
                                            </p>
                                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">TRM {formatTRM(trm)}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )}

                    <Button 
                        data-testid="quote-preview-visualize"
                        onClick={() => setOpen(true)}
                        className="w-full h-16 rounded-[2rem] bg-[#E33A7A] hover:bg-[#E33A7A]/90 text-white font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-[#E33A7A]/20 active:scale-95 transition-all relative overflow-hidden group/btn border-none"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                             Visualizar Experiencia <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-2 transition-transform duration-500" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                    </Button>
                </CardContent>
            </Card>

            {/* Full Quote Dialog — Magazine View Mode */}
            <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-[100vw] w-screen h-screen m-0 p-0 border-none shadow-none bg-[#F8FAFC] rounded-none flex flex-col items-center overflow-hidden custom-scrollbar">
                    {/* Título oculto para accesibilidad (screen readers) — requerido por Radix */}
                    <VisuallyHidden.Root asChild>
                        <DialogTitle>Propuesta de Viaje Premium — {activeQuote.travelerName || "Cliente Elite"}</DialogTitle>
                    </VisuallyHidden.Root>

                    {/* Floating Premium Navigation */}
                    <header className="fixed top-0 left-0 right-0 h-24 bg-[#0F172A]/95 backdrop-blur-2xl border-b border-white/5 px-12 flex items-center justify-between z-[100] transition-colors duration-500 hover:bg-[#0F172A]">
                        <div className="flex items-center gap-10">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setOpen(false)}
                                className="h-12 w-12 text-white/40 hover:text-[#E33A7A] hover:bg-[#E33A7A]/10 rounded-2xl transition-all duration-300"
                            >
                                <X className="h-6 w-6" />
                            </Button>
                            <div className="h-10 w-px bg-white/10 hidden md:block" />
                            <div className="space-y-1 hidden sm:block">
                                <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white flex items-center gap-4">
                                    <span className="text-[#E33A7A]">Trappvel</span> <span className="opacity-40">/</span> Luxury Proposal
                                </h2>
                                <p className="text-[9px] font-black uppercase tracking-[0.6em] text-white/20">Edición Diamante 2026 · Certificado de Exclusividad</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="hidden lg:flex flex-col text-right mr-6 border-r border-white/10 pr-10 space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Preparado para</p>
                                <p className="text-base font-black text-white italic tracking-tight">{activeQuote.travelerName || "Cliente Elite"}</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button
                                    data-testid="quote-preview-print"
                                    variant="outline"
                                    className="h-12 gap-3 rounded-2xl px-6 font-black uppercase tracking-widest text-[10px] bg-white/5 border-white/10 hover:bg-white/10 text-white transition-all active:scale-95 group/print"
                                    onClick={handlePrint}
                                >
                                    <Printer className="h-4 w-4 text-[#E33A7A] group-hover/print:scale-110 transition-transform" /> <span className="hidden sm:inline">Imprimir Propuesta</span>
                                </Button>

                                <Button
                                    asChild
                                    data-testid="quote-preview-download-master"
                                    className="h-12 gap-3 rounded-2xl px-10 font-black uppercase tracking-widest text-[10px] bg-[#E33A7A] hover:bg-[#E33A7A]/90 text-white shadow-[0_20px_40px_-10px_rgba(227,58,122,0.4)] transition-all active:scale-95 border-none group/dl"
                                >
                                    <a data-testid="quote-preview-download-link" href={pdfUrl || "#"} download={`Propuesta-Elite-${activeQuote.travelerName || 'Trappvel'}.pdf`}>
                                        {isGeneratingPdf ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>Descargar Master <Download className="h-4 w-4 group-hover/dl:translate-y-0.5 transition-transform" /></>
                                        )}
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </header>

                    {/* Magazine Layout Canvas */}
                    <div className="flex-1 w-full pt-24 overflow-y-auto bg-slate-100/30 flex justify-center p-6 md:p-12 lg:p-24 custom-scrollbar">
                        <div className="w-full max-w-[1000px] shadow-[0_80px_150px_-30px_rgba(0,0,0,0.1)] transition-transform duration-1000">
                             {/* Frame for the magazine page */}
                            <div className="bg-white rounded-sm overflow-hidden min-h-[1414px] ring-1 ring-slate-200">
                                <QuoteTemplate />
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
