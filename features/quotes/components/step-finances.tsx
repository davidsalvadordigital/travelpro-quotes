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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Costo Neto Proveedor */}
                <div className="space-y-2">
                    <Label
                        htmlFor={isNacional ? "netCostCOP" : "netCostUSD"}
                        className={cn(
                            "text-xs font-semibold tracking-wide cursor-pointer hover:text-brand-primary transition-colors",
                            (isNacional ? activeQuote.netCostCOP : activeQuote.netCostUSD) === 0 ? "text-danger" : "text-muted-foreground"
                        )}
                    >
                        Costo Neto {isNacional ? "(COP)" : "(USD)"}
                    </Label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary">
                            {isNacional ? <Banknote className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                        </div>
                        <Input
                            id={isNacional ? "netCostCOP" : "netCostUSD"}
                            type="number"
                            value={(isNacional ? netCostCOP : netCostUSD) || ""}
                            onChange={(e) => setQuoteField(isNacional ? "netCostCOP" : "netCostUSD", parseFloat(e.target.value) || 0)}
                            className={cn(
                                "h-11 pl-9 rounded-xl border-border bg-background text-sm font-bold tabular-nums transition-all focus-visible:ring-brand-primary/20",
                                (isNacional ? activeQuote.netCostCOP : activeQuote.netCostUSD) === 0 && "border-danger/40 bg-danger/5"
                            )}
                            placeholder="0.00"
                        />
                    </div>
                </div>

                {/* Comisión del proveedor */}
                <div className="space-y-2">
                    <Label htmlFor="providerCommissionPercent" className="text-xs font-semibold tracking-wide text-muted-foreground">
                        Comisión Proveedor (%)
                    </Label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                        <Input
                            id="providerCommissionPercent"
                            type="number"
                            value={commPercent}
                            onChange={(e) => setQuoteField("providerCommissionPercent", parseFloat(e.target.value) || 0)}
                            className="h-11 pl-9 rounded-xl border-border bg-background text-sm font-bold tabular-nums transition-all focus-visible:ring-brand-primary/20"
                        />
                    </div>
                </div>

                {/* Fee adicional de la agencia */}
                <div className="space-y-2">
                    <Label htmlFor="agencyFeePercent" className="text-xs font-semibold tracking-wide text-muted-foreground">
                        Fee Agencia (%)
                    </Label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary">
                            <Zap className="h-4 w-4" />
                        </div>
                        <Input
                            id="agencyFeePercent"
                            type="number"
                            value={agencyFeePercent}
                            onChange={(e) => setQuoteField("agencyFeePercent", parseFloat(e.target.value) || 0)}
                            className="h-11 pl-9 rounded-xl border-border bg-background text-sm font-bold tabular-nums transition-all focus-visible:ring-brand-primary/20"
                        />
                    </div>
                </div>

                {/* TRM */}
                {!isNacional && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="trmUsed" className="text-xs font-semibold tracking-wide text-muted-foreground">
                                TRM del día
                            </Label>
                            <button
                                type="button"
                                onClick={fetchTRM}
                                className="text-xs font-semibold text-brand-secondary hover:underline transition-all"
                            >
                                {trmLoading ? "Cargando..." : "Refrescar"}
                            </button>
                        </div>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary">
                                <RefreshCw className={cn("h-4 w-4", trmLoading && "animate-spin")} />
                            </div>
                            <Input
                                id="trmUsed"
                                type="number"
                                value={trm}
                                onChange={(e) => setQuoteField("trmUsed", parseFloat(e.target.value) || 0)}
                                className="h-11 pl-9 rounded-xl border-border bg-background text-sm font-bold tabular-nums transition-all focus-visible:ring-brand-secondary/20"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* ── Cards de resultado ────────────────────────────────────────── */}
            <div className="pt-8 border-t border-border">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shadow-sm ring-1 ring-brand-primary/20">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="text-base font-bold tracking-tight text-foreground">Desglose de Tarifas</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-muted rounded-full text-xs font-semibold text-muted-foreground border border-border/50">
                        <div className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse" />
                        Calculado para {activeQuote.numberOfTravelers || 1} {(activeQuote.numberOfTravelers || 1) === 1 ? "Viajero" : "Viajeros"}
                    </div>
                </div>

                {isNacional && calcNac ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* PRECIO PAX DESTACADO */}
                        <div className="md:col-span-2 p-8 rounded-3xl bg-brand-primary text-white shadow-xl shadow-brand-primary/25 flex flex-col justify-center relative overflow-hidden group transition-all hover:scale-[1.01]">
                            <div className="absolute -top-4 -right-4 p-4 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500">
                                <Coins className="h-32 w-32" />
                            </div>
                            <div className="relative">
                                <span className="text-xs font-medium text-white/80 mb-2 block">Precio Cliente (PAX)</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-extrabold tabular-nums tracking-tighter">
                                        {formatCOP(calcNac.precioClienteCOP)}
                                    </span>
                                    <span className="text-sm font-bold opacity-60">COP</span>
                                </div>
                                <div className="flex items-center gap-4 mt-6 pt-6 border-t border-white/10 text-xs font-medium text-white/60">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-medium text-white/60">Costo Base</span>
                                        <span className="text-white/90">{formatCOP(calcNac.netCostCOP)}</span>
                                    </div>
                                    <div className="w-px h-6 bg-white/10" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-medium text-white/60">Fee Agencia</span>
                                        <span className="text-white/90">{formatCOP(calcNac.agencyFeeAmountCOP)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* TOTAL GRUPAL */}
                        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-center gap-1 transition-all hover:border-brand-primary/20">
                            <span className="text-xs font-semibold text-muted-foreground">Total Cotización</span>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-bold text-foreground tabular-nums tracking-tight">
                                    {formatCOP(calcNac.precioClienteCOP * (activeQuote.numberOfTravelers || 1))}
                                </span>
                                <span className="text-xs font-bold text-muted-foreground">COP</span>
                            </div>
                        </div>

                        {/* UTILIDAD */}
                        <div className="p-6 rounded-2xl bg-success/5 border border-success/20 flex flex-col justify-center gap-1 transition-all hover:border-success/40">
                            <span className="text-xs font-semibold text-success/80">Utilidad Estimada</span>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-bold text-success tabular-nums tracking-tight">
                                    {formatCOP(calcNac.utilidadCOP * (activeQuote.numberOfTravelers || 1))}
                                </span>
                                <span className="text-xs font-bold text-success/60">COP</span>
                            </div>
                            <p className="text-xs font-medium text-success/80 mt-1">Margen: {commPercent}% + Fee {agencyFeePercent}%</p>
                        </div>
                    </div>
                ) : calcInt ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* PRECIO PAX DESTACADO (USD) */}
                        <div className="md:col-span-2 p-8 rounded-3xl bg-brand-primary text-white shadow-xl shadow-brand-primary/25 flex flex-col justify-center relative overflow-hidden group transition-all hover:scale-[1.01]">
                            <div className="absolute -top-4 -right-4 p-4 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500">
                                <DollarSign className="h-32 w-32" />
                            </div>
                            <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-8">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <span className="text-xs font-medium text-white/80 block">Precio Cliente (PAX)</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-extrabold tabular-nums tracking-tighter">
                                                {formatUSD(calcInt.precioClienteUSD)}
                                            </span>
                                            <span className="text-sm font-bold opacity-60">USD</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs font-medium text-white/60">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-medium text-white/60">Base</span>
                                            <span className="text-white/90">{formatUSD(calcInt.netCostUSD)}</span>
                                        </div>
                                        <div className="w-px h-6 bg-white/10" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-medium text-white/60">Fee</span>
                                            <span className="text-white/90">{formatUSD(calcInt.agencyFeeAmountUSD)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:text-right md:border-l border-white/15 md:pl-8 py-4 md:py-0">
                                    <span className="text-xs font-medium text-white/60 block mb-1">En Pesos (TRM)</span>
                                    <div className="flex items-baseline gap-1.5 md:justify-end">
                                        <span className="text-2xl font-bold tracking-tight tabular-nums">
                                            {formatCOP(calcInt.precioClienteCOP)}
                                        </span>
                                        <span className="text-xs font-bold opacity-60">COP</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* TOTAL GRUPAL */}
                        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-center gap-1 transition-all hover:border-brand-primary/20">
                            <span className="text-xs font-semibold text-muted-foreground">Total Cotización</span>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-bold text-foreground tabular-nums tracking-tight">
                                    {formatUSD(calcInt.precioClienteUSD * (activeQuote.numberOfTravelers || 1))}
                                </span>
                                <span className="text-xs font-bold text-muted-foreground">USD</span>
                            </div>
                            <p className="text-xs font-medium text-subtle-foreground mt-2 border-t border-border pt-2">
                                ≈ {formatCOP(calcInt.precioClienteCOP * (activeQuote.numberOfTravelers || 1))} Total
                            </p>
                        </div>

                        {/* UTILIDAD */}
                        <div className="p-6 rounded-2xl bg-success/5 border border-success/20 flex flex-col justify-center gap-1 transition-all hover:border-success/40">
                            <span className="text-xs font-semibold text-success/80">Utilidad Agencia</span>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-bold text-success tabular-nums tracking-tight">
                                    {formatUSD(calcInt.utilidadUSD * (activeQuote.numberOfTravelers || 1))}
                                </span>
                                <span className="text-xs font-bold text-success/60">USD</span>
                            </div>
                            <p className="text-xs font-medium text-success/80 mt-1">
                                {formatCOP(calcInt.utilidadCOP * (activeQuote.numberOfTravelers || 1))} COP acumulados
                            </p>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* ── Configuración Final de PDF ────────────────────────────────── */}
            <div className="pt-8 mt-4 border-t border-border">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shadow-sm ring-1 ring-border">
                        <Settings2 className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                        <h4 className="text-base font-bold tracking-tight text-foreground">Configuración del Documento</h4>
                        <p className="text-xs text-muted-foreground">Personaliza la validez y el orden de las secciones en el PDF.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Validez de la oferta */}
                    <div className="space-y-4">
                        <Label
                            htmlFor="validUntil"
                            className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground ml-1"
                        >
                            <Calendar className="h-4 w-4 text-brand-primary" />
                            Vigencia de la propuesta
                        </Label>
                        <Input
                            id="validUntil"
                            type="date"
                            value={activeQuote.validUntil ? new Date(activeQuote.validUntil).toISOString().split('T')[0] : ""}
                            onChange={(e) => setQuoteField("validUntil", new Date(e.target.value))}
                            className="h-10 rounded-xl border-border/60 bg-background/50 text-sm font-medium transition-all focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary/40"
                        />
                        <p className="text-xs text-subtle-foreground ml-1">
                            El enlace marcará la cotización como vencida tras esta fecha.
                        </p>
                    </div>

                    {/* Reordenamiento Drag and Drop */}
                    <div className="space-y-4">
                        <Label className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground ml-1">
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

