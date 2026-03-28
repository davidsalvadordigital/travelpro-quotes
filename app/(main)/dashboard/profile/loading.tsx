import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
    return (
        <div className="flex-1 space-y-8 p-8 pt-6 max-w-4xl mx-auto w-full">
            <div className="space-y-2">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-5 w-48" />
            </div>

            <Card className="border-none shadow-xl shadow-primary/5 ring-1 ring-border/50 bg-card rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-muted/20 p-8">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <div className="space-y-3 text-center sm:text-left flex-1">
                            <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
                            <Skeleton className="h-5 w-32 mx-auto sm:mx-0" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <Skeleton className="h-12 w-32 rounded-xl" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
