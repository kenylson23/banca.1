BEGIN;

-- Step 1: normalize old granular status values to valid enum values
UPDATE tables
SET table_status = CASE
  WHEN table_status::text = 'pagamento_pendente' THEN 'aguardando_pgto'::table_status_enum
  WHEN table_status::text = 'aguardando_pagamento' THEN 'aguardando_pgto'::table_status_enum
  WHEN table_status::text = 'livre' THEN 'disponivel'::table_status_enum
  WHEN table_status::text = 'ocupada' THEN 'em_consumo'::table_status_enum
  WHEN table_status::text = 'em_andamento' THEN 'em_consumo'::table_status_enum
  WHEN table_status::text = 'encerrada' THEN 'disponivel'::table_status_enum
  ELSE table_status
END;

-- Step 2: make sure menu_items index uses the existing column name
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
