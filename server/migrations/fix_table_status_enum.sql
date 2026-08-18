-- Fix table_status_enum: remove invalid pagamento_pendente and migrate data

-- 1. Update any tables that still have the old value
UPDATE tables 
SET table_status = 'aguardando_pgto' 
WHERE table_status = 'pagamento_pendente';

-- 2. Remove the invalid enum value if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'table_status_enum' AND enumlabel = 'pagamento_pendente') THEN
    ALTER TYPE table_status_enum DROP VALUE 'pagamento_pendente';
  END IF;
END $$;
