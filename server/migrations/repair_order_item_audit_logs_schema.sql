-- Bring the original guest-movement audit table up to the schema consumed by
-- current table-session history and invoice code.
DO $$
BEGIN
  IF to_regtype('order_item_audit_action') IS NULL THEN
    CREATE TYPE order_item_audit_action AS ENUM (
      'item_reassigned',
      'item_added',
      'item_removed',
      'quantity_changed'
    );
  END IF;
END $$;

ALTER TABLE order_item_audit_logs
  ADD COLUMN IF NOT EXISTS order_id VARCHAR,
  ADD COLUMN IF NOT EXISTS session_id VARCHAR,
  ADD COLUMN IF NOT EXISTS action order_item_audit_action NOT NULL DEFAULT 'item_reassigned',
  ADD COLUMN IF NOT EXISTS actor_user_id VARCHAR,
  ADD COLUMN IF NOT EXISTS source_guest_id VARCHAR,
  ADD COLUMN IF NOT EXISTS target_guest_id VARCHAR,
  ADD COLUMN IF NOT EXISTS item_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS old_value JSONB,
  ADD COLUMN IF NOT EXISTS new_value JSONB,
  ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45),
  ADD COLUMN IF NOT EXISTS user_agent TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'order_item_audit_logs'
      AND column_name = 'moved_by'
  ) THEN
    EXECUTE 'UPDATE order_item_audit_logs
             SET actor_user_id = moved_by
             WHERE actor_user_id IS NULL';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM order_item_audit_logs
    WHERE actor_user_id IS NULL
  ) THEN
    ALTER TABLE order_item_audit_logs
      ALTER COLUMN actor_user_id SET NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'order_item_audit_logs'
      AND column_name = 'previous_guest_id'
  ) THEN
    EXECUTE 'UPDATE order_item_audit_logs
             SET source_guest_id = previous_guest_id
             WHERE source_guest_id IS NULL';
    EXECUTE 'UPDATE order_item_audit_logs
             SET old_value = jsonb_build_object(''guestId'', previous_guest_id)
             WHERE old_value IS NULL AND previous_guest_id IS NOT NULL';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'order_item_audit_logs'
      AND column_name = 'new_guest_id'
  ) THEN
    EXECUTE 'UPDATE order_item_audit_logs
             SET target_guest_id = new_guest_id
             WHERE target_guest_id IS NULL';
    EXECUTE 'UPDATE order_item_audit_logs
             SET new_value = jsonb_build_object(''guestId'', new_guest_id)
             WHERE new_value IS NULL AND new_guest_id IS NOT NULL';
  END IF;

  IF to_regclass('order_items') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = current_schema()
         AND table_name = 'order_items'
         AND column_name = 'id'
     )
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = current_schema()
         AND table_name = 'order_items'
         AND column_name = 'order_id'
     ) THEN
    EXECUTE 'UPDATE order_item_audit_logs AS audit
             SET order_id = item.order_id::varchar
             FROM order_items AS item
             WHERE audit.order_item_id::text = item.id::text
               AND audit.order_id IS NULL';

    IF to_regclass('orders') IS NOT NULL
       AND EXISTS (
         SELECT 1 FROM information_schema.columns
         WHERE table_schema = current_schema()
           AND table_name = 'orders'
           AND column_name = 'id'
       )
       AND EXISTS (
         SELECT 1 FROM information_schema.columns
         WHERE table_schema = current_schema()
           AND table_name = 'orders'
           AND column_name = 'table_session_id'
       ) THEN
      EXECUTE 'UPDATE order_item_audit_logs AS audit
               SET session_id = orders.table_session_id::varchar
               FROM order_items AS item
               JOIN orders ON orders.id::text = item.order_id::text
               WHERE audit.order_item_id::text = item.id::text
                 AND audit.session_id IS NULL';
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_order_item_audit_session
  ON order_item_audit_logs(session_id);
