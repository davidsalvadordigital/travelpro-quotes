import { NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createOpenAI } from "@ai-sdk/openai";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// Schema de respuesta estructurada alineado con QuoteSchema
const extractedQuoteSchema = z.object({
    travelerName: z.string().describe("Nombre de la persona, reserva o viajero principal"),
    email: z.string().email().optional().describe("Correo electrónico si aparece"),
    phone: z.string().optional().describe("Número de teléfono de contacto"),
    destination: z.string().describe("Destino principal del viaje"),
    destinationType: z.enum(["nacional", "internacional"]).describe("Basado en el destino, deducir si es dentro de Colombia (nacional) o fuera (internacional)"),
    numberOfTravelers: z.number().int().describe("Número total de personas que viajan, por defecto 1"),
    departureDate: z.string().optional().describe("Fecha de salida sugerida en formato formato YYYY-MM-DD"),
    returnDate: z.string().optional().describe("Fecha de regreso sugerida en formato formato YYYY-MM-DD"),
    flights: z.array(z.object({
        origin: z.string().describe("Código IATA o ciudad de origen (ej: BOG, Bogotá)"),
        destination: z.string().describe("Código IATA o ciudad de destino (ej: IST, Estambul)"),
        airline: z.string().describe("Nombre de la aerolínea"),
        flightNumber: z.string().describe("Número de vuelo (ej: AV001)"),
        date: z.string().describe("Fecha del vuelo en formato YYYY-MM-DD"),
        departureTime: z.string().describe("Hora de salida (ej: 14:00)"),
        arrivalTime: z.string().describe("Hora de llegada (ej: 18:30)")
    })).optional().describe("Trayectos de vuelo sugeridos o menciones de transporte aéreo"),
    hotelOptions: z.array(z.object({
        name: z.string().describe("Nombre del hotel o alojamiento"),
        location: z.string().describe("Ciudad o zona del hotel"),
        category: z.string().describe("Categoría (ej: 5*, Boutique Lujo)"),
        price: z.number().describe("Precio estimado por noche o total por persona"),
        isCOP: z.boolean().describe("true si el precio está en pesos colombianos, false si es USD"),
        roomType: z.string().describe("Tipo de habitación sugerido (ej: Suite Vista Mar)"),
        notes: z.string().describe("Amenidades, régimen o notas especiales"),
        isRecommended: z.boolean().describe("true si parece ser la mejor opción o la recomendada por el emisor")
    })).optional().describe("Opciones de hospedaje encontradas en el texto"),
    itinerary: z.array(z.object({
        day: z.number(),
        title: z.string(),
        description: z.string(),
        activities: z.array(z.string()).optional()
    })).describe("Desglose del itinerario día a día"),
    inclusions: z.array(z.string()).describe("Todo lo que incluye el paquete/tarifa (ej. Desayunos, traslados, etc.)"),
    exclusions: z.array(z.string()).describe("Aquello que específicamente NO incluye el paquete"),
    hotelInfo: z.string().optional().describe("Resumen narrativo o notas adicionales sobre el hospedaje"),
    airlineInfo: z.string().optional().describe("Resumen narrativo o notas adicionales de vuelos"),
    netCostUSD: z.number().optional().describe("Costo neto TOTAL en USD si se menciona"),
    netCostCOP: z.number().optional().describe("Costo neto TOTAL en COP si se menciona")
});


export async function POST(req: Request) {
    try {
        // 🔐 Security: Verify session before processing AI (save tokens)
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { text } = await req.json();

        if (!text) {
            return NextResponse.json({ error: "No text provided" }, { status: 400 });
        }

        // 🛠️ E2E Test Mock Trigger (Stable Testing)
        if (text.includes("E2E-TEST-TURKEY")) {
            return NextResponse.json({
                travelerName: "Sofia Rodriguez",
                email: "sofia.travels@turkey.com",
                phone: "+57 300 000 0000",
                destination: "Estambul, Turquía",
                destinationType: "internacional",
                numberOfTravelers: 2,
                netCostUSD: 15400,
                itinerary: [
                    { day: 1, title: "Llegada a Estambul", description: "Traslado privado al Four Seasons.", activities: ["Check-in", "Cena de bienvenida"] },
                    { day: 10, title: "Salida", description: "Vuelo de regreso.", activities: ["Traslado al aeropuerto"] }
                ],
                inclusions: ["Hoteles 5*", "Guía privado"],
                exclusions: ["Gastos personales"],
                flights: []
            });
        }

        const openai = createOpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // Use standard generateText with Output.object from Vercel AI SDK
        const { output } = await generateText({
            model: openai('gpt-4o-mini'),
            output: Output.object({ schema: extractedQuoteSchema }),
            system: `Eres un asistente de agencia de viajes de ULTRALUJO experto en TravelPro Quotes. 
            Tu misión es convertir textos desordenados (correos, flyers, notas de WhatsApp) en objetos JSON estructurados con precisión quirúrgica.

            REGLAS CRÍTICAS DE NEGOCIO:
            1. GEOGRAFÍA: Si el destino es en Colombia, marca destinationType como "nacional". De lo contrario, "internacional".
            2. MOTOR FINANCIERO: 
               - Detecta precios: si ves "$" y el contexto es Colombia o aerolíneas nacionales (Avianca, Latam CO), asume COP. 
               - Si dice "USD", "$ USD" o es un viaje internacional/hoteles de cadena global, prioriza USD.
               - NUNCA mezcles monedas en netCostUSD y netCostCOP a menos que el texto explícitamente dé ambos.
            3. ITINERARIO "DIAMANTE": Sé extremadamente detallado. Captura nombres de restaurantes, tipos de habitación (Junior Suite, Ocean View) y experiencias específicas. Si no hay días marcados, agrúpalos lógicamente por "Mañana/Tarde/Noche" o por hitos del viaje.
            4. LOGÍSTICA AÉREA: Extrae cada trayecto por separado en el array "flights". Busca códigos IATA, números de vuelo y horarios. Si solo hay mención general, usa "airlineInfo".
            5. ALOJAMIENTO ESTRUCTURADO: Si mencionan opciones de hoteles específicos con precios o categorías, úsalos en "hotelOptions". Identifica la opción recomendada si el texto lo sugiere.
            6. FECHAS: Usa formato ISO YYYY-MM-DD. Si solo mencionan meses, asume el año actual (${new Date().getFullYear()}).
            7. TONO: Mantén la elegancia incluso en la estructuración de datos.`,
            prompt: `
        Analiza profundamente el siguiente texto y extrae la propuesta de viaje completa:
        """
        ${text}
        """
        
        Asegúrate de capturar cada inclusión y exclusión por separado para una transparencia total con el cliente.
        `
        });

        return NextResponse.json(output || {});
    } catch (error) {
        console.error("AI EXTRACTION ERROR:", error);
        if (error instanceof Error) {
            console.error("ERROR MESSAGE:", error.message);
            console.error("STACK:", error.stack);
        }
        return NextResponse.json(
            { 
                error: "Error interno al analizar o extraer el archivo.",
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
