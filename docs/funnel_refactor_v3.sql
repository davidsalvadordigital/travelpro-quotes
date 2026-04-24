-- 1. Crear el nuevo ENUM temporal
CREATE TYPE lead_status_new AS ENUM (
    'nuevo',
    'contactado',
    'cualificado',
    'propuesta_enviada',
    'negociacion',
    'ganado',
    'perdido'
);

-- 2. Actualizar la tabla leads para usar el nuevo tipo
-- Mapeamos estados viejos a nuevos para no perder data
ALTER TABLE public.leads 
  ALTER COLUMN status TYPE lead_status_new 
  USING (
    CASE 
      WHEN status::text = 'en_proceso' THEN 'contactado'::lead_status_new
      WHEN status::text = 'cotizado' THEN 'propuesta_enviada'::lead_status_new
      ELSE status::text::lead_status_new
    END
  );

-- 3. Borrar el tipo viejo y renombrar el nuevo
DROP TYPE public.lead_status;
ALTER TYPE public.lead_status_new RENAME TO lead_status;

-- 4. Actualizar la vista dashboard_summary (Doble Factor)
-- Solo sumamos si el lead está 'ganado'
CREATE OR REPLACE VIEW public.dashboard_summary AS
SELECT 
    COUNT(DISTINCT q.id) as total_quotes,
    ROUND(
        (COUNT(DISTINCT CASE WHEN l.status = 'ganado' THEN l.id END)::numeric / 
        NULLIF(COUNT(DISTINCT l.id), 0)::numeric) * 100, 2
    ) as quote_conversion_rate,
    -- Revenue verificado (Doble Factor)
    SUM(CASE WHEN q.status = 'aprobada' AND l.status = 'ganado' AND q.destination_type = 'internacional' THEN (q.net_cost_usd * q.trm_used) ELSE 0 END) +
    SUM(CASE WHEN q.status = 'aprobada' AND l.status = 'ganado' AND q.destination_type = 'nacional' THEN q.net_cost_cop ELSE 0 END) as total_verified_revenue_cop
FROM public.quotes q
JOIN public.leads l ON q.lead_id = l.id;
