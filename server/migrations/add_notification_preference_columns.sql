-- Keep notification preferences aligned with the application schema.
-- Older databases used payment_enabled and did not have all notification types.

ALTER TABLE notification_preferences
  ADD COLUMN IF NOT EXISTS order_cancelled_enabled INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS new_customer_enabled INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_received_enabled INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS subscription_alert_enabled INTEGER NOT NULL DEFAULT 1;

-- Preserve the previous payment preference when it exists.
UPDATE notification_preferences
SET payment_received_enabled = payment_enabled
WHERE payment_enabled IS NOT NULL;