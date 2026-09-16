ALTER TABLE table_sessions
  ADD COLUMN IF NOT EXISTS invoice_recipient_type VARCHAR(30) NOT NULL DEFAULT 'table_customer';

ALTER TABLE table_sessions
  ADD COLUMN IF NOT EXISTS invoice_customer_id VARCHAR;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'table_sessions_invoice_customer_id_fkey'
  ) THEN
    ALTER TABLE table_sessions
      ADD CONSTRAINT table_sessions_invoice_customer_id_fkey
      FOREIGN KEY (invoice_customer_id) REFERENCES customers(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_table_sessions_invoice_customer
  ON table_sessions(invoice_customer_id);