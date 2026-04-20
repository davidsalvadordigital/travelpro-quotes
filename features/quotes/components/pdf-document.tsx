import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { Quote } from '@/features/quotes/schemas/quote-schema';
import { calculateNacional, calculateInternacional } from '@/features/quotes/utils/calculator';

/**
 * PDF Document — Diamond Standard v3.0 (Authority Standard)
 * Cleaned of marketing noise, integrated with corporate agency data.
 */

const AGENCY_INFO = {
    name: "TRAPPVEL ENTERPRISE SAS",
    nit: "900.945.317",
    rnt: "116125 - 43733 - 43735",
    phones: "+57 322 222 3329 · 313 221 1090",
    email: "contacto@trappvel.com",
    web: "www.trappvel.com",
    address: "Calle 26 #102-20, Oficina 303, Bogotá, Colombia"
};

const styles = StyleSheet.create({
    // Estilos Base
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 50,
        fontFamily: 'Helvetica'
    },
    // Portada Corporativa
    coverPage: {
        height: '100%',
        backgroundColor: '#0F172A', // Slate-900
        padding: 0,
        position: 'relative',
        color: '#FFFFFF'
    },
    coverImageContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1
    },
    coverImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        opacity: 0.35
    },
    coverOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(15, 23, 42, 0.7)'
    },
    coverContent: {
        height: '100%',
        flexDirection: 'column',
        padding: 40
    },
    // Header Técnico
    coverHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 60
    },
    coverHeaderLabel: {
        fontSize: 9,
        fontWeight: 700,
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: 3
    },
    coverHeaderSec: {
        fontSize: 7,
        color: 'rgba(255, 255, 255, 0.3)',
        marginTop: 4,
        letterSpacing: 2
    },
    coverBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderRadius: 20
    },
    coverBadgeText: {
        fontSize: 8,
        fontWeight: 700,
        color: '#E33A7A',
        textTransform: 'uppercase',
        letterSpacing: 2
    },

    // Cuerpo Central
    coverMain: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center'
    },
    coverTag: {
        fontSize: 12,
        fontWeight: 700,
        color: '#E33A7A',
        letterSpacing: 6,
        textTransform: 'uppercase',
        marginBottom: 20,
        fontStyle: 'italic'
    },
    coverTitle: {
        fontSize: 68,
        fontWeight: 800,
        color: '#FFFFFF',
        letterSpacing: -2,
        textTransform: 'uppercase',
        marginBottom: 30
    },
    coverRecipientLabel: {
        fontSize: 8,
        color: 'rgba(255, 255, 255, 0.4)',
        textTransform: 'uppercase',
        letterSpacing: 4,
        marginBottom: 10
    },
    coverRecipientName: {
        fontSize: 28,
        fontWeight: 700,
        color: '#FFFFFF',
        textTransform: 'uppercase',
        borderBottomWidth: 3,
        borderBottomColor: 'rgba(227, 58, 122, 0.4)',
        paddingBottom: 4
    },

    // Píldora Logística
    coverStatsPill: {
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
    coverStatBox: {
        alignItems: 'center'
    },
    coverStatLabel: {
        fontSize: 7,
        fontWeight: 700,
        color: '#E33A7A',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 4
    },
    coverStatValue: {
        fontSize: 12,
        fontWeight: 700,
        color: '#FFFFFF'
    },
    coverStatDivider: {
        width: 1,
        height: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)'
    },

    // Footer Portada
    coverFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingTop: 40
    },
    coverAgencyName: {
        fontSize: 14,
        fontWeight: 700,
        color: '#FFFFFF',
        textTransform: 'uppercase'
    },
    coverAgencyLine: {
        fontSize: 8,
        color: 'rgba(255, 255, 255, 0.4)',
        marginTop: 4,
        letterSpacing: 2
    },
    coverFooterBadge: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 6,
        paddingHorizontal: 15,
        borderRadius: 8
    },
    coverFooterBadgeText: {
        fontSize: 9,
        fontWeight: 900,
        color: '#0F172A',
        textTransform: 'uppercase',
        letterSpacing: 2
    },

    // Cuerpo del Documento
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        paddingBottom: 20
    },
    headerBrand: {
        flexDirection: 'column',
        gap: 3
    },
    headerText: {
        fontSize: 12,
        fontWeight: 700,
        color: '#0F172A',
        letterSpacing: -0.2
    },
    headerSubText: {
        fontSize: 7,
        color: '#94A3B8',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 1.5
    },
    headerMeta: {
        textAlign: 'right'
    },
    headerLabel: {
        fontSize: 7,
        fontWeight: 700,
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 2
    },
    headerValue: {
        fontSize: 10,
        fontWeight: 700,
        color: '#E33A7A',
        textTransform: 'uppercase',
        marginTop: 2
    },

    // Secciones
    section: {
        marginBottom: 35
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 700,
        color: '#0F172A',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 15,
        borderLeftWidth: 3,
        borderLeftColor: '#E33A7A',
        paddingLeft: 12
    },
    
    // Grid de Datos Rápidos
    statsGrid: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        padding: 20,
        marginBottom: 35,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        gap: 30
    },
    statBox: {
        flex: 1
    },
    statLabel: {
        fontSize: 7,
        fontWeight: 700,
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 4
    },
    statValue: {
        fontSize: 12,
        fontWeight: 700,
        color: '#334155'
    },

    // Tablas
    table: {
        width: '100%',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        overflow: 'hidden'
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9'
    },
    tableHeaderText: {
        fontSize: 8,
        fontWeight: 700,
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
        alignItems: 'center'
    },
    tableCellMain: {
        fontSize: 10,
        fontWeight: 700,
        color: '#0F172A'
    },
    tableCellSub: {
        fontSize: 7,
        color: '#94A3B8',
        marginTop: 2
    },
    
    // Itinerario
    itineraryContainer: {
        paddingLeft: 20,
        borderLeftWidth: 1,
        borderLeftColor: '#F1F5F9'
    },
    itineraryDay: {
        marginBottom: 20,
        position: 'relative'
    },
    dayMarker: {
        position: 'absolute',
        left: -32,
        top: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#0F172A',
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: 700,
        textAlign: 'center',
        paddingTop: 7
    },
    dayTitle: {
        fontSize: 11,
        fontWeight: 700,
        color: '#0F172A',
        textTransform: 'uppercase',
        marginBottom: 6
    },
    dayDesc: {
        fontSize: 9,
        color: '#475569',
        lineHeight: 1.5,
        textAlign: 'justify'
    },

    // Card de Precios
    priceCard: {
        backgroundColor: '#0F172A',
        borderRadius: 25,
        padding: 30,
        marginTop: 20,
        position: 'relative',
        overflow: 'hidden'
    },
    priceLabel: {
        fontSize: 8,
        fontWeight: 700,
        color: 'rgba(255, 255, 255, 0.4)',
        textTransform: 'uppercase',
        letterSpacing: 3,
        marginBottom: 15
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end'
    },
    priceValue: {
        fontSize: 32,
        fontWeight: 700,
        color: '#FFFFFF'
    },
    priceCurrency: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.2)',
        marginLeft: 8,
        fontWeight: 700
    },
    trmBadge: {
        marginTop: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
        fontSize: 7,
        color: 'rgba(255, 255, 255, 0.4)',
        textTransform: 'uppercase',
        letterSpacing: 1
    },

    // Footer General
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 50,
        right: 50,
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 12,
        fontSize: 6,
        fontWeight: 700,
        color: '#CBD5E1',
        textTransform: 'uppercase',
        letterSpacing: 2
    }
});

interface QuoteDocumentProps {
    quote: Quote & { id?: string };
}

const fCOP = (val: number) => `$ ${Math.round(val).toLocaleString('es-CO')}`;
const fUSD = (val: number) => `US$ ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fDate = (date: string | Date | null | undefined) => {
    if (!date) return "TBA";
    const d = new Date(date);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }).toUpperCase();
};

export const QuoteDocument = ({ quote }: QuoteDocumentProps) => {
    const isNacional = quote.destinationType === "nacional";
    const fee = quote.feePercentage ?? 15;
    const trm = quote.trmUsed || 4200;

    const calcNac = isNacional ? calculateNacional(quote.pvpCOP || 0, fee, quote.extraMarginPercent ?? 0) : null;
    const calcInt = !isNacional ? calculateInternacional(quote.pvpUSD || 0, fee, trm, quote.extraMarginPercent ?? 0) : null;

    const renderSection = (sectionId: string) => {
        switch (sectionId) {
            case 'flights':
                if (!quote.flights || quote.flights.length === 0) return null;
                return (
                    <View style={styles.section} key="flights" wrap={false}>
                        <Text style={styles.sectionTitle}>Itinerario de Vuelos</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderText, { width: '30%' }]}>Aerolínea</Text>
                                <Text style={[styles.tableHeaderText, { width: '40%' }]}>Ruta</Text>
                                <Text style={[styles.tableHeaderText, { width: '30%', textAlign: 'right' }]}>Horarios</Text>
                            </View>
                            {quote.flights.map((f, i) => (
                                <View key={i} style={styles.tableRow}>
                                    <View style={{ width: '30%' }}>
                                        <Text style={styles.tableCellMain}>{f.airline}</Text>
                                        <Text style={styles.tableCellSub}>{f.flightNumber}</Text>
                                    </View>
                                    <View style={{ width: '40%' }}>
                                        <Text style={[styles.tableCellMain, { fontSize: 9 }]}>
                                          {f.origin} → {f.destination}
                                        </Text>
                                        <Text style={styles.tableCellSub}>{fDate(f.date)}</Text>
                                    </View>
                                    <View style={{ width: '30%', textAlign: 'right' }}>
                                        <Text style={styles.tableCellMain}>{f.departureTime}</Text>
                                        <Text style={styles.tableCellSub}>Salida Local</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                );

            case 'hotelOptions':
            case 'hotels':
                if (!quote.hotelOptions || quote.hotelOptions.length === 0) return null;
                return (
                    <View style={styles.section} key="hotels">
                        <Text style={styles.sectionTitle}>Detalles de Alojamiento</Text>
                        <View style={{ gap: 15 }}>
                            {quote.hotelOptions.map((h, i) => (
                                <View key={i} style={styles.table} wrap={false}>
                                    <View style={[styles.tableRow, { backgroundColor: h.isRecommended ? '#FFF1F2' : 'transparent' }]}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.tableCellMain}>{h.name.toUpperCase()}</Text>
                                            <Text style={[styles.tableCellSub, { color: '#E33A7A', fontWeight: 'bold' }]}>
                                              {h.location.toUpperCase()} · {'★'.repeat(Number(h.category) || 5)}
                                            </Text>
                                        </View>
                                        <View style={{ textAlign: 'right' }}>
                                            <Text style={styles.tableCellMain}>{h.roomType || 'ESTÁNDAR'}</Text>
                                            <Text style={styles.tableCellSub}>CATEGORÍA</Text>
                                        </View>
                                    </View>
                                    {h.notes && (
                                        <View style={{ padding: 12, backgroundColor: '#FAFAFA' }}>
                                            <Text style={{ fontSize: 8, color: '#64748B', lineHeight: 1.4, fontStyle: 'italic' }}>
                                              {h.notes}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>
                );

            case 'itinerary':
                if (!quote.itinerary || quote.itinerary.length === 0) return null;
                return (
                    <View style={styles.section} key="itinerary">
                        <Text style={styles.sectionTitle}>Jornadas de Viaje</Text>
                        <View style={styles.itineraryContainer}>
                            {quote.itinerary.map((day, i) => (
                                <View key={i} style={styles.itineraryDay} wrap={false}>
                                    <Text style={styles.dayMarker}>{day.day}</Text>
                                    <Text style={[styles.dayTitle, { color: '#0F172A' }]}>{day.title || `Día ${day.day}`}</Text>
                                    <Text style={styles.dayDesc}>{day.description}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                );

            case 'pricing':
                return (
                    <View style={styles.section} key="pricing" wrap={false}>
                        <View style={styles.priceCard}>
                            <Text style={styles.priceLabel}>Presupuesto Final</Text>
                            <View style={styles.priceRow}>
                                <View>
                                    <Text style={styles.priceValue}>
                                      {isNacional ? fCOP(calcNac?.precioClienteCOP || 0) : fUSD(calcInt?.precioClienteUSD || 0)}
                                    </Text>
                                    <Text style={[styles.priceCurrency, { marginLeft: 0, marginTop: 4 }]}>
                                      TARIFA POR PERSONA
                                    </Text>
                                </View>
                                {!isNacional && (
                                    <View style={{ textAlign: 'right' }}>
                                        <Text style={[styles.priceValue, { fontSize: 20, opacity: 0.8 }]}>
                                          ≈ {fCOP(calcInt?.precioClienteCOP || 0)}
                                        </Text>
                                        <Text style={[styles.priceCurrency, { marginLeft: 0, marginTop: 4 }]}>PESOS COLOMBIANOS</Text>
                                    </View>
                                )}
                            </View>
                            {!isNacional && (
                                <Text style={styles.trmBadge}>
                                    TRM DE REFERENCIA: {trm} COP/USD · LIQUIDACIÓN FINAL SEGÚN TRM DEL DÍA DE PAGO
                                </Text>
                            )}
                        </View>
                    </View>
                );

            case 'terms':
                return (
                    <View style={styles.section} key="terms" wrap={false}>
                        <Text style={styles.sectionTitle}>Términos y Condiciones</Text>
                        <View style={{ flexDirection: 'row', gap: 20 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.statLabel, { color: '#10B981', marginBottom: 10 }]}>✓ Incluye</Text>
                                {quote.inclusions?.map((item, i) => (
                                    <Text key={i} style={{ fontSize: 8, color: '#475569', marginBottom: 4 }}>• {item}</Text>
                                ))}
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.statLabel, { color: '#94A3B8', marginBottom: 10 }]}>× No Incluido</Text>
                                {quote.exclusions?.map((item, i) => (
                                    <Text key={i} style={{ fontSize: 8, color: '#94A3B8', marginBottom: 4 }}>• {item}</Text>
                                ))}
                            </View>
                        </View>
                        {quote.legalConditions && (
                           <View style={{ marginTop: 25, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
                               <Text style={{ fontSize: 7, color: '#94A3B8', textAlign: 'justify', lineHeight: 1.4 }}>
                                 {quote.legalConditions}
                               </Text>
                           </View>
                        )}
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <Document title={`Propuesta Trappvel - ${quote.travelerName}`}>
            {/* PORTADA CORPORATIVA */}
            <Page size="A4" style={styles.coverPage}>
                <View style={styles.coverImageContainer}>
                    {quote.destinationImage && <Image src={quote.destinationImage} style={styles.coverImage} />}
                    <View style={styles.coverOverlay} />
                </View>
                
                <View style={styles.coverContent}>
                    {/* Header Technical */}
                    <View style={styles.coverHeader}>
                        <View>
                            <Text style={styles.coverHeaderLabel}>Verified Technical Document</Text>
                            <Text style={styles.coverHeaderSec}>Security ID: TR-{(quote.id || 'EV').substring(0,8).toUpperCase()}</Text>
                        </View>
                        <View style={styles.coverBadge}>
                            <Text style={styles.coverBadgeText}>Edición 2026</Text>
                        </View>
                    </View>

                    {/* Main Content */}
                    <View style={styles.coverMain}>
                        <Text style={styles.coverTag}>Propuesta Técnica</Text>
                        <Text style={styles.coverTitle}>{quote.destination?.toUpperCase() || 'Global'}</Text>
                        
                        <View style={{ marginTop: 40, alignItems: 'center' }}>
                            <Text style={styles.coverRecipientLabel}>Diseñado Exclusivamente Para</Text>
                            <Text style={styles.coverRecipientName}>{quote.travelerName || 'Pasajero de Honor'}</Text>
                        </View>

                        {/* Logistics Pill */}
                        <View style={styles.coverStatsPill}>
                            <View style={styles.coverStatBox}>
                                <Text style={styles.coverStatLabel}>Salida</Text>
                                <Text style={styles.coverStatValue}>{fDate(quote.departureDate)}</Text>
                            </View>
                            <View style={styles.coverStatDivider} />
                            <View style={styles.coverStatBox}>
                                <Text style={styles.coverStatLabel}>Duración</Text>
                                <Text style={styles.coverStatValue}>{quote.itinerary?.length || 0} DÍAS</Text>
                            </View>
                            <View style={styles.coverStatDivider} />
                            <View style={styles.coverStatBox}>
                                <Text style={styles.coverStatLabel}>Viajeros</Text>
                                <Text style={styles.coverStatValue}>{quote.numberOfTravelers || 1} PAX</Text>
                            </View>
                        </View>
                    </View>

                    {/* Footer Authority */}
                    <View style={styles.coverFooter}>
                        <View>
                            <Text style={styles.coverAgencyName}>{AGENCY_INFO.name}</Text>
                            <Text style={styles.coverAgencyLine}>NIT. {AGENCY_INFO.nit} · RNT {AGENCY_INFO.rnt}</Text>
                        </View>
                        <View style={styles.coverFooterBadge}>
                            <Text style={styles.coverFooterBadgeText}>Documento Oficial</Text>
                        </View>
                    </View>
                </View>
            </Page>

            {/* CUERPO DEL DOCUMENTO */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View style={styles.headerBrand}>
                        <Text style={styles.headerText}>{AGENCY_INFO.name}</Text>
                        <Text style={styles.headerSubText}>NIT. {AGENCY_INFO.nit} · RNT {AGENCY_INFO.rnt}</Text>
                    </View>
                    <View style={styles.headerMeta}>
                        <Text style={styles.headerLabel}>Propuesta Técnica</Text>
                        <Text style={styles.headerValue}>{quote.travelerName}</Text>
                    </View>
                </View>

                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Salida</Text>
                        <Text style={styles.statValue}>{fDate(quote.departureDate)}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Duración</Text>
                        <Text style={styles.statValue}>{quote.itinerary?.length || 0} DÍAS</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Pasajeros</Text>
                        <Text style={styles.statValue}>{quote.numberOfTravelers || 1} ADT</Text>
                    </View>
                </View>

                {/* Render dinámico de secciones */}
                {(quote.sectionOrder || ['flights', 'hotelOptions', 'itinerary', 'pricing', 'terms'])
                    .map(sid => renderSection(sid))}

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

