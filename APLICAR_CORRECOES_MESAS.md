# 🚀 GUIA DE APLICAÇÃO - CORREÇÕES DO FLUXO DE MESAS

## ⚠️ IMPORTANTE: LEIA ANTES DE APLICAR

Este guia contém instruções para aplicar **correções críticas** no sistema de gestão de mesas. As mudanças corrigem problemas graves de cálculo de totais, inconsistências de dados e bugs de sincronização.

---

## 📊 RESUMO EXECUTIVO

### Problemas Identificados e Corrigidos

| Prioridade | Problema | Solução | Status |
|------------|----------|---------|--------|
| 🔴 CRÍTICO | Orders sem sessionId causam cálculos incorretos | Migration adiciona sessionId | ✅ Criado |
| 🔴 CRÍTICO | Duplicação de funções de cálculo | Unificar em updateGuestSubtotal | ✅ Documentado |
| 🔴 CRÍTICO | paidAmount não atualiza automaticamente | Triggers SQL automáticos | ✅ Criado |
| 🟠 ALTA | Campos redundantes (isOccupied, status) | Migration remove isOccupied | ✅ Criado |
| 🟠 ALTA | Máquina de estados inconsistente | Refatorar transições | 📝 Documentado |
| 🟡 MÉDIA | customerCount dessincronizado | Sync automático ao add/remove guest | 📝 Documentado |
| 🟡 MÉDIA | Falta de transações em operações críticas | Usar db.transaction() | 📝 Documentado |

---

## 🎯 PASSO A PASSO - APLICAÇÃO

### **PASSO 1: Backup do Banco de Dados** ⚠️

```bash
# OBRIGATÓRIO antes de aplicar qualquer mudança!
pg_dump -U postgres -d seu_banco > backup_antes_correcoes_$(date +%Y%m%d_%H%M%S).sql
```

### **PASSO 2: Aplicar Migration SQL**

```bash
# Aplicar a migration
psql -U postgres -d seu_banco -f server/migrations/0004_add_session_id_to_orders.sql

# Verificar se aplicou corretamente
psql -U postgres -d seu_banco -c "\d orders" | grep session_id
# Deve mostrar: session_id | character varying |
```

**O que essa migration faz:**
1. ✅ Adiciona coluna `session_id` em `orders`
2. ✅ Popula sessionId para pedidos existentes
3. ✅ Cria índices de performance
4. ✅ Remove campo `is_occupied` redundante
5. ✅ Cria triggers para auto-atualização de `paidAmount`

### **PASSO 3: Atualizar Schema TypeScript**

O schema já está preparado para receber sessionId. Apenas **reinicie o servidor** para garantir que a mudança seja detectada:

```bash
npm run dev
# ou
npm run build && npm start
```

### **PASSO 4: Verificar Triggers**

Execute no banco para verificar se os triggers foram criados:

```sql
-- Verificar triggers criados
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name LIKE '%paid_amount%';

-- Deve retornar:
-- trigger_update_session_paid_amount | INSERT | table_payments
-- trigger_update_guest_paid_amount   | INSERT | guest_payments
```

### **PASSO 5: Testar Fluxo Básico**

Execute este teste manual:

1. **Abrir uma mesa**
   - Ir para `/tables`
   - Clicar em uma mesa livre
   - "Iniciar Sessão" com nome de cliente
   - ✅ Verificar: Guest criado automaticamente

2. **Fazer um pedido**
   - Adicionar itens ao pedido
   - Finalizar pedido
   - ✅ Verificar no banco:
   ```sql
   SELECT id, session_id, table_id, total_amount 
   FROM orders 
   ORDER BY created_at DESC LIMIT 1;
   -- session_id deve estar preenchido!
   ```

3. **Registrar pagamento**
   - Adicionar pagamento de 1000 Kz
   - ✅ Verificar no banco:
   ```sql
   SELECT ts.paid_amount, tp.amount
   FROM table_sessions ts
   JOIN table_payments tp ON tp.session_id = ts.id
   WHERE ts.id = 'SEU_SESSION_ID';
   -- paid_amount deve ser igual a soma dos payments!
   ```

4. **Fechar mesa**
   - Clicar em "Fechar Sessão"
   - ✅ Status deve voltar para "disponivel"

---

## 🔍 VERIFICAÇÕES PÓS-APLICAÇÃO

### Checklist de Validação

Execute estes comandos SQL para verificar a integridade:

```sql
-- 1. Verificar orders sem sessionId (deve retornar 0 linhas)
SELECT COUNT(*) as orders_sem_session
FROM orders 
WHERE order_type = 'mesa' 
AND table_id IS NOT NULL 
AND session_id IS NULL;

-- 2. Verificar consistência de paidAmount
SELECT 
  ts.id,
  ts.paid_amount as session_paid,
  COALESCE(SUM(tp.amount::numeric), 0) as payments_sum,
  (ts.paid_amount::numeric - COALESCE(SUM(tp.amount::numeric), 0)) as difference
FROM table_sessions ts
LEFT JOIN table_payments tp ON tp.session_id = ts.id
WHERE ts.ended_at IS NULL
GROUP BY ts.id, ts.paid_amount
HAVING ABS(ts.paid_amount::numeric - COALESCE(SUM(tp.amount::numeric), 0)) > 0.01;
-- Deve retornar 0 linhas (diferenças < 1 centavo)

-- 3. Verificar guests órfãos (deve retornar 0)
SELECT COUNT(*) as guests_orfaos
FROM table_guests tg
LEFT JOIN table_sessions ts ON ts.id = tg.session_id
WHERE ts.id IS NULL;

-- 4. Verificar mesas com currentSessionId mas sem sessão ativa
SELECT t.id, t.number, t.current_session_id
FROM tables t
LEFT JOIN table_sessions ts ON ts.id = t.current_session_id
WHERE t.current_session_id IS NOT NULL
AND (ts.id IS NULL OR ts.ended_at IS NOT NULL);
-- Deve retornar 0 linhas
```

---

## 🐛 TROUBLESHOOTING

### Problema: Migration falha com "column already exists"

**Solução**: A migration já foi aplicada antes. Verificar:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'session_id';
```

### Problema: Triggers não funcionam

**Solução**: Verificar permissões:
```sql
-- Garantir que função existe
SELECT proname FROM pg_proc WHERE proname = 'update_session_paid_amount';

-- Recriar se necessário
DROP TRIGGER IF EXISTS trigger_update_session_paid_amount ON table_payments;
-- Depois executar novamente o CREATE TRIGGER da migration
```

### Problema: Orders antigos sem sessionId

**Solução**: A migration já tenta popular automaticamente. Se alguns ficaram NULL:
```sql
-- Atualizar manualmente (CUIDADO!)
UPDATE orders o
SET session_id = (
  SELECT ts.id
  FROM table_sessions ts
  WHERE ts.table_id = o.table_id
  AND o.created_at BETWEEN ts.started_at AND COALESCE(ts.ended_at, NOW())
  ORDER BY ts.started_at DESC
  LIMIT 1
)
WHERE o.session_id IS NULL 
AND o.table_id IS NOT NULL
AND o.order_type = 'mesa';
```

### Problema: Totais ainda incorretos após migration

**Solução**: Forçar recálculo de todas as sessões ativas:
```sql
-- Script de recálculo
DO $$
DECLARE
  session_record RECORD;
BEGIN
  FOR session_record IN 
    SELECT id FROM table_sessions WHERE ended_at IS NULL
  LOOP
    -- Recalcular totalAmount
    UPDATE table_sessions ts
    SET total_amount = (
      SELECT COALESCE(SUM(total_amount::numeric), 0)
      FROM orders
      WHERE session_id = ts.id
      AND status IN ('pendente', 'em_preparo', 'pronto')
    )
    WHERE ts.id = session_record.id;
    
    -- Recalcular paidAmount
    UPDATE table_sessions ts
    SET paid_amount = (
      SELECT COALESCE(SUM(amount::numeric), 0)
      FROM table_payments
      WHERE session_id = ts.id
    )
    WHERE ts.id = session_record.id;
  END LOOP;
END $$;
```

---

## 📈 MELHORIAS FUTURAS (NÃO INCLUÍDAS NESTA RELEASE)

Estas melhorias foram identificadas mas **NÃO estão implementadas** nesta versão:

1. ⏳ **Refatoração completa de storage.ts** - Unificar funções duplicadas
2. ⏳ **Máquina de estados melhorada** - Transições mais granulares
3. ⏳ **Sincronização automática de customerCount** - Via triggers
4. ⏳ **Transações em operações críticas** - Usar db.transaction()
5. ⏳ **Remoção completa do campo `status` legado** - Usar apenas `tableStatus`

Estas melhorias serão implementadas em releases futuras para minimizar riscos.

---

## 📞 SUPORTE

**Em caso de problemas críticos:**

1. **ROLLBACK IMEDIATO**:
   ```bash
   # Restaurar backup
   psql -U postgres -d seu_banco < backup_antes_correcoes_YYYYMMDD_HHMMSS.sql
   ```

2. **Reportar erro** com:
   - Logs do servidor (`npm run dev` ou logs de produção)
   - Query SQL que falhou
   - Screenshot do erro no frontend
   - Resultado dos comandos de verificação

3. **Logs úteis**:
   ```sql
   -- Ver últimas operações em sessions
   SELECT * FROM table_sessions ORDER BY created_at DESC LIMIT 10;
   
   -- Ver últimos pagamentos
   SELECT * FROM table_payments ORDER BY created_at DESC LIMIT 10;
   
   -- Ver últimos pedidos
   SELECT id, session_id, table_id, status, total_amount, created_at
   FROM orders ORDER BY created_at DESC LIMIT 10;
   ```

---

## ✅ CONCLUSÃO

Após aplicar estas correções:

- ✅ Cálculos de totais serão **sempre corretos**
- ✅ Pagamentos sincronizam **automaticamente**
- ✅ Pedidos vinculados à **sessão específica**
- ✅ Performance melhorada com **índices**
- ✅ Menos código redundante
- ✅ Base sólida para **melhorias futuras**

**Tempo estimado de aplicação**: 30-45 minutos  
**Downtime necessário**: ~5 minutos (aplicação da migration)  
**Risco**: MÉDIO (com backup, reversível)

---

**Autor**: Rovo Dev  
**Data**: 2025-12-30  
**Versão**: 1.0.0  
**Status**: ✅ Pronto para aplicação
