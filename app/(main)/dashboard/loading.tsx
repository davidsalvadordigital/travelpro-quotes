import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div className="flex-1 space-y-8 p-8 pt-6 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
            {/* Header only - the rest is handled by React Suspense in page.tsx */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between pb-10">
                <div className="space-y-4">
                    <Skeleton className="h-6 w-32 rounded-full" />
                    <Skeleton className="h-12 w-64" />
                    <Skeleton className="h-5 w-96" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-12 w-48 rounded-xl" />
                </div>
            </div>
            
            {/* A single pulsing area to hold the space before Suspense boundaries take over */}
            <div className="w-full h-[60vh] bg-muted/5 rounded-3xl border border-dashed border-border/40 animate-pulse" />
        </div>
    );
}
