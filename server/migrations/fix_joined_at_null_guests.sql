-- Fix joined_at null values in table_guests
-- This migration ensures all guests have a valid joined_at timestamp

-- Step 1: Update existing guests with NULL joined_at to use created_at or NOW()
UPDATE table_guests
SET joined_at = COALESCE(created_at, NOW())
WHERE joined_at IS NULL;

-- Step 2: Ensure the column has a default value for new records
ALTER TABLE table_guests 
ALTER COLUMN joined_at SET DEFAULT NOW();

-- Step 3: Make joined_at NOT NULL after populating missing values
ALTER TABLE table_guests 
ALTER COLUMN joined_at SET NOT NULL;

-- Verification query (commented out, for manual check)
-- SELECT COUNT(*) as guests_with_null_joined_at 
-- FROM table_guests 
-- WHERE joined_at IS NULL;
