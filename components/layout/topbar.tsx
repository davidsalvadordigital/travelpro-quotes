"use client";

import { Menu, Plane, Search, Bell, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserNav } from "@/components/layout/user-nav";

interface TopbarProps {
    onMenuClick: () => void;
    onToggleSidebar?: () => void;
}

export function Topbar({ onMenuClick, onToggleSidebar }: TopbarProps) {
    return (
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-glass-border/50 bg-background/20 backdrop-blur-3xl px-4 lg:px-8">
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
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-primary text-white shadow-lg shadow-brand-primary/20">
                        <Plane className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-lg font-display font-bold tracking-tight gradient-text">
                        Trappvel
                    </span>
                </div>
            </div>

            {/* Desktop Left Toggle & Search */}
            <div className="hidden lg:flex items-center flex-1 gap-6">
                {onToggleSidebar && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-muted-foreground hover:bg-muted active:scale-95 transition-all"
                        onClick={onToggleSidebar}
                        aria-label="Alternar menú lateral"
                    >
                        <PanelLeft className="h-6 w-6" />
                    </Button>
                )}
                <div className="relative w-80 group">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar prospectos o servicios (Ctrl+K)..."
                        className="h-10 w-full rounded-xl border border-glass-border bg-glass/10 pl-11 pr-4 text-sm shadow-sm transition-all placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-primary/10 focus-visible:border-brand-primary/40 bg-white/5"
                    />
                </div>
            </div>

            {/* Right side Actions */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground hover:bg-muted active:scale-95 transition-all hidden lg:flex">
                    <Bell className="h-5 w-5" />
                </Button>
                <ThemeToggle />
                <div className="w-px h-6 bg-border/50 mx-1 hidden sm:block"></div>
                <UserNav />
            </div>
        </header>
    );
}