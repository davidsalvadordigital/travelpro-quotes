"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { SortableSectionList } from "./sortable-section-list";
import { useActiveQuote, useQuoteActions } from "@/features/quotes/store/quote-store";
import { FileText, Calendar, ShieldCheck, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepDesignProps {
    showErrors?: boolean;
}

export function StepDesign({ showErrors = false }: StepDesignProps) {
    const activeQuote = useActiveQuote();
    const { setQuoteField } = useQuoteActions();

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Sección de Reordenamiento (Drag & Drop) */}
            <SortableSectionList />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Condiciones y validez */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <Label
                            htmlFor="paymentTerms"
                            className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground/60"
                        >
                            <ShieldCheck className="h-4 w-4 text-brand-primary" strokeWidth={3} />
                            Políticas de Pago
                        </Label>
                        <Textarea
                            id="paymentTerms"
                            placeholder="Ej: 50% para reservar, saldo 30 días antes del viaje..."
                            value={activeQuote.paymentTerms || ""}
                            onChange={(e) => setQuoteField("paymentTerms", e.target.value)}
                            data-testid="quote-design-payment"
                            className="min-h-[120px] rounded-2xl border-2 border-glass-border bg-background/50 text-base font-medium transition-all duration-300 focus-visible:ring-8 focus-visible:ring-brand-primary/5 focus-visible:border-brand-primary/40 resize-none"
                        />
                    </div>

                    <div className="space-y-4">
                        <Label
                            htmlFor="validUntil"
                            className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground/60"
                        >
                            <Calendar className="h-4 w-4 text-brand-primary" strokeWidth={3} />
                            Validez de la Propuesta
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
                            La propuesta se marcará como vencida automáticamente después de esta fecha.
                        </p>
                    </div>
                </div>

                {/* Otros documentos y condiciones */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <Label
                            htmlFor="requiredDocuments"
                            className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground/60"
                        >
                            <ClipboardList className="h-4 w-4 text-brand-primary" strokeWidth={3} />
                            Documentación Requerida
                        </Label>
                        <Textarea
                            id="requiredDocuments"
                            placeholder="Ej: Pasaporte vigente mínimo 6 meses, Visa americana..."
                            value={activeQuote.requiredDocuments || ""}
                            onChange={(e) => setQuoteField("requiredDocuments", e.target.value)}
                            data-testid="quote-design-docs"
                            className="min-h-[120px] rounded-2xl border-2 border-glass-border bg-background/50 text-base font-medium transition-all duration-300 focus-visible:ring-8 focus-visible:ring-brand-primary/5 focus-visible:border-brand-primary/40 resize-none"
                        />
                    </div>

                    <div className="space-y-4">
                        <Label
                            htmlFor="cancellationPolicy"
                            className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground/60"
                        >
                            <FileText className="h-4 w-4 text-brand-primary" strokeWidth={3} />
                            Políticas de Cancelación
                        </Label>
                        <Textarea
                            id="cancellationPolicy"
                            placeholder="Ej: No reembolsable una vez emitido, penalidad de USD 200..."
                            value={activeQuote.cancellationPolicy || ""}
                            onChange={(e) => setQuoteField("cancellationPolicy", e.target.value)}
                            data-testid="quote-design-cancel"
                            className="min-h-[120px] rounded-2xl border-2 border-glass-border bg-background/50 text-base font-medium transition-all duration-300 focus-visible:ring-8 focus-visible:ring-brand-primary/5 focus-visible:border-brand-primary/40 resize-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
