"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActiveQuote, useQuoteActions } from "@/features/quotes/store/quote-store";
import { DollarSign, Percent, ArrowRightLeft, FileText, RefreshCw, Coins, TrendingUp, Sparkles } from "lucide-react";
import { getTRM } from "@/lib/trm";
import { formatCOP, formatUSD, formatTRM, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { calculateNacional, calculateInternacional } from "@/features/quotes/utils/calculator";

export function StepFinances() {
    const activeQuote = useActiveQuote();
    const { setQuoteField } = useQuoteActions();
    const [trmSource, setTrmSource] = useState<string | null>(null);
    const [trmLoading, setTrmLoading] = useState(false);

    const isNacional = activeQuote.destinationType === "nacional";

    // ── Financials internacionales ──────────────────────────────────────────
    const netCostUSD = activeQuote.netCostUSD || 0;
    const trm = activeQuote.trmUsed || 4200;

    // ── Financials nacionales ───────────────────────────────────────────────
    const netCostCOP = activeQuote.netCostCOP || 0;

    const fee = activeQuote.feePercentage ?? 15;

    // ── Cálculos ────────────────────────────────────────────────────────────
    const calcNac = isNacional ? calculateNacional(netCostCOP, fee) : null;
    const calcInt = !isNacional ? calculateInternacional(netCostUSD, fee, trm) : null;

    const fetchTRM = async () => {
        setTrmLoading(true);
        try {
            const data = await getTRM();
            setQuoteField("trmUsed", data.valor);
            setTrmSource(data.fuente === "fallback" ? "valor de respaldo" : "Banco de la República");
        } finally {
            setTrmLoading(false);
        }
    };

    // Para internacionales: auto-fetch TRM si aún no se tiene
    useEffect(() => {
        if (!isNacional && (!activeQuote.trmUsed || activeQuote.trmUsed === 4000)) {
            fetchTRM();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isNacional]);

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* ── Campos de entrada ─────────────────────────────────────────── */}
            <div className={`grid grid-cols-1 gap-8 ${isNacional ? "md:grid-cols-2" : "md:grid-cols-3"}`}>

                {/* Costo Neto — condicional según tipo */}
                {isNacional ? (
                    <div className="space-y-4">
                        <Label
                            htmlFor="netCostCOP"
                            className={cn(
                                "flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] ml-1",
                                activeQuote.netCostCOP === 0 ? "text-destructive" : "text-muted-foreground/60"
                            )}
                        >
                            <Coins className={cn("h-4 w-4", activeQuote.netCostCOP === 0 ? "text-destructive" : "text-brand-primary")} strokeWidth={3} />
                            Costo Neto Operación (COP)
                        </Label>
                        <Input
                            id="netCostCOP"
                            type="number"
                            min={0}
                            step={1000}
                            value={netCostCOP || ""}
                            onChange={(e) => setQuoteField("netCostCOP", parseFloat(e.target.value) || 0)}
                            data-testid="quote-finances-net-cop"
                            className={cn(
                                "h-14 rounded-2xl border-2 border-glass-border bg-background/50 text-lg font-black tabular-nums transition-all duration-300 focus-visible:ring-8 focus-visible:ring-brand-primary/5 focus-visible:border-brand-primary/40",
                                activeQuote.netCostCOP === 0 && "border-destructive/40 bg-destructive/5 focus-visible:border-destructive focus-visible:ring-destructive/10"
                            )}
                            placeholder="0"
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Label
                            htmlFor="netCostUSD"
                            className={cn(
                                "flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] ml-1",
                                activeQuote.netCostUSD === 0 ? "text-destructive" : "text-muted-foreground/60"
                            )}
                        >
                            <DollarSign className={cn("h-4 w-4", activeQuote.netCostUSD === 0 ? "text-destructive" : "text-brand-primary")} strokeWidth={3} />
                            Costo Neto (USD)
                        </Label>
                        <Input
                            id="netCostUSD"
                            type="number"
                            min={0}
                            step={0.01}
                            value={netCostUSD || ""}
                            onChange={(e) => setQuoteField("netCostUSD", parseFloat(e.target.value) || 0)}
                            data-testid="quote-finances-net-usd"
                            className={cn(
                                "h-14 rounded-2xl border-2 border-glass-border bg-background/50 text-lg font-black tabular-nums transition-all duration-300 focus-visible:ring-8 focus-visible:ring-brand-primary/5 focus-visible:border-brand-primary/40",
                                activeQuote.netCostUSD === 0 && "border-destructive/40 bg-destructive/5 focus-visible:border-destructive focus-visible:ring-destructive/10"
                            )}
                            placeholder="0.00"
                        />
                    </div>
                )}

                {/* Fee / Markup — siempre visible */}
                <div className="space-y-4">
                    <Label htmlFor="feePercentage" className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground/60">
                        <Percent className="h-4 w-4 text-brand-primary" strokeWidth={3} />
                        Margen de Agencia (%)
                    </Label>
                    <Input
                        id="feePercentage"
                        type="number"
                        min={0}
                        max={100}
                        value={fee}
                        onChange={(e) => setQuoteField("feePercentage", parseFloat(e.target.value) || 0)}
                        data-testid="quote-finances-fee"
                        className="h-14 rounded-2xl border-2 border-glass-border bg-background/50 text-lg font-black tabular-nums transition-all duration-300 focus-visible:ring-8 focus-visible:ring-brand-primary/5 focus-visible:border-brand-primary/40 italic"
                    />
                </div>

                {/* TRM — solo para internacionales */}
                {!isNacional && (
                    <div className="space-y-4">
                        <Label htmlFor="trmUsed" className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground/60">
                            <span className="flex items-center gap-3">
                                <ArrowRightLeft className="h-4 w-4 text-brand-secondary" strokeWidth={3} />
                                TRM Referencial
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-lg hover:bg-brand-secondary/10 hover:text-brand-secondary transition-all active:scale-90"
                                onClick={fetchTRM}
                                title="Actualizar TRM"
                            >
                                <RefreshCw className={`h-4 w-4 ${trmLoading ? "animate-spin" : ""}`} />
                            </Button>
                        </Label>
                        <Input
                            id="trmUsed"
                            type="number"
                            min={0}
                            value={trm}
                            onChange={(e) => setQuoteField("trmUsed", parseFloat(e.target.value) || 0)}
                            data-testid="quote-finances-trm"
                            className="h-14 rounded-2xl border-2 border-glass-border bg-background/50 text-lg font-black tabular-nums transition-all duration-300 focus-visible:ring-8 focus-visible:ring-brand-secondary/5 focus-visible:border-brand-secondary/40"
                        />
                    </div>
                )}
            </div>

            {/* ── Cards de resultado ────────────────────────────────────────── */}
            <div className="relative">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-brand-primary text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 z-10">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Resumen Financiero Estratégico
                </div>

                {isNacional && calcNac ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-10 rounded-[2.5rem] bg-brand-primary/5 border-2 border-brand-primary/20 backdrop-blur-3xl text-center shadow-2xl shadow-brand-primary/5 group transition-all duration-500 hover:border-brand-primary/40 animate-scale-in">
                            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-brand-primary/60 mb-3">Valor Propuesta Cliente</p>
                            <p className="text-5xl font-black text-brand-primary tabular-nums tracking-tighter italic-pro-max">
                                {formatCOP(calcNac.totalCOP)}
                            </p>
                        </div>
                        <div className="p-10 rounded-[2.5rem] bg-emerald-500/5 border-2 border-emerald-500/20 backdrop-blur-3xl text-center shadow-2xl shadow-emerald-500/5 group transition-all duration-500 hover:border-emerald-500/40 animate-scale-in [animation-delay:100ms]">
                            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-emerald-600/60 mb-3">Utilidad Bruta Proyectada</p>
                            <p className="text-5xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tighter italic-pro-max">
                                {formatCOP(calcNac.profitCOP)}
                            </p>
                        </div>
                    </div>
                ) : calcInt ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-10 rounded-[2.5rem] bg-brand-primary/5 border-2 border-brand-primary/20 backdrop-blur-3xl text-center shadow-2xl shadow-brand-primary/5 group transition-all duration-500 hover:border-brand-primary/40 animate-scale-in">
                            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-brand-primary/60 mb-3">Valor en Dólares</p>
                            <p className="text-4xl font-black text-brand-primary tabular-nums tracking-tighter italic-pro-max">
                                {formatUSD(calcInt.totalUSD)}
                            </p>
                        </div>
                        <div className="p-10 rounded-[2.5rem] bg-brand-secondary/5 border-2 border-brand-secondary/20 backdrop-blur-3xl text-center shadow-2xl shadow-brand-secondary/5 group transition-all duration-500 hover:border-brand-secondary/40 animate-scale-in [animation-delay:100ms]">
                            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-brand-secondary/60 mb-3">Valor en Pesos</p>
                            <p className="text-4xl font-black text-brand-secondary tabular-nums tracking-tighter italic-pro-max">
                                {formatCOP(calcInt.totalCOP)}
                            </p>
                            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-brand-secondary/10 rounded-full text-[10px] font-bold text-brand-secondary/80">
                                TRM: {formatTRM(trm)}
                            </div>
                        </div>
                        <div className="p-10 rounded-[2.5rem] bg-emerald-500/5 border-2 border-emerald-500/20 backdrop-blur-3xl text-center shadow-2xl shadow-emerald-500/5 group transition-all duration-500 hover:border-emerald-500/40 animate-scale-in [animation-delay:200ms]">
                            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-emerald-600/60 mb-3">Margen Agencia</p>
                            <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tighter italic-pro-max">
                                {formatUSD(calcInt.feeAmountUSD)}
                            </p>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Condiciones legales */}
            <div className="space-y-4">
                <Label htmlFor="legalConditions" className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground/60">
                    <FileText className="h-4 w-4 text-brand-primary" strokeWidth={3} />
                    Marco Legal y Condiciones Generales
                </Label>
                <Textarea
                    id="legalConditions"
                    placeholder="Sujeto a disponibilidad. Precios no incluyen impuestos de salida..."
                    value={activeQuote.legalConditions || ""}
                    onChange={(e) => setQuoteField("legalConditions", e.target.value)}
                    data-testid="quote-finances-legal"
                    className="min-h-[120px] resize-none rounded-[2rem] border-2 border-glass-border bg-background/50 text-base font-medium leading-relaxed p-6 transition-all duration-300 focus-visible:ring-8 focus-visible:ring-brand-primary/5 focus-visible:border-brand-primary/40 focus-visible:bg-background"
                />
            </div>
        </div>
    );
}
