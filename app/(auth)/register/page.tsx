"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail, Lock, User, Plane, Briefcase, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type Role = "asesora" | "admin";

export default function RegisterPage() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState<Role>("asesora");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    async function handleGoogleRegister() {
        setLoading(true);
        const supabase = createClient();
        const { error: authError } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: {
                    access_type: "offline",
                    prompt: "consent",
                },
            },
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
        }
    }

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (password.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            setLoading(false);
            return;
        }

        const supabase = createClient();
        const { error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role,
                },
            },
        });

        if (authError) {
            setError(
                authError.message === "User already registered" || authError.message.includes("database_isolation_violation")
                    ? "Este correo ya está registrado"
                    : authError.message
            );
            setLoading(false);
            return;
        }

        setSuccess(true);
        setLoading(false);
    }

    if (success) {
        return (
            <div className="space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <Mail className="h-7 w-7 text-emerald-500" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Revisa tu correo
                    </h1>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Hemos enviado un enlace de confirmación a{" "}
                        <span className="font-medium text-foreground">{email}</span>.
                        <br />
                        Haz clic en el enlace para activar tu cuenta.
                    </p>
                </div>
                <Link href="/login">
                    <Button variant="outline" className="mt-4">
                        Volver al Login
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Mobile logo */}
            <div className="flex items-center gap-3 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-white shadow-lg shadow-brand-primary/20">
                    <Plane className="h-5 w-5" />
                </div>
                <span className="text-xl font-extrabold tracking-tighter">
                    Trapp<span className="text-brand-primary italic">vel</span>
                </span>
            </div>

            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">
                    Crear cuenta
                </h1>
                <p className="text-sm text-muted-foreground">
                    Regístrate para comenzar a cotizar viajes con IA
                </p>
            </div>

            <div className="grid gap-6">
                {/* Google OAuth */}
                <Button
                    variant="outline"
                    type="button"
                    disabled={loading}
                    onClick={handleGoogleRegister}
                    className="h-11 font-medium bg-background"
                >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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
                    Continuar con Google
                </Button>

                {/* Separator */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            o continúa con email
                        </span>
                    </div>
                </div>

                {/* Role Selector */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Tu rol</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setRole("asesora")}
                            className={cn(
                                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 hover:border-brand-primary/50",
                                role === "asesora"
                                    ? "border-brand-primary bg-brand-primary/5 shadow-sm shadow-brand-primary/10"
                                    : "border-border bg-background"
                            )}
                        >
                            <div
                                className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                                    role === "asesora"
                                        ? "bg-brand-primary/15 text-brand-primary"
                                        : "bg-muted text-muted-foreground"
                                )}
                            >
                                <Briefcase className="h-5 w-5" />
                            </div>
                            <span
                                className={cn(
                                    "text-sm font-medium transition-colors",
                                    role === "asesora" ? "text-brand-primary" : "text-muted-foreground"
                                )}
                            >
                                Asesor(a)
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setRole("admin")}
                            className={cn(
                                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 hover:border-brand-primary/50",
                                role === "admin"
                                    ? "border-brand-primary bg-brand-primary/5 shadow-sm shadow-brand-primary/10"
                                    : "border-border bg-background"
                            )}
                        >
                            <div
                                className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                                    role === "admin"
                                        ? "bg-brand-primary/15 text-brand-primary"
                                        : "bg-muted text-muted-foreground"
                                )}
                            >
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <span
                                className={cn(
                                    "text-sm font-medium transition-colors",
                                    role === "admin" ? "text-brand-primary" : "text-muted-foreground"
                                )}
                            >
                                Admin
                            </span>
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="fullName" className="text-sm font-medium">
                            Nombre completo
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="María García"
                                className="pl-10 h-11"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                            Correo electrónico
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu@agencia.com"
                                className="pl-10 h-11"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium">
                            Contraseña
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password"
                                type="password"
                                placeholder="Mínimo 8 caracteres"
                                className="pl-10 h-11"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-sm font-medium">
                            Confirmar Contraseña
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Repite tu contraseña"
                                className="pl-10 h-11"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={8}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full h-11 bg-brand-primary text-white hover:bg-brand-primary/90 font-semibold shadow-lg shadow-brand-primary/10"
                        disabled={loading}
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        {loading ? "Creando cuenta…" : "Crear Cuenta"}
                    </Button>
                </form>
            </div>

            {/* Footer links */}
            <p className="text-center text-sm text-muted-foreground">
                ¿Ya tienes una cuenta?{" "}
                <Link
                    href="/login"
                    className="font-medium text-brand-primary hover:text-brand-primary/80 transition-colors"
                >
                    Inicia sesión
                </Link>
            </p>
        </div>
    );
}
