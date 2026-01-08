-- =========================================================================
-- SCRIPT DE CORREÇÃO: Sessões com Pagamentos que Incluíram Ajustes
-- =========================================================================
-- 
-- OBJETIVO: Corrigir sessões onde pagamentos foram feitos com descontos/taxas
--           mas os ajustes não foram salvos na sessão
--
-- PROBLEMA: session.discount = 0 mas totalAmount != paidAmount
--
-- SOLUÇÃO: Calcular e aplicar ajustes retroativamente
--
-- ⚠️  ATENÇÃO: Este script modifica dados! Faça backup antes de executar!
--
-- DATA: 2026-01-07
-- AUTOR: Rovo Dev
-- =========================================================================

BEGIN;

-- =========================================================================
-- PASSO 1: CRIAR BACKUP
-- =========================================================================
CREATE TABLE IF NOT EXISTS table_sessions_backup_20260107 AS 
SELECT * FROM table_sessions;

SELECT 'Backup criado: ' || COUNT(*) || ' sessões copiadas' 
FROM table_sessions_backup_20260107;

-- =========================================================================
-- PASSO 2: IDENTIFICAR SESSÕES PROBLEMÁTICAS
-- =========================================================================
-- Critérios:
-- 1. session.discount = 0 (ou NULL)
-- 2. session.serviceCharge = 0 (ou NULL)
-- 3. totalAmount != paidAmount (diferença > 0.01)
-- 4. status != 'fechada'

CREATE TEMP TABLE sessions_to_fix AS
SELECT 
    ts.id,
    ts.table_id,
    ts.total_amount,
    ts.paid_amount,
    ts.discount,
    ts.service_charge,
    (ts.total_amount::numeric - ts.paid_amount::numeric) as difference,
    ts.created_at
FROM table_sessions ts
WHERE 
    -- Não tem ajustes salvos
    (ts.discount IS NULL OR ts.discount::numeric = 0)
    AND (ts.service_charge IS NULL OR ts.service_charge::numeric = 0)
    -- Mas tem diferença entre total e pago
    AND ABS(ts.total_amount::numeric - ts.paid_amount::numeric) > 0.01
    -- E não está fechada
    AND ts.status != 'fechada'
    -- E tem valor pago (pagamento foi processado)
    AND ts.paid_amount::numeric > 0;

SELECT 
    '🔍 Sessões identificadas para correção: ' || COUNT(*) as resultado
FROM sessions_to_fix;

-- Mostrar detalhes
SELECT 
    id,
    table_id,
    total_amount,
    paid_amount,
    difference,
    created_at
FROM sessions_to_fix
ORDER BY created_at DESC;

-- =========================================================================
-- PASSO 3: CALCULAR AJUSTES RETROATIVOS
-- =========================================================================
-- Lógica:
-- Se totalAmount > paidAmount: Cliente recebeu DESCONTO
-- Se totalAmount < paidAmount: Cliente pagou TAXA DE SERVIÇO
-- Se totalAmount muito diferente: Pode ser desconto + taxa

CREATE TEMP TABLE calculated_adjustments AS
SELECT 
    stf.id as session_id,
    stf.total_amount::numeric as original_total,
    stf.paid_amount::numeric as paid,
    stf.difference::numeric as diff,
    
    -- Calcular subtotal original (sem ajustes)
    -- Assumindo que paid_amount = total após ajustes
    CASE
        -- Se diferença é positiva: houve desconto
        WHEN stf.difference::numeric > 0 THEN
            -- Tentar calcular % de desconto
            ROUND((stf.difference::numeric / stf.total_amount::numeric * 100)::numeric, 2)
        ELSE 0
    END as calculated_discount_percent,
    
    CASE
        -- Se diferença é negativa: houve taxa
        WHEN stf.difference::numeric < 0 THEN
            -- Tentar calcular % de taxa
            ROUND((ABS(stf.difference::numeric) / stf.total_amount::numeric * 100)::numeric, 2)
        ELSE 0
    END as calculated_service_percent,
    
    -- Tipo de ajuste
    CASE
        WHEN stf.difference::numeric > 0 THEN 'desconto'
        WHEN stf.difference::numeric < 0 THEN 'taxa'
        ELSE 'nenhum'
    END as adjustment_type
    
FROM sessions_to_fix stf;

SELECT 
    '📊 Ajustes calculados' as titulo,
    COUNT(*) as total,
    SUM(CASE WHEN adjustment_type = 'desconto' THEN 1 ELSE 0 END) as com_desconto,
    SUM(CASE WHEN adjustment_type = 'taxa' THEN 1 ELSE 0 END) as com_taxa
FROM calculated_adjustments;

-- Mostrar ajustes calculados
SELECT 
    session_id,
    original_total,
    paid,
    diff,
    adjustment_type,
    calculated_discount_percent,
    calculated_service_percent
FROM calculated_adjustments
ORDER BY ABS(diff) DESC;

-- =========================================================================
-- PASSO 4: ANÁLISE DE SEGURANÇA
-- =========================================================================
-- Verificar se os ajustes calculados fazem sentido

SELECT 
    '⚠️  ATENÇÃO: Sessões com ajustes muito altos (>50%)' as alerta,
    COUNT(*) as quantidade
FROM calculated_adjustments
WHERE calculated_discount_percent > 50 OR calculated_service_percent > 50;

-- Se houver ajustes muito altos, listar para revisão manual
SELECT 
    '🚨 REVISAR MANUALMENTE:' as titulo,
    session_id,
    original_total,
    paid,
    calculated_discount_percent || '% desconto' as desconto,
    calculated_service_percent || '% taxa' as taxa
FROM calculated_adjustments
WHERE calculated_discount_percent > 50 OR calculated_service_percent > 50;

-- =========================================================================
-- PASSO 5: APLICAR CORREÇÕES (CUIDADO!)
-- =========================================================================
-- ⚠️  Este UPDATE modifica os dados!
-- ⚠️  Remova o comentário abaixo APENAS se tiver certeza!

-- DESCOMENTAR PARA EXECUTAR:
/*
UPDATE table_sessions ts
SET 
    discount = ca.calculated_discount_percent::text,
    discount_type = 'percentual',
    service_charge = ca.calculated_service_percent::text,
    service_charge_type = 'percentual',
    updated_at = NOW()
FROM calculated_adjustments ca
WHERE ts.id = ca.session_id
    AND (ca.calculated_discount_percent > 0 OR ca.calculated_service_percent > 0);

SELECT 
    '✅ Sessões corrigidas: ' || COUNT(*) as resultado
FROM calculated_adjustments
WHERE calculated_discount_percent > 0 OR calculated_service_percent > 0;
*/

-- =========================================================================
-- PASSO 6: VALIDAÇÃO PÓS-CORREÇÃO
-- =========================================================================
-- Verificar se após a correção, validateSessionClosure funcionaria

CREATE TEMP TABLE validation_results AS
SELECT 
    ts.id,
    ts.table_id,
    ts.total_amount::numeric as session_total,
    ts.paid_amount::numeric as session_paid,
    ts.discount::numeric as session_discount,
    ts.service_charge::numeric as session_service,
    
    -- Simular cálculo do validateSessionClosure
    CASE
        WHEN ts.discount IS NOT NULL AND ts.discount::numeric > 0 THEN
            -- Aplicar desconto percentual
            ts.total_amount::numeric * (1 - ts.discount::numeric / 100)
        ELSE
            ts.total_amount::numeric
    END as total_after_discount,
    
    CASE
        WHEN ts.service_charge IS NOT NULL AND ts.service_charge::numeric > 0 THEN
            -- Calcular valor com desconto primeiro
            (CASE
                WHEN ts.discount IS NOT NULL AND ts.discount::numeric > 0 THEN
                    ts.total_amount::numeric * (1 - ts.discount::numeric / 100)
                ELSE
                    ts.total_amount::numeric
            END) * (1 + ts.service_charge::numeric / 100)
        ELSE
            CASE
                WHEN ts.discount IS NOT NULL AND ts.discount::numeric > 0 THEN
                    ts.total_amount::numeric * (1 - ts.discount::numeric / 100)
                ELSE
                    ts.total_amount::numeric
            END
    END as expected_total,
    
    -- Diferença final
    ABS(
        (CASE
            WHEN ts.service_charge IS NOT NULL AND ts.service_charge::numeric > 0 THEN
                (CASE
                    WHEN ts.discount IS NOT NULL AND ts.discount::numeric > 0 THEN
                        ts.total_amount::numeric * (1 - ts.discount::numeric / 100)
                    ELSE
                        ts.total_amount::numeric
                END) * (1 + ts.service_charge::numeric / 100)
            ELSE
                CASE
                    WHEN ts.discount IS NOT NULL AND ts.discount::numeric > 0 THEN
                        ts.total_amount::numeric * (1 - ts.discount::numeric / 100)
                    ELSE
                        ts.total_amount::numeric
                END
        END) - ts.paid_amount::numeric
    ) as remaining_difference

FROM table_sessions ts
WHERE ts.id IN (SELECT session_id FROM calculated_adjustments);

SELECT 
    '📊 Validação Pós-Correção' as titulo,
    COUNT(*) as total_sessoes,
    SUM(CASE WHEN remaining_difference <= 0.01 THEN 1 ELSE 0 END) as fecham_corretamente,
    SUM(CASE WHEN remaining_difference > 0.01 THEN 1 ELSE 0 END) as ainda_com_problema
FROM validation_results;

-- Listar sessões que ainda teriam problema
SELECT 
    '⚠️  Sessões que ainda NÃO fechariam após correção:' as alerta,
    id,
    session_total,
    session_paid,
    expected_total,
    remaining_difference
FROM validation_results
WHERE remaining_difference > 0.01;

-- =========================================================================
-- PASSO 7: ROLLBACK OU COMMIT
-- =========================================================================
-- Se tudo estiver OK, COMMIT
-- Se houver problemas, ROLLBACK

SELECT 
    '⚠️  ATENÇÃO: Transação ainda não foi commitada!' as aviso,
    'Execute COMMIT; para aplicar as mudanças' as instrucao1,
    'Ou ROLLBACK; para desfazer tudo' as instrucao2;

-- DESCOMENTAR PARA APLICAR:
-- COMMIT;

-- DESCOMENTAR PARA DESFAZER:
-- ROLLBACK;

-- =========================================================================
-- FIM DO SCRIPT
-- =========================================================================
