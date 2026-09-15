-- Migration: Criar tabela de auditoria para rastreamento de ações críticas
-- Data: 2026-01-06
-- Propósito: Registrar forceClose e outras ações administrativas

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  restaurant_id VARCHAR NOT NULL,
  actor_id VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Existing databases may have created this table from an older Drizzle schema
-- where restaurant_id was INTEGER. Match the actual restaurants.id type before
-- adding the foreign key, without changing any values.
DO $$
DECLARE
  restaurants_id_type TEXT;
  audit_logs_restaurant_id_type TEXT;
BEGIN
  SELECT format_type(a.atttypid, a.atttypmod)
    INTO restaurants_id_type
  FROM pg_attribute a
  WHERE a.attrelid = 'restaurants'::regclass
    AND a.attname = 'id'
    AND NOT a.attisdropped;

  SELECT format_type(a.atttypid, a.atttypmod)
    INTO audit_logs_restaurant_id_type
  FROM pg_attribute a
  WHERE a.attrelid = 'audit_logs'::regclass
    AND a.attname = 'restaurant_id'
    AND NOT a.attisdropped;

  IF restaurants_id_type IS NULL THEN
    RAISE EXCEPTION 'restaurants.id does not exist';
  END IF;

  IF audit_logs_restaurant_id_type IS DISTINCT FROM restaurants_id_type THEN
    EXECUTE format(
      'ALTER TABLE audit_logs ALTER COLUMN restaurant_id TYPE %s USING restaurant_id::text::%s',
      restaurants_id_type,
      restaurants_id_type
    );
  END IF;
END $$;

-- Adicionar foreign keys separadamente (mais seguro)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'audit_logs_restaurant_id_fkey'
  ) THEN
    ALTER TABLE audit_logs 
    ADD CONSTRAINT audit_logs_restaurant_id_fkey 
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
    NOT VALID;
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
