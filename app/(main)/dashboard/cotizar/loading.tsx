import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CotizarLoading() {
    return (
        <div className="flex-1 space-y-8 p-8 pt-6 max-w-4xl mx-auto w-full animate-in fade-in duration-300">
            {/* Header */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-5 w-80" />
            </div>

            {/* Progress bar */}
            <div className="space-y-3">
                <div className="flex justify-between">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-4 w-16" />
                    ))}
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
            </div>

            {/* Wizard card */}
            <Card className="border-none shadow-sm ring-1 ring-border/50 bg-card/60 backdrop-blur-xl rounded-3xl">
                <CardHeader className="border-b border-border/50 bg-muted/20 rounded-t-3xl">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-72 mt-2" />
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    {/* Form fields skeleton */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full rounded-xl" />
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action buttons */}
            <div className="flex justify-between">
                <Skeleton className="h-11 w-28 rounded-xl" />
                <Skeleton className="h-11 w-28 rounded-xl" />
            </div>
        </div>
    );
}
