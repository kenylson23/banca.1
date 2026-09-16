-- Add the fiscal identity fields used by professional restaurant invoices.
-- This migration is intentionally idempotent because some imported databases
-- may already contain a subset of these columns.

ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS nif VARCHAR(30),
  ADD COLUMN IF NOT EXISTS vat_regime VARCHAR(100),
  ADD COLUMN IF NOT EXISTS vat_rate DECIMAL(5, 2),
  ADD COLUMN IF NOT EXISTS document_series VARCHAR(50),
  ADD COLUMN IF NOT EXISTS invoice_prefix VARCHAR(30),
  ADD COLUMN IF NOT EXISTS fiscal_address TEXT,
  ADD COLUMN IF NOT EXISTS legal_footer TEXT,
  ADD COLUMN IF NOT EXISTS website VARCHAR(255);