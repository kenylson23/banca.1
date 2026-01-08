-- Add billing period columns to subscription_payments if they don't exist
DO $$ 
BEGIN
  -- Check and add billing_period_start
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscription_payments' 
    AND column_name = 'billing_period_start'
  ) THEN
    ALTER TABLE subscription_payments 
    ADD COLUMN billing_period_start TIMESTAMP;
    
    -- Set default value for existing rows
    UPDATE subscription_payments 
    SET billing_period_start = created_at 
    WHERE billing_period_start IS NULL;
    
    -- Make it NOT NULL after populating
    ALTER TABLE subscription_payments 
    ALTER COLUMN billing_period_start SET NOT NULL;
  END IF;

  -- Check and add billing_period_end
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscription_payments' 
    AND column_name = 'billing_period_end'
  ) THEN
    ALTER TABLE subscription_payments 
    ADD COLUMN billing_period_end TIMESTAMP;
    
    -- Set default value for existing rows (1 month after start)
    UPDATE subscription_payments 
    SET billing_period_end = billing_period_start + INTERVAL '1 month'
    WHERE billing_period_end IS NULL;
    
    -- Make it NOT NULL after populating
    ALTER TABLE subscription_payments 
    ALTER COLUMN billing_period_end SET NOT NULL;
  END IF;
END $$;
