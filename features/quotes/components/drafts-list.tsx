"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plane, Trash2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuoteActions } from "@/features/quotes/store/quote-store";
import { useRouter } from "next/navigation";
import { formatCOP, formatUSD } from "@/lib/utils";
import { toast } from "sonner";

type ServerQuote = {
    id: string;
    savedAt: string;
    travelerName: string;
    destination: string;
    destinationType: "nacional" | "internacional";
    status: "borrador" | "enviada" | "aprobada" | "rechazada";
    pvpUSD?: number;
    pvpCOP?: number;
    feePercentage?: number;
    trmUsed?: number;
};

interface DraftsListProps {
    initialQuotes: ServerQuote[];
}

export function DraftsList({ initialQuotes }: DraftsListProps) {
    const { loadQuote, deleteQuoteWithSync } = useQuoteActions();
    const router = useRouter();

    const handleLoad = (id: string) => {
        loadQuote(id);
        toast.success("Cotización cargada", { description: "Continúa editando tu borrador." });
        router.push("/dashboard/cotizar");
    };

    const handleDelete = (id: string) => {
        deleteQuoteWithSync(id);
    };

    if (initialQuotes.length === 0) return null;

    return (
        <Card variant="glass" className="h-full border border-glass-border shadow-xl shadow-black/5">
            <CardHeader className="flex flex-row items-center justify-between pt-8 pb-5 px-8">
                <div>
                    <CardTitle className="text-2xl font-black tracking-tight text-foreground">Mis Borradores</CardTitle>
                    <p className="text-[13px] font-bold text-muted-foreground/70">{initialQuotes.length} cotización(es) guardada(s)</p>
                </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
                <div className="space-y-3.5">
                    {initialQuotes.map((q) => (
                        <div key={q.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border border-glass-border/30 hover:border-brand-primary/30 hover:bg-background hover:shadow-xl hover:shadow-brand-primary/5 transition-all duration-500 group cursor-pointer">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300">
                                    <FileText className="h-5 w-5 text-brand-primary group-hover:text-white transition-colors duration-300" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm sm:text-[15px] group-hover:text-brand-primary transition-colors">{q.travelerName || "Sin nombre"}</p>
                                    <p className="text-[11px] sm:text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                        <Plane className="h-3 w-3" />
                                        {q.destination || "Destino sin definir"}
                                        {q.savedAt && (
                                            <> • {new Date(q.savedAt).toLocaleDateString("es-CO", { dateStyle: "short" })}</>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4">
                                {(q.pvpUSD || 0) > 0 && (
                                    <div className="text-right hidden md:block">
                                        <p className="text-sm font-bold tabular-nums">
                                            {formatUSD(q.pvpUSD || 0)}
                                        </p>
                                        <p className="text-xs text-brand tabular-nums">
                                            {formatCOP(Math.round((q.pvpUSD || 0) * (q.trmUsed || 4200)))}
                                        </p>
                                    </div>
                                )}
                                <div className="flex gap-1.5">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 sm:h-9 gap-1.5 rounded-xl text-xs hover:bg-brand-primary hover:text-white hover:border-brand-primary active:scale-95 transition-all"
                                        onClick={() => handleLoad(q.id)}
                                    >
                                        <FolderOpen className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">Abrir</span>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 sm:h-9 w-8 sm:w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:scale-95 transition-all"
                                        onClick={() => handleDelete(q.id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
