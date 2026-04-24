"use client";

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { Quote } from '@/features/quotes/schemas/quote-schema';
import { calculateNacional, calculateInternacional } from '@/features/quotes/utils/calculator';

/**
 * PDF Document — Diamond Standard v3.0 (Authority Standard)
 * Refactored: Senior Architectural Pattern
 * - Local Font Implementation: Outfit
 * - Tailwind Design Tokens
 */

// ─── DESIGN TOKENS (Tailwind v4 Reference) ──────────────────────────────────
// Senior Note: react-pdf does not support CSS variables. 
// We map Tailwind tokens to their canonical hex values.
const TOKENS = {
    colors: {
        brand: '#E33A7A',        // Custom TravelPro Magenta
        slate: {
            950: '#020617',      // tailwind.colors.slate.950
            900: '#0F172A',      // tailwind.colors.slate.900
            800: '#1E293B',      // tailwind.colors.slate.800
            600: '#475569',      // tailwind.colors.slate.600
            400: '#94A3B8',      // tailwind.colors.slate.400
            200: '#E2E8F0',      // tailwind.colors.slate.200
            100: '#F1F5F9',      // tailwind.colors.slate.100
            50:  '#F8FAFC',      // tailwind.colors.slate.50
        },
        white: '#FFFFFF',
        accent: 'rgba(227, 58, 122, 0.4)',
    },
    spacing: {
        page: 50,
        section: 35,
    }
};

const AGENCY_INFO = {
    name: "TRAPPVEL ENTERPRISE SAS",
    nit: "900.945.317",
    rnt: "116125 - 43733 - 43735",
    phones: "+57 322 222 3329 · 313 221 1090",
    email: "contacto@trappvel.com",
    web: "www.trappvel.com",
    address: "Calle 26 #102-20, Oficina 303, Bogotá, Colombia"
};

// ─── FONT REGISTRATION (Local Strategy) ────────────────────────────────────
// Senior Note: Using local fonts in the public directory avoids CSP blocks 
// and network latency during PDF generation.
const getFontPath = (name: string) => {
    if (typeof window !== 'undefined') {
        return `${window.location.origin}/fonts/${name}`;
    }
    return ''; // SSR fallback (fonts are not registered on server in this setup)
};

Font.register({
    family: 'Plus Jakarta Sans',
    fonts: [
        { src: getFontPath('PlusJakartaSans-Regular.ttf'), fontWeight: 400 },
        { src: getFontPath('PlusJakartaSans-Bold.ttf'), fontWeight: 700 }
    ]
});

// ─── STYLESHEET ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    page: {
        padding: TOKENS.spacing.page,
        backgroundColor: TOKENS.colors.white,
        fontFamily: 'Plus Jakarta Sans', // Monofamily Diamond Standard
        color: TOKENS.colors.slate[800]
    },
    coverPage: {
        height: '100%',
        backgroundColor: TOKENS.colors.slate[900],
        color: TOKENS.colors.white,
        position: 'relative',
        fontFamily: 'Plus Jakarta Sans'
    },
    backgroundContainer: {
        position: 'absolute',
        inset: 0,
        zIndex: -1
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        opacity: 0.35
    },
    backgroundOverlay: {
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)'
    },
    coverContent: {
        height: '100%',
        padding: 40,
        justifyContent: 'space-between'
    },
    coverHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    coverTechnicalLabel: {
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: 3,
        textTransform: 'uppercase'
    },
    coverSecurityId: {
        fontSize: 7,
        color: 'rgba(255, 255, 255, 0.3)',
        marginTop: 4,
        letterSpacing: 2
    },
    coverBadge: {
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)'
    },
    coverBadgeText: {
        fontSize: 8,
        fontWeight: 700,
        color: TOKENS.colors.brand,
        letterSpacing: 2
    },
    coverMain: {
        alignItems: 'center',
        textAlign: 'center'
    },
    coverTagline: {
        fontSize: 11,
        fontWeight: 600,
        color: TOKENS.colors.brand,
        letterSpacing: 5,
        textTransform: 'uppercase',
        marginBottom: 20
    },
    coverTitle: {
        fontSize: 72,
        fontWeight: 700,
        fontFamily: 'Plus Jakarta Sans',
        letterSpacing: -1,
        textTransform: 'uppercase'
    },
    coverRecipientBlock: {
        marginTop: 40,
        alignItems: 'center'
    },
    coverRecipientLabel: {
        fontSize: 8,
        color: 'rgba(255, 255, 255, 0.4)',
        letterSpacing: 4,
        marginBottom: 10,
        textTransform: 'uppercase'
    },
    coverRecipientName: {
        fontSize: 32,
        fontWeight: 700,
        fontFamily: 'Plus Jakarta Sans',
        borderBottomWidth: 5,
        borderBottomColor: TOKENS.colors.accent,
        paddingBottom: 4
    },
    statsPill: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 40,
        paddingVertical: 18,
        paddingHorizontal: 35,
        gap: 30,
        marginTop: 50
    },
    statItem: {
        alignItems: 'center'
    },
    statLabel: {
        fontSize: 7,
        fontWeight: 700,
        color: TOKENS.colors.brand,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 4
    },
    statValue: {
        fontSize: 12,
        fontWeight: 700,
        color: TOKENS.colors.white
    },
    statDivider: {
        width: 1,
        height: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)'
    },
    docHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40,
        borderBottomWidth: 1,
        borderBottomColor: TOKENS.colors.slate[100],
        paddingBottom: 20
    },
    brandInfo: {
        gap: 3
    },
    brandName: {
        fontSize: 12,
        fontWeight: 700,
        color: TOKENS.colors.slate[900]
    },
    brandDetails: {
        fontSize: 7,
        color: TOKENS.colors.slate[400],
        fontWeight: 700,
        letterSpacing: 1.5,
        textTransform: 'uppercase'
    },
    section: {
        marginBottom: TOKENS.spacing.section
    },
    sectionTitle: {
        fontSize: 12, // Matched to text-[12px]
        fontWeight: 700,
        color: TOKENS.colors.slate[900],
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 15,
        borderLeftWidth: 3,
        borderLeftColor: TOKENS.colors.brand,
        paddingLeft: 12
    },
    summaryGrid: {
        flexDirection: 'row',
        backgroundColor: TOKENS.colors.slate[50],
        borderRadius: 20,
        padding: 20,
        marginBottom: 35,
        borderWidth: 1,
        borderColor: TOKENS.colors.slate[100],
        gap: 30
    },
    table: {
        width: '100%',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: TOKENS.colors.slate[100],
        overflow: 'hidden'
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: TOKENS.colors.brand,
        paddingVertical: 12,
        paddingHorizontal: 15
    },
    tableHeaderText: {
        fontSize: 9, 
        fontWeight: 700,
        color: TOKENS.colors.white,
        letterSpacing: 2,
        textTransform: 'uppercase'
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: TOKENS.colors.slate[50],
        alignItems: 'center'
    },
    priceCard: {
        backgroundColor: TOKENS.colors.slate[900],
        borderRadius: 25,
        padding: 40,
        marginTop: 20
    },
    priceTag: {
        fontSize: 9,
        fontWeight: 700,
        color: 'rgba(255, 255, 255, 0.4)',
        letterSpacing: 4,
        textTransform: 'uppercase'
    },
    priceMain: {
        fontSize: 48,
        fontWeight: 700,
        color: TOKENS.colors.white
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 50,
        right: 50,
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: TOKENS.colors.slate[100],
        paddingTop: 12,
        fontSize: 6,
        fontWeight: 700,
        color: TOKENS.colors.slate[400],
        letterSpacing: 2,
        textTransform: 'uppercase'
    }
});

// ─── HELPERS ───────────────────────────────────────────────────────────────
const formatters = {
    currencyCOP: (val: number) => `$ ${Math.round(val).toLocaleString('es-CO')}`,
    currencyUSD: (val: number) => `US$ ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    date: (date: string | Date | null | undefined) => {
        if (!date) return "TBA";
        return new Date(date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }).toUpperCase();
    }
};

// ─── ATOMIC COMPONENTS ─────────────────────────────────────────────────────

const Section = ({ title, children, wrap = false }: { title: string; children: React.ReactNode; wrap?: boolean }) => (
    <View style={styles.section} wrap={wrap}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

const TableRow = ({ children, backgroundColor = 'transparent' }: { children: React.ReactNode; backgroundColor?: string }) => (
    <View style={[styles.tableRow, { backgroundColor }]}>
        {children}
    </View>
);

// ─── MAIN DOCUMENT ─────────────────────────────────────────────────────────

export const QuoteDocument = ({ quote }: { quote: Quote & { id?: string } }) => {
    const isNacional = quote.destinationType === "nacional";
    const commPercent = quote.providerCommissionPercent ?? 10;
    const agencyFeePercent = quote.agencyFeePercent ?? 5;
    const trm = quote.trmUsed || 4200;

    const calcNac = isNacional ? calculateNacional(quote.netCostCOP || 0, commPercent, agencyFeePercent) : null;
    const calcInt = !isNacional ? calculateInternacional(quote.netCostUSD || 0, commPercent, agencyFeePercent, trm) : null;

    const renderSections = () => {
        const order = quote.sectionOrder || ['flights', 'hotelOptions', 'itinerary', 'pricing', 'terms'];
        
        return order.map(sectionId => {
            switch (sectionId) {
                case 'flights':
                    if (!quote.flights?.length) return null;
                    return (
                        <Section title="Detalle de Vuelos" key="flights" wrap={false}>
                            <View style={styles.table}>
                                <View style={styles.tableHeader}>
                                    <Text style={{ width: '25%', ...styles.tableHeaderText }}>Aerolínea</Text>
                                    <Text style={{ width: '35%', ...styles.tableHeaderText }}>Ruta</Text>
                                    <Text style={{ width: '20%', ...styles.tableHeaderText, textAlign: 'center' }}>Salida</Text>
                                    <Text style={{ width: '20%', ...styles.tableHeaderText, textAlign: 'right' }}>Llegada</Text>
                                </View>
                                {quote.flights.map((f, i) => (
                                    <TableRow key={i}>
                                        <View style={{ width: '25%' }}>
                                            <Text style={{ fontSize: 10, fontWeight: 700 }}>{f.airline}</Text>
                                            <Text style={{ fontSize: 7, color: TOKENS.colors.slate[400], marginTop: 2 }}>{f.flightNumber}</Text>
                                        </View>
                                        <View style={{ width: '35%' }}>
                                            <Text style={{ fontSize: 9, fontWeight: 700 }}>{f.origin} → {f.destination}</Text>
                                            <Text style={{ fontSize: 7, color: TOKENS.colors.slate[400], marginTop: 2 }}>{formatters.date(f.date)}</Text>
                                        </View>
                                        <View style={{ width: '20%', textAlign: 'center' }}>
                                            <Text style={{ fontSize: 10, fontWeight: 700 }}>{f.departureTime}</Text>
                                            <Text style={{ fontSize: 7, color: TOKENS.colors.slate[400], marginTop: 2 }}>Hora Local</Text>
                                        </View>
                                        <View style={{ width: '20%', textAlign: 'right' }}>
                                            <Text style={{ fontSize: 10, fontWeight: 700 }}>{f.arrivalTime}</Text>
                                            <Text style={{ fontSize: 7, color: TOKENS.colors.slate[400], marginTop: 2 }}>Hora Local</Text>
                                        </View>
                                    </TableRow>
                                ))}
                            </View>
                        </Section>
                    );

                case 'hotelOptions':
                case 'hotels':
                    if (!quote.hotelOptions?.length) return null;
                    return (
                        <Section title="Detalles de Alojamiento" key="hotels">
                            <View style={{ gap: 15 }}>
                                {quote.hotelOptions.map((h, i) => (
                                    <View key={i} style={styles.table} wrap={false}>
                                        <TableRow backgroundColor={h.isRecommended ? '#FFF1F2' : 'transparent'}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 10, fontWeight: 700 }}>{h.name.toUpperCase()}</Text>
                                                <Text style={{ fontSize: 7, color: TOKENS.colors.brand, fontWeight: 700, marginTop: 2 }}>
                                                    {h.location.toUpperCase()} · {'★'.repeat(Number(h.category) || 5)}
                                                </Text>
                                            </View>
                                            <View style={{ textAlign: 'right' }}>
                                                <Text style={{ fontSize: 10, fontWeight: 700 }}>{h.roomType || 'ESTÁNDAR'}</Text>
                                                <Text style={{ fontSize: 7, color: TOKENS.colors.slate[400], marginTop: 2 }}>CATEGORÍA</Text>
                                            </View>
                                        </TableRow>
                                        {h.notes && (
                                            <View style={{ padding: 12, backgroundColor: '#FAFAFA' }}>
                                                <Text style={{ fontSize: 8, color: TOKENS.colors.slate[600], lineHeight: 1.4 }}>
                                                    {h.notes}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        </Section>
                    );

                case 'itinerary':
                    if (!quote.itinerary?.length) return null;
                    return (
                        <Section title="Cronograma del Viaje" key="itinerary">
                            <View style={{ paddingLeft: 20, borderLeftWidth: 1, borderLeftColor: TOKENS.colors.slate[100] }}>
                                {quote.itinerary.map((day, i) => (
                                    <View key={i} style={{ marginBottom: 20, position: 'relative' }} wrap={false}>
                                        <Text style={{
                                            position: 'absolute', left: -32, top: 0, width: 24, height: 24, borderRadius: 12,
                                            backgroundColor: TOKENS.colors.slate[900], color: TOKENS.colors.white,
                                            fontSize: 9, fontWeight: 700, textAlign: 'center', paddingTop: 7
                                        }}>{day.day}</Text>
                                        <Text style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>{day.title || `Día ${day.day}`}</Text>
                                        <Text style={{ fontSize: 9, color: TOKENS.colors.slate[600], lineHeight: 1.7, textAlign: 'justify' }}>{day.description}</Text>
                                    </View>
                                ))}
                            </View>
                        </Section>
                    );

                case 'pricing':
                    const finalPrice = isNacional ? formatters.currencyCOP(calcNac?.precioClienteCOP || 0) : formatters.currencyUSD(calcInt?.precioClienteUSD || 0);
                    return (
                        <Section title="Presupuesto Final" key="pricing" wrap={false}>
                            <View style={styles.priceCard}>
                                <Text style={[styles.priceTag, { color: TOKENS.colors.brand }]}>Desglose de Inversión</Text>
                                <Text style={[styles.priceTag, { color: TOKENS.colors.white, fontSize: 18, marginBottom: 20, marginTop: 4 }]}>Inversión Total Estimada</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <View>
                                        <Text style={styles.priceMain}>{finalPrice}</Text>
                                        <Text style={[styles.priceTag, { marginTop: 4 }]}>TARIFA POR PERSONA</Text>
                                    </View>
                                    {!isNacional && (
                                        <View style={{ textAlign: 'right' }}>
                                            <Text style={{ fontSize: 20, fontWeight: 700, color: TOKENS.colors.white, opacity: 0.8 }}>
                                                ≈ {formatters.currencyCOP(calcInt?.precioClienteCOP || 0)}
                                            </Text>
                                            <Text style={[styles.priceTag, { marginTop: 4 }]}>PESOS COLOMBIANOS</Text>
                                        </View>
                                    )}
                                </View>
                                {!isNacional && (
                                    <Text style={{ marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.05)', fontSize: 7, color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase' }}>
                                        TRM DE REFERENCIA: {trm} COP/USD · LIQUIDACIÓN FINAL SEGÚN TRM DEL DÍA DE PAGO
                                    </Text>
                                )}
                            </View>
                        </Section>
                    );

                case 'terms':
                    return (
                        <Section title="Términos y Condiciones" key="terms" wrap={false}>
                            <View style={{ flexDirection: 'row', gap: 20 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 7, fontWeight: 700, color: '#10B981', textTransform: 'uppercase', marginBottom: 10 }}>✓ Incluye</Text>
                                    {quote.inclusions?.map((item, i) => (
                                        <Text key={i} style={{ fontSize: 8, color: TOKENS.colors.slate[600], marginBottom: 4 }}>• {item}</Text>
                                    ))}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 7, fontWeight: 700, color: TOKENS.colors.slate[400], textTransform: 'uppercase', marginBottom: 10 }}>× No Incluido</Text>
                                    {quote.exclusions?.map((item, i) => (
                                        <Text key={i} style={{ fontSize: 8, color: TOKENS.colors.slate[400], marginBottom: 4 }}>• {item}</Text>
                                    ))}
                                </View>
                            </View>
                        </Section>
                    );

                default: return null;
            }
        });
    };

    return (
        <Document title={`Propuesta Trappvel - ${quote.travelerName}`}>
            {/* PORTADA */}
            <Page size="A4" style={styles.coverPage}>
                <View style={styles.backgroundContainer}>
                    {quote.destinationImage && !quote.destinationImage.startsWith('data:image/webp') && (
                        <Image src={quote.destinationImage} style={styles.backgroundImage} />
                    )}
                    <View style={styles.backgroundOverlay} />
                </View>

                <View style={styles.coverContent}>
                    <View style={styles.coverHeader}>
                        <View>
                            <Text style={styles.coverTechnicalLabel}>Verified Technical Document</Text>
                            <Text style={styles.coverSecurityId}>Security ID: TR-{(quote.id || 'EV').substring(0,8).toUpperCase()}</Text>
                        </View>
                        <View style={styles.coverBadge}>
                            <Text style={styles.coverBadgeText}>Edición 2026</Text>
                        </View>
                    </View>

                    <View style={styles.coverMain}>
                        <Text style={styles.coverTagline}>Propuesta de Viajes</Text>
                        <Text style={styles.coverTitle}>{quote.destination?.toUpperCase() || 'Global'}</Text>
                        
                        <View style={styles.coverRecipientBlock}>
                            <Text style={styles.coverRecipientLabel}>Diseñado Exclusivamente Para</Text>
                            <Text style={styles.coverRecipientName}>{quote.travelerName || 'Pasajero de Honor'}</Text>
                        </View>

                        <View style={styles.statsPill}>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Salida</Text>
                                <Text style={styles.statValue}>{formatters.date(quote.departureDate)}</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Duración</Text>
                                <Text style={styles.statValue}>{quote.itinerary?.length || 0} DÍAS</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Viajeros</Text>
                                <Text style={styles.statValue}>{quote.numberOfTravelers || 1} PAX</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <View>
                            <Text style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase' }}>{AGENCY_INFO.name}</Text>
                            <Text style={{ fontSize: 8, color: 'rgba(255, 255, 255, 0.4)', marginTop: 4 }}>NIT. {AGENCY_INFO.nit} · RNT {AGENCY_INFO.rnt}</Text>
                        </View>
                        <View style={{ backgroundColor: TOKENS.colors.white, paddingVertical: 6, paddingHorizontal: 15, borderRadius: 8 }}>
                            <Text style={{ fontSize: 9, fontWeight: 700, color: TOKENS.colors.slate[900], letterSpacing: 2 }}>Documento Oficial</Text>
                        </View>
                    </View>
                </View>
            </Page>

            {/* CONTENIDO */}
            <Page size="A4" style={styles.page}>
                <View style={styles.docHeader}>
                    <View style={styles.brandInfo}>
                        <Text style={styles.brandName}>{AGENCY_INFO.name}</Text>
                        <Text style={styles.brandDetails}>NIT. {AGENCY_INFO.nit} · RNT {AGENCY_INFO.rnt}</Text>
                    </View>
                    <View style={{ textAlign: 'right' }}>
                        <Text style={styles.brandDetails}>Propuesta Técnica</Text>
                        <Text style={{ fontSize: 10, fontWeight: 700, color: TOKENS.colors.brand, textTransform: 'uppercase', marginTop: 2 }}>{quote.travelerName}</Text>
                    </View>
                </View>

                <View style={styles.summaryGrid}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.brandDetails}>Salida</Text>
                        <Text style={{ fontSize: 12, fontWeight: 700 }}>{formatters.date(quote.departureDate)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.brandDetails}>Duración</Text>
                        <Text style={{ fontSize: 12, fontWeight: 700 }}>{quote.itinerary?.length || 0} DÍAS</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.brandDetails}>Pasajeros</Text>
                        <Text style={{ fontSize: 12, fontWeight: 700 }}>{quote.numberOfTravelers || 1} ADT</Text>
                    </View>
                </View>

                {renderSections()}

                <Text 
                    style={styles.footer} 
                    fixed 
                    render={({ pageNumber, totalPages }) => (
                        `${AGENCY_INFO.name} · NIT ${AGENCY_INFO.nit} · ${AGENCY_INFO.web} · Pág. ${pageNumber} de ${totalPages}`
                    )} 
                />
            </Page>
        </Document>
    );
};
