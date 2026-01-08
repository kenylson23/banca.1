-- Migration: Criar tabela de auditoria para rastreamento de ações críticas
-- Data: 2026-01-06
-- Propósito: Registrar forceClose e outras ações administrativas

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

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
