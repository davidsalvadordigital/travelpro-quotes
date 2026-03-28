import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { Quote } from '@/features/quotes/schemas/quote-schema';
import { calculateNacional, calculateInternacional } from '@/features/quotes/utils/calculator';

// Registrar fuentes premium (Outfit)
Font.register({
    family: 'Outfit',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/outfit/v11/QdbO4Fe9PyovL0GnyhEFcvEK.ttf', fontWeight: 300 },
        { src: 'https://fonts.gstatic.com/s/outfit/v11/QdbO4Fe9PyovL0GnyhEFZPEK.ttf', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/s/outfit/v11/QdbO4Fe9PyovL0GnyhEFcfEK.ttf', fontWeight: 600 },
        { src: 'https://fonts.gstatic.com/s/outfit/v11/QdbO4Fe9PyovL0GnyhEFC_EK.ttf', fontWeight: 700 },
    ]
});

// Estilos del documento PDF - Diamond Standard Edition
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 50,
        fontFamily: 'Outfit'
    },
    // Estilos de la Portada (Cover Page)
    coverPage: {
        height: '100%',
        backgroundColor: '#0F172A', // Dark Slate para elegancia extrema
        padding: 0,
        position: 'relative'
    },
    coverGradient: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: '100%',
        height: '40%',
        backgroundColor: '#E33A7A', // Acento de marca
        opacity: 0.05
    },
    coverContent: {
        padding: 60,
        height: '100%',
        justifyContent: 'space-between'
    },
    coverBrand: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15
    },
    coverLogo: {
        width: 50,
        height: 50,
        backgroundColor: '#E33A7A',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    coverBrandName: {
        fontSize: 32,
        fontWeight: 700,
        color: '#FFFFFF',
        letterSpacing: -1
    },
    coverTitleSection: {
        marginTop: 40
    },
    coverSubtitle: {
        fontSize: 12,
        fontWeight: 600,
        color: '#E33A7A',
        letterSpacing: 4,
        textTransform: 'uppercase',
        marginBottom: 10
    },
    coverTitle: {
        fontSize: 54,
        fontWeight: 700,
        color: '#FFFFFF',
        letterSpacing: -2,
        lineHeight: 1.1
    },
    coverDestination: {
        fontSize: 38,
        fontWeight: 700,
        color: '#E33A7A',
        marginTop: 10
    },
    coverBottom: {
        borderTopWidth: 1,
        borderTopColor: '#1E293B',
        paddingTop: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end'
    },
    coverPreparedFor: {
        fontSize: 10,
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 5
    },
    coverTravelerName: {
        fontSize: 18,
        fontWeight: 600,
        color: '#FFFFFF'
    },
    coverDate: {
        fontSize: 10,
        color: '#64748B',
        textAlign: 'right'
    },

    // Cuerpo del documento
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 30
    },
    brandContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    brandLogo: {
        width: 40,
        height: 40,
        backgroundColor: '#E33A7A',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center'
    },
    brandText: {
        fontSize: 24,
        fontWeight: 700,
        color: '#E33A7A',
        letterSpacing: -1,
        textTransform: 'uppercase'
    },
    brandSub: {
        fontSize: 8,
        color: '#94A3B8',
        letterSpacing: 2,
        textTransform: 'uppercase',
        fontWeight: 700,
        marginTop: 2
    },
    headerRight: {
        alignItems: 'flex-end'
    },
    docTitle: {
        fontSize: 18,
        fontWeight: 700,
        color: '#0F172A',
        textTransform: 'uppercase'
    },
    dateText: {
        fontSize: 9,
        color: '#64748B',
        marginTop: 4,
        textTransform: 'uppercase',
        fontWeight: 700
    },
    badge: {
        marginTop: 10,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        fontSize: 8,
        fontWeight: 700,
        textTransform: 'uppercase',
        borderWidth: 1
    },
    divider: {
        height: 4,
        backgroundColor: '#E33A7A',
        marginBottom: 30,
        borderRadius: 2,
        width: '100%'
    },
    section: {
        marginBottom: 25,
    },
    sectionLabel: {
        fontSize: 9,
        fontWeight: 700,
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        paddingBottom: 4
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 20
    },
    infoBox: {
        flex: 1,
        minWidth: '30%',
        marginBottom: 10
    },
    infoLabel: {
        fontSize: 8,
        color: '#94A3B8',
        textTransform: 'uppercase',
        fontWeight: 700,
        marginBottom: 2
    },
    infoValue: {
        fontSize: 10,
        fontWeight: 700,
        color: '#334155'
    },
    tripCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        padding: 20,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#F1F5F9'
    },
    itineraryDay: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9'
    },
    dayNumber: {
        width: 35,
        height: 35,
        borderRadius: 10,
        backgroundColor: '#E33A7A',
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 700,
        textAlign: 'center',
        paddingTop: 10
    },
    dayContent: {
        flex: 1
    },
    dayTitle: {
        fontSize: 11,
        fontWeight: 700,
        color: '#0F172A',
        marginBottom: 4,
        textTransform: 'uppercase'
    },
    dayDesc: {
        fontSize: 10,
        color: '#64748B',
        lineHeight: 1.5
    },
    incExcContainer: {
        flexDirection: 'row',
        gap: 30,
        marginBottom: 30
    },
    incExcColumn: {
        flex: 1
    },
    incTitle: {
        fontSize: 9,
        fontWeight: 700,
        color: '#10B981',
        textTransform: 'uppercase',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ECFDF5',
        paddingBottom: 4
    },
    excTitle: {
        fontSize: 9,
        fontWeight: 700,
        color: '#94A3B8',
        textTransform: 'uppercase',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
        paddingBottom: 4
    },
    listItem: {
        flexDirection: 'row',
        marginBottom: 6,
        alignItems: 'flex-start'
    },
    bullet: {
        width: 12,
        fontSize: 10,
        fontWeight: 700
    },
    listItemText: {
        flex: 1,
        fontSize: 9,
        color: '#475569',
        fontWeight: 400
    },
    financialsCard: {
        backgroundColor: '#0F172A',
        borderRadius: 25,
        padding: 30,
        marginTop: 10,
        position: 'relative',
        overflow: 'hidden'
    },
    finLabel: {
        fontSize: 8,
        fontWeight: 700,
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 15
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    priceBox: {
        flex: 1
    },
    priceTitle: {
        fontSize: 8,
        color: '#64748B',
        textTransform: 'uppercase',
        fontWeight: 700,
        marginBottom: 5
    },
    priceBig: {
        fontSize: 28,
        fontWeight: 700,
        color: '#FFFFFF',
        letterSpacing: -1
    },
    priceAccent: {
        color: '#E33A7A'
    },
    trmNote: {
        fontSize: 8,
        color: '#475569',
        borderTopWidth: 1,
        borderTopColor: '#1E293B',
        paddingTop: 15,
        marginTop: 15,
        fontWeight: 700,
        textTransform: 'uppercase'
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 50,
        right: 50,
        fontSize: 7,
        color: '#CBD5E1',
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 10,
        textTransform: 'uppercase',
        fontWeight: 700,
        letterSpacing: 1
    },
    // Nuevos estilos para imágenes y tablas
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
        objectFit: 'cover'
    },
    coverOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(15, 23, 42, 0.65)' // Overlay para legibilidad
    },
    flightCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 15,
        padding: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#F1F5F9'
    },
    hotelCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#F1F5F9'
    },
    hotelTag: {
        fontSize: 7,
        fontWeight: 700,
        textTransform: 'uppercase',
        color: '#E33A7A',
        backgroundColor: '#FFF1F2',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginBottom: 5
    },
    // Estilos de tabla
    table: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        borderRadius: 10,
        overflow: 'hidden'
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        paddingVertical: 8,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
        paddingVertical: 10,
        alignItems: 'center'
    },
    tableColHeader: {
        fontSize: 8,
        fontWeight: 700,
        color: '#94A3B8',
        textTransform: 'uppercase',
        paddingHorizontal: 10
    },
    tableCell: {
        fontSize: 9,
        color: '#334155',
        paddingHorizontal: 10
    },
    locationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 15,
        paddingBottom: 8,
        gap: 8,
    },
    locationLine: {
        width: 3,
        height: 12,
        backgroundColor: '#E33A7A',
        borderRadius: 2
    },
    locationText: {
        fontSize: 10,
        fontWeight: 700,
        color: '#0F172A',
        textTransform: 'uppercase'
    }
});

interface QuoteDocumentProps {
    quote: Quote;
}

const fCOP = (val: number) => `$ ${Math.round(val).toLocaleString('es-CO')}`;
const fUSD = (val: number) => `US$ ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fDate = (date: string | Date | null | undefined) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const QuoteDocument = ({ quote }: QuoteDocumentProps) => {
    const isNacional = quote.destinationType === "nacional";
    const fee = quote.feePercentage ?? 15;
    const trm = quote.trmUsed || 4200;

    const calcNac = isNacional ? calculateNacional(quote.netCostCOP || 0, fee) : null;
    const calcInt = !isNacional ? calculateInternacional(quote.netCostUSD || 0, fee, trm) : null;

    const formattedDate = new Date().toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Renderizado dinámico de secciones por orden
    const renderSection = (sectionId: string) => {
        switch (sectionId) {
            case 'flights':
                if (!quote.flights || quote.flights.length === 0) return null;
                return (
                    <View style={styles.section} key="flights">
                        <Text style={styles.sectionLabel}>Itinerario de Vuelos Previstos</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeaderRow}>
                                <Text style={[styles.tableColHeader, { width: '25%' }]}>Aerolínea</Text>
                                <Text style={[styles.tableColHeader, { width: '30%' }]}>Ruta</Text>
                                <Text style={[styles.tableColHeader, { width: '15%' }]}>Fecha</Text>
                                <Text style={[styles.tableColHeader, { width: '15%' }]}>Salida</Text>
                                <Text style={[styles.tableColHeader, { width: '15%' }]}>Llegada</Text>
                            </View>
                            {quote.flights.map((flight, idx) => (
                                <View key={idx} style={[styles.tableRow, idx === (quote.flights?.length || 0) - 1 ? { borderBottomWidth: 0 } : {}]}>
                                    <View style={{ width: '25%', paddingHorizontal: 10 }}>
                                        <Text style={{ fontSize: 9, fontWeight: 700, color: '#E33A7A' }}>{flight.airline}</Text>
                                        <Text style={{ fontSize: 7, color: '#94A3B8' }}>{flight.flightNumber}</Text>
                                    </View>
                                    <Text style={[styles.tableCell, { width: '30%' }]}>{flight.origin} → {flight.destination}</Text>
                                    <Text style={[styles.tableCell, { width: '15%' }]}>{fDate(flight.date)}</Text>
                                    <Text style={[styles.tableCell, { width: '15%', fontWeight: 700 }]}>{flight.departureTime}</Text>
                                    <Text style={[styles.tableCell, { width: '15%', fontWeight: 700 }]}>{flight.arrivalTime}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                );

            case 'hotels':
                if (!quote.hotelOptions || quote.hotelOptions.length === 0) return null;

                const groupedHotels = quote.hotelOptions.reduce((acc, hotel) => {
                    const loc = hotel.location || "Destino General";
                    if (!acc[loc]) acc[loc] = [];
                    acc[loc].push(hotel);
                    return acc;
                }, {} as Record<string, typeof quote.hotelOptions>);

                return (
                    <View style={styles.section} key="hotels">
                        <Text style={styles.sectionLabel}>Tabla de Hoteles Previstos</Text>
                        {Object.entries(groupedHotels).map(([location, hotels], gIdx) => (
                            <View key={gIdx} wrap={false} style={{ marginBottom: 15 }}>
                                <View style={styles.locationHeader}>
                                    <View style={styles.locationLine} />
                                    <Text style={styles.locationText}>Destino: {location}</Text>
                                </View>
                                <View style={styles.table}>
                                    <View style={styles.tableHeaderRow}>
                                        <Text style={[styles.tableColHeader, { width: '30%' }]}>Hotel</Text>
                                        <Text style={[styles.tableColHeader, { width: '15%' }]}>Categoría</Text>
                                        <Text style={[styles.tableColHeader, { width: '40%' }]}>Descripción / Concepto</Text>
                                        <Text style={[styles.tableColHeader, { width: '15%' }]}>Precio p/p</Text>
                                    </View>
                                    {hotels.map((hotel, idx) => (
                                        <View key={idx} style={[styles.tableRow, idx === hotels.length - 1 ? { borderBottomWidth: 0 } : {}]}>
                                            <View style={{ width: '30%', paddingHorizontal: 10 }}>
                                                <Text style={{ fontSize: 9, fontWeight: 700, color: '#0F172A' }}>{hotel.name}</Text>
                                                {hotel.isRecommended ? (
                                                    <Text style={{ fontSize: 6, color: '#E33A7A', fontWeight: 700, textTransform: 'uppercase' }}>Recomendado</Text>
                                                ) : null}
                                            </View>
                                            <Text style={[styles.tableCell, { width: '15%' }]}>{hotel.category}</Text>
                                            <View style={{ width: '40%', paddingHorizontal: 10 }}>
                                                <Text style={{ fontSize: 8, color: '#475569', fontWeight: 700 }}>{hotel.roomType}</Text>
                                                <Text style={{ fontSize: 7, color: '#64748B', lineHeight: 1.2 }}>{hotel.notes}</Text>
                                            </View>
                                            <Text style={[styles.tableCell, { width: '15%', fontWeight: 700, color: '#E33A7A' }]}>
                                                {hotel.isCOP ? fCOP(hotel.price) : fUSD(hotel.price)}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                );

            case 'itinerary':
                if (!quote.itinerary || quote.itinerary.length === 0) return null;
                return (
                    <View style={styles.section} key="itinerary">
                        <Text style={styles.sectionLabel}>Itinerario Curado</Text>
                        {quote.itinerary.map((day, idx) => (
                            <View key={idx} style={styles.itineraryDay} wrap={false}>
                                <Text style={styles.dayNumber}>{day.day}</Text>
                                <View style={styles.dayContent}>
                                    <Text style={styles.dayTitle}>{day.title || `Experiencia Día ${day.day}`}</Text>
                                    <Text style={styles.dayDesc}>{day.description}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                );

            case 'pricing':
                return (
                    <View style={styles.section} key="pricing">
                        <View style={styles.financialsCard} wrap={false}>
                            <Text style={styles.finLabel}>Resumen de Inversión Elite</Text>
                            {isNacional && calcNac ? (
                                <View>
                                    <Text style={styles.priceTitle}>Valor Total del Paquete (COP)</Text>
                                    <Text style={[styles.priceBig, styles.priceAccent]}>{fCOP(calcNac.totalCOP)}</Text>
                                    <Text style={styles.trmNote}>Tarifa neta garantizada por Trappvel · Sujeta a disponibilidad</Text>
                                </View>
                            ) : calcInt ? (
                                <View>
                                    <View style={styles.priceRow}>
                                        <View style={styles.priceBox}>
                                            <Text style={styles.priceTitle}>Cotización en Dólares</Text>
                                            <Text style={styles.priceBig}>{fUSD(calcInt.totalUSD)}</Text>
                                        </View>
                                        <View style={styles.priceBox}>
                                            <Text style={styles.priceTitle}>Conversión Estimada</Text>
                                            <Text style={[styles.priceBig, styles.priceAccent]}>{fCOP(calcInt.totalCOP)}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.trmNote}>
                                        Tasa Referencial: {trm} COP/USD · Liquidación final según TRM de pago bancario
                                    </Text>
                                </View>
                            ) : null}
                            {quote.validUntil ? (
                                <Text style={{ fontSize: 8, color: '#64748B', marginTop: 15, textAlign: 'right', fontWeight: 700 }}>
                                    PROPUESTA VÁLIDA HASTA: {new Date(quote.validUntil).toLocaleDateString('es-CO')}
                                </Text>
                            ) : null}
                        </View>
                    </View>
                );

            case 'terms':
                return (
                    <View style={styles.section} key="terms">
                        <Text style={styles.sectionLabel}>Condiciones y Políticas</Text>
                        <View style={{ gap: 15 }}>
                            {quote.paymentTerms ? (
                                <View>
                                    <Text style={{ fontSize: 9, fontWeight: 700, color: '#334155', marginBottom: 3 }}>POLÍTICAS DE PAGO</Text>
                                    <Text style={{ fontSize: 9, color: '#64748B', lineHeight: 1.4 }}>{quote.paymentTerms}</Text>
                                </View>
                            ) : null}
                            {quote.cancellationPolicy ? (
                                <View>
                                    <Text style={{ fontSize: 9, fontWeight: 700, color: '#334155', marginBottom: 3 }}>POLÍTICAS DE CANCELACIÓN</Text>
                                    <Text style={{ fontSize: 9, color: '#64748B', lineHeight: 1.4 }}>{quote.cancellationPolicy}</Text>
                                </View>
                            ) : null}
                            {quote.requiredDocuments ? (
                                <View>
                                    <Text style={{ fontSize: 9, fontWeight: 700, color: '#334155', marginBottom: 3 }}>DOCUMENTACIÓN REQUERIDA</Text>
                                    <Text style={{ fontSize: 9, color: '#64748B', lineHeight: 1.4 }}>{quote.requiredDocuments}</Text>
                                </View>
                            ) : null}
                            <View style={styles.incExcContainer} wrap={false}>
                                {quote.inclusions && quote.inclusions.length > 0 ? (
                                    <View style={styles.incExcColumn}>
                                        <Text style={styles.incTitle}>✓ Beneficios Incluidos</Text>
                                        {quote.inclusions.map((item, idx) => (
                                            <View key={idx} style={styles.listItem}>
                                                <Text style={[styles.bullet, { color: '#10B981' }]}>•</Text>
                                                <Text style={styles.listItemText}>{item}</Text>
                                            </View>
                                        ))}
                                    </View>
                                ) : null}
                                {quote.exclusions && quote.exclusions.length > 0 ? (
                                    <View style={styles.incExcColumn}>
                                        <Text style={styles.excTitle}>✗ Consideraciones Adicionales</Text>
                                        {quote.exclusions.map((item, idx) => (
                                            <View key={idx} style={styles.listItem}>
                                                <Text style={[styles.bullet, { color: '#94A3B8' }]}>•</Text>
                                                <Text style={[styles.listItemText, { color: '#94A3B8' }]}>{item}</Text>
                                            </View>
                                        ))}
                                    </View>
                                ) : null}
                            </View>
                        </View>
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <Document title={`Propuesta Trappvel - ${quote.travelerName}`}>

            {/* PORTADA (Cover Page) */}
            <Page size="LETTER" style={styles.coverPage}>
                {quote.destinationImage ? (
                    <View style={styles.coverImageContainer}>
                        <Image src={quote.destinationImage} style={styles.coverImage} />
                        <View style={styles.coverOverlay} />
                    </View>
                ) : null}
                <View style={styles.coverGradient} />
                <View style={styles.coverContent}>
                    <View style={styles.coverBrand}>
                        <View style={styles.coverLogo}>
                            <Text style={{ color: 'white', fontSize: 24 }}>✈</Text>
                        </View>
                        <Text style={styles.coverBrandName}>TRAPPVEL</Text>
                    </View>

                    <View style={styles.coverTitleSection}>
                        <Text style={styles.coverSubtitle}>Propuesta Exclusiva</Text>
                        <Text style={styles.coverTitle}>TU PRÓXIMA</Text>
                        <Text style={styles.coverTitle}>EXPERIENCIA EN</Text>
                        <Text style={styles.coverDestination}>{quote.destination?.toUpperCase() || 'EL DESTINO SOÑADO'}</Text>
                    </View>

                    <View style={styles.coverBottom}>
                        <View>
                            <Text style={styles.coverPreparedFor}>Diseñado para</Text>
                            <Text style={styles.coverTravelerName}>{quote.travelerName || 'Viajero Distinguido'}</Text>
                        </View>
                        <Text style={styles.coverDate}>{formattedDate}</Text>
                    </View>
                </View>
            </Page>

            {/* CUERPO DEL DOCUMENTO */}
            <Page size="LETTER" style={styles.page}>
                {/* Header en cada página subsiguiente */}
                <View style={[styles.header, { marginBottom: 20 }]}>
                    <View style={styles.brandContainer}>
                        <View style={styles.brandLogo}>
                            <Text style={{ color: 'white', fontSize: 18 }}>✈</Text>
                        </View>
                        <Text style={[styles.brandText, { fontSize: 18 }]}>TRAPPVEL</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.dateText}>{quote.destination?.toUpperCase()}</Text>
                        <Text style={{ fontSize: 7, color: '#94A3B8', marginTop: 2 }}>{quote.travelerName}</Text>
                    </View>
                </View>

                {/* Info Básica del Viaje */}
                <View style={[styles.tripCard, { padding: 15, marginBottom: 20 }]}>
                    <View style={styles.infoGrid}>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>VIAJEROS</Text>
                            <Text style={styles.infoValue}>{quote.numberOfTravelers || 1} ADULTOS</Text>
                        </View>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>FECHAS</Text>
                            <Text style={styles.infoValue}>
                                {quote.departureDate ? new Date(quote.departureDate).toLocaleDateString('es-CO') : '—'} 
                                {" al "}
                                {quote.returnDate ? new Date(quote.returnDate).toLocaleDateString('es-CO') : '—'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Renderizado dinámico de secciones según el orden definido */}
                {quote.sectionOrder.map(sectionId => renderSection(sectionId))}

                <Text style={styles.footer} fixed>
                    Documento Oficial Trappvel · Elite Travel Agency · {new Date().getFullYear()}
                </Text>
            </Page>
        </Document>
    );
};
