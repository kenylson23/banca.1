# ⚠️ ANÁLISE: Conflitos Críticos no Sistema de Pagamento

## 🔍 Contexto

Após aplicar 5 correções no fluxo de pagamento, foi solicitada análise de **possíveis conflitos** entre as correções implementadas.

**Data da Análise**: 2026-01-06

---

## 🔴 CONFLITO #1: Dupla Atualização de `totalAmount`

### ⚠️ Severidade: ALTA

### Descrição:
Quando um pagamento é processado, `session.totalAmount` é calculado e atualizado **2 VEZES** com **lógicas potencialmente diferentes**.

### Fluxo Atual:

```
1. Endpoint /api/tables/:id/payment (routes.ts linha 4090-4136):
   → Calcula totalAmountAjustado
   → Aplica desconto + taxa
   → Atualiza: session.totalAmount = 8.800,00 ✅
   
2. Chama storage.addTablePayment() (linha 4060):
   → RECALCULA totalAmount
   → Aplica desconto + taxa NOVAMENTE
   → Atualiza: session.totalAmount = 8.800,01 ❌ (sobrescreve!)
```

### Causa:
- **Endpoint** atualiza `totalAmount` (linha 4131-4136)
- **`addTablePayment`** atualiza `totalAmount` NOVAMENTE (storage.ts linha 1816-1818)

### Impacto:
1. **Inconsistência de arredondamento**: Diferenças de centavos
2. **Último vence**: 2º cálculo sobrescreve o 1º
3. **Timing**: Se guests mudarem entre cálculos, valores divergem

### Exemplo Real:
```
Cálculo 1: subtotal = 8.000 → com ajustes = 8.800,00
Cálculo 2: subtotal = 8.000 → com ajustes = 8.800,01 (arredondamento)

session.totalAmount final = 8.800,01
session.paidAmount = 8.800,00
pendente = 0,01 Kz → ❌ BLOQUEIO!
```

### Solução Recomendada:
**Remover** a atualização de `totalAmount` em `addTablePayment` (linhas 1816-1818), mantendo apenas no endpoint.

---

## 🔴 CONFLITO #2: Pagamento Individual de Convidado NÃO Atualiza Sessão

### ⚠️ Severidade: CRÍTICA

### Descrição:
O endpoint `/api/table-guests/:guestId/payment` atualiza apenas o `guest.paidAmount`, mas **NÃO atualiza** `session.paidAmount`.

### Código Atual (linhas 4272-4320):
```typescript
// 1. Cria registro de pagamento
await db.insert(tablePayments).values({
  amount: amount,
  ...
});

// 2. Atualiza APENAS guest.paidAmount
await db.update(tableGuests)
  .set({ paidAmount: newGuestPaid.toFixed(2) })
  .where(eq(tableGuests.id, guestId));

// 3. ❌ NÃO atualiza session.paidAmount!
```

### Cenário Problemático:
```
Mesa com 2 convidados: Total = 8.800 Kz

Guest 1 paga individualmente: 4.400 Kz
→ guest1.paidAmount = 4.400 ✅
→ session.paidAmount = 0 ❌ (não atualizado!)

Guest 2 paga individualmente: 4.400 Kz
→ guest2.paidAmount = 4.400 ✅
→ session.paidAmount = 0 ❌ (ainda não atualizado!)

Validação de fechamento:
→ totalAmount = 8.800
→ paidAmount = 0
→ pendente = 8.800 ❌ BLOQUEADO!
```

### Impacto:
- **Impossível fechar mesa** após pagamentos individuais
- Validação falha porque `session.paidAmount` nunca é atualizado
- Inconsistência total entre guests e sessão

### Solução Recomendada:
Adicionar atualização de `session.paidAmount` após pagamento individual:

```typescript
// Após atualizar guest, atualizar também a sessão
const allGuests = await this.getTableGuests(guest.sessionId);
const totalPaidByGuests = allGuests.reduce((sum, g) => 
  sum + parseFloat(g.paidAmount || '0'), 0
);

await db.update(tableSessions)
  .set({ paidAmount: totalPaidByGuests.toFixed(2) })
  .where(eq(tableSessions.id, guest.sessionId));
```

---

## 🟡 CONFLITO #3: Race Condition em Pagamentos Simultâneos

### ⚠️ Severidade: MÉDIA

### Descrição:
Se dois pagamentos chegarem simultaneamente, pode haver perda de valores por **race condition**.

### Fluxo do Problema:
```
T0: session.paidAmount = 0

T1: Request A lê: session.paidAmount = 0
T2: Request B lê: session.paidAmount = 0

T3: Request A calcula: 0 + 5.000 = 5.000
T4: Request B calcula: 0 + 3.800 = 3.800

T5: Request A grava: session.paidAmount = 5.000
T6: Request B grava: session.paidAmount = 3.800 ❌ SOBRESCREVE!

Resultado: session.paidAmount = 3.800
Esperado: session.paidAmount = 8.800
Perdido: 5.000 Kz ❌
```

### Quando Ocorre:
- Dois garçons fazem pagamentos ao mesmo tempo
- Checkout V2 + Pagamento manual simultâneos
- Múltiplos pagamentos individuais de convidados

### Impacto:
- Perda de valores registrados
- `session.paidAmount` fica menor que o real
- Mesa não fecha automaticamente

### Solução Recomendada:
Usar **transação atômica** ou **UPDATE com incremento**:

```typescript
// Opção 1: Incremento atômico (SQL)
await db.execute(sql`
  UPDATE table_sessions 
  SET paidAmount = paidAmount + ${amount}
  WHERE id = ${sessionId}
`);

// Opção 2: Lock pessimista (transação)
await db.transaction(async (trx) => {
  const session = await trx.select()
    .from(tableSessions)
    .where(eq(tableSessions.id, sessionId))
    .for('update'); // Bloqueia linha
  
  const newPaid = parseFloat(session.paidAmount) + parseFloat(amount);
  await trx.update(tableSessions)
    .set({ paidAmount: newPaid.toFixed(2) })
    .where(eq(tableSessions.id, sessionId));
});
```

---

## 🟡 CONFLITO #4: Arredondamento na Distribuição Proporcional

### ⚠️ Severidade: BAIXA

### Descrição:
Ao distribuir `session.paidAmount` proporcionalmente entre convidados, erros de arredondamento podem fazer com que a **soma dos guests não bata** com a sessão.

### Código Atual (storage.ts linhas 1780-1820):
```typescript
const guests = await this.getTableGuests(table.currentSessionId);
const totalAmount = ...; // Total com ajustes

for (const guest of guests) {
  const guestProportion = parseFloat(guest.subtotal || '0') / totalAmount;
  const guestPaidAmount = newPaid * guestProportion;
  
  await db.update(tableGuests)
    .set({ paidAmount: guestPaidAmount.toFixed(2) });
}
```

### Exemplo do Problema:
```
session.paidAmount = 8.800,00 (valor exato)

Guest 1 (33,333...%): 8.800 × 0,33333 = 2.933,33
Guest 2 (33,333...%): 8.800 × 0,33333 = 2.933,33
Guest 3 (33,333...%): 8.800 × 0,33333 = 2.933,33

Soma: 2.933,33 + 2.933,33 + 2.933,33 = 8.799,99 ❌
Diferença: 0,01 Kz
```

### Impacto:
- Diferenças de **centavos** entre session e soma dos guests
- Não bloqueia operações (tolerância de 0,01)
- Pode causar confusão em auditorias

### Solução Recomendada:
Distribuir resto para o último guest:

```typescript
let remainingAmount = newPaid;

for (let i = 0; i < guests.length; i++) {
  const isLast = i === guests.length - 1;
  
  if (isLast) {
    // Último guest recebe o resto
    guestPaidAmount = remainingAmount;
  } else {
    const proportion = parseFloat(guest.subtotal) / totalAmount;
    guestPaidAmount = newPaid * proportion;
    remainingAmount -= guestPaidAmount;
  }
  
  await db.update(tableGuests)
    .set({ paidAmount: guestPaidAmount.toFixed(2) });
}
```

---

## 📊 Resumo dos Conflitos

| # | Conflito | Severidade | Impacto | Prioridade |
|---|----------|-----------|---------|-----------|
| **1** | Dupla atualização de totalAmount | 🔴 ALTA | Bloqueio por centavos | **P0** |
| **2** | Pagamento individual não atualiza session | 🔴 CRÍTICA | Mesa não fecha | **P0** |
| **3** | Race condition | 🟡 MÉDIA | Perda de valores | **P1** |
| **4** | Arredondamento | 🟡 BAIXA | Diferenças mínimas | **P2** |

---

## 🎯 Ações Recomendadas

### Prioridade P0 (Urgente):

1. **Remover atualização duplicada de `totalAmount`** em `addTablePayment`
2. **Adicionar atualização de `session.paidAmount`** no endpoint de pagamento individual

### Prioridade P1 (Alta):

3. **Implementar proteção contra race condition** usando UPDATE atômico

### Prioridade P2 (Média):

4. **Ajustar distribuição proporcional** para eliminar erros de arredondamento

---

## 📝 Notas Importantes

- Os conflitos **NÃO invalidam** as correções anteriores
- São problemas **adicionais** que precisam ser corrigidos
- A maioria são **edge cases** mas podem ocorrer em produção
- Correções recomendadas são **simples** e de **baixo risco**

---

**Status**: ⚠️ Conflitos identificados e documentados  
**Próximo Passo**: Aplicar correções por ordem de prioridade
