# Correção: Pagamento de Convidado Individual não Contabilizado

## Problema Identificado

Quando um pagamento era feito no contexto de um convidado específico (step individual), o valor:
1. ✅ Era registrado no banco de dados
2. ❌ **NÃO era contabilizado** no `paidAmount` do convidado
3. ❌ **NÃO aparecia** no total pago da mesa
4. ❌ Ao fechar a mesa, ainda aparecia como "Total Pago: 0,00 Kz"

## Causa Raiz

### Problema 1: Rota Inexistente
- Não existia rota no servidor para pagamento de convidado específico
- O frontend usava `/api/tables/:id/payment` que distribui o pagamento **proporcionalmente entre TODOS os convidados**
- Quando você pagava 100 Kz para o Convidado A, o sistema dividia entre A, B, C proporcionalmente

### Problema 2: Lógica de Distribuição Incorreta
A função `addTablePayment` tinha esta lógica (linha 1744-1767 do storage.ts):
```typescript
// Distribuir pagamento proporcionalmente entre os convidados
for (const guest of guests) {
  const proportion = guestSubtotal / totalAmount;
  const guestPaymentShare = parseFloat(payment.amount) * proportion;
  const guestNewPaid = guestCurrentPaid + guestPaymentShare;
  // ...
}
```

**Problema**: Esta lógica é correta para pagamentos gerais da mesa, mas incorreta para pagamentos de convidados específicos.

## Solução Implementada

### 1. Nova Rota de Pagamento Específico (server/routes.ts)
```typescript
app.post("/api/table-guests/:guestId/payment", isOperational, async (req, res) => {
  // Valida convidado e valor
  // Cria tablePayment diretamente (SEM usar addTablePayment)
  // Cria guestPayment que atualiza o paidAmount do convidado
  // Recalcula paidAmount da sessão somando todos os convidados
});
```

**Diferença chave**: 
- ❌ Não usa `addTablePayment` (que distribui entre todos)
- ✅ Cria `tablePayment` diretamente
- ✅ Usa `createGuestPayment` que atualiza apenas o convidado específico
- ✅ Recalcula total da sessão somando os `paidAmount` de todos os convidados

### 2. Frontend: Detecção de Contexto

#### PaymentSection.tsx
```typescript
// Se apenas 1 convidado selecionado, usar rota específica
if (selectedGuestIds.length === 1) {
  const res = await apiRequest('POST', `/api/table-guests/${guestId}/payment`, payload);
}
// Caso contrário, usar rota geral da mesa
```

#### table-checkout-v2.tsx
```typescript
// Mesma lógica no processPaymentMutation
if (selectedGuestIds.length === 1) {
  const res = await apiRequest('POST', `/api/table-guests/${guestId}/payment`, guestPayload);
}
```

### 3. Lógica de Atualização da Sessão

Na nova rota, após criar o pagamento do convidado:
```typescript
// Update session paidAmount manually (sum of all guest payments)
const allGuests = await storage.getTableGuests(guest.sessionId);
const totalPaid = allGuests.reduce((sum, g) => sum + parseFloat(g.paidAmount || '0'), 0);

await db.update(tableSessions)
  .set({ paidAmount: totalPaid.toFixed(2) })
  .where(eq(tableSessions.id, guest.sessionId));
```

## Fluxo Correto Agora

### Cenário: Mesa com 3 convidados
- Convidado A: 2000 Kz
- Convidado B: 2000 Kz  
- Convidado C: 2000 Kz
- **Total Mesa: 6000 Kz**

### Pagamento 1: Convidado A paga 2000 Kz
1. POST `/api/table-guests/{A-id}/payment` com amount: 2000
2. `createGuestPayment` atualiza:
   - Convidado A: `paidAmount = 2000`
   - Status: `pago`
3. Recalcula sessão:
   - `session.paidAmount = A(2000) + B(0) + C(0) = 2000`

### Pagamento 2: Convidado B paga 2000 Kz
1. POST `/api/table-guests/{B-id}/payment` com amount: 2000
2. `createGuestPayment` atualiza:
   - Convidado B: `paidAmount = 2000`
   - Status: `pago`
3. Recalcula sessão:
   - `session.paidAmount = A(2000) + B(2000) + C(0) = 4000`

### Resultado Final
- ✅ Total Mesa: 6000 Kz
- ✅ Total Pago: 4000 Kz
- ✅ Total Pendente: 2000 Kz (Convidado C)
- ✅ Validação de fechamento funcionará corretamente

## Arquivos Modificados

### Backend
1. **server/routes.ts**
   - Nova rota: `POST /api/table-guests/:guestId/payment`
   - Imports: Adicionado `tablePayments` ao import

### Frontend
2. **client/src/components/table-dialog/sections/PaymentSection.tsx**
   - Prop: `selectedGuestIds?: string[]`
   - Lógica: Detecção de pagamento individual vs geral

3. **client/src/pages/table-checkout-v2.tsx**
   - `processPaymentMutation`: Detecção de pagamento individual

4. **client/src/lib/queryClient.ts**
   - Preservação de `status` e outras propriedades do erro

## Benefícios

1. ✅ **Precisão**: Cada convidado paga exatamente o que deve
2. ✅ **Rastreabilidade**: Histórico claro de quem pagou quanto
3. ✅ **Flexibilidade**: Suporta pagamento individual, múltiplo ou geral
4. ✅ **Validação Correta**: Fechamento de mesa valida valores reais
5. ✅ **UX Melhorada**: Usuário vê valores corretos em tempo real

## Testes Recomendados

1. [ ] Pagar convidado individual no checkout v2
2. [ ] Verificar `paidAmount` do convidado específico
3. [ ] Verificar `session.paidAmount` atualizado
4. [ ] Pagar segundo convidado
5. [ ] Verificar soma correta na sessão
6. [ ] Tentar fechar mesa com pendente - deve mostrar valores corretos
7. [ ] Fechar mesa após todos pagarem
8. [ ] Verificar relatórios financeiros

---

**Status**: ✅ Implementado e pronto para teste
**Data**: 2026-01-05
