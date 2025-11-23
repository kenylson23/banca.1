-- Add currency column to subscriptions table
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS currency VARCHAR(3) NOT NULL DEFAULT 'AOA';
