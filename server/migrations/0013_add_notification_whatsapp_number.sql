-- Keep the notification preferences table aligned with the runtime schema.
ALTER TABLE notification_preferences
  ADD COLUMN IF NOT EXISTS whatsapp_notification_number VARCHAR(50);