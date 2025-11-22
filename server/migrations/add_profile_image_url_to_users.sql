-- Migration: Add profile_image_url to users table
-- Date: 2025-11-22

ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(500);
