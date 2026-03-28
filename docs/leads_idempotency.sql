-- ==========================================
-- TravelPro Quotes - Leads Idempotency
-- ==========================================

-- 1. Añadir transaction_id a la tabla leads si no existe
ALTER TABLE leads ADD COLUMN IF NOT EXISTS transaction_id UUID;

-- 2. Asegurarnos que la columna transaction_id garantice unicidad 
-- para prevenir leads duplicados accidentalmente.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'leads_transaction_id_key'
    ) THEN
        ALTER TABLE leads ADD CONSTRAINT leads_transaction_id_key UNIQUE (transaction_id);
    END IF;
END $$;

-- 3. Confirmación: La tabla leads ahora está protegida por idempotencia 
-- en la creación a través de su DAL respectivo.
