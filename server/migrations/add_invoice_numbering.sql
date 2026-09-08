-- Persistent invoice numbering, scoped to a branch (or restaurant when no
-- branch is available). The sequence table makes allocation atomic under
-- concurrent order creation.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS invoice_number INTEGER;

CREATE TABLE IF NOT EXISTS invoice_sequences (
  scope_key VARCHAR(255) PRIMARY KEY,
  restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  branch_id VARCHAR REFERENCES branches(id) ON DELETE CASCADE,
  next_number INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_invoice_sequences_restaurant
  ON invoice_sequences(restaurant_id);

-- Backfill existing orders deterministically, preserving any numbers already
-- assigned by a previous partial migration.
WITH existing_max AS (
  SELECT COALESCE(branch_id, restaurant_id) AS scope_key, MAX(invoice_number) AS max_number
  FROM orders
  WHERE invoice_number IS NOT NULL
  GROUP BY COALESCE(branch_id, restaurant_id)
),
numbered AS (
  SELECT
    o.id,
    COALESCE(em.max_number, 0) +
      ROW_NUMBER() OVER (
        PARTITION BY COALESCE(o.branch_id, o.restaurant_id)
        ORDER BY o.created_at NULLS FIRST, o.id
      ) AS assigned_number
  FROM orders o
  LEFT JOIN existing_max em
    ON em.scope_key = COALESCE(o.branch_id, o.restaurant_id)
  WHERE o.invoice_number IS NULL
)
UPDATE orders o
SET invoice_number = n.assigned_number
FROM numbered n
WHERE o.id = n.id;

INSERT INTO invoice_sequences (scope_key, restaurant_id, branch_id, next_number)
SELECT
  CASE WHEN branch_id IS NULL THEN 'restaurant:' || restaurant_id ELSE 'branch:' || branch_id END,
  restaurant_id,
  branch_id,
  MAX(invoice_number) + 1
FROM orders
WHERE invoice_number IS NOT NULL
GROUP BY restaurant_id, branch_id
ON CONFLICT (scope_key) DO UPDATE
SET next_number = GREATEST(invoice_sequences.next_number, EXCLUDED.next_number);

COMMENT ON COLUMN orders.invoice_number IS
  'Número sequencial persistente da fatura, por filial';