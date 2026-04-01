"use client";

import { useActiveQuote } from "@/features/quotes/store/quote-store";
import { formatCOP, formatUSD, formatTRM } from "@/lib/utils";
import { calculateNacional, calculateInternacional } from "@/features/quotes/utils/calculator";
import { 
    Plane, MapPin, Calendar, Hotel, Star, CheckCircle2, 
    XCircle, Info, User, ShieldCheck, ClipboardList, 
    FileText, ArrowRight, DollarSign, Sparkles, TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * QuoteTemplate — Diamond Standard Edition (2026)
 * Diseño de alta fidelidad para previsualización web y exportación.
 * Estilo Magazine Premium inspirado en editoriales de lujo.
 */
export function QuoteTemplate() {
    const activeQuote = useActiveQuote();

    const isNacional = activeQuote.destinationType === "nacional";
    const fee = activeQuote.feePercentage ?? 15;
    const trm = activeQuote.trmUsed || 4200;

    const calcNac = isNacional ? calculateNacional(activeQuote.pvpCOP || 0, fee, activeQuote.extraMarginPercent ?? 0) : null;
    const calcInt = !isNacional ? calculateInternacional(activeQuote.pvpUSD || 0, fee, trm, activeQuote.extraMarginPercent ?? 0) : null;

    // Helper for rendering sections to prevent reference errors and ensure clean scoping
    const renderSection = (sectionId: string) => {
        switch (sectionId) {
            case 'flights':
                if (!activeQuote.flights || activeQuote.flights.length === 0) return null;
                return (
                    <section key="flights" className="mb-24">
                        <div className="flex items-center gap-5 mb-10">
                            <div className="h-px w-16 bg-gradient-to-r from-[#E33A7A] to-transparent" />
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Itinerario de Vuelos Previstos</h2>
                        </div>
                        <div className="overflow-hidden bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)]">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-10 py-6 text-[9px] font-black uppercase tracking-widest text-[#E33A7A]">Aerolínea</th>
                                        <th className="px-10 py-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Ruta / Trayecto</th>
                                        <th className="px-10 py-6 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Fecha</th>
                                        <th className="px-10 py-6 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Salida</th>
                                        <th className="px-10 py-6 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Llegada</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {activeQuote.flights.map((flight, idx) => (
                                        <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-10 py-8">
                                                <div className="text-base font-black text-slate-800 uppercase italic leading-none">{flight.airline}</div>
                                                <div className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.2em] mt-2 flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200" /> Vuelo {flight.flightNumber || "N/A"}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="text-sm font-bold text-slate-600 uppercase tracking-tighter flex items-center gap-3">
                                                    <span className="text-slate-800">{flight.origin}</span>
                                                    <ArrowRight className="h-3 w-3 text-[#E33A7A] opacity-30" />
                                                    <span className="text-slate-800">{flight.destination}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-center">
                                                <div className="text-[11px] font-black text-slate-500 tabular-nums uppercase tracking-tighter bg-slate-100/50 px-3 py-1 rounded-lg inline-block">
                                                    {flight.date ? new Date(flight.date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-right text-sm font-black text-slate-800 italic">{flight.departureTime}</td>
                                            <td className="px-10 py-8 text-right text-sm font-black text-slate-400 italic">{flight.arrivalTime}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                );

            case 'hotels':
                if (!activeQuote.hotelOptions || activeQuote.hotelOptions.length === 0) return null;
                return (
                    <section key="hotels" className="mb-24">
                        <div className="flex items-center gap-5 mb-10">
                            <div className="h-px w-16 bg-gradient-to-r from-[#E33A7A] to-transparent" />
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Hospedajes Previstos Seleccionados</h2>
                        </div>
                        
                        <div className="overflow-hidden bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)]">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-10 py-6 text-[9px] font-black uppercase tracking-widest text-[#E33A7A]">Destino</th>
                                        <th className="px-10 py-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Hotel / Categoría</th>
                                        <th className="px-10 py-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Detalles de Estancia</th>
                                        <th className="px-10 py-6 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Inversión</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {activeQuote.hotelOptions.map((hotel, idx) => (
                                        <tr key={idx} className={cn(
                                            "group transition-colors",
                                            hotel.isRecommended ? "bg-[#E33A7A]/[0.02]" : ""
                                        )}>
                                            <td className="px-10 py-10 align-top">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-xl bg-slate-900 flex items-center justify-center text-white scale-90">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                    </div>
                                                    <div className="text-sm font-black text-slate-800 uppercase italic tracking-tighter leading-tight">
                                                        {hotel.location || "Principal"}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-10 align-top">
                                                <div className="text-base font-black text-[#E33A7A] uppercase leading-none mb-3 italic tracking-tight">{hotel.name}</div>
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={cn("h-3 w-3", i < parseInt(hotel.category || '5') ? "fill-[#E33A7A] text-[#E33A7A]" : "fill-slate-100 text-slate-100")} />
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-10 py-10 align-top">
                                                <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <TrendingUp className="h-3 w-3 text-[#E33A7A]/40" /> {hotel.roomType || "Estancia de Lujo"}
                                                </div>
                                                <div className="text-xs font-medium text-slate-500 leading-relaxed italic text-pretty">
                                                    {hotel.notes || "Servicios de alta gama contemplados por Trappvel."}
                                                </div>
                                            </td>
                                            <td className="px-10 py-10 align-top text-right">
                                                {hotel.price > 0 ? (
                                                    <div className="text-sm font-black text-slate-800 tabular-nums">
                                                        {hotel.isCOP ? formatCOP(hotel.price) : formatUSD(hotel.price)}
                                                        <span className="text-[8px] opacity-40 ml-1">{hotel.isCOP ? 'COP' : 'USD'}</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">Incluido</div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                );

            case 'itinerary':
                if (!activeQuote.itinerary || activeQuote.itinerary.length === 0) return null;
                return (
                    <section key="itinerary" className="mb-24">
                        <div className="flex items-center gap-5 mb-14">
                            <div className="h-px w-16 bg-gradient-to-r from-[#E33A7A] to-transparent" />
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Historia de tu Viaje</h2>
                        </div>
                        <div className="space-y-4 relative">
                            <div className="absolute left-[47px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-[#E33A7A]/20 via-slate-100 to-[#E33A7A]/20" />
                            {activeQuote.itinerary.map((day, i) => (
                                <div key={i} className="flex gap-16 group last:pb-0 pb-16">
                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="h-24 w-24 rounded-[2rem] bg-white border border-slate-100 flex flex-col items-center justify-center transition-all duration-500 group-hover:bg-[#E33A7A] group-hover:border-[#E33A7A] group-hover:shadow-[0_20px_40px_-10px_rgba(227,58,122,0.3)] group-hover:rotate-6">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-[#E33A7A] group-hover:text-white/60 mb-1">Día</span>
                                            <span className="text-4xl font-black text-slate-200 group-hover:text-white transition-colors">{day.day}</span>
                                        </div>
                                    </div>
                                    <div className="pt-4 flex-1">
                                        <h3 className="text-2xl font-black text-slate-800 mb-4 uppercase tracking-tighter italic group-hover:text-[#E33A7A] transition-colors flex items-center gap-4">
                                            {day.title || `Destino Día ${day.day}`}
                                            {i === 0 && <Sparkles className="h-5 w-5 text-[#E33A7A] animate-pulse" />}
                                        </h3>
                                        <p className="text-base font-medium text-slate-500 leading-loose text-pretty max-w-2xl">{day.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                );

            case 'pricing':
                return (
                    <section key="pricing" className="mb-24">
                        <div className="bg-[#0F172A] rounded-[4rem] p-20 text-white relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(15,23,42,0.3)] transition-transform duration-700 hover:scale-[1.005]">
                            {/* Decorative background layers */}
                            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#E33A7A]/10 rounded-full blur-[140px] pointer-events-none" />
                            <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />

                            <div className="flex items-center justify-between relative z-10 mb-20">
                                <div className="space-y-2">
                                    <div className="text-[11px] font-black uppercase tracking-[0.5em] text-[#E33A7A] mb-2 flex items-center gap-3">
                                        <div className="h-1 w-8 bg-[#E33A7A] rounded-full" /> Inversión Integral
                                    </div>
                                    <h2 className="text-5xl font-black uppercase tracking-tighter italic leading-none">Resumen Estratégico</h2>
                                </div>
                                {activeQuote.validUntil && (
                                    <div className="text-[10px] font-black text-[#E33A7A] uppercase tracking-[0.3em] bg-[#E33A7A]/5 px-8 py-3 rounded-full border border-[#E33A7A]/20 backdrop-blur-3xl shadow-2xl">
                                        Exclusivo hasta: {new Date(activeQuote.validUntil).toLocaleDateString("es-CO", { dateStyle: 'long' })}
                                    </div>
                                )}
                            </div>

                            {isNacional && calcNac ? (
                                <div className="relative z-10 space-y-16">
                                    <div className="space-y-4">
                                        <p className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-500">Valor Neto de la Experiencia</p>
                                        <div className="flex items-baseline gap-4">
                                            <div className="text-9xl font-black text-white tracking-tighter tabular-nums italic leading-none drop-shadow-2xl">
                                                {formatCOP(calcNac.precioClienteCOP)}
                                            </div>
                                            <div className="text-3xl font-black uppercase text-[#E33A7A] tracking-widest opacity-80">COP</div>
                                        </div>
                                    </div>
                                    <div className="pt-12 border-t border-white/5 flex items-center justify-between text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 italic">
                                        <span>Tarifa neta · Luxury All Inclusive</span>
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck className="h-5 w-5 text-emerald-400" /> Transacción Garantizada
                                        </div>
                                    </div>
                                </div>
                            ) : calcInt ? (
                                <div className="relative z-10">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-end">
                                        <div className="space-y-6">
                                            <div className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-500">Inversión en Divisa (USD)</div>
                                            <div className="flex items-baseline gap-4">
                                                <div className="text-8xl font-black text-white tracking-tighter tabular-nums italic leading-none drop-shadow-xl">
                                                    {formatUSD(calcInt.precioClienteUSD)}
                                                </div>
                                                <div className="text-2xl font-black uppercase text-[#E33A7A] tracking-widest opacity-80">USD</div>
                                            </div>
                                        </div>
                                        <div className="space-y-6 bg-white/5 p-10 rounded-[3rem] border border-white/5 backdrop-blur-2xl">
                                            <div className="text-[12px] font-black uppercase tracking-[0.4em] text-[#E33A7A]">Costo Estimado en COP</div>
                                            <div className="flex items-baseline gap-4">
                                                <div className="text-6xl font-black text-[#E33A7A] tracking-tighter tabular-nums italic leading-none">
                                                    {formatCOP(calcInt.precioClienteCOP)}
                                                </div>
                                                <div className="text-sm font-black uppercase text-white/20 tracking-widest">Pesos</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-20 pt-10 border-t border-white/5 flex flex-wrap justify-between items-center gap-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
                                        <span className="flex items-center gap-4">TRM Proyectada: <span className="text-white bg-white/5 px-4 py-1.5 rounded-lg border border-white/10">{formatTRM(trm)}</span></span>
                                        <span className="flex items-center gap-3 italic"><Info className="h-4 w-4 text-[#E33A7A]" /> Liquidación sujeta a TRM vigente al día del pago</span>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </section>
                );

            case 'terms':
                return (
                    <section key="terms" className="mb-24">
                        <div className="flex items-center gap-5 mb-14">
                            <div className="h-px w-16 bg-slate-200 to-transparent" />
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Términos · Exclusiones · Claridad</h2>
                        </div>
                        
                        {(activeQuote.paymentTerms || activeQuote.requiredDocuments) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24 bg-slate-50/50 p-16 rounded-[4rem] border border-slate-100 shadow-inner">
                                {activeQuote.paymentTerms && (
                                    <div className="space-y-8">
                                        <div className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center text-slate-900 shadow-sm border border-slate-100 italic font-black text-sm">
                                                $
                                            </div>
                                            Políticas de Pago
                                        </div>
                                        <p className="text-sm font-semibold text-slate-500 leading-loose italic pr-10 text-pretty">
                                            {activeQuote.paymentTerms}
                                        </p>
                                    </div>
                                )}
                                {activeQuote.requiredDocuments && (
                                    <div className="space-y-8">
                                        <div className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center text-slate-900 shadow-sm border border-slate-100">
                                                <ClipboardList className="h-5 w-5" />
                                            </div>
                                            Requisitos del Viaje
                                        </div>
                                        <p className="text-sm font-semibold text-slate-500 leading-loose italic text-pretty">
                                            {activeQuote.requiredDocuments}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {((activeQuote.inclusions?.length || 0) > 0 || (activeQuote.exclusions?.length || 0) > 0) && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 mb-24">
                                {(activeQuote.inclusions?.length || 0) > 0 && (
                                    <div className="space-y-10">
                                        <div className="text-[14px] font-black uppercase tracking-[0.5em] text-emerald-500 flex items-center gap-4">
                                            <CheckCircle2 className="h-6 w-6" /> Servicios Incluidos
                                        </div>
                                        <ul className="space-y-6">
                                            {activeQuote.inclusions?.map((item, i) => (
                                                <li key={i} className="text-sm font-black text-slate-800 flex items-start gap-5 uppercase tracking-tighter group">
                                                    <span className="text-[#E33A7A] mt-0.5 select-none font-black text-lg transition-transform group-hover:scale-125">/</span> {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {(activeQuote.exclusions?.length || 0) > 0 && (
                                    <div className="space-y-10 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                                        <div className="text-[14px] font-black uppercase tracking-[0.5em] text-slate-400 flex items-center gap-4">
                                            <XCircle className="h-6 w-6" /> No Contemplado
                                        </div>
                                        <ul className="space-y-6">
                                            {activeQuote.exclusions?.map((item, i) => (
                                                <li key={i} className="text-sm font-bold text-slate-400 flex items-start gap-5 uppercase tracking-tight italic">
                                                    <span className="text-slate-200 mt-0.5 select-none font-bold text-lg">/</span> {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeQuote.cancellationPolicy && (
                            <div className="space-y-6 bg-[#0F172A] text-slate-400 rounded-[3rem] p-16 border border-slate-800 relative overflow-hidden group mb-8">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#E33A7A]/5 blur-3xl rounded-full" />
                                <div className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-600 flex items-center gap-4 mb-4">
                                    <FileText className="h-5 w-5 text-[#E33A7A]" /> Protocolo de Cancelación
                                </div>
                                <p className="text-xs font-medium leading-loose italic max-w-4xl opacity-80 group-hover:opacity-100 transition-opacity whitespace-pre-wrap">
                                    {activeQuote.cancellationPolicy}
                                </p>
                            </div>
                        )}

                        {activeQuote.legalConditions && (
                            <div className="space-y-6 bg-slate-50 border border-slate-200 text-slate-500 rounded-[3rem] p-16 relative overflow-hidden group">
                                <div className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 flex items-center gap-4 mb-4">
                                    <ShieldCheck className="h-4 w-4 text-slate-400" /> Condiciones Generales y Legales
                                </div>
                                <p className="text-[11px] font-medium leading-loose text-justify max-w-5xl opacity-80 whitespace-pre-wrap">
                                    {activeQuote.legalConditions}
                                </p>
                            </div>
                        )}
                    </section>
                );

            default:
                return null;
        }
    };

    return (
        <div className="w-full bg-white font-sans text-slate-900 selection:bg-[#E33A7A]/10 selection:text-[#E33A7A]">
            {/* Cover Hero — Magazine Style */}
            <div className="relative h-[900px] w-full bg-[#0F172A] overflow-hidden">
                {activeQuote.destinationImage && (
                    <>
                        <img 
                            src={activeQuote.destinationImage} 
                            alt={activeQuote.destination} 
                            className="absolute inset-0 w-full h-full object-cover opacity-70 scale-100 transition-transform duration-[20s] hover:scale-110 motion-safe:animate-ken-burns"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/90 via-transparent to-[#0F172A]" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/60 via-transparent to-transparent" />
                    </>
                )}
                
                <div className="absolute inset-0 p-24 flex flex-col justify-between z-10 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <div className="h-20 w-20 rounded-[2.5rem] bg-[#E33A7A] flex items-center justify-center text-white shadow-2xl shadow-[#E33A7A]/40 transition-transform hover:rotate-12 duration-500">
                                <Plane className="h-10 w-10" strokeWidth={2.5} />
                            </div>
                            <div className="h-16 w-px bg-white/10" />
                            <div>
                                <div className="text-5xl font-black tracking-tighter uppercase italic leading-none text-white drop-shadow-lg">
                                    Trappvel
                                </div>
                                <div className="text-[11px] font-black uppercase tracking-[0.6em] text-[#E33A7A] mt-2 ml-1">
                                    Luxury · Global · Elite
                                </div>
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-3">
                             <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-1 border-r-2 border-[#E33A7A] pr-4">Identificador de Viaje</div>
                             <div className="text-2xl font-black tabular-nums tracking-[0.2em] italic text-[#E33A7A]">TR-{activeQuote.id?.substring(0, 8).toUpperCase() || 'ELITE-2026'}</div>
                        </div>
                    </div>

                    <div className="space-y-8 max-w-5xl">
                        <div className="flex items-center gap-6">
                            <div className="h-px w-20 bg-[#E33A7A]" />
                            <div className="text-[16px] font-black uppercase tracking-[0.6em] text-[#E33A7A] italic">Propuesta Curada para Ti</div>
                        </div>
                        <h1 className="text-[11rem] font-black tracking-tighter uppercase italic leading-[0.75] text-white drop-shadow-2xl">
                            {activeQuote.destination || 'Mundo'} <br /> 
                            <span className="text-[#E33A7A]">Infinito.</span>
                        </h1>
                    </div>

                    <div className="flex justify-between items-end border-t border-white/10 pt-16">
                        <div className="space-y-3">
                            <div className="text-[11px] font-black uppercase tracking-[0.5em] text-white/30">Explorador Titular</div>
                            <div className="text-4xl font-black italic uppercase tracking-tighter text-white">{activeQuote.travelerName || "Pasajero de Elite"}</div>
                        </div>
                        <div className="text-right space-y-3">
                            <div className="text-[11px] font-black uppercase tracking-[0.5em] text-white/30">Fecha de Emisión</div>
                            <div className="text-xl font-black italic text-[#E33A7A]">{new Date().toLocaleDateString("es-CO", { month: "long", year: "numeric", day: "2-digit" }).toUpperCase()}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="px-24 py-40 space-y-40">
                {/* Trip Context Card — Premium Dashboard Style */}
                <section className="bg-slate-50 border border-slate-100/50 rounded-[5rem] p-20 relative overflow-hidden group hover:shadow-2xl transition-all duration-700">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#E33A7A]/5 rounded-full blur-[100px] -mr-40 -mt-40 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-24 relative z-10">
                        <div className="space-y-5">
                            <div className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-300">Embarque</div>
                            <div className="flex items-center gap-6">
                                <div className="h-14 w-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-[#E33A7A]">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-slate-800 tabular-nums italic leading-none">{activeQuote.departureDate ? new Date(activeQuote.departureDate).toLocaleDateString("es-CO", { day: '2-digit', month: 'short' }) : "PD"}</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{activeQuote.departureDate ? new Date(activeQuote.departureDate).getFullYear() : "AÑO"}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-5 md:border-l border-slate-200 md:pl-24">
                            <div className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-300">Pax de Elite</div>
                            <div className="flex items-center gap-6">
                                <div className="h-14 w-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-[#E33A7A]">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-slate-800 tabular-nums italic leading-none">{activeQuote.numberOfTravelers || 1}</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">Viajeros</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-5 md:border-l border-slate-200 md:pl-24">
                            <div className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-300">Retorno</div>
                            <div className="flex items-center gap-6">
                                <div className="h-14 w-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-400">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-slate-400 tabular-nums italic leading-none">{activeQuote.returnDate ? new Date(activeQuote.returnDate).toLocaleDateString("es-CO", { day: '2-digit', month: 'short' }) : "PD"}</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mt-1">{activeQuote.returnDate ? new Date(activeQuote.returnDate).getFullYear() : "AÑO"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Dynamic Ordered Sections */}
                <div className="space-y-40">
                    {activeQuote.sectionOrder?.map(sectionId => renderSection(sectionId))}
                </div>

                {/* Signature / Footer — Magazine Quality */}
                <footer className="pt-32 border-t-2 border-slate-50 space-y-16">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12">
                         <div className="flex items-center gap-10">
                            <div className="h-20 w-20 rounded-[2rem] bg-slate-900 flex items-center justify-center text-[#E33A7A] shadow-2xl">
                                <Plane className="h-10 w-10" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xl font-black uppercase tracking-[0.4em] text-slate-900 italic">Trappvel Experiences</p>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em]">Curaduría de Viajes de Lujo · Diamond Certified 2026</p>
                            </div>
                         </div>
                         <div className="text-left lg:text-right space-y-2 border-l lg:border-l-0 lg:border-r-4 border-[#E33A7A] pl-10 lg:pl-0 lg:pr-10 py-2">
                             <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-300">Generado de forma Exclusiva por</p>
                             <p className="text-lg font-black text-slate-900 italic uppercase tracking-tighter">TravelPro Strategy Engine <span className="text-[#E33A7A]">v2.8</span></p>
                         </div>
                    </div>
                    
                    <div className="flex flex-col lg:flex-row justify-between items-center text-[10px] font-black uppercase tracking-[0.5em] text-slate-200">
                        <span>© {new Date().getFullYear()} Trappvel Inc. · All Rights Reserved · Private & Confidential</span>
                        <div className="flex items-center gap-10 mt-8 lg:mt-0">
                             <span className="hover:text-slate-400 cursor-pointer transition-colors">Terms of Service</span>
                             <span className="hover:text-slate-400 cursor-pointer transition-colors">Privacy Policy</span>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Global Smooth Scroll Support */}
            <style jsx global>{`
                @keyframes ken-burns {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.1); }
                }
                .animate-ken-burns {
                    animation: ken-burns 20s ease-in-out infinite alternate;
                }
            `}</style>
        </div>
    );
}
