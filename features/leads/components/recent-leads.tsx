import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, ArrowUpRight, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { type LeadRow } from "@/lib/dal/leads";

const STATUS_VARIANTS: Record<string, "brand" | "warning" | "success" | "outline" | "secondary"> = {
    nuevo: "brand",
    cotizado: "warning",
    ganado: "success",
    perdido: "outline",
    en_proceso: "secondary",
};

export function RecentLeads({ initialLeads }: { initialLeads: LeadRow[] }) {
    return (
        <Card variant="glass" className="lg:col-span-4 h-full">
            <CardHeader className="flex flex-row items-center justify-between pt-8 pb-5 px-8">
                <div className="space-y-1">
                    <CardTitle className="text-2xl font-black tracking-tight text-foreground">Flujo de Leads</CardTitle>
                    <p className="text-[13px] font-bold text-muted-foreground/70">Prospectos activos en el radar.</p>
                </div>
                <Button variant="ghost" size="sm" className="font-black text-[10px] uppercase tracking-[0.2em] text-brand-primary">Ver todo</Button>
            </CardHeader>
            <CardContent className="px-8 pb-8">
                <div className="space-y-3.5">
                    {initialLeads.length > 0 ? (
                        initialLeads.map((lead) => (
                            <div key={lead.id} className="flex items-center justify-between p-4 rounded-[1.5rem] bg-background/40 border border-transparent hover:border-brand-primary/20 hover:bg-background hover:shadow-xl hover:shadow-brand-primary/5 transition-all duration-500 group cursor-pointer">
                                <div className="flex items-center gap-5">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-500 shadow-sm font-black text-xl italic">
                                        {lead.traveler_name.charAt(0)}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[16px] font-black text-foreground group-hover:text-brand-primary transition-colors tracking-tight">{lead.traveler_name}</p>
                                        <p className="text-[13px] font-bold text-muted-foreground/60 flex items-center gap-2">
                                            <Plane className="h-4 w-4 text-brand-primary/40" />
                                            {lead.destination ?? "Destino Global"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <Badge variant={STATUS_VARIANTS[lead.status] ?? "outline"} className="shadow-lg">
                                        {lead.status.replace('_', ' ')}
                                    </Badge>
                                    <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-muted/20 border border-border/40 group-hover:bg-brand-primary group-hover:text-white text-muted-foreground/40 transition-all duration-500 shadow-sm">
                                        <ArrowUpRight className="h-5 w-5" strokeWidth={3} />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex h-[280px] flex-col items-center justify-center space-y-4 text-center">
                            <div className="rounded-2xl bg-primary/10 p-5">
                                <Sparkles className="h-10 w-10 text-primary" strokeWidth={1.5} />
                            </div>
                            <div className="space-y-1.5">
                                <h3 className="font-display text-lg font-semibold">No hay actividad reciente</h3>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto">Tus leads y cotizaciones aparecerán aquí tan pronto como comiences a generar actividad.</p>
                            </div>
                            <Button asChild size="sm" className="rounded-full mt-2">
                                <Link href="/dashboard/cotizar">Crear primera cotización</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}