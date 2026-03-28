"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, Save, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase";

export interface Profile {
    id: string;
    full_name: string;
    email: string;
    role: string;
    avatar_url: string | null;
    phone: string | null;
}

export function ProfileForm({ initialProfile }: { initialProfile: Profile }) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [profile, setProfile] = useState<Profile>(initialProfile);
    const [fullName, setFullName] = useState(initialProfile.full_name || "");
    const [phone, setPhone] = useState(initialProfile.phone || "");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(initialProfile.avatar_url);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file || !profile) return;

        setUploading(true);
        const supabase = createClient();
        const ext = file.name.split(".").pop();
        const path = `${profile.id}/avatar.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(path, file, { upsert: true });

        if (uploadError) {
            setMessage({ type: "error", text: "Error al subir la imagen" });
            setUploading(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage
            .from("avatars")
            .getPublicUrl(path);

        // Add cache-buster to force refresh
        const freshUrl = `${publicUrl}?t=${Date.now()}`;

        await supabase
            .from("profiles")
            .update({ avatar_url: freshUrl })
            .eq("id", profile.id);

        setAvatarUrl(freshUrl);
        setUploading(false);
        setMessage({ type: "success", text: "Foto actualizada" });
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        const supabase = createClient();
        const { error } = await supabase
            .from("profiles")
            .update({ full_name: fullName, phone })
            .eq("id", profile.id);

        if (error) {
            setMessage({ type: "error", text: "Error al guardar" });
        } else {
            setMessage({ type: "success", text: "Perfil actualizado correctamente" });
            setProfile(prev => ({ ...prev, full_name: fullName, phone: phone }));
        }
        setSaving(false);
    }

    const initials = fullName
        ?.split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "??";

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Avatar Section — Glassmorphism Pro */}
            <Card className="p-8 border border-glass-border bg-glass backdrop-blur-xl rounded-[2.5rem] shadow-xl shadow-black/5 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent pointer-events-none" />
                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8">
                    <div className="relative group/avatar">
                        <Avatar className="h-32 w-32 ring-4 ring-brand-primary/20 shadow-2xl transition-all duration-500 group-hover/avatar:ring-brand-primary/40">
                            <AvatarImage src={avatarUrl || ""} alt={fullName} className="object-cover" />
                            <AvatarFallback className="bg-brand-primary text-white text-4xl font-black italic">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="absolute inset-0 flex items-center justify-center rounded-full bg-brand-primary/60 backdrop-blur-sm opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 cursor-pointer border-2 border-white/20"
                        >
                            {uploading ? (
                                <Loader2 className="h-8 w-8 text-white animate-spin" />
                            ) : (
                                <Camera className="h-8 w-8 text-white scale-110" />
                            )}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarUpload}
                        />
                    </div>
                    <div className="text-center sm:text-left space-y-2">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black tracking-tighter text-foreground">{fullName || "Agente Trappvel"}</h2>
                            <p className="text-sm font-bold text-muted-foreground/80 tracking-tight">{profile.email}</p>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-brand-primary/10 px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary border border-brand-primary/20">
                            {profile.role}
                        </span>
                    </div>
                </div>
            </Card>

            {/* Info Form — Clean UI */}
            <Card className="p-10 border border-glass-border bg-glass backdrop-blur-xl rounded-[2.5rem] shadow-xl shadow-black/5">
                <form onSubmit={handleSave} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label htmlFor="fullName" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 ml-1">
                                Nombre Estratégico
                            </label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/40 group-focus-within:text-brand-primary transition-colors" />
                                <Input
                                    id="fullName"
                                    type="text"
                                    className="pl-12 h-12 bg-muted/20 border-border/80 focus:bg-background transition-all rounded-2xl"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label htmlFor="phone" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 ml-1">
                                Línea Directa (WhatsApp)
                            </label>
                            <Input
                                id="phone"
                                type="tel"
                                className="h-12 bg-muted/20 border-border/80 focus:bg-background transition-all rounded-2xl"
                                placeholder="+57 300 000 0000"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label htmlFor="email" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 ml-1">
                            Identidad Digital (Inalterable)
                        </label>
                        <Input
                            id="email"
                            type="email"
                            className="h-12 bg-muted/10 border-border/40 opacity-60 rounded-2xl"
                            value={profile.email || ""}
                            disabled
                        />
                    </div>

                    {message && (
                        <div
                            className={`rounded-2xl px-5 py-4 text-xs font-bold uppercase tracking-widest border animate-scale-in ${message.type === "success"
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                                : "bg-destructive/10 border-destructive/20 text-destructive"
                                }`}
                        >
                            {message.text}
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            className="h-13 px-10 rounded-2xl bg-brand-primary text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-brand-primary/20 hover:shadow-brand-primary/30 transition-all active:scale-[0.97] border-t border-white/20"
                            disabled={saving}
                        >
                            {saving ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-3" />
                            ) : (
                                <Save className="h-4 w-4 mr-3" />
                            )}
                            {saving ? "Sincronizando…" : "Actualizar Perfil"}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
