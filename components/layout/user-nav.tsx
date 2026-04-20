"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserProfile {
    full_name: string;
    email: string;
    avatar_url: string | null;
}

export function UserNav() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) return;
            supabase
                .from("profiles")
                .select("full_name, email, avatar_url")
                .eq("id", user.id)
                .single()
                .then(({ data }) => { if (data) setProfile(data); });
        });
    }, []);

    async function handleLogout() {
        router.push("/login");
        const supabase = createClient();
        supabase.auth.signOut();
    }

    const initials = profile?.full_name
        ?.split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "??";

    const firstName = profile?.full_name?.split(" ")[0] || "…";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    id="user-nav-trigger"
                    className="flex items-center gap-2 rounded-xl hover:bg-muted/60 p-1 pr-2.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                    <Avatar className="h-8 w-8 border border-border/50">
                        <AvatarImage src={profile?.avatar_url || ""} alt={firstName} />
                        <AvatarFallback className="bg-brand-primary/10 text-brand-primary text-xs font-semibold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-xs font-semibold text-foreground leading-none">
                        {firstName}
                    </span>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-0.5">
                        <p className="text-sm font-semibold leading-none">{profile?.full_name || "…"}</p>
                        <p className="text-xs leading-none text-muted-foreground mt-1">
                            {profile?.email || ""}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
