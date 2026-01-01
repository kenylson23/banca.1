-- Adicionar campos de desconto e taxa de serviço na tabela table_sessions
ALTER TABLE table_sessions 
ADD COLUMN IF NOT EXISTS discount DECIMAL(10, 2) DEFAULT '0',
ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20) DEFAULT 'valor',
ADD COLUMN IF NOT EXISTS service_charge DECIMAL(10, 2) DEFAULT '0',
ADD COLUMN IF NOT EXISTS service_charge_type VARCHAR(20) DEFAULT 'percentual';

-- Comentários explicativos
COMMENT ON COLUMN table_sessions.discount IS 'Desconto aplicado à sessão (valor fixo ou percentual)';
COMMENT ON COLUMN table_sessions.discount_type IS 'Tipo de desconto: valor ou percentual';
COMMENT ON COLUMN table_sessions.service_charge IS 'Taxa de serviço aplicada à sessão (valor fixo ou percentual)';
COMMENT ON COLUMN table_sessions.service_charge_type IS 'Tipo de taxa: valor ou percentual';
