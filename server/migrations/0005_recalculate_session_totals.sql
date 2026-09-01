-- Migration: Recalculate totalAmount for existing sessions
-- Previous bug: when there were guest adjustments, the code summed
-- guestsSubtotal on top of ordersSubtotal, doubling the total.
-- This migration triggers a recalculation of all open sessions.

-- Update totalAmount based on current orders + guest adjustments
UPDATE table_sessions ts
SET "totalAmount" = COALESCE((
  SELECT
    CASE
      WHEN COALESCE(SUM(o."totalAmount"), 0) > 0
      THEN COALESCE(SUM(o."totalAmount"), 0)
      ELSE COALESCE((
        SELECT SUM(
          CASE
            WHEN oi.price IS NOT NULL
            THEN oi.price * oi.quantity
            ELSE 0
          END
        )
        FROM order_items oi
        WHERE oi."orderId" IN (
          SELECT o.id FROM orders o
          WHERE o."tableSessionId" = ts.id AND o.status != 'cancelado'
        )
      ), 0)
    END
  FROM orders o
  WHERE o."tableSessionId" = ts.id AND o.status != 'cancelado'
), '0')
WHERE ts."endedAt" IS NULL;
