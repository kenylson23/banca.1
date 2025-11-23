-- Add new limit fields to subscription_plans table for feature enforcement

-- Customer limits (default to 50 which is safe for basic plans)
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS max_customers INTEGER NOT NULL DEFAULT 50;

-- Loyalty program (default to disabled)
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS has_loyalty_program INTEGER NOT NULL DEFAULT 0;

-- Coupon system (default to disabled)
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS has_coupon_system INTEGER NOT NULL DEFAULT 0;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS max_active_coupons INTEGER NOT NULL DEFAULT 0;

-- Expense tracking (default to disabled)
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS has_expense_tracking INTEGER NOT NULL DEFAULT 0;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS max_expense_categories INTEGER NOT NULL DEFAULT 0;

-- Inventory module (default to disabled)
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS has_inventory_module INTEGER NOT NULL DEFAULT 0;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS max_inventory_items INTEGER NOT NULL DEFAULT 0;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS has_stock_transfers INTEGER NOT NULL DEFAULT 0;
