-- Keep existing subscription_payments tables aligned with the Drizzle schema.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'subscription_payments'
      AND column_name = 'failed_at'
  ) THEN
    ALTER TABLE subscription_payments ADD COLUMN failed_at TIMESTAMP;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'subscription_payments'
      AND column_name = 'failure_reason'
  ) THEN
    ALTER TABLE subscription_payments ADD COLUMN failure_reason TEXT;
  END IF;
END $$;