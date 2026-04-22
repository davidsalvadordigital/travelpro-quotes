import { NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createOpenAI } from "@ai-sdk/openai";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// Schema de respuesta estructurada alineado con QuoteSchema (Net-Centric 2026)
const extractedQuoteSchema = z.object({
    travelerName: z.string().describe("Nombre de la persona, reserva o viajero principal"),
    email: z.string().email().optional().describe("Correo electrónico si aparece"),
    phone: z.string().optional().describe("Número de teléfono de contacto"),
    destination: z.string().describe("Destino principal del viaje"),
    destinationType: z.enum(["nacional", "internacional"]).describe("Deducir: Colombia (nacional) o fuera (internacional)"),
    numberOfTravelers: z.number().int().describe("Número total de personas, default 1"),
    departureDate: z.string().optional().describe("Fecha de salida en formato YYYY-MM-DD"),
    returnDate: z.string().optional().describe("Fecha de regreso en formato YYYY-MM-DD"),
    flights: z.array(z.object({
        origin: z.string().describe("IATA o ciudad origen"),
        destination: z.string().describe("IATA o ciudad destino"),
        airline: z.string().describe("Nombre de la aerolínea"),
        flightNumber: z.string().describe("Número de vuelo"),
        date: z.string().describe("YYYY-MM-DD"),
        departureTime: z.string().describe("HH:mm"),
        arrivalTime: z.string().describe("HH:mm")
    })).optional().describe("Vuelos sugeridos"),
    hotelOptions: z.array(z.object({
        name: z.string().describe("Nombre del hotel"),
        location: z.string().describe("Ciudad/Zona"),
        category: z.string().describe("Categoría (5*, etc)"),
        price: z.number().describe("Costo NETO para la agencia"),
        isCOP: z.boolean().describe("true si es COP, false si es USD"),
        roomType: z.string().describe("Tipo de habitación"),
        notes: z.string().describe("Amenidades/Notas"),
        isRecommended: z.boolean().describe("true si es la opción principal")
    })).optional().describe("Opciones de hospedaje"),
    itinerary: z.array(z.object({
        day: z.number(),
        title: z.string(),
        description: z.string(),
        activities: z.array(z.string()).optional()
    })).describe("Itinerario día a día"),
    inclusions: z.array(z.string()).describe("Lista de inclusiones"),
    exclusions: z.array(z.string()).describe("Lista de exclusiones"),
    legalConditions: z.string().optional().describe("Términos legales, políticas de cancelación o notas de responsabilidad encontradas"),
    hotelInfo: z.string().optional().describe("Resumen de hospedaje"),
    airlineInfo: z.string().optional().describe("Resumen de vuelos"),
    netCostUSD: z.number().optional().describe("Costo NETO PROVEEDOR en USD (sin comisiones ni fees)"),
    netCostCOP: z.number().optional().describe("Costo NETO PROVEEDOR en COP (sin comisiones ni fees)"),
    providerCommissionPercent: z.number().min(0).max(100).optional().describe("Porcentaje de comisión explícito en el texto (ej: 'Comisión 12%'). Si no aparece, dejar vacío."),
    agencyFeePercent: z.number().min(0).max(100).optional().describe("Porcentaje de fee administrativo explícito en el texto. Si no aparece, dejar vacío.")
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
            Tu misión es convertir documentos desordenados en objetos JSON con precisión quirúrgica para nuestra plataforma interna.

            REGLAS CRÍTICAS DE NEGOCIO (MODELO NET-CENTRIC):
            1. GEOGRAFÍA: Colombia = "nacional". Resto = "internacional".
            2. MOTOR FINANCIERO: 
               - Buscamos el COSTO NETO de proveedor. Si el texto da un "PVP", intenta deducir el costo neto restando comisiones SOLO si se mencionan.
               - "netCostUSD/COP" es el valor de compra al proveedor.
               - COMISIONES/FEES: Solo extrae "providerCommissionPercent" o "agencyFeePercent" si el texto los menciona explícitamente (ej: "Tarifa neta + 12% comisión"). Si no hay mención clara, déjalos VACÍOS. La asesora los definirá manualmente.
               - Identifica monedas: "$" en contexto Colombia = COP. "USD", "$" en hoteles globales o vuelos internacionales = USD.
            3. ITINERARIO, VUELOS Y HOTELES (PRIORIDAD): Sé extremadamente detallado. Captura nombres, categorías, horarios y descripciones día a día. Es lo que más tiempo ahorra al asesor.
            4. TÉRMINOS LEGALES: Extrae políticas de cancelación o depósitos en "legalConditions".
            5. FECHAS: Formato ISO YYYY-MM-DD. Año actual: ${new Date().getFullYear()}.`,
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
