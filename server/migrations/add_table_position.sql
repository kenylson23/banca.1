-- Add position fields to tables for floor plan layout
ALTER TABLE tables ADD COLUMN position_x REAL DEFAULT NULL;
ALTER TABLE tables ADD COLUMN position_y REAL DEFAULT NULL;
