-- Add guest_number column to table_guests
ALTER TABLE table_guests ADD COLUMN IF NOT EXISTS guest_number INTEGER;

-- Update existing records with sequential guest numbers per session
WITH numbered_guests AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY joined_at) AS guest_num
  FROM table_guests
  WHERE guest_number IS NULL
)
UPDATE table_guests
SET guest_number = numbered_guests.guest_num
FROM numbered_guests
WHERE table_guests.id = numbered_guests.id;

-- Make the column NOT NULL after populating existing data
ALTER TABLE table_guests ALTER COLUMN guest_number SET NOT NULL;
