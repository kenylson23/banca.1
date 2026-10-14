-- Repair legacy audit_logs tables before 0005_create_audit_logs.sql attempts
-- to create its action index. CREATE TABLE IF NOT EXISTS does not add columns
-- to a table that already existed.
DO $$
BEGIN
  IF to_regclass('audit_logs') IS NOT NULL THEN
    ALTER TABLE audit_logs
      ADD COLUMN IF NOT EXISTS action VARCHAR(100) NOT NULL DEFAULT 'legacy_action';
    CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
  END IF;
END $$;
