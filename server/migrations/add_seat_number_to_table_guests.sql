-- Migration: Add seat_number column to table_guests
-- Description: Adds seat_number column to track seat positions for guests at tables

-- Add seat_number column (nullable, as existing records won't have values)
ALTER TABLE table_guests 
ADD COLUMN IF NOT EXISTS seat_number INTEGER;

-- Create index for better query performance when ordering by seat_number
CREATE INDEX IF NOT EXISTS idx_table_guests_seat_number 
ON table_guests(seat_number);

-- Add comment to document the column
COMMENT ON COLUMN table_guests.seat_number IS 'Seat number/position for the guest at the table (optional)';
