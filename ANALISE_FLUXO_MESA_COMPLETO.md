# Análise Completa: Fluxo de Ocupação até Fechamento de Mesa

## 📊 Status da Análise: EM ANDAMENTO

---

## 1️⃣ FLUXO DE OCUPAÇÃO DE MESA

### ✅ Cenário 1: Cliente escaneia QR Code (Auto-Abertura)
**Arquivo:** `server/routes.ts` linha 2797-2800

```typescript
// ✅ ABRIR MESA AUTOMATICAMENTE se estiver livre
if (table.status === 'livre') {
  await storage.openTable(validatedOrder.tableId, validatedOrder.customerCount);
  console.log(`[TABLE] Mesa ${table.number} aberta automaticamente via QR Code`);
}
```

**✅ FUNCIONA:** Quando cliente faz pedido via QR Code, mesa é aberta automaticamente.

---

### ✅ Cenário 2: Garçom abre mesa manualmente
**Arquivo:** `server/routes.ts` linha 3680-3705

```typescript
app.post("/api/tables/:id/start-session", isAdmin, async (req, res) => {
  const session = await storage.startTableSession(restaurantId, req.params.id, {
    customerName,
    customerCount,
  });
  
  await storage.calculateTableTotal(restaurantId, req.params.id);
  await storage.autoUpdateTableStatusOnSessionStart(req.params.id);
  
  broadcastToClients({ type: 'table_session_started', data: session });
```

**✅ FUNCIONA:** 
- Cria sessão de mesa
- Calcula total inicial
- Atualiza status automaticamente
- Notifica via WebSocket

---

## 2️⃣ VINCULAÇÃO DE PEDIDOS A GUESTS

### ❌ PROBLEMA CRÍTICO: Pedidos NÃO são vinculados a guests

**Schema:** `shared/schema.ts` linha 1397
```typescript
export const orderItems = pgTable("order_items", {
  // ... outros campos
  guestId: varchar("guest_id").references(() => tableGuests.id, { onDelete: 'set null' }),
  // ...
});
```

**Campo existe no schema:** ✅ `orderItems.guestId`  
**Problema:** ❌ Campo NUNCA é populado durante criação de pedido

### Análise: Criação de Pedidos Públicos
**Arquivo:** `server/routes.ts` linha 2764-2950

```typescript
app.post("/api/public/orders", async (req, res) => {
  // ... validação
  
  const order = await storage.createOrder(validatedOrder, verifiedItems);
  
  // ❌ PROBLEMA: verifiedItems não inclui guestId
  // Items são criados SEM vinculação ao guest
```

### ❌ GAP IDENTIFICADO:
1. **Cliente escaneia QR Code** → Faz pedido
2. **Sistema cria order** → ✅ OK
3. **Sistema cria orderItems** → ❌ SEM guestId
4. **Resultado:** Impossível saber quem pediu o quê!

---

## 3️⃣ CÁLCULO DE SUBTOTAIS POR GUEST

### ❌ PROBLEMA CRÍTICO: Subtotais NUNCA são calculados

**Schema:** `shared/schema.ts` linha 752
```typescript
export const tableGuests = pgTable("table_guests", {
  // ...
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull().default('0'),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).notNull().default('0'),
  // ...
});
```

**Campos existem:** ✅ `subtotal` e `paidAmount`  
**Problema:** ❌ NUNCA são atualizados automaticamente

### Busca no Código:
```bash
grep -n "updateGuestSubtotal" server/storage.ts
# ❌ RESULTADO: Nenhuma função encontrada!
```

### ❌ GAP IDENTIFICADO:
1. Guest é adicionado → `subtotal = 0`
2. Pedidos são feitos → `subtotal` continua 0
3. Checkout individual → Não sabe quanto cobrar!

---

## 4️⃣ CÁLCULO TOTAL DA MESA

### ✅ FUNCIONA (Parcialmente)
**Arquivo:** `server/storage.ts` linha 1581-1612

```typescript
async calculateTableTotal(restaurantId: string, tableId: string): Promise<number> {
  const tableOrders = await db.select()
    .from(orders)
    .where(and(
      eq(orders.tableId, tableId),
      eq(orders.restaurantId, restaurantId),
      or(
        eq(orders.status, 'pendente'),
        eq(orders.status, 'em_preparo'),
        eq(orders.status, 'pronto')
      )
    ));

  const total = tableOrders.reduce((sum: number, order: Order) => {
    return sum + parseFloat(order.totalAmount || '0');
  }, 0);

  await db.update(tables)
    .set({ totalAmount: total.toFixed(2) })
    .where(eq(tables.id, tableId));

  // ✅ Atualiza também a sessão
  if (tableOrders.length > 0) {
    const table = await this.getTableById(tableId);
    if (table?.currentSessionId) {
      await db.update(tableSessions)
        .set({ totalAmount: total.toFixed(2) })
        .where(eq(tableSessions.id, table.currentSessionId));
    }
  }

  return total;
}
```

**✅ FUNCIONA:**
- Soma todos os pedidos da mesa
- Atualiza `tables.totalAmount`
- Atualiza `tableSessions.totalAmount`

**⚠️ LIMITAÇÃO:**
- Calcula apenas total geral
- NÃO distribui por guest

---

## 5️⃣ CHECKOUT INDIVIDUAL (Guest Payment)

### ✅ IMPLEMENTADO (Nova Feature)
**Arquivo:** `server/routes.ts` linha 4255-4355

```typescript
app.post("/api/tables/:id/guests/:guestId/checkout", isCashierOrAbove, async (req, res) => {
  // ✅ Resgata pontos de fidelidade
  // ✅ Registra pagamento
  // ✅ Atualiza guest.paidAmount
  // ✅ Atualiza guest.status
  // ✅ Credita pontos ganhos
```

**✅ FUNCIONA BEM, MAS:**
- Depende de `guest.subtotal` estar correto
- ❌ Como `subtotal` nunca é calculado, esta feature está QUEBRADA

---

## 6️⃣ DIVISÃO DE CONTA

### ⚠️ PARCIALMENTE IMPLEMENTADO
**Arquivo:** `server/routes.ts` linha 4421-4508

```typescript
// GET /api/tables/:id/bill-splits
// POST /api/tables/:id/bill-splits
// PATCH /api/tables/:id/bill-splits/:splitId
// POST /api/tables/:id/bill-splits/:splitId/finalize
```

**Features:**
- ✅ Criar divisão de conta
- ✅ Tipos: igual, por_pessoa, personalizado
- ✅ Alocações manuais

**⚠️ PROBLEMA:**
- Sistema permite divisão manual
- ❌ MAS não sabe automaticamente quanto cada guest consumiu
- Depende de input manual do garçom

---

## 🔴 PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. **Pedidos Órfãos - Sem Vinculação a Guests**
**Impacto:** ALTO 🔴
- Pedidos via QR Code não são vinculados ao guest automaticamente
- Impossível rastrear consumo individual
- Checkout individual não funciona corretamente

**Causa Raiz:**
```typescript
// ❌ Quando cliente faz pedido, não há como saber qual guest ele é
// Fluxo atual:
// 1. Cliente escaneia QR → Acessa menu
// 2. Faz pedido → Cria order
// 3. ❌ Sistema NÃO sabe qual guest fez o pedido
```

---

### 2. **Subtotais Nunca Calculados**
**Impacto:** ALTO 🔴
- `guest.subtotal` sempre permanece 0
- Checkout individual não sabe quanto cobrar
- Relatórios por pessoa não funcionam

**Funções Faltantes:**
```typescript
// ❌ NÃO EXISTE:
async updateGuestSubtotal(guestId: string): Promise<void>
async recalculateGuestSubtotals(sessionId: string): Promise<void>
```

---

### 3. **Falta de Trigger para Atualização Automática**
**Impacto:** MÉDIO 🟡
- Quando novo pedido é criado → Subtotal não atualiza
- Quando item é cancelado → Subtotal não atualiza
- Quando pedido é modificado → Subtotal não atualiza

---

### 4. **Sem Mecanismo de Auto-Link Guest ao Fazer Pedido**
**Impacto:** ALTO 🔴

**Cenário Problemático:**
```
1. Cliente João escaneia QR Code da Mesa 5
2. Sistema: "Bem-vindo João!" (via useAutoDetectCustomer)
3. João vinculado como guest na mesa ✅
4. João faz pedido de Hambúrguer
5. ❌ PROBLEMA: Pedido criado SEM guestId
6. Sistema não sabe que o Hambúrguer é do João!
```

---

### 5. **Checkout Individual Quebrado**
**Impacto:** ALTO 🔴

```typescript
// Rota existe e está implementada ✅
POST /api/tables/:id/guests/:guestId/checkout

// MAS depende de:
const pending = guest.subtotal - guest.paidAmount;

// ❌ Como subtotal = 0, checkout sempre falha!
```

---

### 6. **Sem Validação de Fechamento de Mesa**
**Impacto:** MÉDIO 🟡
- Não há verificação se todos os guests pagaram
- Mesa pode ser fechada com pendências
- Sem alerta de valores não pagos

---

## 📋 FLUXO ATUAL vs FLUXO ESPERADO

### Fluxo ATUAL (Problemático):
```
1. Mesa aberta ✅
2. Guest adicionado (subtotal=0) ✅
3. Cliente faz pedido ✅
4. ❌ Pedido SEM guestId
5. ❌ Subtotal permanece 0
6. ❌ Checkout individual falha
7. ❌ Garçom não sabe quanto cobrar de cada pessoa
```

### Fluxo ESPERADO (Correto):
```
1. Mesa aberta ✅
2. Guest adicionado (subtotal=0) ✅
3. Cliente faz pedido ✅
4. ✅ Sistema vincula pedido ao guest (guestId)
5. ✅ Sistema atualiza guest.subtotal automaticamente
6. ✅ Checkout individual mostra valor correto
7. ✅ Garçom vê consumo de cada pessoa
8. ✅ Mesa só fecha quando todos pagarem
```

---

## 🔍 ANÁLISE CONTINUANDO...

### Próximos Pontos a Verificar:
- [ ] Fluxo de fechamento de mesa/sessão
- [ ] Validações de pagamento total
- [ ] Lógica de reconciliação de valores
- [ ] Tratamento de pedidos cancelados
- [ ] Sincronização de totais

**Status:** Análise 50% completa

---

## 7️⃣ FECHAMENTO DE MESA E SESSÃO

### ✅ Rotas de Fechamento Implementadas
**Arquivo:** `server/routes.ts` linha 3708-3798

#### Rota 1: `POST /api/tables/:id/end-session` (Admin only)
```typescript
await storage.endTableSession(restaurantId, req.params.id);
await storage.autoUpdateTableStatusOnSessionEnd(req.params.id);
```
**✅ FUNCIONA:** Fecha sessão simples

#### Rota 2: `POST /api/tables/:id/close-session` (Operational)
```typescript
// ✅ BÔNUS: Credita pontos de fidelidade ao fechar
const guests = await storage.getTableGuests(table.currentSessionId);
for (const guest of guests) {
  if (guest.customerId && guest.subtotal > 0) {
    const pointsEarned = Math.floor(subtotalAmount * pointsPerCurrency);
    await storage.createLoyaltyTransaction(...);
  }
}
```

**⚠️ PROBLEMA DETECTADO:**
- Linha 3758: Usa `guest.subtotal` para calcular pontos
- ❌ Como `subtotal` nunca é calculado, pontos NUNCA são creditados!

---

## 8️⃣ VALIDAÇÃO DE FECHAMENTO

### ❌ PROBLEMA: Sem Validação de Pendências
```typescript
// Código atual:
await storage.endTableSession(restaurantId, req.params.id);

// ❌ Não verifica:
// - Se todos os guests pagaram
// - Se há saldo pendente
// - Se todos os pedidos foram servidos
```

### ❌ GAP: Mesa pode fechar com dívidas
```
Mesa 5: Total = 15.000 Kz
- Guest 1 (João): consumiu 8.000 Kz, pagou 0 Kz
- Guest 2 (Maria): consumiu 7.000 Kz, pagou 0 Kz

❌ Sistema permite fechar sem pagamento!
```

---

## 🔴 RESUMO DOS PROBLEMAS CRÍTICOS

### 1. **Pedidos Órfãos** 🔴 CRÍTICO
**Status:** ❌ NÃO FUNCIONA  
**Impacto:** Sistema híbrido completamente quebrado

**Problema:**
- `orderItems.guestId` existe mas nunca é populado
- Cliente faz pedido via QR Code → Sistema não sabe quem pediu
- Impossível rastrear consumo individual

**Solução Necessária:**
```typescript
// Ao criar pedido público, precisa:
1. Identificar qual guest está fazendo o pedido (via token/session)
2. Popular orderItems.guestId durante criação
3. Atualizar guest.subtotal automaticamente
```

---

### 2. **Subtotais Nunca Calculados** 🔴 CRÍTICO
**Status:** ❌ NÃO FUNCIONA  
**Impacto:** Checkout individual, pontos de fidelidade, relatórios - TUDO quebrado

**Problema:**
- `guest.subtotal` sempre = 0
- Função `updateGuestSubtotal()` NÃO EXISTE
- Sem triggers para atualização automática

**Solução Necessária:**
```typescript
// Criar funções no storage.ts:
async updateGuestSubtotal(guestId: string): Promise<void> {
  // Soma todos os orderItems vinculados ao guest
  const items = await db.select()
    .from(orderItems)
    .where(eq(orderItems.guestId, guestId));
  
  const total = items.reduce((sum, item) => 
    sum + (parseFloat(item.price) * item.quantity), 0
  );
  
  await db.update(tableGuests)
    .set({ subtotal: total.toFixed(2) })
    .where(eq(tableGuests.id, guestId));
}

// Chamar após:
- Criar novo pedido
- Cancelar pedido
- Modificar quantidade
- Mover item entre guests
```

---

### 3. **Auto-Link Guest ao Pedido** 🔴 CRÍTICO
**Status:** ❌ NÃO IMPLEMENTADO  
**Impacto:** Fluxo QR Code quebrado

**Problema:**
```typescript
// Fluxo atual:
1. Cliente João escaneia QR → useAutoDetectCustomer vincula à mesa ✅
2. João faz pedido → POST /api/public/orders ✅
3. ❌ Sistema não sabe que o pedido é do João!

// Falta:
- Passar guestId no request do pedido
- Ou criar guest automaticamente se não existir
- Ou vincular via customerAuth token
```

**Solução Necessária:**
```typescript
// Opção A: Frontend envia guestId
POST /api/public/orders
{
  guestId: "xxx", // ← Adicionar este campo
  tableId: "yyy",
  items: [...]
}

// Opção B: Backend detecta via customer auth
// Se customerId está autenticado, buscar guest vinculado
if (validatedOrder.customerId && validatedOrder.tableId) {
  const table = await storage.getTableById(validatedOrder.tableId);
  if (table.currentSessionId) {
    const guest = await findGuestByCustomerId(
      table.currentSessionId, 
      validatedOrder.customerId
    );
    validatedOrder.guestId = guest?.id;
  }
}
```

---

### 4. **Checkout Individual Quebrado** 🔴 CRÍTICO
**Status:** ⚠️ IMPLEMENTADO MAS NÃO FUNCIONA  
**Impacto:** Feature principal quebrada

**Problema:**
```typescript
// Rota existe (linha 4255):
POST /api/tables/:id/guests/:guestId/checkout

// Mas:
const pending = guest.subtotal - guest.paidAmount;
// Como subtotal = 0, sempre retorna 0!

// Resultado:
// - Não sabe quanto cobrar
// - Checkout sempre falha ou cobra errado
// - Pontos não são creditados corretamente
```

---

### 5. **Pontos de Fidelidade Não Creditados** 🟡 ALTO
**Status:** ❌ NÃO FUNCIONA  
**Impacto:** Programa de fidelidade quebrado

**Problema:**
```typescript
// Ao fechar mesa (linha 3758):
if (guest.customerId && guest.subtotal > 0) {
  const pointsEarned = Math.floor(subtotal * pointsPerCurrency);
  // ❌ Como subtotal = 0, nunca entra aqui!
}

// Ao fazer checkout individual (linha 4323):
pointsAwarded = Math.floor(paymentAmount * pointsPerCurrency);
// ✅ Credita pontos, MAS valor pode estar errado
```

**Depende de:** Corrigir subtotais (#2)

---

### 6. **Sem Validação de Fechamento** 🟡 MÉDIO
**Status:** ❌ NÃO VALIDADO  
**Impacto:** Mesas fecham com pendências

**Problema:**
- Mesa pode fechar sem verificar se todos pagaram
- Não alerta sobre valores pendentes
- Sem reconciliação de totais

**Solução Necessária:**
```typescript
async validateSessionClosure(sessionId: string): Promise<{
  canClose: boolean;
  pendingAmount: number;
  unpaidGuests: Guest[];
}> {
  const guests = await this.getTableGuests(sessionId);
  const session = await this.getSessionById(sessionId);
  
  let totalPending = 0;
  const unpaidGuests = [];
  
  for (const guest of guests) {
    const pending = parseFloat(guest.subtotal) - parseFloat(guest.paidAmount);
    if (pending > 0.01) {
      totalPending += pending;
      unpaidGuests.push(guest);
    }
  }
  
  return {
    canClose: totalPending <= 0,
    pendingAmount: totalPending,
    unpaidGuests
  };
}
```

---

### 7. **Divisão de Conta Manual** 🟡 MÉDIO
**Status:** ⚠️ FUNCIONA MAS LIMITADO  
**Impacto:** Garçom precisa fazer divisão manual

**Problema:**
- Sistema permite divisão manual ✅
- MAS não sugere divisão automática baseada no consumo
- Garçom não sabe quanto cada guest consumiu

**Solução:**
```typescript
// Adicionar função:
async suggestBillSplit(sessionId: string): Promise<BillSplitSuggestion> {
  const guests = await this.getTableGuests(sessionId);
  
  return {
    splitType: 'por_pessoa',
    allocations: guests.map(g => ({
      guestId: g.id,
      guestName: g.name,
      amount: g.subtotal, // ← Depende de subtotais corretos
      percentage: (parseFloat(g.subtotal) / totalSession) * 100
    }))
  };
}
```

---

## 📊 MATRIZ DE DEPENDÊNCIAS

```
Problema 1 (Pedidos Órfãos)
    ↓ bloqueia
Problema 2 (Subtotais)
    ↓ bloqueia
Problema 4 (Checkout Individual)
Problema 5 (Pontos Fidelidade)
Problema 7 (Divisão Conta)
```

**Ordem de Implementação:**
1. ✅ Vincular pedidos a guests (guestId)
2. ✅ Calcular subtotais automaticamente
3. ✅ Corrigir checkout individual
4. ✅ Corrigir pontos de fidelidade
5. ✅ Adicionar validação de fechamento
6. ✅ Melhorar divisão de conta

---

## 🔧 CORREÇÕES NECESSÁRIAS

### FASE 1: Vinculação de Pedidos (CRÍTICO)

#### 1.1 Modificar Schema de Criação de Pedido Público
**Arquivo:** `shared/schema.ts`

```typescript
export const publicOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  orderId: true,
  createdAt: true,
}).extend({
  guestId: z.string().optional(), // ← ADICIONAR
  selectedOptions: z.array(z.object({
    // ... existente
  })).optional().default([]),
});
```

#### 1.2 Adicionar Auto-Detecção de Guest
**Arquivo:** `server/routes.ts` linha ~2765

```typescript
app.post("/api/public/orders", async (req, res) => {
  // ... código existente
  
  // ✅ NOVO: Detectar guest automaticamente
  let detectedGuestId = null;
  if (validatedOrder.tableId && validatedOrder.customerId) {
    const table = await storage.getTableById(validatedOrder.tableId);
    if (table?.currentSessionId) {
      // Buscar guest vinculado ao cliente autenticado
      const guests = await storage.getTableGuests(table.currentSessionId);
      const linkedGuest = guests.find(g => g.customerId === validatedOrder.customerId);
      detectedGuestId = linkedGuest?.id;
      
      // Se não existe guest, criar automaticamente
      if (!linkedGuest) {
        const customer = await storage.getCustomerById(validatedOrder.customerId);
        const newGuest = await storage.createTableGuest(validatedOrder.restaurantId, {
          sessionId: table.currentSessionId,
          tableId: table.id,
          customerId: validatedOrder.customerId,
          name: customer.name,
        });
        detectedGuestId = newGuest.id;
      }
    }
  }
  
  // Aplicar guestId aos items
  const itemsWithGuest = verifiedItems.map(item => ({
    ...item,
    guestId: item.guestId || detectedGuestId // Frontend pode override
  }));
  
  const order = await storage.createOrder(validatedOrder, itemsWithGuest);
  // ...
});
```

---

### FASE 2: Cálculo de Subtotais (CRÍTICO)

#### 2.1 Criar Função de Atualização
**Arquivo:** `server/storage.ts`

```typescript
async updateGuestSubtotal(guestId: string): Promise<void> {
  // Buscar todos os order items do guest
  const items = await db.select()
    .from(orderItems)
    .leftJoin(orders, eq(orderItems.orderId, orders.id))
    .where(
      and(
        eq(orderItems.guestId, guestId),
        // Apenas pedidos ativos (não cancelados)
        or(
          eq(orders.status, 'pendente'),
          eq(orders.status, 'em_preparo'),
          eq(orders.status, 'pronto'),
          eq(orders.status, 'servido')
        )
      )
    );
  
  // Calcular subtotal
  const subtotal = items.reduce((sum, row) => {
    if (row.order_items) {
      const itemTotal = parseFloat(row.order_items.price) * row.order_items.quantity;
      return sum + itemTotal;
    }
    return sum;
  }, 0);
  
  // Atualizar guest
  await db.update(tableGuests)
    .set({ 
      subtotal: subtotal.toFixed(2),
      updatedAt: new Date()
    })
    .where(eq(tableGuests.id, guestId));
  
  console.log(`✅ Updated guest ${guestId} subtotal: ${subtotal.toFixed(2)} Kz`);
}

async recalculateSessionSubtotals(sessionId: string): Promise<void> {
  const guests = await this.getTableGuests(sessionId);
  
  for (const guest of guests) {
    await this.updateGuestSubtotal(guest.id);
  }
  
  console.log(`✅ Recalculated subtotals for ${guests.length} guests in session ${sessionId}`);
}
```

#### 2.2 Chamar Após Operações de Pedido
**Arquivo:** `server/storage.ts` linha ~2120

```typescript
async createOrder(orderData: any, items: any[]): Promise<Order> {
  // ... código existente de criação
  
  // ✅ NOVO: Atualizar subtotais dos guests
  const guestsToUpdate = new Set<string>();
  for (const item of insertedItems) {
    if (item.guestId) {
      guestsToUpdate.add(item.guestId);
    }
  }
  
  for (const guestId of guestsToUpdate) {
    await this.updateGuestSubtotal(guestId);
  }
  
  // Atualizar total da mesa
  if (order.tableId) {
    await this.calculateTableTotal(restaurantId, order.tableId);
  }
  
  return newOrder;
}
```

---

### FASE 3: Validação de Fechamento (ALTO)

#### 3.1 Criar Função de Validação
**Arquivo:** `server/storage.ts`

```typescript
async validateSessionClosure(sessionId: string): Promise<{
  canClose: boolean;
  totalPending: number;
  unpaidGuests: Array<{ id: string; name: string; pending: number }>;
  warnings: string[];
}> {
  const guests = await this.getTableGuests(sessionId);
  const session = await db.select()
    .from(tableSessions)
    .where(eq(tableSessions.id, sessionId))
    .then(rows => rows[0]);
  
  let totalPending = 0;
  const unpaidGuests = [];
  const warnings = [];
  
  for (const guest of guests) {
    const subtotal = parseFloat(guest.subtotal || '0');
    const paid = parseFloat(guest.paidAmount || '0');
    const pending = subtotal - paid;
    
    if (pending > 0.01) { // Tolera 1 centavo de diferença
      totalPending += pending;
      unpaidGuests.push({
        id: guest.id,
        name: guest.name || `Convidado ${guest.guestNumber || '?'}`,
        pending
      });
    }
  }
  
  // Verificar reconciliação
  const sessionTotal = parseFloat(session?.totalAmount || '0');
  const sessionPaid = parseFloat(session?.paidAmount || '0');
  const sessionPending = sessionTotal - sessionPaid;
  
  if (Math.abs(sessionPending - totalPending) > 0.10) {
    warnings.push(`Diferença de reconciliação: ${Math.abs(sessionPending - totalPending).toFixed(2)} Kz`);
  }
  
  return {
    canClose: totalPending <= 0,
    totalPending,
    unpaidGuests,
    warnings
  };
}
```

#### 3.2 Aplicar Validação nas Rotas
**Arquivo:** `server/routes.ts` linha ~3732

```typescript
app.post("/api/tables/:id/close-session", isOperational, async (req, res) => {
  // ... código existente
  
  // ✅ NOVO: Validar antes de fechar
  const validation = await storage.validateSessionClosure(table.currentSessionId);
  
  if (!validation.canClose && !req.body.forceClose) {
    return res.status(400).json({
      message: "Mesa possui valores pendentes",
      pendingAmount: validation.totalPending,
      unpaidGuests: validation.unpaidGuests,
      warnings: validation.warnings,
      canForceClose: currentUser.role === 'admin' || currentUser.role === 'manager'
    });
  }
  
  // Continuar com fechamento...
});
```

---

### FASE 4: Melhorias UX

#### 4.1 Endpoint para Sugestão de Divisão
**Arquivo:** `server/routes.ts`

```typescript
app.get("/api/tables/:id/suggest-split", isCashierOrAbove, async (req, res) => {
  try {
    const table = await storage.getTableById(req.params.id);
    if (!table?.currentSessionId) {
      return res.status(400).json({ message: "Mesa sem sessão ativa" });
    }
    
    const guests = await storage.getTableGuests(table.currentSessionId);
    const session = await storage.getSessionById(table.currentSessionId);
    
    const totalSession = parseFloat(session.totalAmount || '0');
    
    const suggestion = {
      splitType: 'por_pessoa' as const,
      totalAmount: totalSession,
      allocations: guests.map(g => ({
        guestId: g.id,
        guestName: g.name || `Convidado ${g.guestNumber || ''}`,
        amount: parseFloat(g.subtotal || '0'),
        percentage: totalSession > 0 
          ? (parseFloat(g.subtotal || '0') / totalSession) * 100 
          : 0,
        isPaid: parseFloat(g.paidAmount || '0') >= parseFloat(g.subtotal || '0')
      }))
    };
    
    res.json(suggestion);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Prioridade CRÍTICA 🔴
- [ ] 1.1 Adicionar guestId ao publicOrderItemSchema
- [ ] 1.2 Implementar auto-detecção de guest ao criar pedido
- [ ] 2.1 Criar função updateGuestSubtotal()
- [ ] 2.2 Chamar updateGuestSubtotal após criar/cancelar pedidos
- [ ] 2.3 Adicionar recalculateSessionSubtotals()

### Prioridade ALTA 🟡
- [ ] 3.1 Criar função validateSessionClosure()
- [ ] 3.2 Aplicar validação nas rotas de fechamento
- [ ] 3.3 Adicionar botão "Forçar Fechamento" (admin only)
- [ ] 4.1 Criar endpoint GET /suggest-split
- [ ] 4.2 Integrar sugestão no frontend

### Prioridade MÉDIA 🟢
- [ ] Adicionar logs de auditoria para mudanças em subtotais
- [ ] Criar relatório de reconciliação de valores
- [ ] Adicionar testes automatizados para fluxo completo
- [ ] Documentar fluxo corrigido

---

## 🎯 IMPACTO DAS CORREÇÕES

### Antes (Estado Atual):
```
❌ Pedidos órfãos (sem guest)
❌ Subtotais sempre zerados
❌ Checkout individual quebrado
❌ Pontos de fidelidade não creditados
❌ Divisão de conta manual sem sugestões
❌ Mesas fecham com pendências
```

### Depois (Com Correções):
```
✅ Pedidos vinculados automaticamente ao guest
✅ Subtotais calculados em tempo real
✅ Checkout individual funcionando perfeitamente
✅ Pontos de fidelidade creditados corretamente
✅ Divisão de conta com sugestão automática
✅ Validação de pendências antes de fechar
✅ Sistema híbrido totalmente funcional
```

---

## 📈 ESTIMATIVA DE ESFORÇO

**Desenvolvimento:** 12-16 horas
- Fase 1 (Vinculação): 4-5h
- Fase 2 (Subtotais): 3-4h
- Fase 3 (Validação): 2-3h
- Fase 4 (UX): 2-3h
- Testes: 1-2h

**Risco:** Médio
- Mudanças em fluxo crítico
- Requer testes extensivos
- Pode impactar pedidos em andamento

**Recomendação:** Implementar em ambiente de staging primeiro

---

## 🎉 CONCLUSÃO

A análise identificou **7 problemas críticos e de alto impacto** no fluxo de ocupação até fechamento de mesa.

O sistema híbrido de guests está **implementado pela metade**:
- ✅ Estrutura de dados existe
- ✅ Rotas básicas funcionam
- ❌ Lógica de vinculação AUSENTE
- ❌ Cálculos automáticos AUSENTES
- ❌ Validações AUSENTES

**Prioridade:** URGENTE 🚨
O sistema de checkout individual e pontos de fidelidade **NÃO FUNCIONA** sem estas correções.

