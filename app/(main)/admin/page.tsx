import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Minus, Users, FileText, TrendingUp, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ElementType } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { createServerSupabaseClient } from "@/lib/supabase-server";

import {
    getAdminKpis,
    getAdvisorPerformance,
    getLeadDistribution,
    getWeeklyTrend,
} from "@/lib/dal/stats";

import {
    DynamicAdvisorBarChart as AdvisorBarChart,
    DynamicLeadPieChart as LeadPieChart,
    DynamicWeeklyLineChart as WeeklyLineChart
} from "@/features/quotes/components/dynamic-charts";

// --- HELPERS ---
type KpiTrend = "up" | "down" | "neutral";
const TREND_ICONS: Record<KpiTrend, ElementType> = {
    up: ArrowUpRight,
    down: ArrowDownRight,
    neutral: Minus,
};
const KPI_ICONS = [FileText, TrendingUp, Clock, Users];

// --- SKELETONS ---
function KpiSkeleton() {
    return (
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-3xl" />
            ))}
        </div>
    );
}

function ChartSkeleton({ title, span }: { title: string; span?: string }) {
    return (
        <Card variant="glass" className={cn("h-full border-glass-border/30", span)}>
            <CardHeader className="pt-8 pb-5 px-8 border-b border-glass-border/30 bg-muted/10">
                <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent className="pt-20 pb-20 px-8 flex justify-center items-center">
                <Skeleton className="h-48 w-full rounded-2xl" />
            </CardContent>
        </Card>
    );
}

// --- ASYNC SECTIONS ---
async function AdminKpiSection({ userId }: { userId: string }) {
    const kpis = await getAdminKpis(userId);
    return (
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi, idx) => {
                const TrendIcon = TREND_ICONS[kpi.trend];
                const Icon = KPI_ICONS[idx] || Users;
                const isPositive = kpi.trend === "up";
                const isNegative = kpi.trend === "down";

                return (
                    <Card key={kpi.label} variant="glass" className="overflow-hidden border border-glass-border/30 hover:border-brand-primary/40 shadow-xl shadow-black/5 hover:shadow-premium hover:-translate-y-1.5 transition-all duration-500 group animate-scale-in">
                        <CardContent className="p-7">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary transition-all duration-500 group-hover:bg-brand-primary group-hover:text-white shadow-lg shadow-brand-primary/10 group-hover:shadow-brand-primary/30">
                                    <Icon className="h-7 w-7" strokeWidth={2.5} />
                                </div>
                                <span className={cn(
                                    "flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-2xl shadow-inner transition-all duration-300",
                                    isPositive ? "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400" :
                                        isNegative ? "text-rose-600 bg-rose-500/10 dark:text-rose-400" : "text-muted-foreground bg-muted/40"
                                )}>
                                    <TrendIcon className="h-4 w-4" strokeWidth={3} />
                                    {kpi.delta}
                                </span>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 mb-2">
                                {kpi.label}
                            </p>
                            <h3 className="text-4xl font-black text-foreground tabular-nums tracking-tighter italic-pro-max">
                                {kpi.value}
                            </h3>
                            <div className="mt-5 flex items-center gap-2.5 border-t border-glass-border/40 pt-5">
                                <div className="p-1.5 bg-muted/20 rounded-lg">
                                    <Calendar className="h-3.5 w-3.5 text-brand-primary/60" />
                                </div>
                                <span className="text-[11px] font-bold text-muted-foreground/50 tracking-tight leading-none">{kpi.sub}</span>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

async function AdvisorPerformanceSection({ userId }: { userId: string }) {
    const data = await getAdvisorPerformance(userId, true);
    return (
        <Card variant="glass" className="lg:col-span-4 h-full border-glass-border/30">
            <CardHeader className="flex flex-row items-center justify-between pt-8 pb-5 px-8 border-b border-glass-border/30 bg-muted/10">
                <div className="space-y-1">
                    <CardTitle className="text-2xl font-black tracking-tight text-foreground">Advisor Breakdown</CardTitle>
                    <p className="text-[13px] font-bold text-muted-foreground/70">Seguimiento de conversiones por agente.</p>
                </div>
            </CardHeader>
            <CardContent className="pt-8 px-8 pb-8">
                <AdvisorBarChart data={data} />
            </CardContent>
        </Card>
    );
}

async function LeadDistributionSection({ userId }: { userId: string }) {
    const data = await getLeadDistribution(userId, true);
    return (
        <Card variant="glass" className="lg:col-span-3 h-full border-glass-border/30">
            <CardHeader className="flex flex-row items-center justify-between pt-8 pb-5 px-8 border-b border-glass-border/30 bg-muted/10">
                <div className="space-y-1">
                    <CardTitle className="text-2xl font-black tracking-tight text-foreground">Embudo de Leads</CardTitle>
                    <p className="text-[13px] font-bold text-muted-foreground/70">Distribución de salud del pipeline.</p>
                </div>
            </CardHeader>
            <CardContent className="pt-8 px-8 pb-8">
                <LeadPieChart data={data} />
            </CardContent>
        </Card>
    );
}

async function WeeklyTrendSection({ userId }: { userId: string }) {
    const data = await getWeeklyTrend(userId, true);
    return (
        <Card variant="glass" className="h-full border-glass-border/30">
            <CardHeader className="flex flex-row items-center justify-between pt-8 pb-5 px-8 border-b border-glass-border/30 bg-muted/10">
                <div className="space-y-1">
                    <CardTitle className="text-2xl font-black tracking-tight text-foreground">Tendencia de Crecimiento</CardTitle>
                    <p className="text-[13px] font-bold text-muted-foreground/70">Análisis comparativo de volumen vs éxito semanal.</p>
                </div>
            </CardHeader>
            <CardContent className="pt-8 px-8 pb-8">
                <WeeklyLineChart data={data} />
            </CardContent>
        </Card>
    );
}

export default async function AdminPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id ?? "";

    return (
        <div className="flex-1 space-y-10 p-8 pt-10 pb-24">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-border/40 pb-10">
                <div className="space-y-3">
                    <div className="inline-flex items-center rounded-full bg-brand-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.25em] text-brand-primary border border-brand-primary/20">
                        Executive Control Center
                    </div>
                    <h2 className="text-5xl font-black tracking-tighter text-foreground">
                        Admin Dashboard
                    </h2>
                    <p className="text-lg font-bold text-muted-foreground/70 max-w-2xl">
                        Métricas de rendimiento, conversión y productividad del equipo en tiempo real.
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-muted/20 p-2 rounded-2xl border border-border/40">
                    <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mr-2">Sistema Operativo</span>
                </div>
            </div>

            <div className="space-y-10">
                {/* KPI Cards Suspended */}
                <Suspense fallback={<KpiSkeleton />}>
                    <AdminKpiSection userId={userId} />
                </Suspense>

                {/* Charts Row 1 Suspended in Parallel */}
                <div className="grid gap-8 lg:grid-cols-7">
                    <Suspense fallback={<ChartSkeleton title="Advisor Breakdown" span="lg:col-span-4" />}>
                        <AdvisorPerformanceSection userId={userId} />
                    </Suspense>

                    <Suspense fallback={<ChartSkeleton title="Embudo de Leads" span="lg:col-span-3" />}>
                        <LeadDistributionSection userId={userId} />
                    </Suspense>
                </div>

                {/* Charts Row 2 Suspended */}
                <Suspense fallback={<ChartSkeleton title="Tendencia de Crecimiento" />}>
                    <WeeklyTrendSection userId={userId} />
                </Suspense>
            </div>
        </div>
    );
}
