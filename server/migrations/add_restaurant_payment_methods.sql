-- Store the payment methods configured by each restaurant for public/customer menus.
-- Keep this migration safe for databases where the column was already created manually.
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS payment_methods JSONB NOT NULL DEFAULT '[]'::jsonb;