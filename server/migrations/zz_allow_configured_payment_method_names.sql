ALTER TABLE table_payments
  ALTER COLUMN payment_method TYPE VARCHAR(100)
  USING payment_method::text;

ALTER TABLE guest_payments
  ALTER COLUMN payment_method TYPE VARCHAR(100)
  USING payment_method::text;

ALTER TABLE financial_transactions
  ALTER COLUMN payment_method TYPE VARCHAR(100)
  USING payment_method::text;
