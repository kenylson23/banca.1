# 🔍 Diagnóstico: Pedido Não Aparece

## Problema Relatado
Fez um pedido para um convidado mas o pedido não apareceu no diálogo da mesa.

---

## ✅ Verificações de Código

### 1. **Criação do Pedido** ✅
```typescript
// QuickOrderDialog.tsx linha 231-284
- ✅ Valida sessionId antes de criar
- ✅ Inclui guestId quando disponível
- ✅ Auto-atribui se houver apenas 1 guest
- ✅ Envia para /api/orders
```

### 2. **Invalidação de Queries** ✅
```typescript
// QuickOrderDialog.tsx linha 292-301
- ✅ Invalida orders-by-guest
- ✅ Invalida guests
- ✅ Invalida table-sessions
- ✅ Invalida tables
- ✅ Refetch forçado após 300ms
```

### 3. **GuestId no Carrinho** ✅
```typescript
// QuickOrderDialog.tsx linha 317-343
- ✅ addToCart recebe guestId
- ✅ Armazena guestId no item do carrinho
- ✅ Inclui guestId ao enviar pedido
```

---

## 🐛 Possíveis Causas

### **Causa 1: Guest Não Foi Selecionado**
Se você não selecionou um guest específico ao adicionar o produto:
- O pedido é criado **sem guestId**
- Aparece como "pedido anônimo"
- Não aparece vinculado a nenhum convidado

**Solução:** Ao adicionar produto, selecionar o guest no numpad.

### **Causa 2: TableDialogWrapper vs QuickOrderDialog**
O novo `TableDialogWrapper` pode estar usando queries diferentes das esperadas pelo `QuickOrderDialog`.

**Queries invalidadas pelo QuickOrderDialog:**
```
/api/tables/${tableId}/orders-by-guest  ← Usado pelo novo diálogo?
/api/tables/${tableId}/guests
```

**Queries usadas pelo TableDialogSplitPanelEnhanced:**
```
useTableData hook → preciso verificar quais queries usa
```

### **Causa 3: Debounce do Refetch**
O refetch tem delay de 300ms (linha 300). Se fechar o diálogo antes, pode não atualizar.

### **Causa 4: TableDialogSplitPanelEnhanced Não Integrado**
Se ainda está usando `TableDialogSplitPanel` (antigo) em vez de `TableDialogWrapper`, pode não ter as queries corretas.

---

## 🔧 Testes de Diagnóstico

### **Teste 1: Verificar se pedido foi criado no backend**
```bash
# No console do browser (F12)
fetch('/api/orders')
  .then(r => r.json())
  .then(data => console.log('Últimos pedidos:', data.slice(0, 5)));
```

### **Teste 2: Verificar queries ativas**
```javascript
// No console do browser
import { useQueryClient } from '@tanstack/react-query';
const queryClient = useQueryClient();
console.log('Queries ativas:', queryClient.getQueryCache().getAll());
```

### **Teste 3: Forçar refetch manual**
```javascript
// No console do browser, após criar pedido
queryClient.refetchQueries({ 
  queryKey: ['/api/tables/SEU_TABLE_ID/orders-by-guest'] 
});
```

---

## 🚀 Soluções Imediatas

### **Solução 1: Recarregar Página**
Simplesmente recarregue a página (F5). Se o pedido aparecer, é problema de invalidação.

### **Solução 2: Fechar e Reabrir Diálogo**
Feche o diálogo da mesa e abra novamente. Se aparecer, é problema de timing.

### **Solução 3: Verificar Console**
Abra DevTools (F12) e veja se há erros no console durante a criação do pedido.

---

## 🔄 Correção Permanente

### **Opção A: Garantir Queries Corretas no TableDialogWrapper**

O `TableDialogSplitPanelEnhanced` precisa usar as mesmas queries que o `QuickOrderDialog` invalida:

```typescript
// TableDialogSplitPanelEnhanced.tsx
const { data: ordersByGuestData } = useQuery({
  queryKey: [`/api/tables/${tableId}/orders-by-guest`],  // ← Mesma key!
  // ...
});
```

### **Opção B: QuickOrderDialog Invalidar Queries do Novo Diálogo**

Adicionar invalidação específica para o hook usado pelo novo diálogo:

```typescript
// QuickOrderDialog.tsx
onSuccess: () => {
  // Invalidações existentes
  queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/orders-by-guest`] });
  
  // Adicionar: invalidar queries do TableDialogSplitPanelEnhanced
  queryClient.invalidateQueries({ 
    predicate: (query) => 
      query.queryKey[0] === 'table-data' || 
      query.queryKey[0] === 'orders-by-guest'
  });
}
```

---

## 🧪 Script de Teste Completo

Cole no console do browser (F12) após fazer um pedido:

```javascript
const tableId = 'SEU_TABLE_ID'; // Pegue da URL ou do diálogo

// 1. Verificar se pedido existe no backend
console.log('=== 1. Verificando pedidos no backend ===');
fetch(`/api/tables/${tableId}/orders-by-guest`)
  .then(r => r.json())
  .then(data => {
    console.log('Total de pedidos:', data.ordersByGuest?.length || 0);
    console.log('Pedidos anônimos:', data.anonymousOrders?.length || 0);
    console.log('Dados completos:', data);
  });

// 2. Verificar queries em cache
console.log('=== 2. Queries em cache ===');
const queries = queryClient.getQueryCache().getAll();
const tableQueries = queries.filter(q => 
  String(q.queryKey).includes(tableId)
);
console.log('Queries da mesa:', tableQueries);

// 3. Forçar refetch
console.log('=== 3. Forçando refetch ===');
queryClient.refetchQueries({ 
  queryKey: [`/api/tables/${tableId}/orders-by-guest`] 
}).then(() => {
  console.log('✅ Refetch completo!');
});
```

---

## 💡 Próximos Passos

1. **Execute os testes de diagnóstico**
2. **Verifique o console** durante criação do pedido
3. **Tente recarregar** a página
4. **Reporte** o que encontrou nos testes

---

**Preciso que você:**
1. Tente criar outro pedido
2. Abra o console (F12) antes
3. Me diga se aparece algum erro
4. Execute o script de teste acima
5. Me diga o resultado

Isso me ajudará a identificar exatamente onde está o problema!
