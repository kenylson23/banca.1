-- Keep the restaurant profile compatible with the fiscal invoice settings.
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS website VARCHAR(255);