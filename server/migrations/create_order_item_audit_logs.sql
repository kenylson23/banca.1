-- Create order_item_audit_logs table for tracking item movements between guests
CREATE TABLE IF NOT EXISTS order_item_audit_logs (
  id SERIAL PRIMARY KEY,
  order_item_id VARCHAR NOT NULL,
  restaurant_id VARCHAR NOT NULL,
  previous_guest_id VARCHAR,
  new_guest_id VARCHAR,
  reason TEXT,
  moved_by VARCHAR NOT NULL,
  moved_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_order_item
    FOREIGN KEY(order_item_id) 
    REFERENCES order_items(id)
    ON DELETE CASCADE,
    
  CONSTRAINT fk_restaurant
    FOREIGN KEY(restaurant_id) 
    REFERENCES restaurants(id)
    ON DELETE CASCADE,
    
  CONSTRAINT fk_previous_guest
    FOREIGN KEY(previous_guest_id) 
    REFERENCES table_guests(id)
    ON DELETE SET NULL,
    
  CONSTRAINT fk_new_guest
    FOREIGN KEY(new_guest_id) 
    REFERENCES table_guests(id)
    ON DELETE SET NULL,
    
  CONSTRAINT fk_moved_by
    FOREIGN KEY(moved_by) 
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_order_item_audit_logs_order_item_id ON order_item_audit_logs(order_item_id);
CREATE INDEX IF NOT EXISTS idx_order_item_audit_logs_restaurant_id ON order_item_audit_logs(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_order_item_audit_logs_moved_at ON order_item_audit_logs(moved_at);
