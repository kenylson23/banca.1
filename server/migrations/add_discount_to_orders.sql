-- Migration: Add discount columns to orders table
-- Description: Adds discount and discountType columns to support order-level discounts

-- Add discount columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS discount DECIMAL(10, 2) DEFAULT '0',
ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20) DEFAULT 'valor';

-- Create discount_type enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE discount_type AS ENUM ('valor', 'percentual');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Update the column to use the enum type (if not already using it)
-- Note: This is safe because we have default values
ALTER TABLE orders 
ALTER COLUMN discount_type TYPE discount_type USING discount_type::discount_type;

-- Add comments to document the columns
COMMENT ON COLUMN orders.discount IS 'Desconto aplicado ao pedido (valor fixo ou percentual)';
COMMENT ON COLUMN orders.discount_type IS 'Tipo de desconto: valor (fixed amount) ou percentual (percentage)';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_discount 
ON orders(discount) WHERE discount > 0;
