"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActiveQuote, useQuoteActions } from "@/features/quotes/store/quote-store";
import { DollarSign, Percent, ArrowRightLeft, FileText, RefreshCw, Coins, TrendingUp, Plus, Calendar, Settings2 } from "lucide-react";
import { SortableSectionList } from "./sortable-section-list";
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

    // ── Financials ──────────────────────────────────────────────────────────
    const pvpUSD = activeQuote.pvpUSD || 0;
    const pvpCOP = activeQuote.pvpCOP || 0;
    const trm = activeQuote.trmUsed || 4200;
    const fee = activeQuote.feePercentage ?? 15;
    const extra = activeQuote.extraMarginPercent ?? 0;

    // ── Cálculos (nueva API: pvp-based) ────────────────────────────────────
    const calcNac = isNacional ? calculateNacional(pvpCOP, fee, extra) : null;
    const calcInt = !isNacional ? calculateInternacional(pvpUSD, fee, trm, extra) : null;

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
            <div className={`grid grid-cols-1 gap-8 ${isNacional ? "md:grid-cols-3" : "md:grid-cols-4"}`}>

                {/* PVP Proveedor — condicional según tipo */}
                {isNacional ? (
                    <div className="space-y-4">
                        <Label
                            htmlFor="pvpCOP"
                            className={cn(
                                "flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] ml-1",
                                activeQuote.pvpCOP === 0 ? "text-destructive" : "text-muted-foreground/60"
                            )}
                        >
                            <Coins className={cn("h-4 w-4", activeQuote.pvpCOP === 0 ? "text-destructive" : "text-brand-primary")} strokeWidth={3} />
                            PVP Proveedor (COP)
                        </Label>
                        <Input
                            id="pvpCOP"
                            type="number"
                            min={0}
                            step={1000}
                            value={pvpCOP || ""}
                            onChange={(e) => setQuoteField("pvpCOP", parseFloat(e.target.value) || 0)}
                            data-testid="quote-finances-pvp-cop"
                            className={cn(
                                "h-14 rounded-2xl border-2 border-glass-border bg-background/50 text-lg font-black tabular-nums transition-all duration-300 focus-visible:ring-8 focus-visible:ring-brand-primary/5 focus-visible:border-brand-primary/40",
                                activeQuote.pvpCOP === 0 && "border-destructive/40 bg-destructive/5 focus-visible:border-destructive focus-visible:ring-destructive/10"
                            )}
                            placeholder="0"
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Label
                            htmlFor="pvpUSD"
                            className={cn(
                                "flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] ml-1",
                                activeQuote.pvpUSD === 0 ? "text-destructive" : "text-muted-foreground/60"
                            )}
                        >
                            <DollarSign className={cn("h-4 w-4", activeQuote.pvpUSD === 0 ? "text-destructive" : "text-brand-primary")} strokeWidth={3} />
                            PVP Proveedor (USD)
                        </Label>
                        <Input
                            id="pvpUSD"
                            type="number"
                            min={0}
                            step={0.01}
                            value={pvpUSD || ""}
                            onChange={(e) => setQuoteField("pvpUSD", parseFloat(e.target.value) || 0)}
                            data-testid="quote-finances-pvp-usd"
                            className={cn(
                                "h-14 rounded-2xl border-2 border-glass-border bg-background/50 text-lg font-black tabular-nums transition-all duration-300 focus-visible:ring-8 focus-visible:ring-brand-primary/5 focus-visible:border-brand-primary/40",
                                activeQuote.pvpUSD === 0 && "border-destructive/40 bg-destructive/5 focus-visible:border-destructive focus-visible:ring-destructive/10"
                            )}
                            placeholder="0.00"
                        />
                    </div>
                )}

                {/* Comisión del proveedor */}
                <div className="space-y-4">
                    <Label htmlFor="feePercentage" className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground/60">
                        <Percent className="h-4 w-4 text-brand-primary" strokeWidth={3} />
                        Comisión Proveedor (%)
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

                {/* Margen extra de la agencia */}
                <div className="space-y-4">
                    <Label htmlFor="extraMarginPercent" className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground/60">
                        <Plus className="h-4 w-4 text-emerald-500" strokeWidth={3} />
                        Margen Extra Agencia (%)
                    </Label>
                    <Input
                        id="extraMarginPercent"
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        value={extra}
                        onChange={(e) => setQuoteField("extraMarginPercent", parseFloat(e.target.value) || 0)}
                        data-testid="quote-finances-extra-margin"
                        className="h-14 rounded-2xl border-2 border-glass-border bg-background/50 text-lg font-black tabular-nums transition-all duration-300 focus-visible:ring-8 focus-visible:ring-emerald-500/10 focus-visible:border-emerald-500/40"
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
                        {trmSource && (
                            <p className="text-[10px] text-muted-foreground/50 ml-1">Fuente: {trmSource}</p>
                        )}
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Precio cliente */}
                        <div className="p-10 rounded-[2.5rem] bg-brand-primary/5 border-2 border-brand-primary/20 backdrop-blur-3xl text-center shadow-2xl shadow-brand-primary/5 group transition-all duration-500 hover:border-brand-primary/40 animate-scale-in">
                            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-brand-primary/60 mb-3">Precio al Viajero</p>
                            <p className="text-5xl font-black text-brand-primary tabular-nums tracking-tighter italic-pro-max">
                                {formatCOP(calcNac.precioClienteCOP)}
                            </p>
                        </div>
                        {/* Costo neto */}
                        <div className="p-10 rounded-[2.5rem] bg-muted/30 border-2 border-glass-border backdrop-blur-3xl text-center shadow-2xl shadow-muted/5 group transition-all duration-500 hover:border-muted-foreground/20 animate-scale-in [animation-delay:100ms]">
                            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 mb-3">Pago al Proveedor</p>
                            <p className="text-5xl font-black text-muted-foreground tabular-nums tracking-tighter italic-pro-max">
                                {formatCOP(calcNac.netCostCOP)}
                            </p>
                        </div>
                        {/* Utilidad */}
                        <div className="p-10 rounded-[2.5rem] bg-emerald-500/5 border-2 border-emerald-500/20 backdrop-blur-3xl text-center shadow-2xl shadow-emerald-500/5 group transition-all duration-500 hover:border-emerald-500/40 animate-scale-in [animation-delay:200ms]">
                            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-emerald-600/60 mb-3">Utilidad Agencia</p>
                            <p className="text-5xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tighter italic-pro-max">
                                {formatCOP(calcNac.utilidadCOP)}
                            </p>
                            {extra > 0 && (
                                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full text-[10px] font-bold text-emerald-600/80">
                                    incl. {extra}% extra
                                </div>
                            )}
                        </div>
                    </div>
                ) : calcInt ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Precio USD */}
                        <div className="p-10 rounded-[2.5rem] bg-brand-primary/5 border-2 border-brand-primary/20 backdrop-blur-3xl text-center shadow-2xl shadow-brand-primary/5 group transition-all duration-500 hover:border-brand-primary/40 animate-scale-in">
                            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-brand-primary/60 mb-3">Precio Viajero (USD)</p>
                            <p className="text-4xl font-black text-brand-primary tabular-nums tracking-tighter italic-pro-max">
                                {formatUSD(calcInt.precioClienteUSD)}
                            </p>
                        </div>
                        {/* Precio COP */}
                        <div className="p-10 rounded-[2.5rem] bg-brand-secondary/5 border-2 border-brand-secondary/20 backdrop-blur-3xl text-center shadow-2xl shadow-brand-secondary/5 group transition-all duration-500 hover:border-brand-secondary/40 animate-scale-in [animation-delay:100ms]">
                            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-brand-secondary/60 mb-3">Precio Viajero (COP)</p>
                            <p className="text-4xl font-black text-brand-secondary tabular-nums tracking-tighter italic-pro-max">
                                {formatCOP(calcInt.precioClienteCOP)}
                            </p>
                            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-brand-secondary/10 rounded-full text-[10px] font-bold text-brand-secondary/80">
                                TRM: {formatTRM(trm)}
                            </div>
                        </div>
                        {/* Pago proveedor */}
                        <div className="p-10 rounded-[2.5rem] bg-muted/30 border-2 border-glass-border backdrop-blur-3xl text-center shadow-2xl shadow-muted/5 group transition-all duration-500 hover:border-muted-foreground/20 animate-scale-in [animation-delay:200ms]">
                            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 mb-3">Pago al Proveedor</p>
                            <p className="text-4xl font-black text-muted-foreground tabular-nums tracking-tighter italic-pro-max">
                                {formatUSD(calcInt.netCostUSD)}
                            </p>
                        </div>
                        {/* Utilidad */}
                        <div className="p-10 rounded-[2.5rem] bg-emerald-500/5 border-2 border-emerald-500/20 backdrop-blur-3xl text-center shadow-2xl shadow-emerald-500/5 group transition-all duration-500 hover:border-emerald-500/40 animate-scale-in [animation-delay:300ms]">
                            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-emerald-600/60 mb-3">Utilidad Agencia</p>
                            <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tighter italic-pro-max">
                                {formatUSD(calcInt.utilidadUSD)}
                            </p>
                            {extra > 0 && (
                                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full text-[10px] font-bold text-emerald-600/80">
                                    incl. {extra}% extra
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}
            </div>

            {/* ── Configuración Final de PDF ────────────────────────────────── */}
            <div className="pt-8 mt-4 border-t border-glass-border">
                <div className="flex items-center gap-2 mb-8">
                    <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-white">
                        <Settings2 className="h-4 w-4" />
                    </div>
                    <h4 className="text-xl font-black uppercase tracking-tight text-foreground">Distribución de PDF</h4>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Validez de la oferta */}
                    <div className="space-y-4">
                        <Label
                            htmlFor="validUntil"
                            className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground/60"
                        >
                            <Calendar className="h-4 w-4 text-brand-primary" strokeWidth={3} />
                            Vigencia de la propuesta
                        </Label>
                        <Input
                            id="validUntil"
                            type="date"
                            value={activeQuote.validUntil ? new Date(activeQuote.validUntil).toISOString().split('T')[0] : ""}
                            onChange={(e) => setQuoteField("validUntil", new Date(e.target.value))}
                            data-testid="quote-design-validity"
                            className="h-14 rounded-2xl border-2 border-glass-border bg-background/50 text-base font-medium transition-all duration-300 focus-visible:ring-8 focus-visible:ring-brand-primary/5 focus-visible:border-brand-primary/40"
                        />
                        <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest font-black ml-1">
                            El enlace marcará la cotización como vencida tras esta fecha.
                        </p>
                    </div>

                    {/* Reordenamiento Drag and Drop */}
                    <div className="space-y-4">
                        <Label className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground/60">
                            Orden de Lectura del Cliente
                        </Label>
                        <div className="p-1 rounded-3xl border border-glass-border bg-background/30 shadow-inner">
                            <SortableSectionList />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
