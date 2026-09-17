-- Keep notification preferences aligned with the application schema.
-- Older databases used payment_enabled and did not have all notification types.

ALTER TABLE notification_preferences
  ADD COLUMN IF NOT EXISTS order_cancelled_enabled INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS new_customer_enabled INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_received_enabled INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS subscription_alert_enabled INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS whatsapp_notification_number VARCHAR(50);

-- Preserve the previous payment preference when it exists. The old column was
-- removed from some databases before this migration ran, so reference it
-- dynamically only when it is still present.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'notification_preferences'
      AND column_name = 'payment_enabled'
  ) THEN
    EXECUTE '
      UPDATE notification_preferences
      SET payment_received_enabled = payment_enabled
      WHERE payment_enabled IS NOT NULL
    ';
  END IF;
END $$;