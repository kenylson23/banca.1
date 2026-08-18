BEGIN;

-- Step 1: normalize old granular status values to valid enum values
UPDATE tables
SET table_status = CASE
  WHEN table_status::text = 'pagamento_pendente' THEN 'aguardando_pgto'
  WHEN table_status::text = 'aguardando_pagamento' THEN 'aguardando_pgto'
  WHEN table_status::text = 'livre' THEN 'disponivel'
  WHEN table_status::text = 'ocupada' THEN 'em_consumo'
  WHEN table_status::text = 'em_andamento' THEN 'em_consumo'
  WHEN table_status::text = 'encerrada' THEN 'disponivel'
  ELSE table_status::text
END;

-- Step 2: cleanup invalid enum values if the enum still exists in this DB
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = 'table_status_enum'
      AND e.enumlabel = 'pagamento_pendente'
  ) THEN
    BEGIN
      ALTER TYPE table_status_enum DROP VALUE 'pagamento_pendente';
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Could not drop pagamento_pendente from table_status_enum: %', SQLERRM;
    END;
  END IF;
END $$;

-- Step 3: make sure menu_items index uses the existing column name
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'idx_menu_items_restaurant_available'
  ) THEN
    BEGIN
      DROP INDEX idx_menu_items_restaurant_available;
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Could not drop idx_menu_items_restaurant_available: %', SQLERRM;
    END;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_available
ON menu_items(restaurant_id, is_available);

COMMIT;
