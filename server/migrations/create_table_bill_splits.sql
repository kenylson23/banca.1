-- Create table_bill_splits table
CREATE TABLE IF NOT EXISTS table_bill_splits (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR NOT NULL REFERENCES table_sessions(id) ON DELETE CASCADE,
  table_id VARCHAR NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  split_type VARCHAR NOT NULL CHECK (split_type IN ('igual', 'por_pessoa', 'personalizado')),
  total_amount DECIMAL(10, 2) NOT NULL,
  split_count INTEGER NOT NULL DEFAULT 1,
  allocations JSONB,
  is_finalized INTEGER NOT NULL DEFAULT 0,
  created_by VARCHAR REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  finalized_at TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_table_bill_splits_session ON table_bill_splits(session_id);
CREATE INDEX IF NOT EXISTS idx_table_bill_splits_table ON table_bill_splits(table_id);
CREATE INDEX IF NOT EXISTS idx_table_bill_splits_restaurant ON table_bill_splits(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_table_bill_splits_created_at ON table_bill_splits(created_at);
