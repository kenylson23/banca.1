-- Migration: Add sessionId to orders table and clean up status fields
-- Priority: CRITICAL
-- Description: Links orders to specific table sessions for accurate calculations

-- Step 1: Add sessionId to orders table
ALTER TABLE orders ADD COLUMN session_id VARCHAR REFERENCES table_sessions(id) ON DELETE SET NULL;

-- Step 2: Create index for performance
CREATE INDEX idx_orders_session_id ON orders(session_id);

-- Step 3: Populate sessionId for existing orders based on tableId and timestamp
-- This matches orders to the session that was active when they were created
UPDATE orders o
SET session_id = (
  SELECT ts.id
  FROM table_sessions ts
  WHERE ts.table_id = o.table_id
    AND o.created_at BETWEEN ts.started_at AND COALESCE(ts.ended_at, NOW())
  ORDER BY ts.started_at DESC
  LIMIT 1
)
WHERE o.table_id IS NOT NULL AND o.session_id IS NULL;

-- Step 4: Remove redundant isOccupied field from tables
ALTER TABLE tables DROP COLUMN IF EXISTS is_occupied;

-- Step 5: Remove legacy status field (keeping only tableStatus)
-- First, migrate any remaining data
UPDATE tables 
SET table_status = CASE 
  WHEN status = 'livre' THEN 'disponivel'
  WHEN status = 'ocupada' THEN 'aguardando_pedido'
  WHEN status = 'em_andamento' THEN 'em_consumo'
  WHEN status = 'aguardando_pagamento' THEN 'aguardando_pgto'
  ELSE 'disponivel'
END
WHERE table_status IS NULL OR table_status = 'disponivel';

-- Note: We keep the 'status' column for backward compatibility in this migration
-- It will be removed in a future migration after all code is updated

-- Step 6: Add trigger to auto-update session paidAmount when payment is added
CREATE OR REPLACE FUNCTION update_session_paid_amount()
RETURNS TRIGGER AS $$
BEGIN
  -- Update session paidAmount
  UPDATE table_sessions
  SET paid_amount = (
    SELECT COALESCE(SUM(amount::numeric), 0)
    FROM table_payments
    WHERE session_id = NEW.session_id
  )
  WHERE id = NEW.session_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_paid_amount
AFTER INSERT OR UPDATE OR DELETE ON table_payments
FOR EACH ROW
EXECUTE FUNCTION update_session_paid_amount();

-- Step 7: Add trigger to auto-update guest paidAmount when guest payment is added
CREATE OR REPLACE FUNCTION update_guest_paid_amount()
RETURNS TRIGGER AS $$
BEGIN
  -- Update guest paidAmount
  UPDATE table_guests
  SET paid_amount = (
    SELECT COALESCE(SUM(amount::numeric), 0)
    FROM guest_payments
    WHERE guest_id = NEW.guest_id
  )
  WHERE id = NEW.guest_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_guest_paid_amount
AFTER INSERT OR UPDATE OR DELETE ON guest_payments
FOR EACH ROW
EXECUTE FUNCTION update_guest_paid_amount();

COMMENT ON COLUMN orders.session_id IS 'Links order to specific table session for accurate session-based calculations';
COMMENT ON TRIGGER trigger_update_session_paid_amount ON table_payments IS 'Auto-updates session.paidAmount when payments are added/removed';
COMMENT ON TRIGGER trigger_update_guest_paid_amount ON guest_payments IS 'Auto-updates guest.paidAmount when payments are added/removed';
