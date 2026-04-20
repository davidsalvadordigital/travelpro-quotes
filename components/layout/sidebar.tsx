"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    BarChart3,
    Settings,
    LogOut,
    Plane,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    adminOnly?: boolean;
}

const navItems: NavItem[] = [
    { label: "Panel", href: "/dashboard", icon: LayoutDashboard },
    { label: "Nueva Cotización", href: "/dashboard/cotizar", icon: FileText },
    { label: "Configuración", href: "/dashboard/profile", icon: Settings },
    { label: "Analíticas", href: "/admin", icon: BarChart3, adminOnly: true },
];

interface SidebarProps {
    collapsed?: boolean;
    onToggle?: () => void;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [profile, setProfile] = useState<{ full_name: string; email: string; role: string; avatar_url: string | null } | null>(null);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) return;
            supabase.from("profiles").select("full_name, email, role, avatar_url").eq("id", user.id).single()
                .then(({ data }) => { if (data) setProfile(data); });
        });
    }, []);

    async function handleLogout() {
        // Redirigir de inmediato para UX instantáneo
        router.push("/login");
        // Sign out en background (no bloquea la UI)
        const supabase = createClient();
        supabase.auth.signOut();
    }

    const isAdmin = profile?.role === "admin";
    const filteredItems = navItems.filter((item) => !item.adminOnly || isAdmin);
    const initials = profile?.full_name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "??";

    return (
        <aside
            className={cn(
                "flex h-full flex-col bg-sidebar shadow-xl lg:shadow-none transition-all duration-300 ease-in-out relative z-40 w-full lg:w-64",
                collapsed && "lg:w-20"
            )}
        >
            {/* ─── Logo & Toggle Area ─── */}
            <div className={cn("flex h-16 items-center px-4 pt-2", collapsed ? "justify-center" : "justify-between")}>
                <div className="flex items-center gap-3 overflow-hidden ml-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white shadow-lg shadow-brand-primary/20 transition-transform duration-300 hover:scale-105 active:scale-95">
                        <Plane className="h-6 w-6" />
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col whitespace-nowrap">
                            <span className="font-display text-2xl font-bold tracking-tight gradient-text">
                                Trappvel
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Navigation ─── */}
            <ScrollArea className="flex-1 px-3 py-6">
                <nav className="flex flex-col gap-2">
                    {filteredItems.map((item) => {
                        const isActive =
                            item.href === "/dashboard"
                                ? pathname === "/dashboard"
                                : pathname.startsWith(item.href);

                        const linkContent = (
                            <Link
                                href={item.href}
                                prefetch={true}
                                className={cn(
                                    "group relative flex items-center gap-3.5 rounded-2xl px-3.5 py-3 font-bold transition-all duration-300 active:scale-[0.97]",
                                    isActive
                                        ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-brand-primary"
                                )}
                            >
                                <item.icon
                                    strokeWidth={isActive ? 3 : 2}
                                    className={cn(
                                        "h-6 w-6 shrink-0 transition-transform duration-300",
                                        isActive ? "scale-105" : "group-hover:scale-110"
                                    )}
                                />
                                {!collapsed && <span className="text-[14px] tracking-tight">{item.label}</span>}
                                {isActive && !collapsed && (
                                    <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full my-auto animate-pulse" />
                                )}
                            </Link>
                        );

                        if (collapsed) {
                            return (
                                <Tooltip key={item.href} delayDuration={0}>
                                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                                    <TooltipContent side="right" sideOffset={12}>
                                        {item.label}
                                    </TooltipContent>
                                </Tooltip>
                            );
                        }

                        return <div key={item.href}>{linkContent}</div>;
                    })}
                </nav>
            </ScrollArea>

            {/* ─── Bottom Profile Section ─── */}
            <div className="mt-auto p-4">
                <div
                    className={cn(
                        "flex items-center gap-3 rounded-xl p-2 transition-all duration-200 hover:bg-sidebar-accent/50 cursor-pointer",
                        collapsed && "justify-center"
                    )}
                >
                    <Avatar className="h-10 w-10 shrink-0 ring-1 ring-sidebar-border/20">
                        <AvatarImage src={profile?.avatar_url || ""} alt="Usuario" />
                        <AvatarFallback className="bg-brand text-brand-foreground text-sm font-semibold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    {!collapsed && (
                        <div className="flex flex-1 flex-col overflow-hidden">
                            <span className="truncate text-sm font-medium text-sidebar-foreground">
                                Hola, {profile?.full_name?.split(" ")[0] || "…"}
                            </span>
                            <span className="truncate text-xs text-sidebar-foreground/50">
                                {profile?.email || ""}
                            </span>
                        </div>
                    )}
                    {!collapsed && (
                        <button
                            onClick={handleLogout}
                            title="Cerrar sesión"
                            className="shrink-0 rounded-md p-1.5 text-sidebar-foreground/40 transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="sr-only">Cerrar sesión</span>
                        </button>
                    )}
                </div>
            </div>
        </aside >
    );
}