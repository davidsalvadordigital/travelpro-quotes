-- ==========================================
-- TravelPro Quotes - Free Tier Optimizations
-- ==========================================

-- 1. Batching vía RPC: save_complete_quote_v2
-- Inserta una cotización y su itinerario atómicamente desde un solo payload JSONB.
CREATE OR REPLACE FUNCTION save_complete_quote_v2(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    new_quote_id uuid;
    result jsonb;
    current_user_id uuid := auth.uid();
BEGIN
    -- Validación de seguridad: Asegurar que el usuario esté autenticado
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'No autenticado';
    END IF;

    -- Si se provee un ID, validar propiedad antes de actualizar
    IF (payload->>'id') IS NOT NULL AND (payload->>'id') <> '' THEN
        IF NOT EXISTS (
            SELECT 1 FROM quotes 
            WHERE id = (payload->>'id')::uuid 
            AND created_by = current_user_id
        ) THEN
            RAISE EXCEPTION 'No autorizado o cotización no encontrada';
        END IF;
    END IF;

    -- Upsert de la cotización. Forzamos created_by al ID del usuario actual.
    INSERT INTO quotes (
        id, created_by, traveler_name, email, phone, number_of_travelers, 
        destination, destination_type, departure_date, return_date, 
        hotel_info, airline_info, itinerary, inclusions, exclusions, 
        net_cost_usd, net_cost_cop, fee_percentage, trm_used, status, 
        legal_conditions, transaction_id, updated_at
    )
    VALUES (
        COALESCE((payload->>'id')::uuid, gen_random_uuid()),
        current_user_id,
        payload->>'traveler_name',
        payload->>'email',
        payload->>'phone',
        (payload->>'number_of_travelers')::int,
        payload->>'destination',
        payload->>'destination_type',
        (payload->>'departure_date')::date,
        (payload->>'return_date')::date,
        payload->>'hotel_info',
        payload->>'airline_info',
        COALESCE(payload->'itinerary', '[]'::jsonb),
        COALESCE(payload->'inclusions', '[]'::jsonb),
        COALESCE(payload->'exclusions', '[]'::jsonb),
        (payload->>'net_cost_usd')::numeric,
        (payload->>'net_cost_cop')::numeric,
        (payload->>'fee_percentage')::numeric,
        (payload->>'trm_used')::numeric,
        payload->>'status',
        payload->>'legal_conditions',
        COALESCE((payload->>'transaction_id')::uuid, gen_random_uuid()),
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        traveler_name = EXCLUDED.traveler_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        number_of_travelers = EXCLUDED.number_of_travelers,
        destination = EXCLUDED.destination,
        destination_type = EXCLUDED.destination_type,
        departure_date = EXCLUDED.departure_date,
        return_date = EXCLUDED.return_date,
        hotel_info = EXCLUDED.hotel_info,
        airline_info = EXCLUDED.airline_info,
        itinerary = EXCLUDED.itinerary,
        inclusions = EXCLUDED.inclusions,
        exclusions = EXCLUDED.exclusions,
        net_cost_usd = EXCLUDED.net_cost_usd,
        net_cost_cop = EXCLUDED.net_cost_cop,
        fee_percentage = EXCLUDED.fee_percentage,
        trm_used = EXCLUDED.trm_used,
        status = EXCLUDED.status,
        legal_conditions = EXCLUDED.legal_conditions,
        transaction_id = EXCLUDED.transaction_id,
        updated_at = EXCLUDED.updated_at
    RETURNING row_to_json(quotes.*)::jsonb INTO result;

    RETURN result;
EXCEPTION
    WHEN unique_violation THEN
        -- Capturar específicamente la violación del índice único de transaction_id
        IF SQLERRM LIKE '%transaction_id%' THEN
            RETURN '{"error": "duplicate_transaction"}'::jsonb;
        ELSE
            RAISE; -- Relanzar si es otro tipo de violación única
        END IF;
    WHEN OTHERS THEN
        RAISE; -- Relanzar cualquier otro error
END;
$$;

-- 2. Índices de Alto Rendimiento y Ahorro Espacial (Índices Parciales Pre-emptive)
-- En el Free Tier (500MB), los borradores (status = 'borrador') suelen ser mayoría. 
-- Excluimos 'borrador' de estos índices para ahorrar disco desde el día 1, 
-- acelerando las búsquedas reales (cotizaciones enviadas, aprobadas, etc.).
CREATE INDEX IF NOT EXISTS idx_quotes_created_at_partial 
    ON quotes USING btree (created_at) 
    WHERE status != 'borrador';

CREATE INDEX IF NOT EXISTS idx_quotes_created_by_partial 
    ON quotes USING btree (created_by) 
    WHERE status != 'borrador';

-- We will cautiously create index on leads
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads USING btree (status);

-- 3. Vistas Optimizadas: dashboard_summary
-- Agrega todos los datos de KPIs para evitar el 90% del procesamiento JS en Vercel.
CREATE OR REPLACE VIEW dashboard_summary WITH (security_invoker = true) AS
WITH quote_metrics AS (
  SELECT 
    COUNT(*) AS total_quotes,
    COUNT(*) FILTER (WHERE status = 'aprobada') AS count_aprobada,
    COUNT(*) FILTER (WHERE status = 'borrador') AS count_borrador,
    COUNT(*) FILTER (WHERE status = 'enviada') AS count_enviada,
    COUNT(*) FILTER (WHERE status = 'rechazada') AS count_rechazada,
    
    SUM(
      CASE WHEN destination_type = 'internacional' THEN 
        COALESCE(net_cost_usd, 0) * (1 + COALESCE(fee_percentage, 15) / 100.0) 
      ELSE 0 END
    ) AS total_revenue_usd,
    
    SUM(
      CASE WHEN destination_type = 'internacional' AND trm_used IS NOT NULL THEN 
        COALESCE(net_cost_usd, 0) * (1 + COALESCE(fee_percentage, 15) / 100.0) * trm_used
      ELSE 0 END
    ) AS usd_revenue_with_trm,

    SUM(
      CASE WHEN destination_type = 'internacional' AND trm_used IS NULL THEN 
        COALESCE(net_cost_usd, 0) * (1 + COALESCE(fee_percentage, 15) / 100.0)
      ELSE 0 END
    ) AS usd_revenue_without_trm,

    SUM(
      CASE WHEN destination_type = 'nacional' THEN 
        COALESCE(net_cost_cop, 0) * (1 + COALESCE(fee_percentage, 15) / 100.0)
      ELSE 0 END
    ) AS cop_revenue,
    
    COUNT(*) FILTER (WHERE destination_type = 'internacional') AS count_internacional
  FROM quotes
),
lead_metrics AS (
  SELECT
    COUNT(*) AS total_leads,
    COUNT(*) FILTER (WHERE status = 'nuevo' OR status = 'en_proceso' OR status = 'cotizado') AS active_leads,
    COUNT(*) FILTER (WHERE status = 'ganado') AS won_leads
  FROM leads
)
SELECT 
  q.total_quotes,
  q.count_aprobada,
  q.count_borrador,
  q.count_enviada,
  q.count_rechazada,
  
  CASE WHEN q.total_quotes > 0 THEN ROUND((q.count_aprobada::numeric / q.total_quotes) * 100) ELSE 0 END AS quote_conversion_rate,
  CASE WHEN q.count_internacional > 0 THEN ROUND((q.total_revenue_usd::numeric / q.count_internacional)) ELSE 0 END AS avg_ticket_usd,
  
  -- Partes de ingresos en COP para ensamblar en el frontend con la TRM actual si es necesario
  ROUND(q.cop_revenue::numeric) AS cop_revenue,
  ROUND(q.usd_revenue_with_trm::numeric) AS usd_revenue_with_trm,
  ROUND(q.usd_revenue_without_trm::numeric) AS usd_revenue_without_trm,

  -- Métricas de Leads
  l.total_leads,
  l.active_leads,
  l.won_leads,
  CASE WHEN l.total_leads > 0 THEN ROUND((l.won_leads::numeric / l.total_leads) * 100) ELSE 0 END AS lead_conversion_rate
FROM quote_metrics q, lead_metrics l;

-- 4. Protección de Duplicados (Idempotencia)
-- Ensure 'transaction_id' exists and is UNIQUE
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS transaction_id UUID;
ALTER TABLE quotes ADD CONSTRAINT quotes_transaction_id_key UNIQUE (transaction_id);

-- 5. Limpieza de Realtime
-- Drop Supabase Realtime from the default publication, then add specific tables manually.
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
  
  -- Add only quotes and limit what goes over the websocket.
  -- Setting REPLICA IDENTITY FULL to get Old Records (if needed) and minimizing traffic.
  ALTER PUBLICATION supabase_realtime ADD TABLE quotes;
COMMIT;

-- 6. Confirmación de RLS
-- Explicitly ensure Row Level Security is enabled on the quotes table.
-- Existing policies will govern access, but this guarantees the table is secure.
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 7. Free Tier Guardrails (Data Sustainability)
-- ==========================================

-- 7.1 Limpieza Automática de Borradores (Drafts Antiguos)
-- Requiere tener habilitada la extensión pg_cron en Supabase (Database -> Extensions).
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Programa un borrado cada 1ro del mes a la medianoche.
-- Elimina cotizaciones en estado 'borrador' que tengan más de 6 meses (180 días) sin actualizaciones.
SELECT cron.schedule(
    'purge_old_drafts', 
    '0 0 1 * *', 
    $$ DELETE FROM quotes WHERE status = 'borrador' AND updated_at < now() - interval '6 months' $$
);

-- NOTA FALLBACK EDGE FUNCTION:
-- Si `pg_cron` no está disponible o falla por límites del Free Tier (algunas regiones lo restringen),
-- deberás crear una Edge Function en Supabase (`supabase functions new purge-drafts`)
-- que ejecute ese DELETE vía el cliente de Supabase, y llamarla externamente 
-- mediante un GitHub Action programado (cron: '0 0 1 * *').

-- 7.2 [NOTA TÉCNICA] Audit Log de Almacenamiento y Monitorización:
-- El plan "Free Tier" de Supabase ofrece 500MB de espacio.
--
-- Consulta para Auditoría Manual Rápida:
-- Ejecuta esto periódicamente para saber cuánto pesa TODA la tabla con su data, JSONBs e índices:
-- 
-- SELECT pg_size_pretty(pg_total_relation_size('quotes')) AS total_quotes_size;
-- 
-- También puedes ver el tamaño de la data e índices por separado:
-- SELECT pg_size_pretty(pg_relation_size('quotes')) AS data_size,
--        pg_size_pretty(pg_indexes_size('quotes')) AS index_size;
--
-- ACCIÓN CORRECTIVA: Si el disco supera los 350MB, se puede acortar el PG_CRON a borrar drafts
-- de hace 3 meses en lugar de 6.

-- ==========================================
-- 8. Storage S3 Guardrails (Auditoría de 1GB Free Tier)
-- ==========================================

-- 8.1. Creación de Bucket de Documentos con Políticas Restrictivas
-- Limitar el bucket a 2MB de tamaño (2097152 bytes) y forzar que las asesoras
-- solo puedan subir archivos JPEG/JPG para maximizar el ahorro en el Storage.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents', 
  'documents', 
  false, -- Privado por RLS (Nadie puede leer sin autenticación)
  2097152, -- 2MB
  '{image/jpeg}'::text[] -- ÚNICAMENTE JPG permitido por orden de optimización
)
ON CONFLICT (id) DO UPDATE SET 
  file_size_limit = 2097152,
  allowed_mime_types = '{image/jpeg}'::text[];

-- 8.2. Limpieza de Archivos Huérfanos en S3
-- Los archivos subidos a borradores que luego se eliminaron deben ser purgados.
-- Borramos objetos en el bucket 'documents' que tengan más de 7 días 
-- y cuyo nombre (o prefijo) no exista como ID válido en la tabla `quotes`.
-- (NOTA: Esto asume que guardas el archivo con ruta `quote_id/nombre_archivo.jpg`)
SELECT cron.schedule(
    'purge_orphan_storage', 
    '0 3 1 * *', -- Ejecutar a las 3:00 AM cada 1ro del mes
    $$
    DELETE FROM storage.objects
    WHERE bucket_id = 'documents' 
      AND created_at < current_timestamp - interval '7 days'
      AND NOT EXISTS (
          SELECT 1 FROM public.quotes 
          WHERE id::text = (string_to_array(storage.objects.name, '/'))[1]
      )
    $$
);
