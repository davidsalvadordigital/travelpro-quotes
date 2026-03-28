"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Hotel, Star, DollarSign, Info, CheckCircle2, MapPin, Sparkles, TrendingUp } from "lucide-react";
import { useActiveQuote, useQuoteActions } from "@/features/quotes/store/quote-store";
import { cn } from "@/lib/utils";

interface StepHotelsProps {
    showErrors?: boolean;
}

/**
 * StepHotels — Diamond Standard Edition (2026)
 * Gestión de alojamientos con estética premium y validación en tiempo real.
 */
export function StepHotels({ showErrors = false }: StepHotelsProps) {
    const activeQuote = useActiveQuote();
    const { addHotelOption, removeHotelOption, updateHotelOption } = useQuoteActions();
    const hotelOptions = activeQuote.hotelOptions || [];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 pb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-[#E33A7A]" />
                        <h3 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">
                            Hospedajes <span className="text-[#E33A7A]">Elite</span>
                        </h3>
                    </div>
                    <p className="text-sm font-medium text-slate-400 max-w-md">
                        Define la estancia perfecta. Agrega múltiples opciones para que el viajero experimente el lujo a su medida.
                    </p>
                </div>
                <Button
                    data-testid="quote-hotel-add"
                    onClick={addHotelOption}
                    className="h-14 rounded-2xl gap-3 px-8 font-black uppercase tracking-widest text-[11px] bg-[#E33A7A] text-white shadow-2xl shadow-[#E33A7A]/30 hover:shadow-[#E33A7A]/50 active:scale-[0.95] transition-all border-none"
                >
                    <Plus className="h-5 w-5 stroke-[3px]" />
                    Nueva Opción
                </Button>
            </div>

            <div className="grid gap-10">
                {hotelOptions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 rounded-[4rem] border-2 border-dashed border-slate-100 bg-slate-50/30 text-center space-y-6">
                        <div className="h-20 w-20 rounded-3xl bg-white shadow-xl flex items-center justify-center text-slate-200">
                            <Hotel className="h-10 w-10" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-lg font-black text-slate-400 uppercase italic tracking-tight">Sin hoteles detectados</p>
                            <p className="text-xs text-slate-300 uppercase tracking-[0.2em] font-bold">Puedes agregarlos manualmente o usar la IA en el primer paso</p>
                        </div>
                    </div>
                ) : (
                    hotelOptions.map((option, index) => (
                        <div 
                            key={index} 
                            className={cn(
                                "group relative bg-white border border-slate-100 rounded-[3.5rem] p-10 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)]",
                                option.isRecommended 
                                    ? "ring-2 ring-[#E33A7A] ring-offset-8 ring-offset-white bg-[#E33A7A]/[0.01]" 
                                    : "hover:border-[#E33A7A]/30"
                            )}
                        >
                            <div className={cn(
                                "absolute -top-4 left-12 px-6 py-2 text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-2xl flex items-center gap-3 z-10",
                                option.isRecommended ? "bg-[#E33A7A] text-white" : "bg-slate-900 text-white"
                            )}>
                                {option.isRecommended ? <Sparkles className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                                {option.isRecommended ? "Recomendación Premium" : `Opción de Estancia #${index + 1}`}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                                {/* Details Section */}
                                <div className="lg:col-span-3 space-y-8">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                                                <MapPin className="h-3.5 w-3.5 text-[#E33A7A]" />
                                                Destino / Ciudad
                                            </Label>
                                            <Input
                                                data-testid={`quote-hotel-loc-${index}`}
                                                placeholder="Ej: Cartagena, Dubai..."
                                                value={option.location || ""}
                                                onChange={(e) => updateHotelOption(index, { ...option, location: e.target.value })}
                                                className="h-14 rounded-2xl border-none bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#E33A7A]/20 font-bold text-slate-700 placeholder:text-slate-300"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                                                <Star className="h-3.5 w-3.5 text-[#E33A7A]" />
                                                Categoría
                                            </Label>
                                            <Input
                                                data-testid={`quote-hotel-cat-${index}`}
                                                placeholder="Ej: 5 Estrellas · Gran Lujo"
                                                value={option.category || ""}
                                                onChange={(e) => updateHotelOption(index, { ...option, category: e.target.value })}
                                                className="h-14 rounded-2xl border-none bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#E33A7A]/20 font-bold text-slate-700 placeholder:text-slate-300"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                                            <Hotel className="h-3.5 w-3.5 text-[#E33A7A]" />
                                            Nombre del Establecimiento
                                        </Label>
                                        <Input
                                            data-testid={`quote-hotel-name-${index}`}
                                            placeholder="Introduce el nombre del hotel..."
                                            value={option.name || ""}
                                            onChange={(e) => updateHotelOption(index, { ...option, name: e.target.value })}
                                            className="h-14 rounded-2xl border-none bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#E33A7A]/20 font-black text-slate-900 text-lg placeholder:text-slate-200"
                                        />
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                                            <Info className="h-3.5 w-3.5 text-[#E33A7A]" />
                                            Notas Exclusivas
                                        </Label>
                                        <Textarea
                                            data-testid={`quote-hotel-notes-${index}`}
                                            placeholder="Detalles sobre el régimen, amenidades o beneficios VIP..."
                                            value={option.notes || ""}
                                            onChange={(e) => updateHotelOption(index, { ...option, notes: e.target.value })}
                                            className="min-h-[120px] rounded-[2rem] border-none bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#E33A7A]/20 transition-all p-6 text-sm font-medium text-slate-600 leading-relaxed resize-none placeholder:text-slate-300"
                                        />
                                    </div>
                                </div>

                                {/* Financials & Settings Section */}
                                <div className="lg:col-span-2 flex flex-col gap-8">
                                    <div className="bg-slate-900 rounded-[3rem] p-8 space-y-8 shadow-2xl">
                                        <div className="space-y-4">
                                            <Label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">
                                                <DollarSign className="h-4 w-4 text-[#E33A7A]" />
                                                Inversión por Persona
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    data-testid={`quote-hotel-price-${index}`}
                                                    type="number"
                                                    value={option.price || ""}
                                                    onChange={(e) => updateHotelOption(index, { ...option, price: Number(e.target.value) })}
                                                    className="h-16 rounded-2xl border-none bg-white/5 focus-visible:ring-2 focus-visible:ring-[#E33A7A]/50 text-white font-black text-2xl pl-6 tabular-nums"
                                                />
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#E33A7A] uppercase tracking-widest">
                                                    {option.isCOP ? "COP" : "USD"}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between px-2">
                                            <span className={cn("text-[10px] font-black uppercase tracking-widest transition-all", !option.isCOP ? "text-[#E33A7A] scale-110" : "text-slate-600")}>Dólares</span>
                                            <Switch
                                                data-testid={`quote-hotel-currency-${index}`}
                                                checked={option.isCOP || false}
                                                onCheckedChange={(checked: boolean) => updateHotelOption(index, { ...option, isCOP: checked })}
                                                className="data-[state=checked]:bg-[#E33A7A]"
                                            />
                                            <span className={cn("text-[10px] font-black uppercase tracking-widest transition-all", option.isCOP ? "text-[#E33A7A] scale-110" : "text-slate-600")}>Pesos</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">
                                            <Sparkles className="h-4 w-4 text-[#E33A7A]" />
                                            Tipo de Estancia
                                        </Label>
                                        <Input
                                            data-testid={`quote-hotel-room-${index}`}
                                            placeholder="Ej: Suite con vista al mar..."
                                            value={option.roomType || ""}
                                            onChange={(e) => updateHotelOption(index, { ...option, roomType: e.target.value })}
                                            className="h-14 rounded-2xl border-none bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#E33A7A]/20 font-bold text-slate-700 placeholder:text-slate-300"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-8 rounded-[2.5rem] bg-[#E33A7A]/5 border border-[#E33A7A]/10 mt-auto group/rec transition-all hover:bg-[#E33A7A]/10">
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-slate-900 uppercase italic">Opción Recomendada</p>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Destacar en la Editorial</p>
                                        </div>
                                        <Switch
                                            data-testid={`quote-hotel-rec-${index}`}
                                            checked={option.isRecommended || false}
                                            onCheckedChange={(checked: boolean) => updateHotelOption(index, { ...option, isRecommended: checked })}
                                            className="data-[state=checked]:bg-[#E33A7A]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button
                                data-testid={`quote-hotel-remove-${index}`}
                                variant="ghost"
                                size="icon"
                                onClick={() => removeHotelOption(index)}
                                className="absolute top-8 right-8 h-12 w-12 rounded-2xl text-slate-200 hover:text-white hover:bg-slate-900 transition-all active:scale-90"
                            >
                                <Trash2 className="h-6 w-6" />
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
