"use client";

import { Menu, Plane, Search, Bell, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { type UserProfile } from "./app-shell";

interface TopbarProps {
    onMenuClick: () => void;
    onToggleSidebar?: () => void;
    profile?: UserProfile | null;
}

export function Topbar({ onMenuClick, onToggleSidebar, profile = null }: TopbarProps) {
    const firstName = profile?.full_name?.split(" ")[0] || "Usuario";

    return (
        <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between border-b border-border/40 bg-background/60 backdrop-blur-xl px-4 lg:px-8">
            {/* Mobile Left Logo & Menu */}
            <div className="flex items-center gap-3 lg:hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-muted-foreground hover:bg-muted active:scale-95 transition-all"
                    onClick={onMenuClick}
                    aria-label="Abrir menú"
                >
                    <Menu className="h-6 w-6" />
                </Button>
                <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary text-white shadow-lg shadow-brand-primary/20">
                        <Plane className="h-5 w-5" />
                    </div>
                </div>
            </div>

            {/* Desktop Left: Greeting */}
            <div className="hidden lg:flex items-center gap-4 min-w-[240px]">
                {onToggleSidebar && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-muted-foreground hover:bg-muted active:scale-95 transition-all mr-2"
                        onClick={onToggleSidebar}
                        aria-label="Alternar menú lateral"
                    >
                        <PanelLeft className="h-5 w-5" />
                    </Button>
                )}
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold tracking-tight text-foreground">
                        ¡Hola, {firstName}!
                    </h1>
                    <p className="text-xs font-medium text-muted-foreground/60">
                        Bienvenido de regreso al dashboard.
                    </p>
                </div>
            </div>

            {/* Desktop Center: Search Bar */}
            <div className="hidden lg:flex flex-1 justify-center max-w-xl px-8">
                <div className="relative w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-brand-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar cotizaciones, destinos o clientes..."
                        className="h-11 w-full rounded-full border border-border/40 bg-muted/20 pl-11 pr-4 text-sm font-medium transition-all placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/10 focus-visible:border-brand-primary/40 focus-visible:bg-background shadow-sm group-hover:bg-muted/30"
                    />
                </div>
            </div>

            {/* Right side Actions */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl text-muted-foreground hover:bg-muted active:scale-95 transition-all">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-brand-primary border-2 border-background" />
                </Button>
                <div className="h-7 w-[1px] bg-border/40 hidden lg:block mx-1" />
                <ThemeToggle />
            </div>
        </header>
    );
}
