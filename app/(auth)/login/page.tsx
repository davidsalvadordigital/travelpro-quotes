"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, Plane, Briefcase, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const supabase = createClient();
        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError(
                authError.message === "Invalid login credentials"
                    ? "Email o contraseña incorrectos"
                    : authError.message
            );
            setLoading(false);
            return;
        }

        router.push("/dashboard");
        router.refresh();
    }

    async function handleGoogleLogin() {
        setLoading(true);
        const supabase = createClient();
        const { error: authError } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
        }
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Mobile logo */}
            <div className="flex items-center gap-3 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-white shadow-lg shadow-brand-primary/20">
                    <Plane className="h-5 w-5" />
                </div>
                <span className="text-xl font-black tracking-tighter">
                    Trapp<span className="text-brand-primary italic">vel</span>
                </span>
            </div>

            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-black tracking-tighter text-foreground">
                    Acceso Agentes
                </h1>
                <p className="text-sm text-muted-foreground font-bold">
                    Ingresa al centro de mando de Trappvel.
                </p>
            </div>

            <div className="grid gap-6">
                <Button
                    variant="outline"
                    type="button"
                    disabled={loading}
                    onClick={handleGoogleLogin}
                    className="h-12 font-bold bg-background border-border/80 hover:bg-brand-primary/5 hover:text-brand-primary hover:border-brand-primary/30 transition-all active:scale-[0.97]"
                >
                    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Google Workspace
                </Button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]">
                        <span className="bg-background px-6 text-muted-foreground/50">
                            o credenciales internas
                        </span>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2.5">
                        <label htmlFor="email" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 ml-1">
                            Email Corporativo
                        </label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/40 group-focus-within:text-brand-primary transition-colors" />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                placeholder="agente@trappvel.com"
                                className="pl-12 h-12 bg-muted/20 border-border/80 focus:bg-background transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between ml-1">
                            <label htmlFor="password" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                                Clave Maestra
                            </label>
                            <button
                                type="button"
                                className="text-[10px] font-black uppercase tracking-widest text-brand-primary hover:text-brand-primary/80 transition-colors"
                            >
                                ¿La olvidaste?
                            </button>
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/40 group-focus-within:text-brand-primary transition-colors" />
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                placeholder="••••••••"
                                className="pl-12 h-12 bg-muted/20 border-border/80 focus:bg-background transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-2xl bg-destructive/10 border border-destructive/20 px-4 py-3 animate-fade-in">
                            <p className="text-xs font-bold text-destructive text-center">{error}</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full h-12 bg-brand-primary text-white hover:bg-brand-primary/90 transition-all active:scale-[0.97] font-black uppercase tracking-widest text-[11px] shadow-xl shadow-brand-primary/20 border-t border-white/20"
                        disabled={loading}
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin mr-3" />}
                        {loading ? "Autenticando..." : "Entrar ahora"}
                    </Button>
                </form>
            </div>

            {/* Register link */}
            <p className="text-center text-xs font-bold text-muted-foreground">
                ¿Nuevo en el equipo?{" "}
                <Link
                    href="/register"
                    className="font-black text-brand-primary hover:underline transition-all"
                >
                    Solicita una cuenta
                </Link>
            </p>

            {/* Quick Access — Test Credentials */}
            {process.env.NODE_ENV === "development" && (
                <div className="pt-6 border-t border-border/40 space-y-4">
                    <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
                        Entornos de Prueba
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={loading}
                            className={cn("h-11 text-[10px] font-black uppercase tracking-widest border-border/80 hover:border-brand-primary/40 hover:text-brand-primary hover:bg-brand-primary/5 transition-all shadow-sm")}
                            onClick={() => {
                                setEmail("test-asesor@travelpro.com");
                                setPassword("Travel123!");
                                setTimeout(() => {
                                    document.querySelector<HTMLFormElement>("form")?.requestSubmit();
                                }, 100);
                            }}
                        >
                            <Briefcase className="mr-2 h-4 w-4" />
                            Agente
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={loading}
                            className={cn("h-11 text-[10px] font-black uppercase tracking-widest border-border/80 hover:border-brand-action/40 hover:text-brand-action hover:bg-brand-action/5 transition-all shadow-sm")}
                            onClick={() => {
                                setEmail("test-admin@travelpro.com");
                                setPassword("Admin123!");
                                setTimeout(() => {
                                    document.querySelector<HTMLFormElement>("form")?.requestSubmit();
                                }, 100);
                            }}
                        >
                            <Shield className="mr-2 h-4 w-4" />
                            Gerente
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
