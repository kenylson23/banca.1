-- Migration: Fix orders with missing sessionId
-- Description: Update orders that have guestId but no sessionId
-- Date: 2025-12-31

UPDATE orders 
SET "sessionId" = (
  SELECT tg."sessionId" 
  FROM table_guests tg 
  WHERE tg.id = orders."guestId"
)
WHERE orders."sessionId" IS NULL 
  AND orders."guestId" IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM table_guests tg 
    WHERE tg.id = orders."guestId"
  );
