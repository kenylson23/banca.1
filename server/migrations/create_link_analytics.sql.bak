-- Create link_analytics table for tracking menu access
CREATE TABLE IF NOT EXISTS link_analytics (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  source VARCHAR(255), -- 'direct', 'whatsapp', 'instagram', 'facebook', 'qrcode', etc
  referrer TEXT,
  user_agent TEXT,
  ip_address VARCHAR(45),
  session_id VARCHAR(255),
  converted BOOLEAN DEFAULT FALSE, -- true if resulted in an order
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_link_analytics_restaurant_id ON link_analytics(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_link_analytics_timestamp ON link_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_link_analytics_session_id ON link_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_link_analytics_converted ON link_analytics(converted);

-- Create a view for quick stats
CREATE OR REPLACE VIEW link_analytics_summary AS
SELECT 
  restaurant_id,
  COUNT(*) as total_clicks,
  COUNT(DISTINCT session_id) as unique_visitors,
  COUNT(*) FILTER (WHERE timestamp >= NOW() - INTERVAL '7 days') as clicks_this_week,
  COUNT(*) FILTER (WHERE timestamp >= NOW() - INTERVAL '30 days') as clicks_this_month,
  COUNT(*) FILTER (WHERE converted = TRUE) as total_conversions,
  CASE 
    WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE converted = TRUE)::numeric / COUNT(*)) * 100, 2)
    ELSE 0
  END as conversion_rate,
  MAX(timestamp) as last_accessed
FROM link_analytics
GROUP BY restaurant_id;
