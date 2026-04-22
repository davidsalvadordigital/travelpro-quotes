import { quoteSchema } from "../features/quotes/schemas/quote-schema";
import { calculateNacional, calculateInternacional } from "../features/quotes/utils/calculator";

async function testFoundation() {
    console.log("🚀 Iniciando Test de Integridad - Fase 1\n");

    // --- TEST 1: Zod Discriminated Union ---
    console.log("1. Validando Esquema Zod...");
    
    const validNacional = quoteSchema.safeParse({
        destinationType: "nacional",
        travelerName: "Pepe Test",
        email: "pepe@test.com",
        destination: "Cartagena",
        departureDate: new Date(),
        returnDate: new Date(),
        netCostCOP: 1000000,
        providerCommissionPercent: 10,
        agencyFeePercent: 5
    });

    if (validNacional.success) {
        console.log("✅ Cotización Nacional válida aceptada.");
    } else {
        console.error("❌ Error en Nacional válida:", validNacional.error.format());
    }

    const invalidNacional = quoteSchema.safeParse({
        destinationType: "nacional",
        travelerName: "Pepe Test",
        email: "pepe@test.com",
        destination: "Cartagena",
        departureDate: new Date(),
        returnDate: new Date(),
        netCostCOP: 1000000,
        trmUsed: 4200 // ESTO DEBERÍA FALLAR
    });

    if (!invalidNacional.success) {
        console.log("✅ El esquema bloqueó correctamente TRM en cotización Nacional.");
    } else {
        console.error("❌ ERROR: El esquema permitió TRM en una cotización Nacional.");
    }

    // --- TEST 2: Calculator Logic ---
    console.log("\n2. Validando Lógica de Cálculo (Net-Centric)...");
    
    // Ejemplo: Neto 1.000.000, Comm 10%, Fee 5%
    // Comm = 100.000, Fee = 50.000
    // PVP = 1.100.000, Cliente = 1.150.000, Utilidad = 150.000
    const calc = calculateNacional(1000000, 10, 5);
    
    if (calc.precioClienteCOP === 1150000 && calc.utilidadCOP === 150000) {
        console.log("✅ Cálculo Nacional correcto (Neto + Comm + Fee).");
    } else {
        console.error("❌ Error en cálculo Nacional:", calc);
    }

    const calcInt = calculateInternacional(100, 10, 5, 4000);
    // Neto 100, Comm 10, Fee 5 -> Precio Cliente USD 115 -> COP 460.000
    if (calcInt.precioClienteUSD === 115 && calcInt.precioClienteCOP === 460000) {
        console.log("✅ Cálculo Internacional correcto (USD -> COP).");
    } else {
        console.error("❌ Error en cálculo Internacional:", calcInt);
    }
}

testFoundation().catch(console.error);
