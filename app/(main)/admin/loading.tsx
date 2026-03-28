import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
    return (
        <div className="flex-1 space-y-8 p-8 pt-6 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
            <div className="space-y-2">
                <Skeleton className="h-10 w-72" />
                <Skeleton className="h-5 w-64" />
            </div>

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

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                <Card className="col-span-1 border-none shadow-sm ring-1 ring-border/50 rounded-3xl h-[400px] flex items-center justify-center">
                    <Skeleton className="h-[300px] w-full max-w-md mx-4 rounded-xl" />
                </Card>
                <Card className="col-span-1 border-none shadow-sm ring-1 ring-border/50 rounded-3xl h-[400px] flex items-center justify-center">
                    <Skeleton className="h-[300px] w-full max-w-md mx-4 rounded-xl" />
                </Card>
            </div>

            <Card className="border-none shadow-sm ring-1 ring-border/50 rounded-3xl h-[400px] flex items-center justify-center mt-6">
                <Skeleton className="h-[300px] w-full mx-8 rounded-xl" />
            </Card>
        </div>
    );
}
