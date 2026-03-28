# Data Access Layer (DAL) Guidelines

Esta guía establece las políticas y estándares para la capa de acceso a datos de TravelPro Quotes, asegurando aislamiento de inquilinos (tenant isolation), seguridad y consistencia en un entorno de Server Components / Next.js 16.

## 1. Helper de Aislamiento: `withTenantIsolation`

Para garantizar que un usuario (o agente) solo interactúe con los datos de su propia agencia, **todas las operaciones de base de datos** dentro de las Server Actions o controladores del DAL deben envolverse con el helper `withTenantIsolation`, ubicado en `lib/dal/isolation.ts`.

### Por qué usarlo
Evita vulnerabilidades de *Cross-Tenant Data Leak* (Filtración de datos cruzados) añadiendo implícitamente la cláusula de validación de `agency_id` a la operación.

### Cómo usarlo
```typescript
import { withTenantIsolation } from '@/lib/dal/isolation';

export async function getQuotes() {
  return await withTenantIsolation(async (supabase, tenantId) => {
    // El helper inyecta la instancia de supabase correcta y el tenantId
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('agency_id', tenantId); // Validarlo explícitamente sigue siendo buena práctica
      
    if (error) throw new Error(error.message);
    return data;
  });
}
```

## 2. Idempotencia en Leads

Para evitar la duplicación de contactos provocada por múltiples clics de los usuarios o reintentos de red, la creación de Leads implementa un mecanismo de **Idempotencia**.

### Funcionamiento
1. En el cliente, antes de enviar la creación del lead, se genera de forma determinista un `transaction_id`.
2. Se envía este `transaction_id` en el *payload* de la acción.
3. La base de datos tiene una restricción de índice único/clave (Unique Constraint) combinando `transaction_id` u otros atributos identificadores relevantes en la tabla de `leads`.
4. Si la inserción colisiona, devolvemos el registro existente o un estado de "ya procesado", evitando crear duplicados exactos.

## 3. Cuándo usar ServiceRole vs Cliente Normal (SSR)

### Supabase SSR Client (Cliente Autenticado Normal)
- **Regla general:** El 95% del código debe usar este cliente (ej. `createClient()` de `@supabase/ssr`).
- Se debe usar para consultas donde las políticas RLS (Row Level Security) actúen como la primera capa de defensa. Funciona con el contexto de auth del usuario navegando.

### Supabase ServiceRole Client (Admin)
- **Advertencia de Seguridad:** Este cliente sobreescribe y **saltará todas las políticas RLS**.
- **Cuándo se justifica:**
  1. *Webhooks de terceros* (ej. Stripe) donde el usuario actual no está en la sesión, pero el webhook es confiable y su firma fue validada.
  2. *Tareas programadas (Cron jobs)* o funciones Edge que operan en segundo plano administrando registros.
  3. Cuentas de servicio o inicialización de *seeds/tenants* donde necesites privilegios absolutos de escritura en una tabla resguardada.
- **Implementación obligatoria:** NUNCA lo expongas en un Server Component o Server Action que consuma parámetros no sanitizados sin validaciones de negocio muy estrictas en el Server.
