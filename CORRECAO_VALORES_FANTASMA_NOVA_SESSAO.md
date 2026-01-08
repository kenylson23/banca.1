# Correção: Valores Fantasma em Nova Sessão (16.000 Kz)

## 🐛 Problema Reportado

Após fechar uma sessão com pagamento completo e reabrir a mesa, ao adicionar apenas um convidado **SEM fazer pedidos**, o sistema mostrava um valor de **16.000 Kz** no preview.

### Cenário Detalhado:

**Sessão Anterior (Fechada):**
1. Pedidos: 8.000 Kz
2. Desconto 15%: -1.200 Kz
3. Taxa serviço: +2.000 Kz
4. Total pago: 8.800 Kz ✅
5. Sessão fechada com sucesso ✅

**Nova Sessão (Problema):**
1. Mesa reaberta
2. Convidado adicionado
3. **SEM pedidos novos**
4. ❌ Preview mostra: **16.000 Kz** (valor fantasma!)

## 🔍 Causas Identificadas

### 1. Filtro de Pedidos Permissivo Demais

**Arquivo**: `server/routes.ts` (linhas ~4873-4893)

O filtro de pedidos no endpoint `/api/tables/:id/orders-by-guest` tinha duas regras:

```typescript
// ❌ CÓDIGO ANTIGO (PROBLEMA)
const orders = allTableOrders.filter((order: any) => {
  // Regra 1: Pedidos com tableSessionId da sessão atual
  if (order.tableSessionId === table.currentSessionId) {
    return true;
  }
  // Regra 2: Pedidos de convidados da sessão atual
  if (order.guestId && currentGuestIds.includes(order.guestId)) {
    return true; // ❌ PROBLEMA: Inclui pedidos antigos se guestId bater
  }
  return false;
});
```

**Problema**: Se um convidado da sessão antiga tinha o mesmo ID ou se havia pedidos órfãos (sem `tableSessionId`), eles podiam ser incluídos na nova sessão.

### 2. Nova Sessão Não Inicializava Valores Explicitamente

**Arquivo**: `server/storage.ts` (linhas ~1494-1500)

```typescript
// ❌ CÓDIGO ANTIGO
const [session] = await db.insert(tableSessions).values({
  tableId,
  restaurantId,
  customerName: sessionData.customerName,
  customerCount: sessionData.customerCount,
  status: 'ocupada',
  // ❌ FALTANDO: totalAmount, discount, serviceCharge, etc.
}).returning();
```

**Problema**: Campos como `discount`, `serviceCharge`, `totalAmount` podiam herdar valores defaults incorretos ou causar cálculos errados.

## ✅ Soluções Implementadas

### Correção 1: Preview Mostra Valor da Tabela `tables.totalAmount`

**Problema Adicional Descoberto**: O preview das plantas das mesas (componente `TableCard`) busca dados via endpoint `/api/tables/with-orders` que retorna o campo `table.totalAmount` diretamente da tabela `tables`. Esse valor não era zerado ao criar nova sessão.

**Solução**: Atualizar `table.totalAmount = '0'` ao criar nova sessão.

### Correção 2: Filtro Estrito de Pedidos

**Arquivo**: `server/routes.ts` (linhas ~4873-4898)

```typescript
// ✅ CORREÇÃO: Filtrar ESTRITAMENTE por sessão atual
const orders = table.currentSessionId 
  ? allTableOrders.filter((order: any) => {
      // ✅ REGRA 1: APENAS pedidos com tableSessionId da sessão atual
      if (order.tableSessionId === table.currentSessionId) {
        return true;
      }
      
      // ✅ REGRA 2: APENAS pedidos de convidados da sessão atual
      // E que NÃO tenham tableSessionId (pedidos legados)
      if (!order.tableSessionId && order.guestId && currentGuestIds.includes(order.guestId)) {
        return true;
      }
      
      // ❌ EXCLUIR: Todos os outros (sessões antigas, pedidos órfãos, etc)
      return false;
    })
  : []; // Se não há sessão ativa, retornar array vazio
```

**Melhorias**:
- ✅ Verifica explicitamente se há sessão ativa
- ✅ Prioriza `tableSessionId` como fonte de verdade
- ✅ Pedidos legados só entram se não tiverem `tableSessionId` E pertencerem a convidado atual
- ✅ Retorna array vazio se não há sessão (evita valores fantasma)

### Correção 3: Inicialização Explícita de Nova Sessão

**Arquivo**: `server/storage.ts` (linhas ~1494-1540)

```typescript
// ✅ CORREÇÃO: Inicializar nova sessão com valores ZERADOS
const [session] = await db.insert(tableSessions).values({
  tableId,
  restaurantId,
  customerName: sessionData.customerName,
  customerCount: sessionData.customerCount,
  status: 'ocupada',
  totalAmount: '0',
  paidAmount: '0',
  discount: '0',
  discountType: 'valor',
  serviceCharge: '0',
  serviceChargeType: 'percentual',
}).returning();

console.log('[startTableSession] Nova sessão criada:', {
  sessionId: session.id,
  tableId,
  customerName: sessionData.customerName,
  initialValues: {
    totalAmount: '0',
    paidAmount: '0',
    discount: '0',
    serviceCharge: '0'
  }
});

// ✅ CRÍTICO: Atualizar também a coluna table.totalAmount
await db.update(tables)
  .set({
    status: 'ocupada',
    currentSessionId: session.id,
    customerName: sessionData.customerName,
    customerCount: sessionData.customerCount || 0,
    totalAmount: '0', // ✅ Zerar total para preview mostrar 0 Kz
    lastActivity: new Date(),
    isOccupied: 1,
  })
  .where(eq(tables.id, tableId));
```

**Melhorias**:
- ✅ Inicializa TODOS os valores monetários com '0' na sessão
- ✅ **Zera `table.totalAmount`** para preview mostrar valor correto
- ✅ Define tipos padrão (valor/percentual)
- ✅ Log detalhado para debug
- ✅ Evita herança de valores de sessões anteriores

### Correção 4: Debug Melhorado

**Arquivo**: `server/routes.ts` (linhas ~5004-5030)

```typescript
// 🔍 DEBUG: Log dos valores retornados COM ajustes e filtros
console.log(`[orders-by-guest] Mesa ${req.params.id}:`, {
  sessionId: table.currentSessionId,
  allTableOrdersCount: allTableOrders.length,
  filteredOrdersCount: orders.length,
  currentGuestIds,
  ordersBreakdown: orders.map(o => ({
    id: o.id,
    tableSessionId: o.tableSessionId,
    guestId: o.guestId,
    status: o.status,
    total: calculateOrderTotal(o).toFixed(2)
  })),
  subtotalBeforeAdjustments: subtotalBeforeAdjustments.toFixed(2),
  sessionDiscount: sessionDiscount.toFixed(2),
  sessionServiceCharge: sessionServiceCharge.toFixed(2),
  totalAmount: totalAmount.toFixed(2),
  paidAmount: session?.paidAmount || '0.00',
  sessionData: session ? { 
    id: session.id, 
    discount: session.discount,
    serviceCharge: session.serviceCharge,
    paidAmount: session.paidAmount 
  } : null
});
```

**Melhorias**:
- ✅ Mostra contagem de pedidos (total vs filtrados)
- ✅ Lista detalhada de cada pedido incluído
- ✅ Mostra IDs dos convidados atuais
- ✅ Permite identificar rapidamente pedidos órfãos ou de sessões antigas

## 📊 Fluxo Correto Agora

### Fechamento de Sessão:
1. Validação de pagamento completo ✅
2. Pontos de fidelidade atribuídos ✅
3. Sessão marcada como 'encerrada' ✅
4. Mesa resetada: `currentSessionId: null`, `totalAmount: '0'` ✅

### Abertura de Nova Sessão:
1. **Nova sessão criada** com valores zerados ✅
2. Mesa atualizada: `currentSessionId: novo_id` ✅
3. Convidado adicionado ✅
4. **Filtro de pedidos**: Array vazio (sem pedidos) ✅
5. **Total calculado**: 0 Kz ✅

### Cálculo de Total:
```
1. Pedidos filtrados: [] (vazio)
2. Subtotal: 0 Kz
3. Desconto: 0 Kz (nova sessão)
4. Taxa serviço: 0 Kz (nova sessão)
5. TOTAL FINAL: 0 Kz ✅
```

## 🧪 Como Testar

### Teste 1: Nova Sessão Limpa
1. Fechar uma mesa com pagamento completo
2. Reabrir a mesa
3. Adicionar apenas convidado (sem pedidos)
4. ✅ Verificar: Total deve ser **0 Kz**

### Teste 2: Verificar Logs
```bash
# Abrir nova sessão e verificar logs
tail -f /var/log/app.log | grep startTableSession

# Buscar pedidos e verificar filtro
tail -f /var/log/app.log | grep orders-by-guest
```

**Logs esperados:**
```
[startTableSession] Nova sessão criada: {
  sessionId: 'novo_id',
  initialValues: { totalAmount: '0', discount: '0', serviceCharge: '0' }
}

[orders-by-guest] Mesa X: {
  allTableOrdersCount: 5,      // Pedidos históricos da mesa
  filteredOrdersCount: 0,      // ✅ ZERO (nova sessão vazia)
  subtotalBeforeAdjustments: 0.00,
  totalAmount: 0.00
}
```

### Teste 3: Sessão com Pedidos Novos
1. Abrir nova sessão
2. Adicionar convidado
3. Fazer pedido de 5.000 Kz
4. ✅ Verificar: Total deve ser **5.000 Kz** (sem herdar valores antigos)

## 📝 Arquivos Modificados

1. **`server/routes.ts`** (3 locais):
   - Filtro de pedidos (linhas ~4873-4898)
   - Logs de debug (linhas ~5004-5030)
   - Removida chamada desnecessária a `calculateTableTotal` (linha ~3760)

2. **`server/storage.ts`** (1 local):
   - Inicialização de nova sessão (linhas ~1494-1540)
   - ✅ **CRÍTICO**: Agora zera `table.totalAmount` ao criar nova sessão

## 🔍 Por Que 16.000 Kz?

**Resposta**: O valor de 16.000 Kz era o **dobro** do valor da sessão anterior (8.000 Kz × 2). Isso acontecia porque:

1. **`table.totalAmount` não era zerado** ao criar nova sessão
2. O valor persistia de sessões antigas na coluna `tables.totalAmount`
3. O preview mostrava esse valor antigo (possivelmente duplicado por cache ou cálculo incorreto)

## 🎯 Impacto

### Antes:
- ❌ Nova sessão mostrava valores fantasma (16.000 Kz)
- ❌ Pedidos de sessões antigas incluídos por engano
- ❌ Campos não inicializados podiam causar bugs

### Depois:
- ✅ Nova sessão sempre inicia com **0 Kz**
- ✅ Apenas pedidos da sessão atual são incluídos
- ✅ Valores explicitamente inicializados
- ✅ Logs detalhados facilitam debug
- ✅ Comportamento previsível e correto

## 🔗 Correções Relacionadas

Esta correção complementa:
- ✅ **Correção anterior**: Cálculo de totais com desconto + taxa ([CORRECAO_CALCULO_TOTAL_MESAS.md](CORRECAO_CALCULO_TOTAL_MESAS.md))
- ✅ Validação de fechamento de sessão
- ✅ Sincronização de pagamentos

## 🎉 Resultado Final

**Problema resolvido!** O sistema agora:
- ✅ **Zera `table.totalAmount`** ao criar nova sessão (preview mostra 0 Kz)
- ✅ Isola completamente sessões antigas das novas
- ✅ Filtra pedidos de forma estrita por `tableSessionId`
- ✅ Inicializa novas sessões com valores zerados (sessão + mesa)
- ✅ Fornece logs detalhados para diagnóstico
- ✅ Previne "vazamento" de valores entre sessões

### Teste Rápido:
1. Fechar mesa com pagamento completo ✅
2. Reabrir mesa (nova sessão) ✅
3. Adicionar convidado SEM pedidos ✅
4. **Verificar preview**: Deve mostrar **0 Kz** ✅

---
**Data da Correção**: 2026-01-06  
**Arquivos Modificados**: 
- `server/routes.ts` (linhas ~4873-4898, ~5004-5030)
- `server/storage.ts` (linhas ~1494-1520)
