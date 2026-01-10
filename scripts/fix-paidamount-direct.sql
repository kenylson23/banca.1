-- Correção direta do paidAmount baseado na tabela table_payments
-- Este script corrige o valor de paidAmount na tabela table_sessions
-- usando a soma real dos pagamentos registrados

WITH payment_totals AS (
  SELECT 
    session_id,
    SUM(CAST(amount AS DECIMAL(10,2))) as total_paid
  FROM table_payments
  GROUP BY session_id
)
UPDATE table_sessions
SET paid_amount = COALESCE(pt.total_paid, 0.00)
FROM payment_totals pt
WHERE table_sessions.id = pt.session_id
  AND table_sessions.ended_at IS NULL
  AND ABS(table_sessions.paid_amount - pt.total_paid) > 0.01;

-- Verificar o resultado
SELECT 
  ts.id as session_id,
  ts.total_amount as total,
  ts.paid_amount as paid,
  (CAST(ts.total_amount AS DECIMAL(10,2)) - CAST(ts.paid_amount AS DECIMAL(10,2))) as pending,
  (SELECT COUNT(*) FROM table_payments WHERE session_id = ts.id) as payment_count,
  (SELECT SUM(CAST(amount AS DECIMAL(10,2))) FROM table_payments WHERE session_id = ts.id) as sum_payments
FROM table_sessions ts
WHERE ts.ended_at IS NULL
ORDER BY ts.started_at DESC;
