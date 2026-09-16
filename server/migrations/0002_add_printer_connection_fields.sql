-- Add printer connection settings introduced after the initial printer migration.
-- This migration is safe for databases where any of these columns already exist.

ALTER TABLE printer_configurations
  ADD COLUMN IF NOT EXISTS connection_type VARCHAR(20) DEFAULT 'usb',
  ADD COLUMN IF NOT EXISTS network_host VARCHAR(100),
  ADD COLUMN IF NOT EXISTS network_port INTEGER DEFAULT 9100;