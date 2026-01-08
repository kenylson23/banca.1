# Correções P0 - Gestão de Mesas
**Data:** 2026-01-06  
**Status:** Pronto para aplicar

---

## 📋 CORREÇÕES IMPLEMENTADAS

### ✅ Correção 1: Transações Atômicas em `addTablePayment`

**Localização:** `server/storage.ts` - linha ~1742

**Problema:** Pagamentos podem ser registrados sem atualizar `session.paidAmount`, causando inconsistências.

**Solução:** Envolver toda operação em transação atômica.

**Código Original:**
```typescript
async addTablePayment(restaurantId: string, payment: any): Promise<any> {
  const table = await this.getTableById(payment.tableId);
  if (!table) {
    throw new Error('Table not found');
  }

  const [newPayment] = await db.insert(tablePayments).values({
    ...payment,
    restaurantId,
  }).returning();

  // ... resto do código sem transação
  return newPayment;
}
```

**Código Corrigido:**
```typescript
async addTablePayment(restaurantId: string, payment: any): Promise<any> {
  // ✅ P0 CORREÇÃO: Usar transação atômica
  return await db.transaction(async (tx) => {
    // 1. Validar mesa
    const [table] = await tx.select()
      .from(tables)
      .where(eq(tables.id, payment.tableId))
      .limit(1);
    
    if (!table) {
      throw new Error('Table not found');
    }

    // 2. Criar pagamento
    const [newPayment] = await tx.insert(tablePayments).values({
      ...payment,
      restaurantId,
    }).returning();

    // 3. Atualizar session.paidAmount atomicamente
    if (table.currentSessionId) {
      await tx.execute(sql`
        UPDATE table_sessions 
        SET paid_amount = COALESCE(paid_amount, 0) + ${payment.amount}::numeric,
            updated_at = NOW()
        WHERE id = ${table.currentSessionId}
      `);
    }

    return newPayment;
  });
}
```

---

### ✅ Correção 2: Transações Atômicas em `createGuestPayment`

**Localização:** `server/storage.ts` - linha ~9925

**Problema:** Pagamento de convidado não atualiza `session.paidAmount` atomicamente.

**Solução:** Usar transação para atualizar guest e session simultaneamente.

**Código Original:**
```typescript
async createGuestPayment(restaurantId: string, data: InsertGuestPayment): Promise<GuestPayment> {
  const [payment] = await db
    .insert(guestPayments)
    .values({
      ...data,
      restaurantId,
    })
    .returning();

  // Atualizações fora da transação
  const guest = await this.getTableGuestById(data.guestId);
  // ...
  return payment;
}
```

**Código Corrigido:**
```typescript
async createGuestPayment(restaurantId: string, data: InsertGuestPayment): Promise<GuestPayment> {
  // ✅ P0 CORREÇÃO: Usar transação atômica
  return await db.transaction(async (tx) => {
    // 1. Criar pagamento
    const [payment] = await tx
      .insert(guestPayments)
      .values({
        ...data,
        restaurantId,
      })
      .returning();

    // 2. Atualizar guest.paidAmount atomicamente
    await tx.execute(sql`
      UPDATE table_guests 
      SET paid_amount = COALESCE(paid_amount, 0) + ${data.amount}::numeric,
          updated_at = NOW()
      WHERE id = ${data.guestId}
    `);
    
    // 3. Atualizar session.paidAmount atomicamente
    if (data.sessionId) {
      await tx.execute(sql`
        UPDATE table_sessions 
        SET paid_amount = COALESCE(paid_amount, 0) + ${data.amount}::numeric,
            updated_at = NOW()
        WHERE id = ${data.sessionId}
      `);
    }
    
    return payment;
  });
}
```

---

### ✅ Correção 3: Row-Level Locking em `validateSessionClosure`

**Localização:** `server/storage.ts` - linha ~1643

**Problema:** Validação não previne que novos pedidos sejam adicionados durante o fechamento.

**Solução:** Usar `FOR UPDATE` para lock pessimista.

**Código Original:**
```typescript
async validateSessionClosure(sessionId: string): Promise<ValidationResult> {
  const session = await db
    .select()
    .from(tableSessions)
    .where(eq(tableSessions.id, sessionId))
    .limit(1);
  
  // ... validações sem lock
}
```

**Código Corrigido:**
```typescript
async validateSessionClosure(sessionId: string): Promise<ValidationResult> {
  // ✅ P0 CORREÇÃO: Lock pessimista para prevenir race conditions
  return await db.transaction(async (tx) => {
    // 1. Lock na sessão
    const [session] = await tx
      .select()
      .from(tableSessions)
      .where(eq(tableSessions.id, sessionId))
      .for('update') // 🔒 Lock até commit
      .limit(1);
    
    if (!session) {
      throw new Error('Session not found');
    }

    // 2. Validar tudo em uma query atômica
    const [validation] = await tx.execute(sql`
      SELECT 
        s.total_amount,
        s.paid_amount,
        s.discount_amount,
        s.service_fee,
        COUNT(DISTINCT o.id) FILTER (WHERE o.status IN ('pendente', 'em_preparo')) as pending_orders,
        COUNT(DISTINCT tg.id) as total_guests,
        COUNT(DISTINCT tg.id) FILTER (WHERE tg.paid_amount >= tg.subtotal) as paid_guests
      FROM table_sessions s
      LEFT JOIN table_guests tg ON tg.session_id = s.id
      LEFT JOIN orders o ON o.table_session_id = s.id
      WHERE s.id = ${sessionId}
      GROUP BY s.id, s.total_amount, s.paid_amount, s.discount_amount, s.service_fee
    `);

    const totalPending = parseFloat(validation.total_amount || '0') - parseFloat(validation.paid_amount || '0');
    const hasPendingOrders = parseInt(validation.pending_orders) > 0;

    return {
      canClose: !hasPendingOrders && totalPending <= 0.01,
      totalPending: totalPending,
      pendingOrders: parseInt(validation.pending_orders),
      reasons: [
        hasPendingOrders && 'Há pedidos pendentes ou em preparo',
        totalPending > 0.01 && `Valor pendente: ${totalPending.toFixed(2)} Kz`
      ].filter(Boolean)
    };
  });
}
```

---

### ✅ Correção 4: Melhorar `closeTableSession` com Audit Trail

**Localização:** `server/storage.ts` - linha ~1489

**Problema:** `forceClose` não registra auditoria, permitindo fechamento sem rastreabilidade.

**Solução:** Adicionar tabela de auditoria e registrar todas as ações de force close.

**Código Corrigido:**
```typescript
async closeTableSession(
  sessionId: string, 
  forceClose: boolean = false,
  actorId?: number
): Promise<void> {
  return await db.transaction(async (tx) => {
    // 1. Validar com lock
    const validation = await this.validateSessionClosure(sessionId);
    
    if (!validation.canClose && !forceClose) {
      throw new Error(`Não é possível fechar a sessão: ${validation.reasons.join(', ')}`);
    }

    // 2. Se forçado, registrar auditoria
    if (forceClose && !validation.canClose) {
      await tx.insert(auditLogs).values({
        restaurantId: session.restaurantId,
        actorId: actorId,
        action: 'session_force_closed',
        entityType: 'table_session',
        entityId: sessionId,
        details: {
          totalPending: validation.totalPending,
          pendingOrders: validation.pendingOrders,
          reasons: validation.reasons,
          timestamp: new Date().toISOString()
        }
      });
      
      console.log('⚠️ [CloseSession] Sessão fechada forçadamente - auditoria registrada', {
        sessionId,
        actorId,
        totalPending: validation.totalPending
      });
    }

    // 3. Fechar sessão
    await tx.update(tableSessions)
      .set({ 
        status: 'fechada',
        closedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(tableSessions.id, sessionId));

    // 4. Limpar currentSessionId da mesa
    await tx.update(tables)
      .set({ 
        currentSessionId: null,
        status: 'disponivel',
        totalAmount: '0'
      })
      .where(eq(tables.currentSessionId, sessionId));
  });
}
```

---

### ✅ Correção 5: Remover Endpoint Vulnerável em `routes.ts`

**Localização:** `server/routes.ts` - linha ~4007-4150

**Problema:** Endpoint `/api/tables/:id/payment` atualiza `paidAmount` manualmente, causando race conditions.

**Solução:** Remover atualização manual - deixar para a transação em `addTablePayment`.

**Código Original:**
```typescript
app.post('/api/tables/:id/payment', authenticateToken, async (req, res) => {
  // ... código
  
  // ❌ PROBLEMA: Atualização manual causa race condition
  const currentPaid = parseFloat(session?.paidAmount || '0');
  const totalPaid = currentPaid + parseFloat(amount);

  await db.update(tableSessions)
    .set({ paidAmount: totalPaid.toFixed(2) })
    .where(eq(tableSessions.id, session.id));
    
  // ...
});
```

**Código Corrigido:**
```typescript
app.post('/api/tables/:id/payment', authenticateToken, async (req, res) => {
  // ... validações
  
  // ✅ CORREÇÃO: Apenas criar pagamento - transação atômica cuida do resto
  const payment = await storage.addTablePayment(restaurantId, {
    tableId: parseInt(id),
    sessionId: session.id,
    amount: parseFloat(amount),
    method,
    notes,
    userId: req.user?.id
  });
  
  // Session.paidAmount já foi atualizado atomicamente dentro da transação
  
  // Buscar sessão atualizada
  const updatedSession = await storage.getSessionById(session.id);
  
  res.json({ 
    payment, 
    session: updatedSession 
  });
});
```

---

## 🗂️ NOVA TABELA: audit_logs

**Arquivo Migration:** `server/migrations/0005_create_audit_logs.sql`

```sql
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_restaurant ON audit_logs(restaurant_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

**Schema TypeScript:**
```typescript
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  restaurantId: integer('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  actorId: integer('actor_id').references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: varchar('entity_id', { length: 255 }).notNull(),
  details: jsonb('details'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

---

## 📊 IMPACTO DAS CORREÇÕES

### Antes
- ❌ Race conditions em pagamentos concorrentes
- ❌ Perda de valores em atualizações simultâneas
- ❌ Fechamento de mesa sem validação adequada
- ❌ Sem auditoria de ações críticas

### Depois
- ✅ Transações atômicas garantem consistência
- ✅ Locks pessimistas previnem race conditions
- ✅ Validação robusta com queries SQL otimizadas
- ✅ Auditoria completa de ações forçadas

---

## 🚀 PASSOS PARA APLICAR

1. Criar migration de audit_logs
2. Atualizar shared/schema.ts com tabela auditLogs
3. Aplicar correções em server/storage.ts
4. Atualizar endpoint em server/routes.ts
5. Testar fluxos críticos
6. Deploy gradual

---

**Status:** ✅ Documentado e pronto para aplicar
