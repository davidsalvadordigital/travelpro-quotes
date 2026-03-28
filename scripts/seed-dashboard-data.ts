
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
  const EMAIL = "testuser@travelpro.com";
  
  // 1. Obtener ID del usuario
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const user = users.find(u => u.email === EMAIL);
  if (!user) return console.error("Usuario no encontrado");

  console.log("Sembrando datos para:", user.id);

  // 2. Crear un Lead de prueba
  const { data: lead } = await supabase.from('leads').upsert({
    full_name: "Juan Pérez (Test Client)",
    email: "juan.perez@test.com",
    phone: "+57 300 000 0000",
    created_by: user.id
  }).select().single();

  // 3. Crear una Cotización de prueba (Status: Approved)
  await supabase.from('quotes').upsert({
    lead_id: lead.id,
    destination: "París & Roma",
    total_amount_cop: 15450000,
    status: "approved",
    created_by: user.id,
    trm_value: 3950
  });

  console.log("✅ Datos de prueba sembrados con éxito.");
}

seed();
