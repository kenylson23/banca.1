-- Create guest_payments table
CREATE TABLE IF NOT EXISTS guest_payments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id VARCHAR NOT NULL REFERENCES table_guests(id) ON DELETE CASCADE,
  session_id VARCHAR NOT NULL REFERENCES table_sessions(id) ON DELETE CASCADE,
  table_payment_id VARCHAR REFERENCES table_payments(id) ON DELETE SET NULL,
  split_id VARCHAR REFERENCES table_bill_splits(id) ON DELETE SET NULL,
  restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_guest_payments_guest_id ON guest_payments(guest_id);
CREATE INDEX IF NOT EXISTS idx_guest_payments_session_id ON guest_payments(session_id);
CREATE INDEX IF NOT EXISTS idx_guest_payments_restaurant_id ON guest_payments(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_guest_payments_table_payment_id ON guest_payments(table_payment_id);
CREATE INDEX IF NOT EXISTS idx_guest_payments_split_id ON guest_payments(split_id);

-- Create trigger to update guest.paidAmount when payments are added/removed
CREATE OR REPLACE FUNCTION update_guest_paid_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE table_guests
    SET paid_amount = COALESCE((
      SELECT SUM(amount)
      FROM guest_payments
      WHERE guest_id = OLD.guest_id
    ), 0)
    WHERE id = OLD.guest_id;
    RETURN OLD;
  ELSE
    UPDATE table_guests
    SET paid_amount = COALESCE((
      SELECT SUM(amount)
      FROM guest_payments
      WHERE guest_id = NEW.guest_id
    ), 0)
    WHERE id = NEW.guest_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_guest_paid_amount
AFTER INSERT OR UPDATE OR DELETE ON guest_payments
FOR EACH ROW
EXECUTE FUNCTION update_guest_paid_amount();

COMMENT ON TRIGGER trigger_update_guest_paid_amount ON guest_payments IS 'Auto-updates guest.paidAmount when payments are added/removed';
