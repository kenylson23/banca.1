-- Script para corrigir o status das mesas
-- Este script define todas as mesas sem sessão ativa como 'livre'

-- 1. Resetar todas as mesas que não têm sessão ativa para status 'livre'
UPDATE tables 
SET 
  status = 'livre',
  current_session_id = NULL,
  total_amount = '0',
  customer_name = NULL,
  customer_count = 0,
  last_activity = NULL,
  is_occupied = 0
WHERE current_session_id IS NULL 
  OR current_session_id NOT IN (SELECT id FROM table_sessions WHERE ended_at IS NULL);

-- 2. Atualizar mesas que têm sessão ativa mas com status incorreto
UPDATE tables t
SET 
  status = CASE 
    WHEN ts.status = 'ocupada' THEN 'ocupada'
    WHEN ts.status = 'em_andamento' THEN 'em_andamento'
    WHEN ts.status = 'aguardando_pagamento' THEN 'aguardando_pagamento'
    ELSE 'livre'
  END,
  total_amount = COALESCE(ts.total_amount, '0'),
  customer_name = ts.customer_name,
  customer_count = ts.customer_count,
  is_occupied = CASE WHEN ts.status != 'livre' THEN 1 ELSE 0 END
FROM table_sessions ts
WHERE t.current_session_id = ts.id 
  AND ts.ended_at IS NULL;

-- 3. Mostrar resultado
SELECT 
  'Mesas atualizadas' as message,
  COUNT(*) as total_tables,
  SUM(CASE WHEN status = 'livre' THEN 1 ELSE 0 END) as livres,
  SUM(CASE WHEN status = 'ocupada' THEN 1 ELSE 0 END) as ocupadas,
  SUM(CASE WHEN status = 'em_andamento' THEN 1 ELSE 0 END) as em_andamento,
  SUM(CASE WHEN status = 'aguardando_pagamento' THEN 1 ELSE 0 END) as aguardando_pagamento
FROM tables;
