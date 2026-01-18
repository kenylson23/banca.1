-- Add per-guest adjustments (discount/service charge) for individual billing
ALTER TABLE table_guests
  ADD COLUMN IF NOT EXISTS discount decimal(10,2) DEFAULT '0',
  ADD COLUMN IF NOT EXISTS discount_type discount_type DEFAULT 'valor',
  ADD COLUMN IF NOT EXISTS service_charge decimal(10,2) DEFAULT '0',
  ADD COLUMN IF NOT EXISTS service_charge_type service_charge_type DEFAULT 'valor';
