import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getUserProfile } from "@/lib/dal/profiles";
import { getLeads } from "@/lib/dal/leads";
import { RecentLeads } from "@/features/leads/components/recent-leads";

export default async function LeadsPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id ?? "";
    const profile = await getUserProfile(userId);
    const isAdmin = profile?.role === "admin";
    const leads = await getLeads(100, userId, isAdmin);

    return (
        <div className="flex-1 space-y-8 p-8 pt-10">
            <div className="border-b border-border/40 pb-6">
                <h2 className="text-xl font-semibold tracking-tight">Flujo de Leads</h2>
                <p className="text-sm text-muted-foreground/70 mt-1">
                    {isAdmin ? "Todos los prospectos de la agencia." : "Tus prospectos activos."}
                </p>
            </div>
            <RecentLeads initialLeads={leads} />
        </div>
    );
}
