"use client";

import { useState, Suspense, useEffect } from "react";
import { AppBreadcrumb } from "@/components/layout/app-breadcrumb";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase";

export interface UserProfile {
    full_name: string;
    email: string;
    role: string;
    avatar_url: string | null;
}

export function AppShell({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) return;
            supabase.from("profiles")
                .select("full_name, email, role, avatar_url")
                .eq("id", user.id)
                .single()
                .then(({ data }) => { if (data) setProfile(data); });
        });
    }, []);

    return (
        <div className="flex h-screen overflow-hidden bg-transparent">
            {/* Desktop sidebar */}
            <div className="hidden lg:flex border-r border-border/40 bg-background/50 backdrop-blur-2xl">
                <Suspense fallback={null}>
                    <Sidebar 
                        collapsed={collapsed} 
                        onToggle={() => setCollapsed(!collapsed)} 
                        profile={profile}
                    />
                </Suspense>
            </div>

            {/* Mobile drawer sidebar */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetContent side="left" className="w-[280px] p-0 border-r-0 bg-sidebar" showCloseButton={false}>
                    <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
                    <Suspense fallback={null}>
                        <Sidebar profile={profile} />
                    </Suspense>
                </SheetContent>
            </Sheet>

            {/* Main content area */}
            <div className="flex flex-1 flex-col overflow-hidden relative">
                <Topbar
                    onMenuClick={() => setMobileOpen(true)}
                    onToggleSidebar={() => setCollapsed(!collapsed)}
                    profile={profile}
                />

                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <Suspense fallback={null}>
                            <AppBreadcrumb />
                        </Suspense>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
