# 🔍 Resumo: Sistema de Debug Implementado para Pagamentos

**Data:** 2026-01-05  
**Status:** ✅ Sistema de debug completo implementado

---

## 📦 O Que Foi Implementado

### 1. Logs Detalhados no Backend

#### `server/storage.ts` - Função `addTablePayment`
```typescript
console.log(`[addTablePayment] Atualizando sessão ${table.currentSessionId}:`, {
  currentPaid: currentPaid.toFixed(2),
  paymentAmount: parseFloat(payment.amount).toFixed(2),
  newPaid: newPaid.toFixed(2)
});
```
**O que mostra:** Quando um pagamento é registrado, quanto já estava pago, quanto está sendo pago agora, e o novo total.

#### `server/routes.ts` - Endpoint `GET /api/tables/:id/orders-by-guest`
```typescript
console.log(`[orders-by-guest] Mesa ${req.params.id}:`, {
  sessionId: table.currentSessionId,
  totalAmount: totalAmount.toFixed(2),
  paidAmount: session?.paidAmount || '0.00',
  sessionData: session ? { id: session.id, paidAmount: session.paidAmount } : null
});
```
**O que mostra:** Quando o diálogo de gestão busca dados da mesa, mostra o total e quanto já foi pago.

---

### 2. Logs Detalhados no Frontend

#### `client/src/pages/table-checkout-v2.tsx` - Após pagamento
```typescript
console.log('🔍 [CHECKOUT] Pagamento processado com sucesso:', data);
console.log('🔍 [CHECKOUT] Invalidando queries para mesa:', id);
console.log('🔍 [CHECKOUT] Queries invalidadas. TableDetailsDialog deve refetch agora.');
```
**O que mostra:** Confirma que o pagamento foi processado e que as queries foram invalidadas.

#### `client/src/components/TableDetailsDialog.tsx` - Ao receber dados
```typescript
console.log('[DEBUG TableDetailsDialog] ===== PAYMENT DEBUG =====');
console.log('[DEBUG TableDetailsDialog] ordersByGuestData:', ordersByGuestData);
console.log('[DEBUG TableDetailsDialog] paidAmount from data:', ordersByGuestData?.paidAmount);
console.log('[DEBUG TableDetailsDialog] totalAmount from data:', ordersByGuestData?.totalAmount);
console.log('[DEBUG TableDetailsDialog] currentSessionId:', ordersByGuestData?.currentSessionId);
console.log('[DEBUG TableDetailsDialog] ========================');
```
**O que mostra:** Os dados brutos recebidos da API.

#### `client/src/components/TableDetailsDialog.tsx` - Ao calcular paidAmount
```typescript
console.log('[DEBUG TableDetailsDialog] Calculated paidAmount:', paid);
// ou
console.log('[DEBUG TableDetailsDialog] No paidAmount in data, returning 0');
```
**O que mostra:** O valor calculado a partir dos dados recebidos.

#### `client/src/components/TableDetailsDialog.tsx` - Ao renderizar painel
```typescript
console.log('[DEBUG TableDetailsDialog] Rendering payment section. paidAmount:', paidAmount, 'totalAmount:', totalAmount);
```
**O que mostra:** Confirma que o painel está sendo renderizado e com quais valores.

---

### 3. Melhorias na Sincronização

#### `client/src/components/TableDetailsDialog.tsx` - Query otimizada
```typescript
const { data: ordersByGuestData } = useQuery<OrdersByGuestData>({
  queryKey: [`/api/tables/${currentTable?.id}/orders-by-guest`],
  enabled: open && !!currentTable?.id && currentTable?.status !== 'livre',
  refetchOnMount: true, // ✅ Sempre buscar dados frescos ao abrir
  refetchOnWindowFocus: true, // ✅ Refetch quando voltar para a aba
  staleTime: 0, // ✅ Dados sempre considerados stale
});
```

---

## 🎯 Como Usar Este Sistema de Debug

### Passo 1: Abrir o Console
1. Abra o DevTools (F12)
2. Vá para a aba **Console**
3. No terminal do servidor, mantenha visível

### Passo 2: Fazer um Pagamento
1. Crie uma mesa com pedidos
2. Vá para o checkout
3. Processe um pagamento
4. **OBSERVE os logs** que aparecem

### Passo 3: Voltar para o Diálogo
1. Volte para a gestão de mesas
2. Abra o diálogo da mesa
3. **COMPARE os valores** nos logs com o que aparece na tela

---

## 🔍 O Que Procurar nos Logs

### ✅ Fluxo Correto (Tudo Funcionando)

**1. Backend ao processar pagamento:**
```
[addTablePayment] Atualizando sessão abc-123: {
  currentPaid: "0.00",
  paymentAmount: "5000.00",
  newPaid: "5000.00"
}
```

**2. Frontend ao processar pagamento:**
```
🔍 [CHECKOUT] Pagamento processado com sucesso: { ... }
🔍 [CHECKOUT] Invalidando queries para mesa: 1
🔍 [CHECKOUT] Queries invalidadas. TableDetailsDialog deve refetch agora.
```

**3. Backend ao buscar dados (quando diálogo abre):**
```
[orders-by-guest] Mesa 1: {
  sessionId: "abc-123",
  totalAmount: "10000.00",
  paidAmount: "5000.00",  ← CORRETO!
  sessionData: { id: "abc-123", paidAmount: "5000.00" }
}
```

**4. Frontend ao receber dados:**
```
[DEBUG TableDetailsDialog] ===== PAYMENT DEBUG =====
[DEBUG TableDetailsDialog] paidAmount from data: "5000.00"  ← CORRETO!
[DEBUG TableDetailsDialog] totalAmount from data: "10000.00"
[DEBUG TableDetailsDialog] Calculated paidAmount: 5000
[DEBUG TableDetailsDialog] Rendering payment section. paidAmount: 5000, totalAmount: 10000
```

**5. Tela mostra:**
```
┌─────────────────────┐
│ Total: 10.000,00 Kz│
│ Pago:   5.000,00 Kz│ 🟢
│ Restante: 5.000,00│  🟠
└─────────────────────┘
```

---

### 🔴 Problemas Possíveis

#### Problema A: Backend não atualiza
```
❌ Log [addTablePayment] NÃO APARECE
```
**Causa:** Endpoint de pagamento não está sendo chamado ou falhando antes de chegar ao `addTablePayment`

#### Problema B: Backend atualiza, mas retorna 0.00
```
✅ [addTablePayment] ... newPaid: "5000.00"
❌ [orders-by-guest] ... paidAmount: "0.00"
```
**Causa:** 
- SessionId diferente nos dois logs
- Sessão não está sendo commitada no banco
- Cache do banco de dados

#### Problema C: Backend correto, frontend recebe 0.00
```
✅ Backend: paidAmount: "5000.00"
❌ Frontend: paidAmount from data: "0.00"
```
**Causa:**
- Cache do React Query não invalida
- Request não está sendo feito
- Response está diferente do esperado

#### Problema D: Frontend recebe correto, mas não exibe
```
✅ Frontend: paidAmount from data: "5000.00"
✅ Frontend: Calculated paidAmount: 5000
❌ Log de "Rendering payment section" NÃO APARECE
```
**Causa:**
- Condição `paidAmount > 0` não satisfeita (tipo de dado?)
- Erro de renderização
- Componente não está montado

---

## 📁 Arquivos Modificados

### Backend
1. **`server/storage.ts`** (linha ~1721)
   - Adicionado log em `addTablePayment`

2. **`server/routes.ts`** (linha ~4616)
   - Adicionado log em GET `/api/tables/:id/orders-by-guest`

### Frontend
1. **`client/src/pages/table-checkout-v2.tsx`** (linha ~452)
   - Adicionado logs após pagamento bem-sucedido

2. **`client/src/components/TableDetailsDialog.tsx`**
   - Linha ~376: Logs detalhados dos dados recebidos
   - Linha ~1008, ~1012: Logs do cálculo do paidAmount
   - Linha ~1731: Log da renderização do painel

---

## 🧪 Teste Rápido

Execute este teste rápido para verificar se tudo está funcionando:

```bash
# 1. Certifique-se de que o servidor está rodando
npm run dev

# 2. Abra o navegador e o console (F12)

# 3. No terminal do servidor, você deve ver logs assim:
[addTablePayment] Atualizando sessão ...
[orders-by-guest] Mesa ...

# 4. No console do navegador, você deve ver logs assim:
🔍 [CHECKOUT] Pagamento processado ...
[DEBUG TableDetailsDialog] ===== PAYMENT DEBUG =====
```

---

## 🎯 Próximos Passos

### 1. Execute o Teste
Siga o **`GUIA_TESTE_DEBUG_PAGAMENTO.md`** passo a passo.

### 2. Colete os Logs
- Logs do **terminal do servidor**
- Logs do **console do navegador**
- Screenshot da **tela**

### 3. Reporte os Resultados
Use o template no guia de teste para reportar:
- ✅ Checkboxes que passaram
- ❌ Primeiro checkbox que falhou
- 📋 Logs completos

### 4. Diagnosticaremos Juntos
Com os logs, identificaremos **exatamente** onde está o problema:
- Backend não salvando?
- Backend salvando mas não retornando?
- Frontend não recebendo?
- Frontend recebendo mas não exibindo?

---

## 📚 Documentação Relacionada

- **`GUIA_TESTE_DEBUG_PAGAMENTO.md`** - Guia detalhado de como executar o teste
- **`ANALISE_SINCRONIZACAO_PAGAMENTO_MESAS.md`** - Análise técnica completa do fluxo
- **`CORRECAO_SINCRONIZACAO_PAGAMENTO_APLICADA.md`** - Documentação das correções anteriores

---

## ✅ Status

**Sistema de Debug:** ✅ Implementado e pronto para uso  
**Próximo Passo:** Execute o teste e reporte os resultados

---

**Com este sistema de logs, vamos descobrir exatamente onde está o problema! 🔍🎯**
