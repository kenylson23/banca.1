# Análise: Pedido de Convidado Não Aparece

## 🔴 Problema Identificado

Ao criar um pedido para um convidado na mesa através do `TableOrderDialog`, o pedido **não é reconhecido nem aparece** no diálogo de gestão de mesas (`TableDetailsDialog`).

## 🔍 Causa Raiz (REAL)

O componente `TableOrderDialog` estava enviando `guestId` no **nível incorreto**:

### ❌ Implementação INCORRETA (Antes)
```typescript
return apiRequest('POST', '/api/orders', {
  tableId: table.id,
  orderType: 'mesa',
  guestId: selectedGuest,  // ❌ ERRADO: guestId no nível do pedido
  items: orderItems,       // ❌ Items sem guestId
});
```

### ✅ Implementação CORRETA (Depois)
```typescript
const orderItems = cartItems.map(item => ({
  menuItemId: item.menuItem.id,
  quantity: item.quantity,
  price: totalPrice,
  guestId: selectedGuest || undefined,  // ✅ CORRETO: guestId em cada item
  selectedOptions: [...],
}));

return apiRequest('POST', '/api/orders', {
  tableId: table.id,
  orderType: 'mesa',
  // guestId removido daqui
  items: orderItems,  // ✅ Items COM guestId
});
```

### Por que o Backend Não Reconhecia o Pedido?

O backend processa `guestId` apenas quando ele vem **dentro dos items**:

```typescript
// server/storage.ts - createOrder() - Linha 2485
// ✅ Backend procura guestId nos ITEMS
const guestsToUpdate = new Set<string>();
for (const itemData of items) {
  if (itemData.guestId) {  // ← Procura aqui
    guestsToUpdate.add(itemData.guestId);
  }
}

if (guestsToUpdate.size > 0) {
  for (const guestId of guestsToUpdate) {
    await this.updateGuestSubtotal(guestId);  // Atualiza subtotal do guest
  }
}
```

### Schemas Suportam Ambos, Mas Backend Só Usa Items

```typescript
// shared/schema.ts
export const insertOrderSchema = {
  guestId: z.string().optional().nullable(),  // ⚠️ Aceito mas NÃO usado
  // ...
}

export const publicOrderItemSchema = {
  guestId: z.string().optional(),  // ✅ Este é usado pelo backend
  // ...
}
```

### Comparação com Componentes Corretos

#### ✅ SpeedDialMenu (CORRETO)
```typescript
// client/src/components/SpeedDialMenu.tsx - Linha 78
onSuccess: ({ product }) => {
  queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/orders-by-guest`] });
  queryClient.invalidateQueries({ queryKey: ['tables'] });
  onOrderCreated?.();
}
```

#### ✅ QuickOrderDialog (CORRETO)
```typescript
// client/src/components/QuickOrderDialog.tsx - Linha 293
queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/orders-by-guest`] });
```

#### ✅ TableDetailsDialog (CORRETO)
```typescript
// client/src/components/TableDetailsDialog.tsx - Linha 2794
queryClient.invalidateQueries({ queryKey: [`/api/tables/${table.id}/orders-by-guest`] });
```

## 📊 Impacto

### O que acontece:
1. ✅ Pedido é criado com sucesso no backend
2. ✅ Pedido é vinculado ao `guestId` correto
3. ✅ Backend processa tudo corretamente
4. ❌ **Frontend não atualiza a query** `/api/tables/${tableId}/orders-by-guest`
5. ❌ **Diálogo não mostra o novo pedido** até refresh manual

### Queries Afetadas:
- `TableDetailsDialog` usa: `/api/tables/${table.id}/orders-by-guest`
- `TableCheckoutDialog` usa: `/api/tables/${id}/orders-by-guest`
- `BillSplitPanel` depende desta query
- `GuestsList` depende desta query

## 🔧 Soluções Aplicadas

### 1. ✅ Mover `guestId` para dentro dos items (PRINCIPAL)

```typescript
// client/src/components/tables/TableOrderDialog.tsx - Linha 242
const orderItems = cartItems.map(item => {
  const itemPrice = parseFloat(item.menuItem.price);
  const optionsPrice = item.selectedOptions.reduce((sum, opt) => {
    return sum + parseFloat(opt.priceAdjustment) * opt.quantity;
  }, 0);
  const totalPrice = (itemPrice + optionsPrice).toFixed(2);

  return {
    menuItemId: item.menuItem.id,
    quantity: item.quantity,
    price: totalPrice,
    // ✅ FIX: guestId must be inside each item, not at order level
    guestId: selectedGuest || undefined,  // ← ADICIONADO
    selectedOptions: item.selectedOptions.map(opt => ({
      optionId: opt.optionId,
      optionName: opt.optionName,
      optionGroupName: opt.optionGroupName,
      priceAdjustment: opt.priceAdjustment,
      quantity: opt.quantity,
    })),
  };
});

return apiRequest('POST', '/api/orders', {
  restaurantId: currentUser?.restaurantId || table.restaurantId,
  tableId: table.id,
  orderType: 'mesa',
  // ❌ REMOVED: guestId at order level doesn't work
  // guestId: selectedGuest,  // ← REMOVIDO
  items: orderItems,
});
```

### 2. ✅ Adicionar invalidação da query (SECUNDÁRIO - já estava corrigido)

```typescript
// client/src/components/tables/TableOrderDialog.tsx - Linha 268
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
  queryClient.invalidateQueries({ queryKey: ['/api/tables'] });
  queryClient.invalidateQueries({ queryKey: ['/api/tables/open'] });
  queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
  // ✅ FIX: Invalidate orders-by-guest to show new order immediately
  queryClient.invalidateQueries({ queryKey: [`/api/tables/${table.id}/orders-by-guest`] });
  // ...
},
```

## ✅ Verificações Backend (OK)

### 1. Endpoint POST /api/orders (Linha 5632)
- ✅ Aceita `guestId` no corpo do pedido
- ✅ Passa para `storage.createOrder()`

### 2. storage.createOrder() (Linha 2388)
- ✅ Recebe e processa `guestId` nos items
- ✅ Vincula items ao guest via `guestId`
- ✅ Atualiza subtotais dos guests

### 3. Endpoint GET /api/tables/:id/orders-by-guest (Linha 4423)
- ✅ Retorna pedidos agrupados por guest
- ✅ Inclui items com preços corretos
- ✅ Calcula subtotais por guest

## 📝 Resumo

**Problema:** Pedido criado mas não vinculado ao convidado  
**Causa:** `guestId` enviado no nível do pedido em vez dos items  
**Solução:** Mover `guestId` para dentro de cada item + invalidar query  
**Complexidade:** Baixa - correção de estrutura de dados  
**Impacto:** Alto - resolve completamente o problema

## 🎯 Resultado

Agora o fluxo funciona corretamente:

1. ✅ Frontend envia `guestId` dentro de cada item
2. ✅ Backend processa `guestId` dos items corretamente
3. ✅ Backend vincula items ao convidado na tabela `order_items`
4. ✅ Backend atualiza subtotal do convidado via `updateGuestSubtotal()`
5. ✅ Frontend invalida cache e mostra pedido imediatamente
6. ✅ Pedido aparece vinculado ao convidado correto no diálogo  

## 🎯 Próximos Passos

1. ✅ Adicionar invalidação da query no `TableOrderDialog`
2. ✅ Testar criação de pedidos para convidados
3. ✅ Verificar atualização imediata no diálogo
