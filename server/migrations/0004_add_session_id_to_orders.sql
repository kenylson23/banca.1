-- Migration: Add table_session_id to orders table and clean up status fields
-- Priority: CRITICAL
-- Description: Links orders to specific table sessions for accurate calculations

-- Step 1: Add table_session_id to orders table if not existing
ALTER TABLE orders ADD COLUMN IF NOT EXISTS table_session_id VARCHAR REFERENCES table_sessions(id) ON DELETE SET NULL;

-- Step 2: Create index for performance if not existing
CREATE INDEX IF NOT EXISTS idx_orders_table_session_id ON orders(table_session_id);

-- Step 3: Populate table_session_id for existing orders based on tableId and timestamp
UPDATE orders o
SET table_session_id = (
  SELECT ts.id
  FROM table_sessions ts
  WHERE ts.table_id = o.table_id
    AND o.created_at BETWEEN ts.started_at AND COALESCE(ts.ended_at, NOW())
  ORDER BY ts.started_at DESC
  LIMIT 1
)
WHERE o.table_id IS NOT NULL AND o.table_session_id IS NULL;

-- Step 4: Remove redundant is_occupied field from tables if exists
ALTER TABLE tables DROP COLUMN IF EXISTS is_occupied;

-- Step 5: Migrate remaining status data to table_status if table_status is null
DO 1109
BEGIN
  -- Only attempt migration if the target column accepts these values
  BEGIN
    UPDATE tables 
    SET table_status = CASE 
      WHEN status = 'reservada' THEN 'reservada'
      WHEN status = 'ocupada' THEN 'ocupada'
      WHEN status = 'em_andamento' THEN 'em_andamento'
      WHEN status = 'aguardando_pagamento' THEN 'aguardando_pagamento'
      ELSE 'livre'
    END
    WHERE table_status IS NULL;
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'Migration skipped: table_status enum does not accept legacy values yet';
  END;
END 1109;

-- Step 6: Add trigger to auto-update session paidAmount when payment is added
CREATE OR REPLACE FUNCTION update_session_paid_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE table_sessions
    SET paid_amount = (
      SELECT COALESCE(SUM(amount::numeric), 0)
      FROM table_payments
      WHERE session_id = OLD.session_id
    )
    WHERE id = OLD.session_id;
    RETURN OLD;
  ELSE
    UPDATE table_sessions
    SET paid_amount = (
      SELECT COALESCE(SUM(amount::numeric), 0)
      FROM table_payments
      WHERE session_id = NEW.session_id
    )
    WHERE id = NEW.session_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_session_paid_amount ON table_payments;
CREATE TRIGGER trigger_update_session_paid_amount
AFTER INSERT OR UPDATE OR DELETE ON table_payments
FOR EACH ROW
EXECUTE FUNCTION update_session_paid_amount();

-- Step 7: Add trigger to auto-update guest paidAmount when guest payment is added
CREATE OR REPLACE FUNCTION update_guest_paid_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE table_guests
    SET paid_amount = (
      SELECT COALESCE(SUM(amount::numeric), 0)
      FROM guest_payments
      WHERE guest_id = OLD.guest_id
    )
    WHERE id = OLD.guest_id;
    RETURN OLD;
  ELSE
    UPDATE table_guests
    SET paid_amount = (
      SELECT COALESCE(SUM(amount::numeric), 0)
      FROM guest_payments
      WHERE guest_id = NEW.guest_id
    )
    WHERE id = NEW.guest_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_guest_paid_amount ON guest_payments;
CREATE TRIGGER trigger_update_guest_paid_amount
AFTER INSERT OR UPDATE OR DELETE ON guest_payments
FOR EACH ROW
EXECUTE FUNCTION update_guest_paid_amount();

COMMENT ON COLUMN orders.table_session_id IS 'Links order to specific table session for accurate session-based calculations';
COMMENT ON TRIGGER trigger_update_session_paid_amount ON table_payments IS 'Auto-updates session.paidAmount when payments are added/removed';
COMMENT ON TRIGGER trigger_update_guest_paid_amount ON guest_payments IS 'Auto-updates guest.paidAmount when payments are added/removed';
