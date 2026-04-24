"use client";

// Typography: Plus Jakarta Sans (Monofamily Diamond Standard)
import { useEffect } from "react";
import { useActiveQuote } from "@/features/quotes/store/quote-store";
import { formatCOP, formatUSD, formatTRM } from "@/lib/utils";
import { calculateNacional, calculateInternacional } from "@/features/quotes/utils/calculator";
import {
    Plane, MapPin, Calendar, Hotel, Star, CheckCircle2,
    XCircle, Info, ArrowRight, DollarSign, Clock, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Corporate Identity ────────────────────────────────────────────────────
const AGENCY_INFO = {
    name: "TRAPPVEL ENTERPRISE SAS",
    nit: "900.945.317",
    rnt: "116125 - 43733 - 43735",
    phones: "+57 322 222 3329 · 313 221 1090",
    email: "contacto@trappvel.com",
    web: "www.trappvel.com",
    address: "Calle 26 #102-20, Oficina 303, Bogotá, Colombia",
};

const DEFAULT_SECTION_ORDER = ["flights", "hotelOptions", "itinerary", "pricing", "terms"];

// ─── A4 Page Wrapper ───────────────────────────────────────────────────────
const A4PageWrapper = ({
    children,
    className,
    pageNumber,
}: {
    children: React.ReactNode;
    className?: string;
    pageNumber?: number;
}) => (
    <div
        className={cn(
            "relative w-[210mm] min-h-[297mm] bg-white mx-auto overflow-hidden flex flex-col shrink-0 mb-12 font-sans",
            "shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-foreground/5",
            "print:shadow-none print:ring-0 print:m-0 print:w-full print:min-h-screen print:break-after-page",
            className
        )}
    >
        {children}

        {/* Footer corporativo en páginas de contenido */}
        {pageNumber && pageNumber > 1 && (
            <div className="mt-auto px-16 py-8 border-t border-border/50 flex justify-between items-end bg-card">
                <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-extrabold text-foreground uppercase tracking-tighter">
                        {AGENCY_INFO.name}
                    </span>
                    <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest">
                        Nit. {AGENCY_INFO.nit} · RNT {AGENCY_INFO.rnt}
                    </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[8px] font-extrabold text-muted-foreground tabular-nums uppercase tracking-widest">
                        Página {pageNumber}
                    </span>
                    <span className="text-[6px] font-bold text-border uppercase tracking-tighter">
                        {AGENCY_INFO.web}
                    </span>
                </div>
            </div>
        )}
    </div>
);



// ─── Section Header ────────────────────────────────────────────────────────
const SectionHeader = ({
    title,
    icon: Icon,
    subtitle,
}: {
    title: string;
    icon?: React.ElementType;
    subtitle?: string;
}) => (
    <div className="mb-8 border-l-[3px] border-brand-primary pl-5 break-inside-avoid">
        <div className="flex items-center gap-3 mb-1">
            <h2 className="text-[12px] font-extrabold uppercase tracking-[0.25em] text-foreground">
                {title}
            </h2>
            {Icon && <Icon className="h-4 w-4 text-brand-primary" strokeWidth={2.5} />}
        </div>
        {subtitle && (
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.15em] leading-none">
                {subtitle}
            </p>
        )}
    </div>
);

// ─── Section Renderers ─────────────────────────────────────────────────────

function FlightsSection({ flights }: { flights: NonNullable<ReturnType<typeof useActiveQuote>["flights"]> }) {
    if (!flights || flights.length === 0) return null;
    return (
        <section className="mb-16 break-inside-avoid">
            <SectionHeader title="Detalle de Vuelos" icon={Plane} subtitle="Conexiones Aéreas" />
            <div className="overflow-hidden shadow-sm rounded-2xl border border-border">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-brand-primary">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-extrabold text-primary-foreground uppercase tracking-[0.2em]">Aerolínea</th>
                            <th className="px-6 py-4 text-[10px] font-extrabold text-primary-foreground uppercase tracking-[0.2em]">Ruta</th>
                            <th className="px-6 py-4 text-[10px] font-extrabold text-primary-foreground uppercase tracking-[0.2em] text-center">Salida</th>
                            <th className="px-6 py-4 text-[10px] font-extrabold text-primary-foreground uppercase tracking-[0.2em] text-right">Llegada</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        {flights.map((flight, idx) => (
                            <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="text-[11px] font-extrabold text-foreground uppercase tracking-tighter">{flight.airline}</div>
                                    {flight.flightNumber && (
                                        <div className="text-[10px] text-brand-primary font-bold tabular-nums">{flight.flightNumber}</div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-[10px] font-bold text-muted-foreground flex items-center gap-3">
                                        {flight.origin} <ArrowRight className="h-3 w-3 text-border" /> {flight.destination}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="text-[10px] font-bold text-foreground tabular-nums">{flight.departureTime}</div>
                                    <div className="text-[8px] font-semibold text-muted-foreground uppercase">
                                        {new Date(flight.date).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="text-[10px] font-bold text-foreground tabular-nums">{flight.arrivalTime}</div>
                                    <div className="text-[8px] font-semibold text-muted-foreground uppercase">Hora Local</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function HotelsSection({ hotelOptions }: { hotelOptions: NonNullable<ReturnType<typeof useActiveQuote>["hotelOptions"]> }) {
    if (!hotelOptions || hotelOptions.length === 0) return null;
    return (
        <section className="mb-16">
            <SectionHeader title="Detalles de Alojamiento" icon={Hotel} subtitle="Hospedaje Seleccionado" />
            <div className="grid grid-cols-1 gap-6">
                {hotelOptions.map((hotel, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "p-6 rounded-[2rem] border relative overflow-hidden break-inside-avoid",
                            hotel.isRecommended
                                ? "bg-brand-primary/5 border-brand-primary/20 shadow-sm"
                                : "bg-card border-border"
                        )}
                    >
                        {hotel.isRecommended && (
                            <div className="absolute top-0 right-12 bg-brand-primary text-primary-foreground text-[8px] font-extrabold px-5 py-2 uppercase tracking-[0.2em] rounded-b-xl shadow-lg ring-2 ring-white/20">
                                Opción Sugerida
                            </div>
                        )}
                        <div className="flex gap-8">
                            <div className="h-20 w-20 bg-brand-primary/5 rounded-3xl flex items-center justify-center shrink-0 border border-brand-primary/10 shadow-sm">
                                <Hotel className="h-8 w-8 text-brand-primary" strokeWidth={1.5} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="space-y-2">
                                        <h3 className="text-[15px] font-extrabold text-foreground uppercase tracking-tight italic">
                                            {hotel.name}
                                        </h3>
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={cn(
                                                        "h-3.5 w-3.5",
                                                        i < (parseInt(hotel.category) || 5)
                                                            ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                                                            : "fill-border text-border"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-extrabold text-brand-primary uppercase tracking-widest">
                                            <MapPin className="h-3 w-3" /> {hotel.location}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-8 mt-6">
                                    <div>
                                        <span className="text-[8px] font-extrabold text-muted-foreground uppercase tracking-[0.3em] block mb-1.5">
                                            Categoría de Habitación
                                        </span>
                                        <span className="text-[10px] font-bold text-foreground uppercase">
                                            {hotel.roomType || "Estándar"}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-[0.3em] block mb-1.5">
                                            Estado
                                        </span>
                                        <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-[0.1em]">
                                            Sujeto a Disponibilidad
                                        </span>
                                    </div>
                                </div>
                                {hotel.notes && (
                                    <div className="mt-6 flex gap-4 bg-muted/20 p-5 rounded-2xl border border-border shadow-sm transition-all hover:border-brand-primary/20">
                                        <Info className="h-3.5 w-3.5 text-brand-primary shrink-0 mt-0.5 fill-brand-primary/10" />
                                        <p className="text-[9.5px] text-muted-foreground leading-relaxed font-semibold">
                                            {hotel.notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function ItinerarySection({ itinerary }: { itinerary: NonNullable<ReturnType<typeof useActiveQuote>["itinerary"]> }) {
    if (!itinerary || itinerary.length === 0) return null;
    return (
        <section className="mb-16">
            <SectionHeader title="Cronograma del Viaje" icon={Calendar} subtitle="Itinerario Detallado" />
            <div className="relative pl-12 space-y-12 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border/60">
                {itinerary.map((day, i) => (
                    <div key={i} className="relative break-inside-avoid pb-2">
                        <div className="absolute -left-[45px] top-0 h-9 w-9 rounded-full border-[4px] border-white bg-foreground flex items-center justify-center text-primary-foreground text-[11px] font-extrabold tabular-nums shadow-md z-10">
                            {day.day}
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-[13px] font-extrabold text-foreground uppercase tracking-tight border-b border-border pb-2.5">
                                {day.title || `Día ${day.day}`}
                            </h3>
                            <p className="text-[10px] text-muted-foreground leading-[1.7] text-pretty max-w-2xl font-medium tracking-normal">
                                {day.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function PricingSection({
    isNacional,
    calcNac,
    calcInt,
    commPercent,
    agencyFeePercent,
    trm,
    validUntil,
}: {
    isNacional: boolean;
    calcNac: ReturnType<typeof calculateNacional> | null;
    calcInt: ReturnType<typeof calculateInternacional> | null;
    commPercent: number;
    agencyFeePercent: number;
    trm: number;
    validUntil?: Date;
}) {
    return (
        <section className="mb-16">
            <div className="bg-foreground text-primary-foreground rounded-[2rem] overflow-hidden p-10 relative break-inside-avoid shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-5">
                    <DollarSign className="h-40 w-40" />
                </div>

                <div className="flex justify-between items-end mb-10 border-b border-white/5 pb-8">
                    <div>
                        <span className="text-[11px] font-extrabold text-brand-primary uppercase tracking-[0.3em] block mb-2">
                            Desglose de Inversión
                        </span>
                        <h2 className="text-2xl font-bold uppercase tracking-tight text-white">
                            Presupuesto Final
                        </h2>
                    </div>
                    {validUntil && (
                        <div className="text-right">
                            <span className="text-[8px] font-bold text-white/30 uppercase tracking-[0.3em] block mb-1">
                                Cotización Válida Hasta
                            </span>
                            <div className="flex items-center gap-2 text-[10px] font-extrabold text-white/90 uppercase">
                                <Clock className="h-3 w-3 text-brand-primary" />
                                {new Date(validUntil).toLocaleDateString("es-CO", { day: "2-digit", month: "long" })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <span className="text-[10px] font-bold text-brand-primary/60 uppercase tracking-wider block">
                                Tarifa por Persona
                            </span>
                            <div className="flex items-baseline gap-3">
                                <span className="text-5xl font-extrabold text-white tabular-nums tracking-tighter leading-none">
                                    {isNacional && calcNac
                                        ? formatCOP(calcNac.precioClienteCOP)
                                        : calcInt
                                        ? formatUSD(calcInt.precioClienteUSD)
                                        : "$0"}
                                </span>
                                <span className="text-xl font-bold text-white/40">
                                    {isNacional ? "COP" : "USD"}
                                </span>
                            </div>
                        </div>

                        {!isNacional && calcInt && (
                            <div className="pt-8 border-t border-white/5">
                                <div className="flex items-center gap-3 mb-2 opacity-60">
                                    <span className="text-[11px] font-bold text-white/80 uppercase tracking-[0.1em]">
                                        Equivalente Local
                                    </span>
                                    <div className="h-px w-8 bg-white/10" />
                                </div>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-2xl font-bold text-white tracking-tight tabular-nums opacity-90">
                                        ≈ {formatCOP(calcInt.precioClienteCOP)}
                                    </span>
                                    <span className="text-[10px] text-white/30 font-extrabold tracking-[0.3em] uppercase">
                                        COP
                                    </span>
                                </div>
                                <p className="text-[8px] text-white/30 mt-4 italic max-w-xs leading-relaxed uppercase tracking-tighter">
                                    Liquidación final sujeta a TRM oficial del día del pago.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col justify-center">
                        <div className="bg-white/5 rounded-2xl p-8 border border-white/10 space-y-6">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <span className="text-[8px] font-extrabold text-white/20 uppercase block tracking-[0.4em] mb-1.5">
                                        Fee Gestión
                                    </span>
                                    <span className="text-[12px] font-extrabold text-brand-primary">{(commPercent + agencyFeePercent).toFixed(1)}%</span>
                                </div>
                                {!isNacional && (
                                    <div className="text-right">
                                        <span className="text-[8px] font-extrabold text-white/20 uppercase block tracking-[0.4em] mb-1.5">
                                            TRM Base
                                        </span>
                                        <span className="text-[12px] font-extrabold text-white/80 tabular-nums">
                                            {formatTRM(trm)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function TermsSection({
    inclusions,
    exclusions,
    legalConditions,
    paymentTerms,
    cancellationPolicy,
}: {
    inclusions?: string[];
    exclusions?: string[];
    legalConditions?: string;
    paymentTerms?: string;
    cancellationPolicy?: string;
}) {
    return (
        <section className="mb-16">
            <SectionHeader title="Términos y Condiciones" subtitle="Condiciones de la Propuesta" />
            <div className="bg-muted rounded-2xl p-8 border border-border break-inside-avoid">
                <div className="grid grid-cols-2 gap-12">
                    <div className="space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-brand-primary/5 rounded-lg border border-brand-primary/10">
                                <CheckCircle2 className="h-4 w-4 text-brand-primary" />
                            </div>
                            <h4 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-primary">Lo que Incluye</h4>
                        </div>
                        <ul className="space-y-3">
                            {inclusions?.map((item, i) => (
                                <li key={i} className="text-[9.5px] font-bold text-muted-foreground leading-tight border-l-2 border-brand-primary/20 pl-4 py-0.5">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-brand-primary/5 rounded-lg border border-brand-primary/10">
                                <XCircle className="h-4 w-4 text-brand-primary" />
                            </div>
                            <h4 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-primary">No Incluye</h4>
                        </div>
                        <ul className="space-y-3">
                            {exclusions?.map((item, i) => (
                                <li key={i} className="text-[9.5px] font-bold text-muted-foreground leading-tight border-l-2 border-brand-primary/20 pl-4 py-0.5">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {(legalConditions || paymentTerms || cancellationPolicy) && (
                    <div className="mt-8 pt-6 border-t border-border space-y-4">
                        {paymentTerms && (
                            <div>
                                <span className="text-[8px] font-extrabold text-subtle-foreground uppercase tracking-[0.3em] block mb-1">
                                    Condiciones de Pago
                                </span>
                                <p className="text-[8px] text-muted-foreground leading-relaxed">{paymentTerms}</p>
                            </div>
                        )}
                        {cancellationPolicy && (
                            <div>
                                <span className="text-[8px] font-extrabold text-subtle-foreground uppercase tracking-[0.3em] block mb-1">
                                    Política de Cancelación
                                </span>
                                <p className="text-[8px] text-muted-foreground leading-relaxed">{cancellationPolicy}</p>
                            </div>
                        )}
                        {legalConditions && (
                            <p className="text-[11px] text-muted-foreground leading-relaxed text-justify font-semibold bg-card p-4 rounded-xl border border-border shadow-sm italic">
                                {legalConditions}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────
export function QuoteTemplate() {
    const activeQuote = useActiveQuote();

    const isNacional = activeQuote.destinationType === "nacional";
    const commPercent = activeQuote.providerCommissionPercent ?? 10;
    const agencyFeePercent = activeQuote.agencyFeePercent ?? 5;
    const trm = activeQuote.trmUsed || 4200;

    const calcNac = isNacional
        ? calculateNacional(activeQuote.netCostCOP || 0, commPercent, agencyFeePercent)
        : null;
    const calcInt = !isNacional
        ? calculateInternacional(activeQuote.netCostUSD || 0, commPercent, agencyFeePercent, trm)
        : null;

    // Consume el orden definido por el asesor en el wizard
    const sectionOrder = activeQuote.sectionOrder || DEFAULT_SECTION_ORDER;

    const renderSection = (sectionId: string) => {
        switch (sectionId) {
            case "flights":
                return activeQuote.flights && activeQuote.flights.length > 0
                    ? <FlightsSection key="flights" flights={activeQuote.flights} />
                    : null;

            case "hotelOptions":
            case "hotels":
                return activeQuote.hotelOptions && activeQuote.hotelOptions.length > 0
                    ? <HotelsSection key="hotels" hotelOptions={activeQuote.hotelOptions} />
                    : null;

            case "itinerary":
                return activeQuote.itinerary && activeQuote.itinerary.length > 0
                    ? <ItinerarySection key="itinerary" itinerary={activeQuote.itinerary} />
                    : null;

            case "pricing":
                return (
                    <PricingSection
                        key="pricing"
                        isNacional={isNacional}
                        calcNac={calcNac}
                        calcInt={calcInt}
                        commPercent={commPercent}
                        agencyFeePercent={agencyFeePercent}
                        trm={trm}
                        validUntil={activeQuote.validUntil}
                    />
                );

            case "terms":
                return (
                    <TermsSection
                        key="terms"
                        inclusions={activeQuote.inclusions}
                        exclusions={activeQuote.exclusions}
                        legalConditions={activeQuote.legalConditions}
                        paymentTerms={activeQuote.paymentTerms}
                        cancellationPolicy={activeQuote.cancellationPolicy}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <>

        <div className="flex flex-col items-center bg-muted py-16 text-foreground">

            {/* ── HOJA 1: PORTADA CORPORATIVA ─────────────────────────── */}
            <A4PageWrapper className="bg-foreground border-none group/cover">
                {/* Background Image */}
                {activeQuote.destinationImage && (
                    <div className="absolute inset-0 z-0">
                        <img
                            src={activeQuote.destinationImage}
                            alt={activeQuote.destination}
                            className="w-full h-full object-cover grayscale-[40%] brightness-[0.35]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black via-foreground/40 to-black" />
                    </div>
                )}

                {/* Technical Header */}
                <div className="relative z-20 w-full px-16 py-10 flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-brand-primary" strokeWidth={2.5} />
                            <span className="text-[10px] font-extrabold text-white uppercase tracking-[0.3em]">
                                Verified Technical Document
                            </span>
                        </div>
                        <span className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em] ml-6 font-mono">
                            Security ID: TR-{ (activeQuote.id || Math.abs(activeQuote.travelerName?.length || 0 + new Date().getTime()).toString(16).toUpperCase() ).substring(0, 8) }
                        </span>
                    </div>
                    <div className="px-5 py-2 bg-white/5 border border-white/10 rounded-full">
                        <span className="text-[11px] font-extrabold text-brand-primary uppercase tracking-[0.2em]">
                            Edición 2026
                        </span>
                    </div>
                </div>

                {/* Main Identity Block */}
                <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-20">
                    <div className="space-y-16 w-full text-center">
                        <div className="flex flex-col items-center gap-6">
                            <div className="h-px w-24 bg-gradient-to-r from-transparent via-brand-primary to-transparent" />
                            {/* Inter — label de clasificación */}
                            <span
                                className="text-[11px] font-semibold text-brand-primary uppercase tracking-[0.5em]"
                            >
                                Propuesta de viajes
                            </span>
                            {/* Playfair Display — título editorial del destino */}
                            <h1
                                className="text-7xl font-bold text-white leading-[0.9] drop-shadow-[0_10px_30px_rgba(227,58,122,0.3)]"
                            >
                                {activeQuote.destination || "Global"}
                            </h1>
                        </div>

                        <div className="space-y-4 py-8">
                            <span
                                className="text-[8px] font-semibold text-white/40 uppercase tracking-[0.5em] block"
                            >
                                Diseñado Exclusivamente Para
                            </span>
                            <div className="relative inline-block">
                                {/* Playfair Display — nombre del cliente como titular editorial */}
                                <h2
                                    className="text-[2.8rem] font-bold text-white relative z-10 px-4 leading-tight"
                                >
                                    {activeQuote.travelerName || "Pasajero"}
                                </h2>
                                <div className="absolute -bottom-1 left-0 w-full h-[5px] bg-brand-primary/40 -skew-x-12 z-0" />
                            </div>
                        </div>

                        {/* Logistics Pill */}
                        <div className="flex justify-center">
                            <div className="flex items-center gap-10 px-10 py-6 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
                                <div className="text-center">
                                    <p className="text-[8px] font-extrabold text-brand-primary uppercase tracking-[0.3em] mb-1">Salida</p>
                                    <p className="text-[14px] font-extrabold text-white tabular-nums">
                                        {activeQuote.departureDate
                                            ? new Date(activeQuote.departureDate).toLocaleDateString("es-CO", { month: "short", day: "2-digit" })
                                            : "TBA"}
                                    </p>
                                </div>
                                <div className="h-8 w-px bg-white/10" />
                                <div className="text-center">
                                    <p className="text-[8px] font-extrabold text-brand-primary uppercase tracking-[0.3em] mb-1">Duración</p>
                                    <p className="text-[14px] font-extrabold text-white tabular-nums">
                                        {activeQuote.itinerary?.length
                                            ? `${activeQuote.itinerary.length} DÍAS`
                                            : "TBA"}
                                    </p>
                                </div>
                                <div className="h-8 w-px bg-white/10" />
                                <div className="text-center">
                                    <p className="text-[8px] font-extrabold text-brand-primary uppercase tracking-[0.3em] mb-1">Viajeros</p>
                                    <p className="text-[14px] font-extrabold text-white tabular-nums">
                                        {activeQuote.numberOfTravelers || 1} PAX
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Authority */}
                <div className="relative z-10 w-full px-20 py-12 flex justify-between items-end bg-gradient-to-t from-black/80 to-transparent">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-brand-primary rounded-lg">
                                <Plane className="h-3 w-3 text-white fill-white" />
                            </div>
                            <span className="text-[14px] font-extrabold text-white uppercase tracking-tighter">
                                {AGENCY_INFO.name}
                            </span>
                        </div>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-9">
                            NIT. {AGENCY_INFO.nit} · RNT {AGENCY_INFO.rnt}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-right">
                        <div className="px-4 py-1.5 bg-white rounded-lg">
                            <span className="text-[10px] font-extrabold text-foreground uppercase tracking-widest">
                                Documento Oficial
                            </span>
                        </div>
                        <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.1em] max-w-[200px]">
                            {AGENCY_INFO.address.toUpperCase()} · {AGENCY_INFO.web.toUpperCase()}
                        </p>
                    </div>
                </div>
            </A4PageWrapper>

            {/* ── HOJA 2: CONTENIDO DINÁMICO ─────────────────────────── */}
            <A4PageWrapper className="px-16 py-12" pageNumber={2}>
                {sectionOrder
                    .filter(id => id !== "terms")
                    .map((sectionId) => renderSection(sectionId))}

                {/* Info de continuación */}
                <div className="mt-auto pt-6 border-t border-border">
                    <p className="text-[10px] text-muted-foreground font-extrabold uppercase text-center tracking-[0.3em] italic">
                        Esta propuesta continúa en la siguiente página con términos y condiciones.
                    </p>
                </div>
            </A4PageWrapper>

            {/* ── HOJA 3: TÉRMINOS Y CONDICIONES ──────────────────── */}
            <A4PageWrapper className="px-16 py-12" pageNumber={3}>
                <div className="flex-1">
                    {renderSection("terms")}
                </div>

                {/* Legal Footer Final */}
                <div className="mt-auto pt-10 border-t border-border">
                    <div className="flex flex-col items-center gap-6 text-[10px] text-subtle-foreground leading-relaxed uppercase font-extrabold text-center tracking-[0.4em]">
                        <p className="text-[11px] text-foreground border-b border-border pb-3 max-w-2xl px-4">
                            Esta propuesta es un documento informativo y está sujeta a disponibilidad y cambios de tarifa sin previo aviso hasta que se realice el pago total.
                        </p>
                        <p className="pt-2 w-full text-muted-foreground">
                            {AGENCY_INFO.name} · NIT. {AGENCY_INFO.nit} · {AGENCY_INFO.address}
                        </p>
                    </div>
                </div>
            </A4PageWrapper>

        </div>
        </>
    );
}
