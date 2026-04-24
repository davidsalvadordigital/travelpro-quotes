"use client";

import { AlertCircle, FileText, CheckCircle2, ShieldCheck, Banknote, ListPlus, Trash2, Globe, Home } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActiveQuote, useQuoteActions } from "@/features/quotes/store/quote-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface StepTermsProps {
    showErrors?: boolean;
}

export function StepTerms({ showErrors = false }: StepTermsProps) {
    const activeQuote = useActiveQuote();
    const { setQuoteField, setFullQuote } = useQuoteActions();

    const isNacional = activeQuote.destinationType === "nacional";

    // ── GESTIÓN DE LISTAS DINÁMICAS (Inclusiones/Exclusiones) ──
    const inclusions = activeQuote.inclusions || [];
    const exclusions = activeQuote.exclusions || [];

    const handleAddInclusion = () => setQuoteField("inclusions", [...inclusions, ""]);
    const handleUpdateInclusion = (idx: number, val: string) => {
        const updated = [...inclusions];
        updated[idx] = val;
        setQuoteField("inclusions", updated);
    };
    const handleRemoveInclusion = (idx: number) => {
        setQuoteField("inclusions", inclusions.filter((_, i) => i !== idx));
    };

    const handleAddExclusion = () => setQuoteField("exclusions", [...exclusions, ""]);
    const handleUpdateExclusion = (idx: number, val: string) => {
        const updated = [...exclusions];
        updated[idx] = val;
        setQuoteField("exclusions", updated);
    };
    const handleRemoveExclusion = (idx: number) => {
        setQuoteField("exclusions", exclusions.filter((_, i) => i !== idx));
    };

    // ── SISTEMA DE PLANTILLAS INTELIGENTES (SMART TEMPLATES) ──

    // Plantillas de Bases Legales y Documentos Recomendados
    const loadNacionalTemplate = () => {
        setFullQuote({
            legalConditions: "TARIFAS SUJETAS A DISPONIBILIDAD TEMPORAL. No se garantiza el precio hasta el momento de la confirmación formal y abono inicial. El titular asume responsabilidad de revisar itinerarios para asegurar exactitud antes de emitir tickets.",
            requiredDocuments: "Se requiere Cédula de Ciudadanía original y vigente para todos los viajeros adultos. Menores de edad: Registro Civil de Nacimiento original impreso y Tarjeta de Identidad en caso de aplicar.",
            paymentTerms: `DATOS BANCARIOS (Facturación Nacional)
Cuenta de Ahorros Bancolombia: 123-456789-00
• A nombre de: TravelPro SAS
• NIT: 900.XXX.XXX-X
Puede enviar soporte de transferencia vía WhatsApp o email para conciliación.`
        });
        toast.success("Plantilla Nacional cargada", { description: "Textos legales, requisitos de cédula y cuentas en COP inyectados." });
    };

    const loadInternacionalTemplate = () => {
        setFullQuote({
            legalConditions: "TARIFAS SUJETAS A DISPONIBILIDAD TEMPORAL Y FLUCTUACIONES TRM. La propuesta mantendrá la tasa de cambio de referencia hasta el corte bancario del día emitido. Los precios finales en COP dependen de la liquidación del proveedor internacional.",
            requiredDocuments: "OBLIGATORIO: Pasaporte Biométrico válido con al menos 6 meses de vigencia contados a partir de la fecha de retorno. El trámite y puerto de visados (en caso de requerirse por el destino) es total responsabilidad del pasajero.",
            paymentTerms: `DATOS DE RECAUDO INTERNACIONAL (Dólares / TRM)
Cuenta Corriente Davivienda (Multimoneda): 098-765432-11
• A nombre de: Trappvel
• Referencia: Indicar apellido del pasajero principal.
El pago se liquida a la TRM oficial del día del abono.`
        });
        toast.success("Plantilla Global cargada", { description: "Textos TRM, requisitos migratorios de pasaporte y cuentas multimoneda inyectados." });
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border/40 pb-8">
                <div className="space-y-1">
                    <h3 className="text-base font-bold tracking-tight text-foreground">Cláusulas y Condiciones</h3>
                    <p className="text-xs text-subtle-foreground">
                        Define inclusiones, exclusiones y políticas legales de la propuesta.
                    </p>
                </div>

                {/* BOTONES SMART FILL DE PLANTILLAS */}
                <div className="flex bg-muted/30 p-2 rounded-2xl border border-border/50 gap-2 shrink-0 overflow-x-auto">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={loadNacionalTemplate}
                        className={cn("h-11 rounded-xl gap-2 font-bold transition-all px-4 cursor-pointer", isNacional ? "bg-brand-primary text-white shadow hover:bg-brand-primary/90 hover:text-white" : "text-muted-foreground hover:bg-background")}
                    >
                        <Home className="h-4 w-4" /> Plantilla Nacional
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={loadInternacionalTemplate}
                        className={cn("h-11 rounded-xl gap-2 font-bold transition-all px-4 cursor-pointer", !isNacional ? "bg-brand-secondary text-white shadow hover:bg-brand-secondary/90 hover:text-white" : "text-muted-foreground hover:bg-background")}
                    >
                        <Globe className="h-4 w-4" /> Plantilla Internacional
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* COLUMNA IZQUIERDA: Inclusiones / Exclusiones */}
                <div className="lg:col-span-6 space-y-10">

                    {/* INCLUSIONES */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-xs font-semibold tracking-wide text-success">
                                <CheckCircle2 className="h-4 w-4 text-success" />
                                Inclusiones
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddInclusion}
                                className="h-8 px-3 rounded-lg text-xs font-bold gap-2 text-success border-success/20 bg-success/5 hover:bg-success/10 hover:border-success/30 transition-all cursor-pointer"
                            >
                                <ListPlus className="h-3 w-3" /> Añadir Inclusión
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {inclusions.length === 0 ? (
                                <p className="text-xs text-muted-foreground italic py-4 text-center border-2 border-dashed border-border/60 rounded-xl">Sin inclusiones definidas.</p>
                            ) : (
                                inclusions.map((inc, i) => (
                                    <div key={i} className="flex gap-3 group animate-in slide-in-from-top-2">
                                        <div className="h-12 w-10 shrink-0 flex items-center justify-center font-bold text-emerald-600/40 text-xs">
                                            IN.{i + 1}
                                        </div>
                                        <Input
                                            value={inc}
                                            onChange={(e) => handleUpdateInclusion(i, e.target.value)}
                                            placeholder="Tiquetes aéreos ida y vuelta..."
                                            className="h-12 rounded-xl bg-background/50 focus-visible:ring-success/20 focus-visible:border-success/40"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => handleRemoveInclusion(i)}
                                            className="h-12 w-12 px-0 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-xl cursor-pointer opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* EXCLUSIONES */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-xs font-semibold tracking-wide text-destructive">
                                <AlertCircle className="h-4 w-4 text-destructive" />
                                Exclusiones
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddExclusion}
                                className="h-8 px-3 rounded-lg text-xs font-bold gap-2 text-destructive border-destructive/20 bg-destructive/5 hover:bg-destructive/10 hover:border-destructive/30 transition-all cursor-pointer"
                            >
                                <ListPlus className="h-3 w-3" /> Añadir Exclusión
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {exclusions.length === 0 ? (
                                <p className="text-xs text-muted-foreground italic py-4 text-center border-2 border-dashed border-border/60 rounded-xl">Sin exclusiones definidas.</p>
                            ) : (
                                exclusions.map((exc, i) => (
                                    <div key={i} className="flex gap-3 group animate-in slide-in-from-top-2">
                                        <div className="h-12 w-10 shrink-0 flex items-center justify-center font-bold text-red-600/40 text-xs">
                                            EX.{i + 1}
                                        </div>
                                        <Input
                                            value={exc}
                                            onChange={(e) => handleUpdateExclusion(i, e.target.value)}
                                            placeholder="Gastos no especificados en el plan..."
                                            className="h-12 rounded-xl bg-background/50 focus-visible:ring-destructive/20 focus-visible:border-destructive/40"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => handleRemoveExclusion(i)}
                                            className="h-12 w-12 px-0 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-xl cursor-pointer opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>

                {/* COLUMNA DERECHA: Textos y Condiciones */}
                <div className="lg:col-span-6 space-y-8">

                    {/* Requisitos y Migración */}
                    <div className="space-y-3">
                        <Label htmlFor="reqDocs" className="flex items-center gap-2 text-xs font-semibold tracking-wide ml-1 text-muted-foreground">
                            Documentación y Requisitos
                        </Label>
                        <Textarea
                            id="reqDocs"
                            value={activeQuote.requiredDocuments || ""}
                            onChange={(e) => setQuoteField("requiredDocuments", e.target.value)}
                            placeholder="Especifica vacunas, vigencia de pasaportes, cédulas..."
                            className="min-h-[100px] resize-none rounded-2xl bg-background/50 text-sm font-medium leading-relaxed p-4 transition-all focus-visible:ring-2 focus-visible:ring-brand-primary/20"
                        />
                    </div>

                    {/* Pagos y Recaudo */}
                    <div className="space-y-3">
                        <Label htmlFor="paymentParams" className="flex items-center gap-2 text-xs font-semibold tracking-wide ml-1 text-brand-secondary">
                            <Banknote className="h-4 w-4" />
                            Canales de Recaudo y Abonos
                        </Label>
                        <Textarea
                            id="paymentParams"
                            value={activeQuote.paymentTerms || ""}
                            onChange={(e) => setQuoteField("paymentTerms", e.target.value)}
                            placeholder="Cuentas de banco, enlaces de PSE, montos de reserva mínima..."
                            className="min-h-[120px] resize-none rounded-2xl bg-brand-secondary/5 border-brand-secondary/10 text-brand-secondary/90 text-sm font-medium leading-relaxed p-5 transition-all focus-visible:ring-2 focus-visible:ring-brand-secondary/40 focus-visible:border-brand-secondary/40"
                        />
                    </div>

                    {/* Respaldo Legal */}
                    <div className="space-y-3">
                        <Label htmlFor="legalConditions" className="flex items-center gap-2 text-xs font-semibold tracking-wide ml-0.5 text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            Cláusulas Legales y Generales
                        </Label>
                        <Textarea
                            id="legalConditions"
                            placeholder="Términos estándar, políticas de cancelación y letra pequeña..."
                            value={activeQuote.legalConditions || ""}
                            onChange={(e) => setQuoteField("legalConditions", e.target.value)}
                            className="min-h-[130px] resize-none rounded-xl border border-border/60 bg-muted/20 text-xs font-medium leading-relaxed p-4 transition-all focus-visible:ring-2 focus-visible:ring-brand-primary/20 hover:bg-muted/40"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
