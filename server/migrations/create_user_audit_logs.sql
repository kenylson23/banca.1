-- Create user_audit_action enum if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_audit_action') THEN
    CREATE TYPE user_audit_action AS ENUM (
      'user_created',
      'user_updated',
      'user_deleted',
      'password_reset',
      'role_changed',
      'user_login',
      'user_logout'
    );
  END IF;
END $$;

-- Create user_audit_logs table if not exists
CREATE TABLE IF NOT EXISTS user_audit_logs (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id varchar REFERENCES restaurants(id) ON DELETE CASCADE,
  actor_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_user_id varchar REFERENCES users(id) ON DELETE SET NULL,
  action user_audit_action NOT NULL,
  details jsonb,
  ip_address varchar(45),
  user_agent text,
  created_at timestamp DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_audit_logs_restaurant ON user_audit_logs(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_user_audit_logs_actor ON user_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_user_audit_logs_target_user ON user_audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_user_audit_logs_created_at ON user_audit_logs(created_at);
