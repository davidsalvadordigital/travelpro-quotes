"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Plane, Clock, MapPin, Calendar as CalendarIcon, ArrowRightLeft, Sparkles, Navigation } from "lucide-react";
import { useActiveQuote, useQuoteActions } from "@/features/quotes/store/quote-store";
import { cn } from "@/lib/utils";

interface StepFlightsProps {
    showErrors?: boolean;
}

/**
 * StepFlights — Diamond Standard Edition (2026)
 * Gestión de itinerarios aéreos con estética de revista de lujo.
 */
export function StepFlights({ showErrors = false }: StepFlightsProps) {
    const activeQuote = useActiveQuote();
    const { addFlight, removeFlight, updateFlight } = useQuoteActions();
    const flights = activeQuote.flights || [];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 pb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-[#E33A7A]" />
                        <h3 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">
                            Logística <span className="text-[#E33A7A]">Aérea</span>
                        </h3>
                    </div>
                    <p className="text-sm font-medium text-slate-400 max-w-md">
                        Define las conexiones que darán vida al viaje. Configura rutas de primer nivel para una experiencia sin interrupciones.
                    </p>
                </div>
                <Button
                    data-testid="quote-flight-add"
                    onClick={addFlight}
                    className="h-14 rounded-2xl gap-3 px-8 font-black uppercase tracking-widest text-[11px] bg-[#E33A7A] text-white shadow-2xl shadow-[#E33A7A]/30 hover:shadow-[#E33A7A]/50 active:scale-[0.95] transition-all border-none"
                >
                    <Plus className="h-5 w-5 stroke-[3px]" />
                    Nuevo Trayecto
                </Button>
            </div>

            <div className="grid gap-10">
                {flights.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 rounded-[4rem] border-2 border-dashed border-slate-100 bg-slate-50/30 text-center space-y-6">
                        <div className="h-20 w-20 rounded-3xl bg-white shadow-xl flex items-center justify-center text-slate-200">
                            <Plane className="h-10 w-10" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-lg font-black text-slate-400 uppercase italic tracking-tight">Sin trayectos detectados</p>
                            <p className="text-xs text-slate-300 uppercase tracking-[0.2em] font-bold">Puedes agregarlos manualmente o usar la IA en el primer paso</p>
                        </div>
                    </div>
                ) : (
                    flights.map((flight, index) => (
                        <div 
                            key={index} 
                            className="group relative bg-white border border-slate-100 rounded-[3.5rem] p-10 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] hover:border-[#E33A7A]/30"
                        >
                            <div className="absolute -top-4 left-12 px-6 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-2xl flex items-center gap-3 z-10">
                                <Navigation className="h-3 w-3 text-[#E33A7A]" />
                                Conexión #{index + 1}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                {/* Ruta y Aerolínea */}
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                                            <ArrowRightLeft className="h-3.5 w-3.5 text-[#E33A7A]" />
                                            Corredor Aéreo (Origen ↔ Destino)
                                        </Label>
                                        <div className="grid grid-cols-2 gap-4 p-2 bg-slate-50 rounded-3xl">
                                            <Input
                                                data-testid={`quote-flight-origin-${index}`}
                                                placeholder="Origen (Ej: BOG)"
                                                value={flight.origin || ""}
                                                onChange={(e) => updateFlight(index, { ...flight, origin: e.target.value.toUpperCase() })}
                                                className="h-14 rounded-2xl border-none bg-white font-black text-lg text-slate-900 placeholder:text-slate-200 text-center shadow-sm"
                                            />
                                            <Input
                                                data-testid={`quote-flight-target-${index}`}
                                                placeholder="Destino (Ej: LIM)"
                                                value={flight.destination || ""}
                                                onChange={(e) => updateFlight(index, { ...flight, destination: e.target.value.toUpperCase() })}
                                                className="h-14 rounded-2xl border-none bg-white font-black text-lg text-slate-900 placeholder:text-slate-200 text-center shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                                                <Sparkles className="h-3.5 w-3.5 text-[#E33A7A]" />
                                                Aerolínea
                                            </Label>
                                            <Input
                                                data-testid={`quote-flight-airline-${index}`}
                                                placeholder="Ej: Emirates"
                                                value={flight.airline || ""}
                                                onChange={(e) => updateFlight(index, { ...flight, airline: e.target.value })}
                                                className="h-14 rounded-2xl border-none bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#E33A7A]/20 font-bold text-slate-700 placeholder:text-slate-300"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                                                <Navigation className="h-3.5 w-3.5 text-[#E33A7A]" />
                                                Nro de Vuelo
                                            </Label>
                                            <Input
                                                data-testid={`quote-flight-number-${index}`}
                                                placeholder="Ej: EK201"
                                                value={flight.flightNumber || ""}
                                                onChange={(e) => updateFlight(index, { ...flight, flightNumber: e.target.value.toUpperCase() })}
                                                className="h-14 rounded-2xl border-none bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#E33A7A]/20 font-bold text-slate-700 placeholder:text-slate-300"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Horarios y Fecha */}
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                                            <CalendarIcon className="h-3.5 w-3.5 text-[#E33A7A]" />
                                            Fecha de Salida
                                        </Label>
                                        <Input
                                            data-testid={`quote-flight-date-${index}`}
                                            type="date"
                                            value={flight.date ? new Date(flight.date).toISOString().split('T')[0] : ""}
                                            onChange={(e) => updateFlight(index, { ...flight, date: new Date(e.target.value) })}
                                            className="h-14 rounded-2xl border-none bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#E33A7A]/20 font-bold text-slate-700 tabular-nums uppercase"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                                            <Clock className="h-3.5 w-3.5 text-[#E33A7A]" />
                                            Cronograma (Salida / Llegada)
                                        </Label>
                                        <div className="grid grid-cols-2 gap-8 bg-slate-900 rounded-[2.5rem] p-4 shadow-xl">
                                            <div className="space-y-1 text-center">
                                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Take OFF</span>
                                                <Input
                                                    data-testid={`quote-flight-time-dep-${index}`}
                                                    placeholder="00:00"
                                                    value={flight.departureTime || ""}
                                                    onChange={(e) => updateFlight(index, { ...flight, departureTime: e.target.value })}
                                                    className="h-12 border-none bg-white/5 text-white font-black text-xl text-center tabular-nums focus-visible:ring-1 focus-visible:ring-[#E33A7A]"
                                                />
                                            </div>
                                            <div className="space-y-1 text-center">
                                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Landing</span>
                                                <Input
                                                    data-testid={`quote-flight-time-arr-${index}`}
                                                    placeholder="00:00"
                                                    value={flight.arrivalTime || ""}
                                                    onChange={(e) => updateFlight(index, { ...flight, arrivalTime: e.target.value })}
                                                    className="h-12 border-none bg-white/5 text-white font-black text-xl text-center tabular-nums focus-visible:ring-1 focus-visible:ring-[#E33A7A]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button
                                                data-testid={`quote-flight-remove-${index}`}
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFlight(index)}
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
