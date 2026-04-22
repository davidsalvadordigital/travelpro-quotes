"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActiveQuote, useQuoteActions } from "@/features/quotes/store/quote-store";
import { Banknote, HandCoins, Zap, FileText, RefreshCw, Coins, TrendingUp, Calendar, Settings2, DollarSign } from "lucide-react";
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
    const netCostUSD = activeQuote.netCostUSD || 0;
    const netCostCOP = activeQuote.netCostCOP || 0;
    const trm = activeQuote.trmUsed || 4200;
    const commPercent = activeQuote.providerCommissionPercent ?? 10;
    const agencyFeePercent = activeQuote.agencyFeePercent ?? 5;

    // ── Cálculos (Modelo Net-Centric) ──────────────────────────────────────
    const calcNac = isNacional ? calculateNacional(netCostCOP, commPercent, agencyFeePercent) : null;
    const calcInt = !isNacional ? calculateInternacional(netCostUSD, commPercent, agencyFeePercent, trm) : null;

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
        if (!isNacional && (!activeQuote.trmUsed || activeQuote.trmUsed === 4200)) {
            fetchTRM();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isNacional]);

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* ── Campos de entrada ─────────────────────────────────────────── */}
            <div className={`grid grid-cols-1 gap-8 ${isNacional ? "md:grid-cols-3" : "md:grid-cols-4"}`}>

                {/* Costo Neto Proveedor — condicional según tipo */}
                {isNacional ? (
                    <div className="space-y-4">
                        <Label
                            htmlFor="netCostCOP"
                            className={cn(
                                "flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.15em] ml-1",
                                activeQuote.netCostCOP === 0 ? "text-destructive" : "text-muted-foreground/70"
                            )}
                        >
                            <Banknote className={cn("h-3.5 w-3.5", activeQuote.netCostCOP === 0 ? "text-destructive" : "text-brand-primary")} strokeWidth={2.5} />
                            Costo Neto (COP)
                        </Label>
                        <Input
                            id="netCostCOP"
                            type="number"
                            min={0}
                            step={1000}
                            value={netCostCOP || ""}
                            onChange={(e) => setQuoteField("netCostCOP", parseFloat(e.target.value) || 0)}
                            className={cn(
                                "h-10 rounded-xl border border-border/60 bg-background/50 text-sm font-bold tabular-nums transition-all focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary/40",
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
                                "flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.15em] ml-1",
                                activeQuote.netCostUSD === 0 ? "text-destructive" : "text-muted-foreground/70"
                            )}
                        >
                            <Banknote className={cn("h-3.5 w-3.5", activeQuote.netCostUSD === 0 ? "text-destructive" : "text-brand-primary")} strokeWidth={2.5} />
                            Costo Neto (USD)
                        </Label>
                        <Input
                            id="netCostUSD"
                            type="number"
                            min={0}
                            step={0.01}
                            value={netCostUSD || ""}
                            onChange={(e) => setQuoteField("netCostUSD", parseFloat(e.target.value) || 0)}
                            className={cn(
                                "h-10 rounded-xl border border-border/60 bg-background/50 text-sm font-bold tabular-nums transition-all focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary/40",
                                activeQuote.netCostUSD === 0 && "border-destructive/40 bg-destructive/5 focus-visible:border-destructive focus-visible:ring-destructive/10"
                            )}
                            placeholder="0.00"
                        />
                    </div>
                )}

                {/* Comisión del proveedor */}
                <div className="space-y-4">
                    <Label htmlFor="providerCommissionPercent" className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.15em] ml-1 text-muted-foreground/70">
                        <HandCoins className="h-3.5 w-3.5 text-brand-primary" strokeWidth={2.5} />
                        Comisión Proveedor (%)
                    </Label>
                    <Input
                        id="providerCommissionPercent"
                        type="number"
                        min={0}
                        max={100}
                        value={commPercent}
                        onChange={(e) => setQuoteField("providerCommissionPercent", parseFloat(e.target.value) || 0)}
                        className="h-10 rounded-xl border border-border/60 bg-background/50 text-sm font-bold tabular-nums transition-all focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary/40"
                    />
                </div>

                {/* Fee adicional de la agencia */}
                <div className="space-y-4">
                    <Label htmlFor="agencyFeePercent" className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.15em] ml-1 text-muted-foreground/70">
                        <Zap className="h-3.5 w-3.5 text-brand-primary" strokeWidth={2.5} />
                        Fee Agencia (%)
                    </Label>
                    <Input
                        id="agencyFeePercent"
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        value={agencyFeePercent}
                        onChange={(e) => setQuoteField("agencyFeePercent", parseFloat(e.target.value) || 0)}
                        className="h-10 rounded-xl border border-border/60 bg-background/50 text-sm font-bold tabular-nums transition-all focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/40"
                    />
                </div>

                {/* TRM — solo para internacionales */}
                {!isNacional && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.15em] ml-1 text-muted-foreground/70">
                            <button
                                type="button"
                                onClick={fetchTRM}
                                className="flex items-center gap-2.5 hover:text-brand-secondary transition-colors group"
                                title="Click para actualizar TRM"
                            >
                                <RefreshCw className={cn("h-3.5 w-3.5 text-brand-secondary group-hover:scale-110 transition-transform", trmLoading && "animate-spin")} strokeWidth={2.5} />
                                <span>TRM Pactada</span>
                            </button>
                        </div>
                        <Input
                            id="trmUsed"
                            type="number"
                            min={0}
                            value={trm}
                            onChange={(e) => setQuoteField("trmUsed", parseFloat(e.target.value) || 0)}
                            className="h-10 rounded-xl border border-border/60 bg-background/50 text-sm font-bold tabular-nums transition-all focus-visible:ring-2 focus-visible:ring-brand-secondary/20 focus-visible:border-brand-secondary/40"
                        />
                        {trmSource && (
                            <p className="text-[10px] text-muted-foreground/50 ml-1">Fuente: {trmSource}</p>
                        )}
                    </div>
                )}
            </div>

            {/* ── Cards de resultado ────────────────────────────────────────── */}
            <div className="pt-6 border-t border-border/40">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-brand-primary" />
                        <span className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Desglose de Tarifas</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Cálculo para {activeQuote.numberOfTravelers || 1} { (activeQuote.numberOfTravelers || 1) === 1 ? "Pasajero" : "Pasajeros" }
                    </div>
                </div>

                {isNacional && calcNac ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* PRECIO PAX DESTACADO */}
                        <div className="md:col-span-2 p-6 rounded-2xl bg-brand-primary text-white shadow-xl shadow-brand-primary/20 flex flex-col justify-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <Coins className="h-24 w-24 rotate-12" />
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80 mb-1">Precio Cliente (PAX)</p>
                            <p className="text-4xl font-black tabular-nums tracking-tighter">
                                {formatCOP(calcNac.precioClienteCOP)}
                            </p>
                            <div className="flex items-center gap-4 mt-2 opacity-60 text-[10px] font-medium uppercase tracking-widest">
                                <span>Costo Base: {formatCOP(calcNac.netCostCOP)}</span>
                                <span className="h-1 w-1 rounded-full bg-white/40" />
                                <span>Fee: {formatCOP(calcNac.agencyFeeAmountCOP)}</span>
                            </div>
                        </div>

                        {/* TOTAL GRUPAL */}
                        <div className="p-6 rounded-2xl bg-card border border-border/60 flex flex-col justify-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Total Cotización</p>
                            <p className="text-xl font-bold text-foreground tabular-nums">
                                {formatCOP(calcNac.precioClienteCOP * (activeQuote.numberOfTravelers || 1))}
                            </p>
                        </div>

                        {/* UTILIDAD */}
                        <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col justify-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/60 mb-1">Rentabilidad Estimada</p>
                            <p className="text-xl font-bold text-emerald-600 tabular-nums">
                                {formatCOP(calcNac.utilidadCOP * (activeQuote.numberOfTravelers || 1))}
                            </p>
                            <p className="text-[10px] font-bold text-emerald-500/60 mt-1">Comisión {commPercent}% + Fee {agencyFeePercent}%</p>
                        </div>
                    </div>
                ) : calcInt ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* PRECIO PAX DESTACADO (USD) */}
                        <div className="md:col-span-2 p-6 rounded-2xl bg-brand-primary text-white shadow-xl shadow-brand-primary/20 flex flex-col justify-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <DollarSign className="h-24 w-24 rotate-12" />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80 mb-1">Precio Cliente (PAX)</p>
                                    <p className="text-4xl font-black tabular-nums tracking-tighter">
                                        {formatUSD(calcInt.precioClienteUSD)}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1 opacity-60 text-[9px] font-medium uppercase tracking-widest">
                                        <span>Costo Base: {formatUSD(calcInt.netCostUSD)}</span>
                                        <span className="h-1 w-1 rounded-full bg-white/40" />
                                        <span>Fee: {formatUSD(calcInt.agencyFeeAmountUSD)}</span>
                                    </div>
                                </div>
                                <div className="text-right border-l border-white/20 pl-4">
                                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-1 leading-none">En Pesos (TRM)</p>
                                    <p className="text-sm font-bold opacity-90 tabular-nums">
                                        {formatCOP(calcInt.precioClienteCOP)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* TOTAL GRUPAL */}
                        <div className="p-6 rounded-2xl bg-card border border-border/60 flex flex-col justify-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Total Cotización</p>
                            <p className="text-xl font-bold text-foreground tabular-nums">
                                {formatUSD(calcInt.precioClienteUSD * (activeQuote.numberOfTravelers || 1))}
                            </p>
                            <p className="text-[10px] font-medium text-muted-foreground/40 mt-1 uppercase tracking-tighter">
                                ≈ {formatCOP(calcInt.precioClienteCOP * (activeQuote.numberOfTravelers || 1))} Total
                            </p>
                        </div>

                        {/* UTILIDAD */}
                        <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col justify-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/60 mb-1">Utilidad Agencia</p>
                            <p className="text-xl font-bold text-emerald-600 tabular-nums">
                                {formatUSD(calcInt.utilidadUSD * (activeQuote.numberOfTravelers || 1))}
                            </p>
                            <p className="text-[10px] font-bold text-emerald-500/60 mt-1">Margen total acumulado ({formatCOP(calcInt.utilidadCOP * (activeQuote.numberOfTravelers || 1))})</p>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* ── Configuración Final de PDF ────────────────────────────────── */}
            <div className="pt-6 mt-2 border-t border-border/40">
                <div className="flex items-center gap-2 mb-5">
                    <Settings2 className="h-3.5 w-3.5 text-muted-foreground/50" />
                    <h4 className="text-sm font-bold text-muted-foreground/70 uppercase tracking-widest">Configuración del documento</h4>
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
                            className="h-10 rounded-xl border-border/60 bg-background/50 text-sm font-medium transition-all focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary/40"
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
                        <div className="p-1 rounded-xl border border-border/50 bg-background/30">
                            <SortableSectionList />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

