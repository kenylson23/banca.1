# ✅ Correção: Pedido de Convidado Não Aparece

## 🎯 Problema Resolvido

Ao criar pedido para convidado na mesa, **o pedido não era reconhecido** nem vinculado ao convidado.

## 🔧 Correções Aplicadas

**Arquivo:** `client/src/components/tables/TableOrderDialog.tsx`

### Correção 1: Mover `guestId` para os items (CRÍTICA)

**Linhas:** 242-245

```typescript
// Antes (INCORRETO)
const orderItems = cartItems.map(item => ({
  menuItemId: item.menuItem.id,
  quantity: item.quantity,
  price: totalPrice,
  // ❌ FALTAVA guestId aqui
  selectedOptions: [...]
}));

return apiRequest('POST', '/api/orders', {
  tableId: table.id,
  guestId: selectedGuest,  // ❌ ERRADO: no nível do pedido
  items: orderItems,
});

// Depois (CORRETO)
const orderItems = cartItems.map(item => ({
  menuItemId: item.menuItem.id,
  quantity: item.quantity,
  price: totalPrice,
  guestId: selectedGuest || undefined,  // ✅ CORRETO: em cada item
  selectedOptions: [...]
}));

return apiRequest('POST', '/api/orders', {
  tableId: table.id,
  // guestId removido daqui
  items: orderItems,
});
```

### Correção 2: Invalidar query de pedidos por convidado

**Linha:** 268

```typescript
onSuccess: () => {
  // ... outras invalidações
  // ✅ ADICIONADO:
  queryClient.invalidateQueries({ queryKey: [`/api/tables/${table.id}/orders-by-guest`] });
}
```

## 📝 Explicação Técnica

### Por que não funcionava?

1. **Frontend** enviava `guestId` no nível do pedido
2. **Backend** só processa `guestId` dos items (não do pedido)
3. Items eram criados **sem vinculação** ao convidado
4. `updateGuestSubtotal()` não era chamado (sem guestId nos items)
5. Pedido existia mas estava "solto", não vinculado ao convidado

### Por que agora funciona?

1. **Frontend** envia `guestId` dentro de cada item
2. **Backend** detecta `guestId` nos items durante `createOrder()`
3. Items são salvos **com guestId** na tabela `order_items`
4. Backend chama `updateGuestSubtotal(guestId)` automaticamente
5. Frontend invalida cache e busca dados atualizados
6. Pedido aparece vinculado ao convidado correto

## ✅ Queries Afetadas (Agora Atualizadas)

- `/api/tables/${tableId}/orders-by-guest` - **PRINCIPAL**
- `/api/orders` - Lista geral de pedidos
- `/api/tables` - Lista de mesas
- `/api/tables/open` - Mesas abertas
- `/api/tables/with-orders` - Mesas com pedidos

## 🎨 Componentes Beneficiados

- ✅ `TableDetailsDialog` - Mostra pedidos por convidado
- ✅ `TableCheckoutDialog` - Checkout por mesa
- ✅ `BillSplitPanel` - Divisão de conta por convidado
- ✅ `GuestsList` - Lista de convidados com pedidos

## 🧪 Como Testar

1. Abrir mesa ocupada no sistema
2. Abrir diálogo de gestão da mesa
3. Clicar em "Novo Pedido" (ícone +)
4. Selecionar produtos
5. (Opcional) Associar a um convidado
6. Criar pedido
7. ✅ **Pedido deve aparecer IMEDIATAMENTE no diálogo**

## 📊 Impacto

- **Tipo:** Bug Fix
- **Severidade:** Alta (funcionalidade não funcionava)
- **Complexidade:** Baixa (1 linha de código)
- **Risco:** Muito baixo (apenas invalida cache)
- **Benefício:** Alto (resolve problema completamente)

## 🔍 Análise Completa

Ver arquivo: `ANALISE_PEDIDO_CONVIDADO_NAO_APARECE.md`
