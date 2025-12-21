-- Printer Configuration System Migration
-- Run this migration to create printer configuration tables

-- Create printer type enum
DO $$ BEGIN
  CREATE TYPE printer_type AS ENUM ('receipt', 'kitchen', 'invoice');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create printer language enum
DO $$ BEGIN
  CREATE TYPE printer_language AS ENUM ('esc-pos', 'star-prnt');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create printer_configurations table
CREATE TABLE IF NOT EXISTS printer_configurations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  branch_id VARCHAR REFERENCES branches(id) ON DELETE CASCADE,
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
  printer_type printer_type NOT NULL,
  printer_name VARCHAR(200) NOT NULL,
  vendor_id INTEGER,
  product_id INTEGER,
  serial_number VARCHAR(100),
  language printer_language DEFAULT 'esc-pos',
  codepage_mapping VARCHAR(50),
  paper_width INTEGER NOT NULL DEFAULT 80,
  margin_left INTEGER DEFAULT 0,
  margin_right INTEGER DEFAULT 0,
  margin_top INTEGER DEFAULT 0,
  margin_bottom INTEGER DEFAULT 0,
  auto_print INTEGER NOT NULL DEFAULT 0,
  copies INTEGER DEFAULT 1,
  sound_enabled INTEGER DEFAULT 1,
  auto_reconnect INTEGER DEFAULT 1,
  is_active INTEGER NOT NULL DEFAULT 1,
  last_connected TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create print_history table
CREATE TABLE IF NOT EXISTS print_history (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  branch_id VARCHAR REFERENCES branches(id) ON DELETE CASCADE,
  printer_id VARCHAR REFERENCES printer_configurations(id) ON DELETE SET NULL,
  user_id VARCHAR REFERENCES users(id) ON DELETE SET NULL,
  order_id VARCHAR REFERENCES orders(id) ON DELETE SET NULL,
  printer_type printer_type NOT NULL,
  printer_name VARCHAR(200) NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  order_number VARCHAR(20),
  success INTEGER NOT NULL DEFAULT 1,
  error_message TEXT,
  printed_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_printer_configurations_restaurant ON printer_configurations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_printer_configurations_branch ON printer_configurations(branch_id);
CREATE INDEX IF NOT EXISTS idx_printer_configurations_user ON printer_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_printer_configurations_type ON printer_configurations(printer_type);
CREATE INDEX IF NOT EXISTS idx_print_history_restaurant ON print_history(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_print_history_order ON print_history(order_id);
CREATE INDEX IF NOT EXISTS idx_print_history_printed_at ON print_history(printed_at);

-- Add trigger to update updated_at on printer_configurations
CREATE OR REPLACE FUNCTION update_printer_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_printer_config_updated_at
BEFORE UPDATE ON printer_configurations
FOR EACH ROW
EXECUTE FUNCTION update_printer_config_updated_at();
