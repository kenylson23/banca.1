# 🔧 Correção do Status das Mesas

## Problema
Mesas aparecem como "ocupadas" mesmo quando são recém-criadas.

## Causa
O código de criação está **correto** e define o status como `'livre'`. O problema é que mesas antigas podem ter ficado com status incorreto devido a bugs anteriores ou sessões não finalizadas.

## Solução

### Opção 1: Via SQL Direto (Mais Rápido) ⚡

Execute o seguinte SQL no seu banco de dados:

```sql
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

-- 3. Verificar resultado
SELECT 
  status,
  COUNT(*) as quantidade
FROM tables
GROUP BY status
ORDER BY status;
```

### Opção 2: Via Console do Navegador 🌐

1. Abra o sistema no navegador
2. Faça login como administrador
3. Abra o Console do Desenvolvedor (F12)
4. Cole e execute este código:

```javascript
fetch('/api/debug/fix-table-status', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(res => res.json())
.then(data => {
  console.log('✅ Correção concluída!');
  console.log('Mesas corrigidas:', data.fixed);
  console.log('Estatísticas:', data.stats);
  console.log('Detalhes:', data.fixedTables);
})
.catch(err => console.error('❌ Erro:', err));
```

### Opção 3: Via cURL (Terminal) 🖥️

Se o servidor estiver rodando, execute:

```bash
curl -X POST http://localhost:5000/api/debug/fix-table-status \
  -H "Content-Type: application/json"
```

## O Que a Correção Faz

1. ✅ Verifica cada mesa no sistema
2. ✅ Se a mesa **não tem sessão ativa** → define como `'livre'`
3. ✅ Se a mesa **tem sessão ativa** → ajusta o status de acordo com a sessão
4. ✅ Reseta campos relacionados (totalAmount, customerName, etc.)
5. ✅ Retorna estatísticas completas

## Resultado Esperado

Você verá algo como:

```json
{
  "success": true,
  "message": "Fixed 5 tables",
  "fixed": 5,
  "stats": {
    "total": 10,
    "livre": 8,
    "ocupada": 1,
    "em_andamento": 1,
    "aguardando_pagamento": 0
  },
  "fixedTables": [
    {
      "id": "abc123",
      "number": 1,
      "oldStatus": "ocupada",
      "newStatus": "livre",
      "hasActiveSession": false
    }
  ]
}
```

## Prevenção

A partir de agora, **novas mesas serão criadas corretamente como 'livre'**. O código já está correto:

- ✅ `server/storage.ts` linha 1349: `status: 'livre'`
- ✅ Schema correto: `status: tableStatusEnum("status").notNull().default('livre')`

## Após a Correção

1. Atualize a página do sistema
2. Verifique que as mesas agora aparecem com o status correto
3. Crie uma nova mesa de teste - ela deve aparecer como "livre"

---

**Nota:** Este é um problema pontual de dados antigos. O código de criação de mesas está funcionando corretamente.
