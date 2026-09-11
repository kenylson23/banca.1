ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS nif VARCHAR(30);

CREATE INDEX IF NOT EXISTS idx_customers_nif
  ON customers(nif);