import { Suspense } from "react";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { ProfileForm } from "./profile-form";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

async function ProfileSection({ userId }: { userId: string }) {
    const supabase = await createServerSupabaseClient();
    
    // Direct fetch — ensure we aren't joining anything slow
    const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, avatar_url, phone")
        .eq("id", userId)
        .single();

    if (!profile) {
        return (
            <div className="p-6 text-center text-muted-foreground bg-muted/50 rounded-xl">
                No se encontró la información del perfil.
            </div>
        );
    }

    return <ProfileForm initialProfile={profile} />;
}

function SectionSkeleton() {
    return (
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
    );
}

export default async function ProfilePage() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="mx-auto max-w-2xl space-y-8 p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Header - Renders instantly */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Administra tu información personal y foto de perfil
                </p>
            </div>

            {/* Profile Content - Suspended */}
            <Suspense fallback={<SectionSkeleton />}>
                <ProfileSection userId={user.id} />
            </Suspense>
        </div>
    );
}
