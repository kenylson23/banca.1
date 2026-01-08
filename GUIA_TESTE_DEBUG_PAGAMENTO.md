# 🔍 Guia de Teste com Debug - Problema de Sincronização de Pagamento

**Data:** 2026-01-05  
**Objetivo:** Identificar onde está falhando a sincronização do pagamento entre checkout e diálogo de gestão

---

## 📋 Preparação

### 1. Abrir Console do Navegador
- Pressione `F12` ou clique com botão direito > Inspecionar
- Vá para a aba **Console**
- Limpe o console (ícone 🚫 ou Ctrl+L)

### 2. Manter Console Aberto
- Deixe o console aberto durante todo o teste
- Configure para preservar logs (checkbox "Preserve log")

---

## 🧪 Procedimento de Teste

### Passo 1: Abrir Mesa e Criar Pedido
1. Vá para a página de gestão de mesas
2. Clique em uma mesa livre
3. Adicione convidados
4. Faça um pedido (ex: 10.000 Kz)
5. **AGUARDE** e observe no console:
   ```
   [DEBUG TableDetailsDialog] ===== PAYMENT DEBUG =====
   [DEBUG TableDetailsDialog] paidAmount from data: "0.00"
   [DEBUG TableDetailsDialog] totalAmount from data: "10000.00"
   ```

### Passo 2: Ir para o Checkout
1. No diálogo da mesa, clique em **"Checkout"**
2. Você será redirecionado para `/table-checkout-v2/:id`
3. Preencha o formulário de pagamento:
   - Valor: 5.000 Kz (pagamento parcial)
   - Método: Dinheiro
4. **NÃO CLIQUE EM PAGAR AINDA**

### Passo 3: Processar Pagamento e Observar Logs
1. **Limpe o console** (Ctrl+L)
2. Clique em **"Confirmar Pagamento"**
3. **OBSERVE ATENTAMENTE** os logs que aparecerão:

#### 🔍 Logs Esperados no Backend (Terminal do Servidor):
```
[addTablePayment] Atualizando sessão <session-id>: {
  currentPaid: "0.00",
  paymentAmount: "5000.00",
  newPaid: "5000.00"
}
```

#### 🔍 Logs Esperados no Frontend (Console do Navegador):
```
🔍 [CHECKOUT] Pagamento processado com sucesso: { id: "...", amount: "5000.00", ... }
🔍 [CHECKOUT] Invalidando queries para mesa: <table-id>
🔍 [CHECKOUT] Queries invalidadas. TableDetailsDialog deve refetch agora.
```

### Passo 4: Voltar para o Diálogo de Gestão
1. **Feche o diálogo de sucesso** do checkout (se aparecer)
2. **Volte para a página de gestão de mesas**
3. **Abra o diálogo da mesma mesa**
4. **OBSERVE** os logs no console:

#### 🔍 Logs Esperados quando o Diálogo Abre:
```
[orders-by-guest] Mesa <table-id>: {
  sessionId: "<session-id>",
  totalAmount: "10000.00",
  paidAmount: "5000.00",  ← DEVE SER 5000.00, NÃO 0.00!
  sessionData: { id: "<session-id>", paidAmount: "5000.00" }
}

[DEBUG TableDetailsDialog] ===== PAYMENT DEBUG =====
[DEBUG TableDetailsDialog] paidAmount from data: "5000.00"  ← DEVE SER 5000.00!
[DEBUG TableDetailsDialog] totalAmount from data: "10000.00"
[DEBUG TableDetailsDialog] Calculated paidAmount: 5000
[DEBUG TableDetailsDialog] Rendering payment section. paidAmount: 5000, totalAmount: 10000
```

### Passo 5: Verificar Exibição Visual
1. No painel lateral do diálogo, você **DEVE VER**:
   ```
   Total da Mesa
   10.000,00 Kz
   
   ┌─────────────────────┐
   │ Pago    5.000,00 Kz │ (verde)
   │ Restante 5.000,00 Kz│ (laranja)
   └─────────────────────┘
   ```

---

## 🔴 Cenários de Falha e O Que Fazer

### Cenário 1: Backend NÃO atualiza paidAmount
**Sintoma no terminal do servidor:**
```
❌ NÃO APARECE: [addTablePayment] Atualizando sessão...
```

**O que fazer:**
1. Copie TODA a saída do terminal do servidor
2. Procure por erros relacionados a `addTablePayment`
3. Verifique se o endpoint `/api/tables/:id/payment` foi chamado
4. Me envie os logs completos

---

### Cenário 2: Backend atualiza, mas orders-by-guest retorna paidAmount = "0.00"
**Sintoma no terminal do servidor:**
```
✅ [addTablePayment] Atualizando sessão abc-123: { currentPaid: "0.00", paymentAmount: "5000.00", newPaid: "5000.00" }
❌ [orders-by-guest] Mesa 1: { sessionId: "abc-123", paidAmount: "0.00", ... }
```

**Possíveis causas:**
- A sessão não está sendo commitada no banco
- A query de orders-by-guest está buscando sessão diferente
- Há um problema de cache no banco de dados

**O que fazer:**
1. Verifique se o `sessionId` é o mesmo nos dois logs
2. Copie os logs completos
3. Execute no banco: 
   ```sql
   SELECT id, table_id, paid_amount FROM table_sessions WHERE id = 'abc-123';
   ```
4. Me envie o resultado

---

### Cenário 3: orders-by-guest retorna correto, mas TableDetailsDialog não recebe
**Sintoma:**
```
✅ Backend: [orders-by-guest] Mesa 1: { paidAmount: "5000.00" }
❌ Frontend: [DEBUG TableDetailsDialog] paidAmount from data: "0.00"
```

**Possíveis causas:**
- Cache do React Query não está invalidando
- TableDetailsDialog está usando dados antigos em cache
- A query não está habilitada (`enabled: false`)

**O que fazer:**
1. Copie os logs do console
2. Verifique se aparecem logs de "Invalidando queries"
3. Na aba **Network** do DevTools, verifique se há um request GET para `/api/tables/:id/orders-by-guest` após o pagamento
4. Clique no request e veja a **Response** - verifique o `paidAmount`

---

### Cenário 4: TableDetailsDialog recebe correto, mas não exibe
**Sintoma:**
```
✅ [DEBUG TableDetailsDialog] paidAmount from data: "5000.00"
✅ [DEBUG TableDetailsDialog] Calculated paidAmount: 5000
❌ O painel de pagamento NÃO APARECE na tela
```

**Possíveis causas:**
- Erro de renderização no componente
- CSS ocultando o elemento
- Condição `paidAmount > 0` não está sendo satisfeita

**O que fazer:**
1. Copie o log: `[DEBUG TableDetailsDialog] Rendering payment section...`
2. Verifique o valor exibido
3. Na aba **Elements** do DevTools, procure por elementos com classe `bg-white/5 backdrop-blur-sm`
4. Tire um screenshot da tela e dos logs

---

## 📊 Checklist de Diagnóstico

Após executar o teste, preencha:

- [ ] ✅ Backend: Log `[addTablePayment]` apareceu com `newPaid: "5000.00"`
- [ ] ✅ Backend: Log `[orders-by-guest]` apareceu com `paidAmount: "5000.00"`
- [ ] ✅ Frontend: Log `[CHECKOUT] Pagamento processado` apareceu
- [ ] ✅ Frontend: Log `[CHECKOUT] Invalidando queries` apareceu
- [ ] ✅ Frontend: Log `[DEBUG TableDetailsDialog] paidAmount from data: "5000.00"` apareceu
- [ ] ✅ Frontend: Log `[DEBUG TableDetailsDialog] Calculated paidAmount: 5000` apareceu
- [ ] ✅ Frontend: Log `[DEBUG TableDetailsDialog] Rendering payment section...` apareceu
- [ ] ✅ Visual: Painel de pagamento apareceu na tela com valores corretos

---

## 🎯 Próximos Passos Baseados nos Resultados

### Se TODOS os checkboxes estão ✅:
🎉 **O problema está resolvido!** O pagamento está sincronizando corretamente.

### Se algum checkbox está ❌:
1. **Identifique o primeiro checkbox falho** na lista
2. **Siga o cenário de falha correspondente** acima
3. **Colete os logs e informações** solicitados
4. **Me envie** para análise detalhada

---

## 🔧 Comandos Úteis para Debug

### Ver estado da sessão no banco:
```sql
SELECT id, table_id, paid_amount, started_at 
FROM table_sessions 
WHERE table_id = '<table-id>' 
ORDER BY started_at DESC 
LIMIT 1;
```

### Ver pagamentos da sessão:
```sql
SELECT id, session_id, amount, payment_method, created_at 
FROM table_payments 
WHERE session_id = '<session-id>' 
ORDER BY created_at DESC;
```

### Limpar cache do React Query (console do navegador):
```javascript
window.location.reload(); // Força reload completo
```

---

## 📝 Template para Reportar Problema

Use este template se encontrar falhas:

```
## 🐛 Problema de Sincronização de Pagamento

**Data/Hora:** [data e hora do teste]

**Mesa ID:** [id da mesa]
**Session ID:** [id da sessão]
**Valor Total:** [ex: 10.000 Kz]
**Valor Pago:** [ex: 5.000 Kz]

**Checklist de Diagnóstico:**
- [ ] Backend: addTablePayment
- [ ] Backend: orders-by-guest
- [ ] Frontend: Checkout invalidação
- [ ] Frontend: TableDetailsDialog recebeu dados
- [ ] Frontend: TableDetailsDialog calculou paidAmount
- [ ] Frontend: Renderizou painel
- [ ] Visual: Painel visível na tela

**Logs do Backend (servidor):**
```
[cole os logs aqui]
```

**Logs do Frontend (console):**
```
[cole os logs aqui]
```

**Screenshot:**
[anexe screenshot da tela]

**Aba Network - Response de orders-by-guest:**
```json
{
  "paidAmount": "???",
  "totalAmount": "???"
}
```
```

---

**Boa sorte com o teste! Com estes logs, vamos identificar exatamente onde está o problema. 🔍**
