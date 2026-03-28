import { Suspense } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { KpiGrid } from "@/features/dashboard/components/kpi-grid";
import { RecentLeads } from "@/features/leads/components/recent-leads";
import { ActivityFeed } from "@/features/dashboard/components/activity-feed";
import { DraftsList } from "@/features/quotes/components/drafts-list";

import { getDashboardKpis, getRecentActivity } from "@/lib/dal/stats";
import { getLeads } from "@/lib/dal/leads";
import { getQuotes } from "@/lib/dal/quotes";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// --- SKELETONS ---
function KpiSkeleton() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="border-none shadow-sm ring-1 ring-border/50 bg-card/60 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-20 mb-1" />
                        <Skeleton className="h-4 w-32" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function LeadsSkeleton() {
    return (
        <div className="col-span-1 lg:col-span-4 space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-28 w-full rounded-3xl" />
                ))}
            </div>
        </div>
    );
}

function ActivitySkeleton() {
    return (
        <div className="col-span-1 lg:col-span-3">
            <Card className="border-none shadow-sm ring-1 ring-border/50 bg-card rounded-[2.5rem] h-full">
                <CardHeader className="border-b border-border/50 bg-muted/20 pb-5 pt-8 px-8">
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex gap-4">
                            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-[80%]" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

function DraftsSkeleton() {
    return (
        <Card className="border-none shadow-sm ring-1 ring-border/50 bg-card rounded-[2rem]">
            <CardHeader className="pb-5 pt-8 px-8">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32 mt-2" />
            </CardHeader>
            <CardContent className="p-8 space-y-4">
                {[...Array(2)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                ))}
            </CardContent>
        </Card>
    );
}

// --- ASYNC DATA FETCHERS ---
async function KpiSection({ userId }: { userId: string }) {
    const stats = await getDashboardKpis(userId);
    return <KpiGrid initialStats={stats} />;
}

async function LeadsSection({ userId }: { userId: string }) {
    const leads = await getLeads(10, userId);
    return <RecentLeads initialLeads={leads} />;
}

async function ActivitySection({ userId }: { userId: string }) {
    const activity = await getRecentActivity(userId);
    return <ActivityFeed initialActivity={activity} />;
}

async function DraftsSection({ userId }: { userId: string }) {
    const quotes = await getQuotes(50, userId);
    return <DraftsList initialQuotes={quotes} />;
}

export default async function DashboardPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id ?? "";

    return (
        <div className="flex-1 space-y-10 p-8 pt-10 pb-24">
            {/* Page header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-border/40 pb-10">
                <div className="space-y-3">
                    <div className="inline-flex items-center rounded-full bg-brand-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.25em] text-brand-primary border border-brand-primary/20">
                        Operational Dashboard
                    </div>
                    <h2 className="text-5xl font-black tracking-tighter text-foreground">Panel de Control</h2>
                    <p className="text-lg font-bold text-muted-foreground/70 max-w-2xl">Gestión estratégica de prospectos y motor de cotización activa.</p>
                </div>
                <Button asChild className="h-13 rounded-2xl bg-brand-action text-white px-8 shadow-2xl shadow-brand-action/30 transition-all duration-500 hover:bg-brand-action/90 hover:shadow-brand-action/40 hover:-translate-y-1 active:scale-[0.97] border-t border-white/20 w-full lg:w-auto">
                    <Link href="/dashboard/cotizar" className="flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[11px]">
                        <Plus className="h-5 w-5 stroke-[3px]" />
                        <span>Nueva Cotización</span>
                    </Link>
                </Button>
            </div>

            <div className="space-y-10">
                {/* KPI Stats Suspended */}
                <Suspense fallback={<KpiSkeleton />}>
                    <KpiSection userId={userId} />
                </Suspense>

                {/* Main content: Leads + Activity Suspended in Parallel */}
                <div className="grid gap-8 lg:grid-cols-7">
                    <Suspense fallback={<LeadsSkeleton />}>
                        <LeadsSection userId={userId} />
                    </Suspense>
                    
                    <Suspense fallback={<ActivitySkeleton />}>
                        <ActivitySection userId={userId} />
                    </Suspense>
                </div>

                {/* Saved Drafts Suspended */}
                <div className="pt-4">
                    <Suspense fallback={<DraftsSkeleton />}>
                        <DraftsSection userId={userId} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
