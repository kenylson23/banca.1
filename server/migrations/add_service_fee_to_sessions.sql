-- Add service fee columns to table_sessions
ALTER TABLE table_sessions 
ADD COLUMN IF NOT EXISTS service_fee VARCHAR,
ADD COLUMN IF NOT EXISTS service_fee_type VARCHAR;

COMMENT ON COLUMN table_sessions.service_fee IS 'Valor da taxa de serviço aplicada (pode ser percentual ou valor fixo)';
COMMENT ON COLUMN table_sessions.service_fee_type IS 'Tipo da taxa: percentual ou valor';
