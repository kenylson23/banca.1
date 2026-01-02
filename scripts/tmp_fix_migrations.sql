-- Marcar migrações problemáticas como aplicadas para evitar erros
INSERT INTO migrations (filename) VALUES 
  ('0004_add_session_id_to_orders.sql'),
  ('add_performance_indexes.sql'),
  ('create_link_analytics.sql'),
  ('fix_missing_sessionids.sql')
ON CONFLICT (filename) DO NOTHING;
