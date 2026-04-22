"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Hotel, Star, DollarSign, Info, CheckCircle2, MapPin } from "lucide-react";
import { useActiveQuote, useQuoteActions } from "@/features/quotes/store/quote-store";
import { cn } from "@/lib/utils";

interface StepHotelsProps {
    showErrors?: boolean;
}

export function StepHotels({ showErrors = false }: StepHotelsProps) {
    const activeQuote = useActiveQuote();
    const { addHotelOption, removeHotelOption, updateHotelOption } = useQuoteActions();
    const hotelOptions = activeQuote.hotelOptions || [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
                <div className="space-y-0.5">
                    <h3 className="text-base font-bold tracking-tight text-foreground">
                        Opciones de Alojamiento
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Define alternativas de hospedaje para el viajero.
                    </p>
                </div>
                <Button
                    data-testid="quote-hotel-add"
                    onClick={addHotelOption}
                    className="h-10 rounded-xl gap-2 px-5 font-semibold text-sm bg-brand-primary text-white shadow-md shadow-brand-primary/20 hover:bg-brand-primary/90 active:scale-[0.97] transition-all"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Agregar opción
                </Button>
            </div>

            <div className="grid gap-6">
                {hotelOptions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 rounded-2xl border-2 border-dashed border-border/50 bg-muted/20 text-center space-y-3">
                        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground/40">
                            <Hotel className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Sin opciones registradas</p>
                            <p className="text-xs text-muted-foreground/60">Agregue manualmente las alternativas para esta cotización.</p>
                        </div>
                    </div>
                ) : (
                    hotelOptions.map((option, index) => (
                        <div
                            key={index}
                            className={cn(
                                "group relative bg-card border rounded-2xl p-6 transition-all duration-300",
                                option.isRecommended
                                    ? "border-brand-primary/40 ring-1 ring-brand-primary/20"
                                    : "border-border/60 hover:border-border"
                            )}
                        >
                            {/* Header de la opción */}
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md",
                                        option.isRecommended
                                            ? "bg-brand-primary/10 text-brand-primary"
                                            : "bg-muted text-muted-foreground"
                                    )}>
                                        {option.isRecommended ? "Recomendada" : `Alternativa ${index + 1}`}
                                    </span>
                                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground/60 border-l pl-3">
                                        <Switch
                                            id={`rec-${index}`}
                                            data-testid={`quote-hotel-rec-${index}`}
                                            checked={option.isRecommended || false}
                                            onCheckedChange={(checked: boolean) => updateHotelOption(index, { ...option, isRecommended: checked })}
                                            className="scale-75 data-[state=checked]:bg-brand-primary"
                                        />
                                        <Label htmlFor={`rec-${index}`} className="cursor-pointer">Marcar como recomendada</Label>
                                    </div>
                                </div>
                                <Button
                                    data-testid={`quote-hotel-remove-${index}`}
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeHotelOption(index)}
                                    className="h-8 w-8 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="space-y-1.5 lg:col-span-1">
                                    <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                                        <MapPin className="h-3 w-3 text-brand-primary/60" />
                                        Destino
                                    </Label>
                                    <Input
                                        data-testid={`quote-hotel-loc-${index}`}
                                        placeholder="Ciudad..."
                                        value={option.location || ""}
                                        onChange={(e) => updateHotelOption(index, { ...option, location: e.target.value })}
                                        className="h-10 rounded-xl border-border/60 bg-background/50 text-sm focus-visible:ring-brand-primary/20"
                                    />
                                </div>
                                <div className="space-y-1.5 lg:col-span-2">
                                    <Label className={cn(
                                        "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest",
                                        showErrors && !option.name ? "text-destructive" : "text-muted-foreground/70"
                                    )}>
                                        <Hotel className={cn("h-3 w-3", showErrors && !option.name ? "text-destructive" : "text-brand-primary/60")} />
                                        Hotel
                                    </Label>
                                    <Input
                                        data-testid={`quote-hotel-name-${index}`}
                                        placeholder="Nombre oficial del establecimiento..."
                                        value={option.name || ""}
                                        onChange={(e) => updateHotelOption(index, { ...option, name: e.target.value })}
                                        className={cn(
                                            "h-10 rounded-xl border-border/60 bg-background/50 font-medium text-sm focus-visible:ring-brand-primary/20",
                                            showErrors && !option.name && "border-destructive/40 bg-destructive/5"
                                        )}
                                    />
                                </div>
                                <div className="space-y-1.5 lg:col-span-1">
                                    <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                                        <Star className="h-3 w-3 text-brand-primary/60" />
                                        Categoría
                                    </Label>
                                    <Input
                                        data-testid={`quote-hotel-cat-${index}`}
                                        placeholder="Ej: 5★, Boutique..."
                                        value={option.category || ""}
                                        onChange={(e) => updateHotelOption(index, { ...option, category: e.target.value })}
                                        className="h-10 rounded-xl border-border/60 bg-background/50 text-sm focus-visible:ring-brand-primary/20"
                                    />
                                </div>

                                <div className="space-y-1.5 lg:col-span-1">
                                    <Label className={cn(
                                        "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest",
                                        showErrors && !option.roomType ? "text-destructive" : "text-muted-foreground/70"
                                    )}>
                                        <Star className={cn("h-3 w-3", showErrors && !option.roomType ? "text-destructive" : "text-brand-primary/60")} />
                                        Acomodación
                                    </Label>
                                    <Input
                                        data-testid={`quote-hotel-roomType-${index}`}
                                        placeholder="Tipo de habitación..."
                                        value={option.roomType || ""}
                                        onChange={(e) => updateHotelOption(index, { ...option, roomType: e.target.value })}
                                        className={cn(
                                            "h-10 rounded-xl border-border/60 bg-background/50 text-sm focus-visible:ring-brand-primary/20",
                                            showErrors && !option.roomType && "border-destructive/40 bg-destructive/5"
                                        )}
                                    />
                                </div>

                                <div className="space-y-1.5 lg:col-span-1">
                                    <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                                        <CheckCircle2 className="h-3 w-3 text-brand-primary/60" />
                                        Disponibilidad
                                    </Label>
                                    <Input
                                        data-testid={`quote-hotel-status-${index}`}
                                        placeholder="Ej: Disponible, Sujeto..."
                                        value={option.status || ""}
                                        onChange={(e) => updateHotelOption(index, { ...option, status: e.target.value })}
                                        className="h-10 rounded-xl border-border/60 bg-background/50 text-sm focus-visible:ring-brand-primary/20"
                                    />
                                </div>

                                <div className="space-y-1.5 md:col-span-2 lg:col-span-2">
                                    <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                                        <Info className="h-3 w-3 text-brand-primary/60" />
                                        Especificaciones
                                    </Label>
                                    <Input
                                        data-testid={`quote-hotel-notes-${index}`}
                                        placeholder="Régimen, amenidades, fechas..."
                                        value={option.notes || ""}
                                        onChange={(e) => updateHotelOption(index, { ...option, notes: e.target.value })}
                                        className="h-10 rounded-xl border-border/60 bg-background/50 text-sm focus-visible:ring-brand-primary/20"
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
