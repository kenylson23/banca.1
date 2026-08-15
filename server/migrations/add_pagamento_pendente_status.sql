-- Add pagamento_pendente to table_status enum
ALTER TYPE table_status ADD VALUE IF NOT EXISTS 'pagamento_pendente';

-- Update table_status granular enum if needed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'table_status_enum' AND enumlabel = 'pagamento_pendente') THEN
    ALTER TYPE table_status_enum ADD VALUE 'pagamento_pendente';
  END IF;
END $$;
