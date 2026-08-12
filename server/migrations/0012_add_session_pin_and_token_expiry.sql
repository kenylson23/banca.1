-- Migration: Add session PIN and guest token expiry for QR code security
-- Description: Prevents remote hijacking of table sessions by requiring PIN validation
-- and limiting guest token lifetime
-- Date: 2026-08-12

-- ============================================================
-- TABLE: table_sessions
-- ============================================================
ALTER TABLE table_sessions 
ADD COLUMN IF NOT EXISTS pin VARCHAR(6);

COMMENT ON COLUMN table_sessions.pin IS 'Temporary PIN shown on POS for QR code validation';

-- ============================================================
-- TABLE: table_guests
-- ============================================================
ALTER TABLE table_guests 
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP;

COMMENT ON COLUMN table_guests.token_expires_at IS 'Guest token expiry timestamp for security';

-- Index for fast token expiry checks
CREATE INDEX IF NOT EXISTS idx_table_guests_token_expires 
ON table_guests(token_expires_at);
