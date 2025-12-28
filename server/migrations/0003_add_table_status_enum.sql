-- Migration: Add Table Status Enum
-- Description: Adds granular status tracking for tables

-- Create table status enum
CREATE TYPE table_status_enum AS ENUM (
  'disponivel',
  'aguardando_pedido',
  'em_consumo',
  'aguardando_pgto',
  'pagamento_parcial',
  'reservada'
);

-- Add table_status column to tables (default to current behavior)
ALTER TABLE tables 
ADD COLUMN IF NOT EXISTS table_status table_status_enum;

-- Set initial values based on current status
UPDATE tables 
SET table_status = CASE 
  WHEN status = 'reservada' THEN 'reservada'::table_status_enum
  WHEN status = 'ocupada' THEN 'em_consumo'::table_status_enum
  ELSE 'disponivel'::table_status_enum
END
WHERE table_status IS NULL;

-- Make it NOT NULL after setting initial values
ALTER TABLE tables 
ALTER COLUMN table_status SET DEFAULT 'disponivel'::table_status_enum;

ALTER TABLE tables 
ALTER COLUMN table_status SET NOT NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_tables_table_status ON tables(table_status);

-- Add comments
COMMENT ON COLUMN tables.table_status IS 'Granular status: disponivel, aguardando_pedido, em_consumo, aguardando_pgto, pagamento_parcial, reservada';
COMMENT ON TYPE table_status_enum IS 'Enum for detailed table status tracking';
