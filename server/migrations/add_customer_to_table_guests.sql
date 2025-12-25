-- Add customer association to table_guests
-- This allows linking guests at tables to registered customers for loyalty tracking

-- Add customer_id column to table_guests
ALTER TABLE table_guests 
ADD COLUMN IF NOT EXISTS customer_id VARCHAR;

-- Add foreign key constraint to customers table
ALTER TABLE table_guests
ADD CONSTRAINT fk_table_guests_customer
FOREIGN KEY (customer_id) REFERENCES customers(id)
ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_table_guests_customer_id 
ON table_guests(customer_id);

-- Create index for customer lookup by phone (useful for quick search)
CREATE INDEX IF NOT EXISTS idx_customers_phone 
ON customers(phone);

-- Create index for customer lookup by name
CREATE INDEX IF NOT EXISTS idx_customers_name 
ON customers(name);

-- Comment for documentation
COMMENT ON COLUMN table_guests.customer_id IS 'Links a table guest to a registered customer for loyalty tracking and personalization';
