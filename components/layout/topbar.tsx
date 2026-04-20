"use client";

import { Menu, Plane, Search, Bell, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

interface TopbarProps {
    onMenuClick: () => void;
    onToggleSidebar?: () => void;
}

export function Topbar({ onMenuClick, onToggleSidebar }: TopbarProps) {
    return (
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-md px-4 lg:px-8">
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
                        <PanelLeft className="h-5 w-5" />
                    </Button>
                )}
                <div className="relative w-80 group">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground/40 group-focus-within:text-brand-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar cotizaciones..."
                        className="h-10 w-full rounded-xl border border-border/40 bg-muted/20 pl-10 pr-4 text-[13px] font-medium transition-all placeholder:text-muted-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/10 focus-visible:border-brand-primary/40 focus-visible:bg-background"
                    />
                </div>
            </div>

            {/* Right side Actions */}
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-muted active:scale-95 transition-all">
                    <Bell className="h-4.5 w-4.5" />
                </Button>
                <div className="h-6 w-[1px] bg-border/40 hidden lg:block mx-2" />
                <ThemeToggle />
            </div>
        </header>
    );
}