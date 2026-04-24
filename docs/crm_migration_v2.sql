-- ═══════════════════════════════════════════════════════════════
-- Migración: Motor CRM — lead_activity (v2 - Auditado)
-- ═══════════════════════════════════════════════════════════════

-- ── 1. ENUM ──────────────────────────────────────────────────
CREATE TYPE activity_event_type AS ENUM (
    'lead_created',
    'status_changed',
    'quote_created',
    'quote_sent',
    'quote_approved',
    'quote_rejected'
);

-- ── 2. TABLA PRINCIPAL ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lead_activity (
    id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id     UUID        NOT NULL REFERENCES public.leads(id)    ON DELETE CASCADE,
    quote_id    UUID                 REFERENCES public.quotes(id)   ON DELETE SET NULL,
    actor_id    UUID                 REFERENCES public.profiles(id) ON DELETE SET NULL,
    event_type  activity_event_type  NOT NULL,
    description TEXT        NOT NULL,
    metadata    JSONB       DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- ── 3. ÍNDICES ────────────────────────────────────────────────
CREATE INDEX idx_lead_activity_lead_id    ON public.lead_activity(lead_id);
CREATE INDEX idx_lead_activity_actor_id   ON public.lead_activity(actor_id);
CREATE INDEX idx_lead_activity_created_at ON public.lead_activity(created_at DESC);
CREATE INDEX idx_lead_activity_event_type ON public.lead_activity(event_type);

-- ── 4. RLS ────────────────────────────────────────────────────
ALTER TABLE public.lead_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lead_activity_select_advisor"
    ON public.lead_activity FOR SELECT
    USING (
        lead_id IN (
            SELECT id FROM public.leads WHERE created_by = auth.uid()
        )
    );

CREATE POLICY "lead_activity_select_admin"
    ON public.lead_activity FOR SELECT
    USING (is_admin());

CREATE POLICY "lead_activity_insert"
    ON public.lead_activity FOR INSERT
    WITH CHECK (
        lead_id IN (
            SELECT id FROM public.leads WHERE created_by = auth.uid()
        )
        OR is_admin()
    );

-- ── 5. RPC ATÓMICA (con idempotencia) ─────────────────────────
CREATE OR REPLACE FUNCTION create_lead_with_activity(
    p_traveler_name  TEXT,
    p_created_by     UUID,
    p_transaction_id UUID    DEFAULT NULL,
    p_destination    TEXT    DEFAULT NULL,
    p_email          TEXT    DEFAULT NULL,
    p_phone          TEXT    DEFAULT NULL,
    p_agency_id      UUID    DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_lead_id        UUID;
    v_transaction_id UUID;
BEGIN
    v_transaction_id := COALESCE(p_transaction_id, gen_random_uuid());

    -- Idempotencia: si ya existe un lead con este transaction_id, retornar su ID
    SELECT id INTO v_lead_id
    FROM public.leads
    WHERE transaction_id = v_transaction_id;

    IF v_lead_id IS NOT NULL THEN
        RETURN v_lead_id;
    END IF;

    INSERT INTO public.leads (
        traveler_name, created_by, destination, email,
        phone, agency_id, status, transaction_id
    )
    VALUES (
        p_traveler_name, p_created_by, p_destination, p_email,
        p_phone, p_agency_id, 'nuevo', v_transaction_id
    )
    RETURNING id INTO v_lead_id;

    INSERT INTO public.lead_activity (lead_id, actor_id, event_type, description, metadata)
    VALUES (
        v_lead_id,
        p_created_by,
        'lead_created',
        'Nuevo prospecto ingresado al sistema',
        jsonb_build_object('source', 'creation', 'transaction_id', v_transaction_id)
    );

    RETURN v_lead_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 6. MIGRACIÓN RETROACTIVA ──────────────────────────────────
INSERT INTO public.lead_activity (lead_id, actor_id, event_type, description, metadata, created_at)
SELECT 
    l.id,
    l.created_by,
    'lead_created'::activity_event_type,
    'Prospecto importado al sistema CRM',
    jsonb_build_object('source', 'retroactive_migration'),
    l.created_at
FROM public.leads l
WHERE NOT EXISTS (
    SELECT 1 FROM public.lead_activity la WHERE la.lead_id = l.id
);
