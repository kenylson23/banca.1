-- Migration: Criar tabela de auditoria para rastreamento de ações críticas
-- Data: 2026-01-06
-- Propósito: Registrar forceClose e outras ações administrativas

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  restaurant_id VARCHAR(255) NOT NULL,
  actor_id VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Adicionar foreign keys separadamente (mais seguro)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'audit_logs_restaurant_id_fkey'
  ) THEN
    ALTER TABLE audit_logs 
    ADD CONSTRAINT audit_logs_restaurant_id_fkey 
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'audit_logs_actor_id_fkey'
  ) THEN
    ALTER TABLE audit_logs 
    ADD CONSTRAINT audit_logs_actor_id_fkey 
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_restaurant ON audit_logs(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Comentários
COMMENT ON TABLE audit_logs IS 'Registra ações críticas e administrativas para auditoria';
COMMENT ON COLUMN audit_logs.action IS 'Tipo de ação: session_force_closed, payment_override, etc';
COMMENT ON COLUMN audit_logs.entity_type IS 'Tipo de entidade afetada: table_session, payment, etc';
COMMENT ON COLUMN audit_logs.entity_id IS 'ID da entidade afetada';
COMMENT ON COLUMN audit_logs.details IS 'Detalhes adicionais em JSON (valores, razões, etc)';
