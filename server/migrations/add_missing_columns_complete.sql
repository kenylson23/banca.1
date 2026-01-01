-- Migration: Add missing columns to tables
-- Description: Adds missing columns identified by schema comparison
-- Date: 2026-01-01

-- ============================================================
-- TABLE: table_guests
-- ============================================================
ALTER TABLE table_guests 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

COMMENT ON COLUMN table_guests.created_at IS 'Timestamp when guest was added';
COMMENT ON COLUMN table_guests.updated_at IS 'Timestamp when guest was last updated';

-- ============================================================
-- TABLE: table_sessions
-- ============================================================
ALTER TABLE table_sessions 
ADD COLUMN IF NOT EXISTS session_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS opened_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS opened_by VARCHAR REFERENCES users(id),
ADD COLUMN IF NOT EXISTS closed_by VARCHAR REFERENCES users(id),
ADD COLUMN IF NOT EXISTS guest_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

COMMENT ON COLUMN table_sessions.session_number IS 'Sequential session number for the table';
COMMENT ON COLUMN table_sessions.opened_at IS 'Timestamp when session was opened';
COMMENT ON COLUMN table_sessions.closed_at IS 'Timestamp when session was closed';
COMMENT ON COLUMN table_sessions.opened_by IS 'User who opened the session';
COMMENT ON COLUMN table_sessions.closed_by IS 'User who closed the session';
COMMENT ON COLUMN table_sessions.guest_count IS 'Number of guests in the session';

-- ============================================================
-- TABLE: tables
-- ============================================================
ALTER TABLE tables 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

COMMENT ON COLUMN tables.updated_at IS 'Timestamp when table was last updated';

-- ============================================================
-- TABLE: customers
-- ============================================================
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS total_visits INTEGER DEFAULT 0;

COMMENT ON COLUMN customers.total_visits IS 'Total number of visits by customer';

CREATE INDEX IF NOT EXISTS idx_customers_total_visits 
ON customers(total_visits);

-- ============================================================
-- TABLE: order_items
-- ============================================================
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS name VARCHAR(200),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

COMMENT ON COLUMN order_items.name IS 'Name of the menu item at time of order';
COMMENT ON COLUMN order_items.updated_at IS 'Timestamp when order item was last updated';

-- ============================================================
-- Update existing records with default timestamps (if needed)
-- ============================================================
UPDATE table_guests SET created_at = NOW() WHERE created_at IS NULL;
UPDATE table_guests SET updated_at = NOW() WHERE updated_at IS NULL;
UPDATE table_sessions SET created_at = NOW() WHERE created_at IS NULL;
UPDATE table_sessions SET updated_at = NOW() WHERE updated_at IS NULL;
UPDATE tables SET updated_at = NOW() WHERE updated_at IS NULL;
UPDATE order_items SET updated_at = NOW() WHERE updated_at IS NULL;
