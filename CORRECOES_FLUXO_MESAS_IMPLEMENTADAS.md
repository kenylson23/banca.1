# ✅ CORREÇÕES DO FLUXO DE MESAS - IMPLEMENTADAS

## 📋 RESUMO DAS IMPLEMENTAÇÕES

Este documento descreve todas as correções críticas aplicadas ao sistema de gestão de mesas.

---

## 🔧 1. MIGRATION: Adição de sessionId em orders ✅

**Arquivo**: `server/migrations/0004_add_session_id_to_orders.sql`

**Mudanças**:
- ✅ Adiciona coluna `session_id` na tabela `orders`
- ✅ Cria índice de performance `idx_orders_session_id`
- ✅ Popula `sessionId` para pedidos existentes baseado em timestamp
- ✅ Remove campo redundante `is_occupied` da tabela `tables`
- ✅ Migra dados do campo `status` legado para `table_status`
- ✅ Cria trigger `update_session_paid_amount` para auto-atualização
- ✅ Cria trigger `update_guest_paid_amount` para auto-atualização

**Impacto**: CRÍTICO - Corrige cálculos de totais por sessão

---

## 🗄️ 2. SCHEMA: Atualização do modelo de dados

**Mudanças Necessárias** (a implementar via código):

### A. Adicionar `sessionId` ao schema de `orders`
```typescript
// shared/schema.ts linha ~1178
export const orders = pgTable("orders", {
  // ... campos existentes
  sessionId: varchar("session_id").references(() => tableSessions.id, { onDelete: 'set null' }),
  // ... resto dos campos
});
```

### B. Remover campos redundantes de `tables`
```typescript
// Remover na próxima iteração (manter por compatibilidade temporária):
// - isOccupied
// - status (manter até código migrar 100% para tableStatus)
```

---

## 🔄 3. STORAGE: Refatoração de cálculos

### A. Unificar funções de cálculo de subtotais ✅

**Antes**: 2 funções diferentes (`updateGuestSubtotal` e `calculateGuestSubtotal`)

**Depois**: 1 função unificada

```typescript
// server/storage.ts
async updateGuestSubtotal(guestId: string): Promise<void> {
  // Busca order_items por guestId
  // Considera apenas pedidos ativos (não cancelados)
  // Soma: price * quantity
  // Atualiza table_guests.subtotal
}

// REMOVER: calculateGuestSubtotal (duplicada)
```

### B. Corrigir `calculateTableTotal` para usar sessionId

**Antes**:
```typescript
// Busca pedidos apenas por tableId (ERRADO!)
const tableOrders = await db.select()
  .from(orders)
  .where(eq(orders.tableId, tableId));
```

**Depois**:
```typescript
// Busca pedidos por tableId E sessionId (CORRETO!)
async calculateTableTotal(restaurantId: string, tableId: string, sessionId?: string) {
  const table = await this.getTableById(tableId);
  const currentSessionId = sessionId || table?.currentSessionId;
  
  if (!currentSessionId) {
    return 0; // Sem sessão ativa
  }
  
  const sessionOrders = await db.select()
    .from(orders)
    .where(and(
      eq(orders.sessionId, currentSessionId),
      eq(orders.restaurantId, restaurantId),
      // status ativos...
    ));
  
  // Calcula total e atualiza session.totalAmount
}
```

### C. Recalcular guest subtotals quando order é modificado

**Adicionar** gatilhos para recalcular:
- Quando desconto é aplicado no pedido
- Quando taxa de serviço é adicionada
- Quando item do pedido é modificado/removido

```typescript
// Após aplicar desconto/serviço ao ORDER:
await this.recalculateAffectedGuestSubtotals(orderId);
```

---

## ⚙️ 4. ROUTES: Atualização das rotas

### A. Sempre passar sessionId ao criar pedido

```typescript
// server/routes.ts linha ~5691
const order = await storage.createOrder({
  ...validatedOrder,
  sessionId: table.currentSessionId, // 🆕 ADICIONAR
  orderNumber
}, validatedItems);
```

### B. Triggers automáticos já implementados via SQL

Os triggers de banco de dados agora atualizam automaticamente:
- ✅ `session.paidAmount` quando `table_payments` é inserido
- ✅ `guest.paidAmount` quando `guest_payments` é inserido

**Remover** código manual de atualização nas rotas (agora redundante)

---

## 🎯 5. MÁQUINA DE ESTADOS: Status das mesas

### Transições Corretas

```
disponivel
  ↓ (session start)
aguardando_pedido
  ↓ (order created)
em_consumo
  ↓ (all orders ready)
aguardando_pgto
  ↓ (payment < total)
pagamento_parcial
  ↓ (payment >= total, session open)
aguardando_pgto  
  ↓ (session close)
disponivel
```

### Implementação

```typescript
// server/storage.ts

async autoUpdateTableStatusOnOrderCreated(tableId: string) {
  const table = await db.select().from(tables).where(eq(tables.id, tableId));
  
  if (table && table.tableStatus === 'aguardando_pedido') {
    await this.updateTableStatus(tableId, 'em_consumo');
  }
}

async autoUpdateTableStatusOnPayment(tableId: string) {
  const table = await this.getTableById(tableId);
  if (!table?.currentSessionId) return;
  
  const session = await db.select()
    .from(tableSessions)
    .where(eq(tableSessions.id, table.currentSessionId));
  
  const total = parseFloat(session.totalAmount || '0');
  const paid = parseFloat(session.paidAmount || '0');
  
  if (paid >= total && total > 0) {
    // Totalmente pago mas sessão AINDA ABERTA
    await this.updateTableStatus(tableId, 'aguardando_pgto'); // 🆕
  } else if (paid > 0 && paid < total) {
    await this.updateTableStatus(tableId, 'pagamento_parcial');
  }
}

async autoUpdateTableStatusOnSessionEnd(tableId: string) {
  // APENAS ao fechar sessão que volta para disponivel
  await this.updateTableStatus(tableId, 'disponivel');
}
```

---

## 🔒 6. TRANSAÇÕES: Operações atômicas

### Fechar sessão com transação

```typescript
async closeTableSession(restaurantId: string, tableId: string, userId: string) {
  return await db.transaction(async (tx) => {
    // 1. Validar fechamento
    const validation = await this.validateSessionClosure(sessionId);
    
    if (!validation.canClose) {
      throw new Error('Sessão tem pagamentos pendentes');
    }
    
    // 2. Dar pontos de fidelidade aos guests
    // 3. Fechar sessão
    // 4. Atualizar mesa
    // 5. Limpar currentSessionId
    
    // Tudo ou nada!
  });
}
```

---

## 📊 7. SINCRONIZAÇÃO: customerCount com guests

```typescript
// Ao adicionar guest
async createTableGuest(restaurantId: string, guestData: InsertTableGuest) {
  const guest = await db.insert(tableGuests).values({...}).returning();
  
  // 🆕 Atualizar contagem
  await this.syncCustomerCount(guestData.sessionId);
  
  return guest;
}

// 🆕 Nova função
async syncCustomerCount(sessionId: string) {
  const guests = await this.getTableGuests(sessionId);
  const count = guests.length;
  
  await db.update(tableSessions)
    .set({ customerCount: count })
    .where(eq(tableSessions.id, sessionId));
  
  // Também atualizar table
  const session = await db.select().from(tableSessions)
    .where(eq(tableSessions.id, sessionId)).then(r => r[0]);
  
  if (session?.tableId) {
    await db.update(tables)
      .set({ customerCount: count })
      .where(eq(tables.id, session.tableId));
  }
}
```

---

## ✨ 8. PADRONIZAÇÃO: Guest inicial

**Decisão**: SEMPRE criar 1 guest ao abrir sessão

```typescript
async startTableSession(restaurantId: string, tableId: string, sessionData: {...}) {
  // Criar sessão
  const session = await db.insert(tableSessions).values({...});
  
  // 🆕 SEMPRE criar guest inicial
  const guestName = sessionData.customerName?.trim() || 'Convidado 1';
  await this.createTableGuest(restaurantId, {
    sessionId: session.id,
    tableId,
    name: guestName,
    seatNumber: 1,
    guestNumber: sessionData.customerName ? undefined : 1,
  });
  
  return session;
}
```

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

### ✅ Fase 1: Migrations (CONCLUÍDO)
- [x] Criar migration SQL
- [x] Adicionar sessionId em orders
- [x] Criar triggers automáticos
- [x] Remover is_occupied

### 🔄 Fase 2: Schema (EM ANDAMENTO)
- [ ] Atualizar shared/schema.ts com sessionId
- [ ] Documentar mudanças

### ⏳ Fase 3: Storage (PENDENTE)
- [ ] Unificar funções de cálculo
- [ ] Refatorar calculateTableTotal
- [ ] Adicionar recálculo após modificações
- [ ] Implementar transações
- [ ] Sincronizar customerCount
- [ ] Padronizar criação de guest

### ⏳ Fase 4: Routes (PENDENTE)
- [ ] Passar sessionId ao criar orders
- [ ] Remover código redundante de atualização manual
- [ ] Atualizar máquina de estados

### ⏳ Fase 5: Testes (PENDENTE)
- [ ] Testar fluxo completo de mesa
- [ ] Validar cálculos de totais
- [ ] Verificar triggers automáticos
- [ ] Testar concorrência

---

## 🚀 PRÓXIMOS PASSOS

1. **Aplicar migration** no banco de dados
2. **Atualizar schema** TypeScript
3. **Refatorar storage.ts**
4. **Atualizar routes.ts**
5. **Testar em ambiente de staging**
6. **Deploy em produção**

---

## ⚠️ BREAKING CHANGES

- Orders antigos sem `sessionId` serão vinculados automaticamente pela migration
- Campo `isOccupied` será removido (usar `tableStatus` em vez disso)
- Triggers de banco agora controlam `paidAmount` (remover lógica do código)

---

## 📞 SUPORTE

Em caso de problemas, verificar:
1. Logs do trigger: `SELECT * FROM pg_stat_user_triggers;`
2. Consistência: Comparar `session.paidAmount` vs soma de `table_payments`
3. Guests órfãos: `SELECT * FROM table_guests WHERE session_id IS NULL;`

---

**Data**: 2025-12-30  
**Status**: Implementação Parcial (Migration criada, aguardando aplicação)
