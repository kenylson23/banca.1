# 🛠️ Guia de Execução: Script de Correção de Sessões

**Objetivo:** Corrigir sessões onde pagamentos incluíram descontos/taxas mas os ajustes não foram salvos

---

## 📋 Pré-requisitos

1. ✅ Backup do banco de dados
2. ✅ Acesso ao servidor
3. ✅ Node.js e npx instalados
4. ✅ Permissões de escrita no banco

---

## 🚀 Método 1: Script TypeScript (Recomendado)

### **Passo 1: Análise (Dry-Run)**

```bash
npx tsx scripts/fix-sessions-with-adjustments.ts
```

**O que faz:**
- ✅ Identifica sessões problemáticas
- ✅ Calcula ajustes necessários
- ✅ Mostra análise detalhada
- ❌ **NÃO modifica dados**

**Output esperado:**
```
🔍 Encontradas 5 sessões com diferença entre total e pago

📊 Análise das Sessões:
┌─────────────────────┬─────┐
│                     │     │
├─────────────────────┼─────┤
│ Total de sessões    │ 5   │
│ Com desconto        │ 3   │
│ Com taxa            │ 2   │
│ Com ambos           │ 0   │
└─────────────────────┴─────┘

📋 Detalhes das sessões:
1. Sessão xxx-yyy-zzz
   Mesa: mesa-123
   Total: R$ 8000.00
   Pago: R$ 7920.00
   Diferença: R$ -80.00
   Tipo: desconto
   Desconto calculado: 10%
```

---

### **Passo 2: Revisão Manual**

Revise cada sessão listada:
- ✅ Valores fazem sentido?
- ✅ Percentuais são razoáveis (<50%)?
- ⚠️ Há algum alerta de "ajuste muito alto"?

Se houver alertas, **NÃO execute** e revise manualmente no banco.

---

### **Passo 3: Execução (Aplicar Correções)**

```bash
npx tsx scripts/fix-sessions-with-adjustments.ts --execute
```

**O que faz:**
1. ✅ Cria backup automático (`table_sessions_backup_TIMESTAMP`)
2. ✅ Solicita confirmação
3. ✅ Aplica correções
4. ✅ Valida resultados

**Confirmação:**
```
⚠️  ATENÇÃO: As correções serão aplicadas ao banco de dados!
Deseja continuar? (s/n): 
```

Digite `s` para continuar ou `n` para cancelar.

---

### **Passo 4: Validação**

O script valida automaticamente, mas você pode verificar manualmente:

```sql
SELECT 
    id,
    total_amount,
    paid_amount,
    discount,
    service_charge,
    (total_amount::numeric - paid_amount::numeric) as diff
FROM table_sessions
WHERE discount IS NOT NULL AND discount::numeric > 0
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🗄️ Método 2: Script SQL Direto

Se preferir executar SQL diretamente:

```bash
psql -d seu_banco -f scripts/fix-sessions-with-adjustments.sql
```

**Fluxo do script SQL:**
1. Cria backup
2. Identifica sessões
3. Calcula ajustes
4. Analisa segurança
5. **AGUARDA COMMIT MANUAL** (não aplica automaticamente)

**Para aplicar:**
```sql
-- No final do script, descomentar:
COMMIT;
```

**Para desfazer:**
```sql
-- Se algo der errado:
ROLLBACK;
```

---

## ⚠️ Segurança

### **Backup Manual (Antes de Executar)**

```bash
# PostgreSQL
pg_dump -Fc seu_banco > backup_before_fix_$(date +%Y%m%d_%H%M%S).dump

# Ou via SQL
psql -d seu_banco -c "
  CREATE TABLE table_sessions_manual_backup AS 
  SELECT * FROM table_sessions;
"
```

### **Restaurar Backup (Se Necessário)**

```bash
# PostgreSQL
pg_restore -d seu_banco backup_before_fix_*.dump

# Ou via SQL
psql -d seu_banco -c "
  DELETE FROM table_sessions;
  INSERT INTO table_sessions 
  SELECT * FROM table_sessions_manual_backup;
"
```

---

## 🧪 Cenários de Teste

### **Teste 1: Sessão com Desconto 10%**

**Antes:**
```
total_amount: 8000.00
paid_amount: 7200.00
discount: 0.00 ❌
```

**Depois:**
```
total_amount: 8000.00
paid_amount: 7200.00
discount: 10.00 ✅
discount_type: percentual ✅
```

**Validação:**
```
8000 * (1 - 10/100) = 7200 ✅ CORRETO
```

---

### **Teste 2: Sessão com Taxa 10%**

**Antes:**
```
total_amount: 8000.00
paid_amount: 8800.00
service_charge: 0.00 ❌
```

**Depois:**
```
total_amount: 8000.00
paid_amount: 8800.00
service_charge: 10.00 ✅
service_charge_type: percentual ✅
```

**Validação:**
```
8000 * (1 + 10/100) = 8800 ✅ CORRETO
```

---

### **Teste 3: Sessão com Desconto + Taxa**

**Antes:**
```
total_amount: 8000.00
paid_amount: 7920.00
discount: 0.00 ❌
service_charge: 0.00 ❌
```

**Depois:**
```
total_amount: 8000.00
paid_amount: 7920.00
discount: 10.00 ✅
service_charge: 10.00 ✅
```

**Validação:**
```
8000 * (1 - 10/100) * (1 + 10/100) = 7920 ✅ CORRETO
```

---

## 📊 Logs e Monitoramento

### **Logs do Script TypeScript**

O script gera logs coloridos:
- 🔵 Azul: Informação
- 🟢 Verde: Sucesso
- 🟡 Amarelo: Aviso
- 🔴 Vermelho: Erro

### **Logs a Monitorar Após Execução**

```bash
# Ver logs do servidor
tail -100 logs/server.log | grep -i "validateSessionClosure"

# Verificar mesas que agora fecham
psql -d seu_banco -c "
  SELECT COUNT(*) as mesas_podem_fechar
  FROM table_sessions
  WHERE ABS(
    (total_amount::numeric * 
     (1 - COALESCE(discount::numeric, 0) / 100) * 
     (1 + COALESCE(service_charge::numeric, 0) / 100)
    ) - paid_amount::numeric
  ) <= 0.01
  AND status != 'fechada';
"
```

---

## 🐛 Troubleshooting

### **Problema: "Sessões ainda com diferença após correção"**

**Causa:** Ajuste complexo (desconto fixo distribuído ou múltiplos ajustes)

**Solução:**
```sql
-- Revisar manualmente
SELECT * FROM table_sessions WHERE id = 'sessao-problematica';

-- Aplicar ajuste manual se necessário
UPDATE table_sessions 
SET 
  discount = '15.00',
  discount_type = 'percentual',
  service_charge = '5.00',
  service_charge_type = 'percentual'
WHERE id = 'sessao-problematica';
```

---

### **Problema: "Ajuste muito alto (>50%)"**

**Causa:** Pode ser erro de dados ou caso especial

**Solução:**
1. Verificar no banco:
   ```sql
   SELECT * FROM table_sessions WHERE id = 'sessao-xyz';
   SELECT * FROM table_payments WHERE session_id = 'sessao-xyz';
   ```

2. Se for erro real, corrigir manualmente
3. Se for legítimo (promoção especial), forçar fechamento com auditoria

---

## ✅ Checklist Final

Após executar o script:

- [ ] Backup foi criado com sucesso
- [ ] Script executou sem erros
- [ ] Validação mostrou todas as sessões OK
- [ ] Tentei fechar uma mesa corrigida no frontend
- [ ] Mesa fechou sem avisos de "valor pendente"
- [ ] Verificar logs do servidor (sem erros)
- [ ] Backup pode ser removido (após 7 dias de estabilidade)

---

## 📞 Suporte

Se encontrar problemas:

1. **NÃO entre em pânico** - O backup está lá!
2. Copie os logs completos
3. Anote quais sessões falharam
4. Execute `ROLLBACK;` se ainda em transação
5. Restaure o backup se necessário

---

**Documentação criada em:** 2026-01-07 17:45 UTC  
**Autor:** Rovo Dev  
**Versão:** 1.0
