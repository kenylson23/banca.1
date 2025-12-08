-- Migration: Expand user roles to support more operational roles
-- Date: 2024-12-08
-- Description: Adds waiter, cashier, manager roles to the user_role enum

-- Step 1: Add new values to the enum (PostgreSQL allows adding values to enums)
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'waiter';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'cashier';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'manager';

-- Note: PostgreSQL does not allow removing enum values, only adding.
-- The new roles hierarchy:
-- - superadmin: Full system access (all restaurants)
-- - admin: Full restaurant access (owner)
-- - manager: Almost full access except critical settings
-- - cashier: PDV, payments, close tables
-- - waiter: View tables, take orders, update status
-- - kitchen: Kitchen display only
