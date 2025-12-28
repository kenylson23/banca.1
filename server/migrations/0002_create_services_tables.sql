-- Migration: Create Services and Order Services Tables
-- Description: Adds tables for configurable services/fees (e.g., service charge, cover charge, delivery fee)

-- Create enums
CREATE TYPE service_charge_type AS ENUM ('valor', 'percentual');
CREATE TYPE service_context AS ENUM ('todos', 'mesa', 'delivery', 'takeout', 'balcao', 'pdv');

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  branch_id VARCHAR REFERENCES branches(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  charge_type service_charge_type NOT NULL DEFAULT 'percentual',
  value DECIMAL(10, 2) NOT NULL,
  apply_automatically INTEGER NOT NULL DEFAULT 0,
  context service_context NOT NULL DEFAULT 'todos',
  min_order_value DECIMAL(10, 2),
  active INTEGER NOT NULL DEFAULT 1,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_by VARCHAR REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for services
CREATE INDEX idx_services_restaurant_id ON services(restaurant_id);
CREATE INDEX idx_services_branch_id ON services(branch_id);
CREATE INDEX idx_services_active ON services(active);

-- Create order_services table
CREATE TABLE IF NOT EXISTS order_services (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  service_id VARCHAR REFERENCES services(id) ON DELETE SET NULL,
  restaurant_id VARCHAR NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  service_name VARCHAR(100) NOT NULL,
  charge_type service_charge_type NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  calculated_amount DECIMAL(10, 2) NOT NULL,
  applied_by VARCHAR REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for order_services
CREATE INDEX idx_order_services_order_id ON order_services(order_id);
CREATE INDEX idx_order_services_service_id ON order_services(service_id);
CREATE INDEX idx_order_services_restaurant_id ON order_services(restaurant_id);

-- Add comment to tables
COMMENT ON TABLE services IS 'Configurable services and fees (e.g., service charge, cover charge, delivery fee)';
COMMENT ON TABLE order_services IS 'Services applied to specific orders for historical tracking';
