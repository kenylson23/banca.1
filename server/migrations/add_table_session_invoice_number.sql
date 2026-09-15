-- Give each table session a stable document number.
-- Existing sessions are backfilled per branch/restaurant without changing
-- existing order invoice numbers.
ALTER TABLE table_sessions
  ADD COLUMN IF NOT EXISTS invoice_number INTEGER;

WITH missing_sessions AS (
  SELECT
    s.id,
    s.restaurant_id,
    t.branch_id,
    CASE
      WHEN t.branch_id IS NOT NULL THEN 'branch:' || t.branch_id
      ELSE 'restaurant:' || s.restaurant_id
    END AS scope_key,
    COALESCE((
      SELECT MAX(o.invoice_number)
      FROM orders o
      LEFT JOIN tables ot ON ot.id = o.table_id
      WHERE o.restaurant_id = s.restaurant_id
        AND o.invoice_number IS NOT NULL
        AND (
          (t.branch_id IS NOT NULL AND ot.branch_id = t.branch_id)
          OR (t.branch_id IS NULL AND ot.branch_id IS NULL)
        )
    ), 0) AS base_number,
    ROW_NUMBER() OVER (
      PARTITION BY CASE
        WHEN t.branch_id IS NOT NULL THEN 'branch:' || t.branch_id
        ELSE 'restaurant:' || s.restaurant_id
      END
      ORDER BY s.started_at NULLS FIRST, s.id
    ) AS session_offset
  FROM table_sessions s
  JOIN tables t ON t.id = s.table_id
  WHERE s.invoice_number IS NULL
),
numbered_sessions AS (
  SELECT id, base_number + session_offset AS invoice_number
  FROM missing_sessions
)
UPDATE table_sessions s
SET invoice_number = numbered_sessions.invoice_number
FROM numbered_sessions
WHERE s.id = numbered_sessions.id;

INSERT INTO invoice_sequences (scope_key, restaurant_id, branch_id, next_number)
SELECT
  CASE
    WHEN t.branch_id IS NOT NULL THEN 'branch:' || t.branch_id
    ELSE 'restaurant:' || s.restaurant_id
  END AS scope_key,
  s.restaurant_id,
  t.branch_id,
  MAX(s.invoice_number) + 1
FROM table_sessions s
JOIN tables t ON t.id = s.table_id
WHERE s.invoice_number IS NOT NULL
GROUP BY s.restaurant_id, t.branch_id
ON CONFLICT (scope_key) DO UPDATE
SET next_number = GREATEST(invoice_sequences.next_number, EXCLUDED.next_number);

CREATE INDEX IF NOT EXISTS idx_table_sessions_invoice_number
  ON table_sessions(restaurant_id, invoice_number);