"use client";

import dynamic from "next/dynamic";

const ChartSkeleton = () => (
    <div className="flex items-center justify-center h-[280px] w-full animate-pulse rounded-[2rem] bg-muted/40 border border-glass-border shadow-inner">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/50">Cargando gráfico…</span>
    </div>
);

export const DynamicAdvisorBarChart = dynamic(
    () => import("@/features/quotes/components/dashboard-charts").then((m) => m.AdvisorBarChart),
    { loading: ChartSkeleton, ssr: false }
);

export const DynamicLeadPieChart = dynamic(
    () => import("@/features/quotes/components/dashboard-charts").then((m) => m.LeadPieChart),
    { loading: ChartSkeleton, ssr: false }
);

export const DynamicWeeklyLineChart = dynamic(
    () => import("@/features/quotes/components/dashboard-charts").then((m) => m.WeeklyLineChart),
    { loading: ChartSkeleton, ssr: false }
);
