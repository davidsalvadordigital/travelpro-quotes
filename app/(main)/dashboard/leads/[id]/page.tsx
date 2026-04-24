import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getUserProfile } from "@/lib/dal/profiles";
import { getLeadById } from "@/lib/dal/leads";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Mail, Phone, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const STATUS_VARIANTS: Record<string, "brand" | "warning" | "success" | "outline" | "secondary"> = {
    nuevo: "brand",
    contactado: "secondary",
    cualificado: "secondary",
    propuesta_enviada: "warning",
    negociacion: "warning",
    ganado: "success",
    perdido: "outline",
};

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id ?? "";
    const profile = await getUserProfile(userId);
    const isAdmin = profile?.role === "admin";

    let lead;
    try {
        lead = await getLeadById(id, userId, isAdmin);
    } catch {
        notFound();
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-10">
            <div className="flex items-center justify-between border-b border-border/40 pb-6">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">{lead.traveler_name}</h2>
                    <p className="text-sm text-muted-foreground/70 mt-1">Ficha del prospecto</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant={STATUS_VARIANTS[lead.status] ?? "outline"}>
                        {lead.status.replace("_", " ")}
                    </Badge>
                    <Button asChild variant="outline" size="sm" className="rounded-xl">
                        <Link href="/dashboard/leads">← Volver</Link>
                    </Button>
                </div>
            </div>

            <Card variant="glass" className="max-w-2xl">
                <CardHeader className="pt-8 px-8 pb-4">
                    <CardTitle className="text-lg font-bold">Información del Prospecto</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-4">
                    {lead.destination && (
                        <div className="flex items-center gap-3 text-sm">
                            <Plane className="h-4 w-4 text-brand-primary" />
                            <span className="font-medium">{lead.destination}</span>
                        </div>
                    )}
                    {lead.email && (
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="h-4 w-4 text-brand-primary" />
                            <span>{lead.email}</span>
                        </div>
                    )}
                    {lead.phone && (
                        <div className="flex items-center gap-3 text-sm">
                            <Phone className="h-4 w-4 text-brand-primary" />
                            <span>{lead.phone}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Creado: {new Date(lead.created_at!).toLocaleDateString("es-CO", { dateStyle: "long" })}</span>
                    </div>
                    {lead.notes && (
                        <p className="text-sm text-muted-foreground border-t border-border/40 pt-4 mt-4">{lead.notes}</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
