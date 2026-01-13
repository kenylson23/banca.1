# 🔍 ANÁLISE COMPLETA: Divisão de Conta & Criar Pedido para Toda Mesa

**Data:** 2026-01-10  
**Componentes analisados:** QuickOrderDialog, BillSplitPanel, Backend API

---

## 📋 ÍNDICE

1. [Fluxo Completo de Criar Pedido](#fluxo-criar-pedido)
2. [Aba Divisão de Conta - Funcionamento](#aba-divisao)
3. [Drag & Drop - Análise Técnica](#drag-drop)
4. [Problemas Identificados](#problemas)
5. [Soluções Implementadas](#solucoes)
6. [Fluxo de Atualização de Dados](#fluxo-atualizacao)

---

## 1️⃣ FLUXO COMPLETO DE CRIAR PEDIDO {#fluxo-criar-pedido}

### 📥 **Frontend - QuickOrderDialog.tsx**

#### **1.1. Inicialização do Diálogo**
```typescript
// Linhas 164-223
- Carrega menu items: /api/menu-items?available=true
- Busca dados da mesa: /api/tables/${tableId}/orders-by-guest
- Busca convidados: /api/tables/${tableId}/guests
- Extrai currentSessionId do ordersByGuestData
```

**✅ STATUS:** Funcionando corretamente
- Query orders-by-guest retorna `currentSessionId`
- Convidados são carregados corretamente

#### **1.2. Adicionar Produtos ao Carrinho**
```typescript
// Linhas 413-450: addToCart()
- Usuário clica em produto
- Abre NumpadOverlay para selecionar quantidade e convidado
- Opções:
  ✓ Selecionar convidado específico (item.guestId = guestId)
  ✓ Deixar vazio = pedido para toda mesa (item.guestId = undefined)
  ✓ Auto-atribuir se só houver 1 convidado (linha 299)
```

**✅ STATUS:** Funcionando corretamente
- Carrinho mantém guestId de cada item
- Interface mostra para qual convidado é cada item

#### **1.3. Criar Pedido - Mutation**
```typescript
// Linhas 246-411: createOrderMutation
```

**Passos:**
1. **Verificar Sessão (linhas 253-281)**
   ```typescript
   let sessionId = tableData?.currentSessionId;
   
   if (!sessionId) {
     // Criar sessão automaticamente
     POST /api/tables/${tableId}/start-session
   }
   ```
   ✅ Se não há sessão, cria automaticamente

2. **Preparar Dados do Pedido (linhas 283-306)**
   ```typescript
   const orderData = {
     restaurantId: user.restaurantId,
     tableId,
     orderType: 'mesa',
     tableSessionId: sessionId, // ✅ SEMPRE presente
     items: cart.map(item => ({
       menuItemId: item.productId,
       quantity: item.quantity,
       price: item.price.toString(),
       notes: item.notes || '',
       guestId: item.guestId || undefined // ✅ Pode ser NULL
     })),
     notes: orderNotes,
   };
   ```
   
   **🔑 PONTO CRÍTICO:**
   - `tableSessionId`: SEMPRE preenchido
   - `guestId` por item: PODE SER NULL (pedido para toda mesa)

3. **Enviar Pedido (linhas 308-339)**
   ```typescript
   console.log('📤 [QuickOrder] Enviando pedido:', {
     tableId, tableSessionId, itemsCount,
     items: items.map(i => ({ 
       guestId: i.guestId || 'NULL (para toda mesa)'
     }))
   });
   
   POST /api/orders
   ```
   ✅ Logs confirmam que dados são enviados corretamente

4. **Invalidar Queries (linhas 341-411)**
   ```typescript
   // Invalidar TODAS as queries relacionadas
   queryClient.invalidateQueries(['/api/tables/${tableId}/orders-by-guest']);
   queryClient.invalidateQueries(['/api/tables/${tableId}/guests']);
   queryClient.invalidateQueries(['/api/tables/${tableId}']);
   queryClient.invalidateQueries(['/api/tables']);
   
   // Forçar refetch imediato
   await Promise.all([
     queryClient.refetchQueries({ 
       queryKey: [`/api/tables/${tableId}`],
       type: 'active'
     }),
     queryClient.refetchQueries({ 
       queryKey: [`/api/tables/${tableId}/orders-by-guest`],
       type: 'active'
     }),
     // ... mais queries
   ]);
   ```
   ✅ Invalidação completa implementada

---

### 📤 **Backend - POST /api/orders**

**Localização:** `server/routes.ts` (linha ~2800)

**Processamento:**
1. Validar dados com schema Zod
2. Criar registro na tabela `orders`:
   ```sql
   INSERT INTO orders (id, restaurantId, tableId, tableSessionId, orderType, status)
   VALUES (uuid, restaurantId, tableId, sessionId, 'mesa', 'pendente')
   ```

3. Criar itens na tabela `order_items`:
   ```sql
   INSERT INTO order_items (id, orderId, menuItemId, quantity, price, guestId)
   VALUES (uuid, orderId, menuItemId, qty, price, guestId_OR_NULL)
   ```
   
   **🔑 PONTO CRÍTICO:** `guestId` pode ser NULL!

4. Retornar pedido criado

**✅ STATUS:** Backend funciona corretamente

---

## 2️⃣ ABA DIVISÃO DE CONTA - FUNCIONAMENTO {#aba-divisao}

### **2.1. Carregamento de Dados**

```typescript
// Linhas 165-192: useQuery orders-by-guest
const { data: ordersData } = useQuery({
  queryKey: [`/api/tables/${tableId}/orders-by-guest`],
});

const ordersByGuest = ordersData?.ordersByGuest || [];
const anonymousOrders = ordersData?.anonymousOrders || [];
```

**API Response Structure:**
```json
{
  "currentSessionId": "uuid",
  "ordersByGuest": [
    {
      "guest": { "id": "uuid", "name": "João", "status": "ativo" },
      "orders": [ /* pedidos do convidado */ ],
      "subtotal": "25000.00"
    }
  ],
  "anonymousOrders": [
    {
      "id": "uuid",
      "tableSessionId": "uuid",
      "guestId": null,  // ← Pedido para toda mesa
      "items": [ /* itens do pedido */ ],
      "totalPrice": "45000.00"
    }
  ],
  "totalAmount": "70000.00",
  "paidAmount": "0.00"
}
```

**✅ CONFIRMADO PELOS LOGS:**
```
📊 [BillSplitPanel] Dados recebidos: {
  hasOrdersData: true,
  ordersByGuestCount: 2,
  anonymousOrdersCount: 2,  ← PEDIDOS ESTÃO CHEGANDO!
  anonymousOrders: Array(2),
  totalAmount: '45000.00'
}
```

---

### **2.2. Exibição de Pedidos Não Atribuídos**

```typescript
// Linhas 746-810: Seção de Pedidos Não Atribuídos
{anonymousOrders.length > 0 && (
  <Card className="border-yellow-500/50 bg-yellow-500/5">
    <CardHeader>
      <CardTitle>Pedidos da Mesa (Não Atribuídos)</CardTitle>
    </CardHeader>
    <CardContent>
      {anonymousOrders.map((order) => (
        <Card key={order.id}>
          {order.items.map((item) => (
            <DraggableOrderItem
              key={item.id}
              id={item.id}
              menuItemName={item.name}
              quantity={item.quantity}
              guestId="anonymous"
              disabled={false}
            />
          ))}
        </Card>
      ))}
    </CardContent>
  </Card>
)}
```

**✅ STATUS:** Pedidos SÃO EXIBIDOS corretamente
- Seção amarela aparece quando `anonymousOrders.length > 0`
- Items são renderizados como `DraggableOrderItem`
- Logs confirmam: `🔵 [Draggable] Item renderizado: {guestId: 'anonymous'}`

---

### **2.3. Exibição de Convidados**

```typescript
// Linhas 586-738: Lista de Convidados
{ordersByGuest.map((guestData) => (
  <DroppableGuestZone guestId={guestData.guest.id}>
    <Card>
      {/* Informações do convidado */}
      {selectedGuest === guestData.guest.id && (
        <div>
          {/* Itens consumidos pelo convidado */}
          {guestData.orders.map((order) => (
            {order.items.map((item) => (
              <DraggableOrderItem
                key={item.id}
                guestId={guestData.guest.id}
              />
            ))}
          ))}
        </div>
      )}
    </Card>
  </DroppableGuestZone>
))}
```

**✅ STATUS:** Funcionando
- `DroppableGuestZone` envolve todo o card (correção aplicada)
- Zona de drop sempre visível (não precisa expandir)
- Logs confirmam: `🟢 [Droppable] Zone renderizada: {guestId: '...', disabled: false}`

---

## 3️⃣ DRAG & DROP - ANÁLISE TÉCNICA {#drag-drop}

### **3.1. Estrutura DnD**

```typescript
// Linhas 482-503: DndContext
<DndContext
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
  onDragStart={(event) => {
    console.log('🚀 [DragStart] Evento iniciado');
    setDraggedItem(event.active.data.current);
  }}
  onDragOver={(event) => {
    console.log('🔄 [DragOver] Sobre:', { overId: event.over?.id });
  }}
  onDragCancel={() => {
    console.log('❌ [DragCancel] Drag cancelado');
  }}
>
```

**✅ STATUS:** Configurado corretamente

---

### **3.2. Evento onDragEnd**

```typescript
// Linhas 323-424: handleDragEnd
const handleDragEnd = (event: DragEndEvent) => {
  console.log('🎯 [DragEnd] Evento:', {
    activeId: event.active.id,
    overId: event.over?.id,
  });
  
  // 1. Validar destino
  if (!over) return;
  
  // 2. Extrair dados
  const itemId = active.id;
  const sourceGuestId = active.data.current?.sourceGuestId;
  const targetGuestId = over.id;
  const itemQuantity = active.data.current?.quantity || 1;
  
  // 3. Validar target guest
  const targetGuest = ordersByGuest.find(g => g.guest.id === targetGuestId);
  if (!targetGuest) return;
  
  // 4. Abrir diálogo de motivo
  setReasonDialog({
    open: true,
    itemId,
    itemName: menuItemName,
    sourceGuestName,
    targetGuestName,
    maxQuantity: itemQuantity,
  });
};
```

**❌ PROBLEMA IDENTIFICADO:**
Os logs `🎯 [DragEnd] Evento:` **NÃO APARECEM** quando você faz drag.

**Possíveis causas:**
1. **Evento não está sendo disparado** (mais provável)
2. **JavaScript bloqueado por erro anterior**
3. **Colisão não está sendo detectada**

---

### **3.3. Mutation de Movimentação**

```typescript
// Linhas 244-321: moveItemMutation
const moveItemMutation = useMutation({
  mutationFn: async (data: { 
    itemId, newGuestId, reason, quantity 
  }) => {
    console.log('🚀 [MoveItem] Enviando requisição:', data);
    
    const response = await apiRequest(
      'PATCH',
      `/api/order-items/${itemId}/reassign`,
      { newGuestId, reason, quantity }
    );
    
    return response;
  },
  onSuccess: async () => {
    console.log('🎉 [MoveItem] Sucesso! Invalidando queries...');
    
    // Invalidar queries
    queryClient.invalidateQueries([...]);
    
    // Aguardar 500ms
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Refetch forçado
    await Promise.all([
      queryClient.refetchQueries({ 
        queryKey: [`/api/tables/${tableId}`] 
      }),
      queryClient.refetchQueries({ 
        queryKey: [`/api/tables/${tableId}/orders-by-guest`] 
      }),
    ]);
    
    // Refetch adicional após 1s
    setTimeout(async () => {
      await queryClient.refetchQueries([...]);
    }, 1000);
  }
});
```

**✅ STATUS:** Mutation funciona quando chamada
- Backend processa corretamente (erro 500 foi resolvido)
- Invalidação de queries implementada com delay
- Refetch múltiplo (imediato + 500ms + 1000ms)

**❌ PROBLEMA:** Mutation nunca é chamada porque `onDragEnd` não dispara

---

## 4️⃣ PROBLEMAS IDENTIFICADOS {#problemas}

### 🔴 **PROBLEMA PRINCIPAL: Evento onDragEnd não dispara**

**Evidências:**
```
✅ Logs que APARECEM:
- 🔵 [Draggable] Item renderizado
- 🟢 [Droppable] Zone renderizada

❌ Logs que NÃO APARECEM:
- 🚀 [DragStart] Evento iniciado
- 🔄 [DragOver] Sobre
- 🎯 [DragEnd] Evento

✅ Logs que APARECEM MAS SÃO DE EXECUÇÃO ANTERIOR:
- 🔄 [MoveItem] Refetch adicional de segurança
- ✅ [MoveItem] Refetch adicional concluído
```

**Diagnóstico:**
- Items são renderizados corretamente
- Zonas de drop são renderizadas corretamente
- **MAS** o drag não está sendo iniciado

**Possíveis causas:**
1. **Listeners não estão sendo aplicados aos elementos**
   - O `useDraggable` retorna `listeners` que devem ser aplicados ao elemento
   - Verificar se `{...listeners}` está presente no JSX

2. **Conflito com evento onClick**
   - O card do convidado tem `onClick` (linha 594)
   - Pode estar capturando o evento antes do drag

3. **CSS pointer-events**
   - Algum elemento pai pode ter `pointer-events: none`

4. **Z-index ou overlay bloqueando**
   - Algum elemento sobreposto impedindo o drag

---

### 🟡 **PROBLEMA SECUNDÁRIO: Após mover, interface não atualiza**

**Status:** Já implementamos correção (refetch com delays)
**Pendente:** Testar se funciona quando o drag funcionar

---

## 5️⃣ SOLUÇÕES IMPLEMENTADAS {#solucoes}

### ✅ **Problemas JÁ RESOLVIDOS:**

1. **Pedidos "da mesa" não apareciam** → ✅ RESOLVIDO
   - Backend retorna `anonymousOrders` corretamente
   - Frontend recebe e exibe os pedidos

2. **DroppableGuestZone só aparecia ao expandir** → ✅ RESOLVIDO
   - Movido para envolver todo o card
   - Sempre visível agora

3. **Tabela order_item_audit_logs não existia** → ✅ RESOLVIDO
   - Migração criada e executada
   - Backend insere audit logs corretamente

4. **Mover item por quantidade** → ✅ IMPLEMENTADO
   - Frontend com seletor de quantidade
   - Backend divide itens quando quantidade < total

5. **Invalidação de queries após mover** → ✅ IMPLEMENTADO
   - Refetch com delays (500ms + 1000ms)
   - Múltiplas queries invalidadas

---

## 6️⃣ FLUXO DE ATUALIZAÇÃO DE DADOS {#fluxo-atualizacao}

### **Fluxo Esperado (Após Drag Funcionar):**

```
1. Usuário arrasta item
   ↓
2. onDragStart → Marca item como sendo arrastado
   ↓
3. onDragOver → Destaca zona de drop
   ↓
4. onDragEnd → Valida e abre diálogo
   ↓
5. Usuário confirma motivo
   ↓
6. moveItemMutation.mutate()
   ↓
7. Backend: PATCH /api/order-items/:id/reassign
   ↓
8. Backend processa:
   - Se quantidade < total: divide item
   - Atualiza guestId do item
   - Cria audit log
   ↓
9. Frontend onSuccess:
   - Invalidar queries (imediato)
   - Aguardar 500ms
   - Refetch queries (forçado)
   - Aguardar mais 1000ms
   - Refetch adicional (segurança)
   ↓
10. Interface atualiza:
    - Item desaparece da seção amarela
    - Item aparece no cliente de destino
```

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

### **1. RESOLVER PROBLEMA DO DRAG (PRIORIDADE MÁXIMA)**

**Ação 1:** Verificar se `listeners` estão sendo aplicados
```typescript
// Em DraggableOrderItem.tsx
const { attributes, listeners, setNodeRef } = useDraggable({...});

// Verificar no JSX:
<div ref={setNodeRef} {...listeners} {...attributes}>
```

**Ação 2:** Adicionar logs nos listeners
```typescript
const customListeners = {
  onPointerDown: (e) => {
    console.log('👆 PointerDown capturado!');
    listeners?.onPointerDown?.(e);
  },
};

<div {...customListeners}>
```

**Ação 3:** Verificar CSS
```typescript
// Procurar por:
- pointer-events: none
- user-select: none (pode bloquear)
- position: fixed que sobreponha
```

**Ação 4:** Testar drag em item isolado
- Criar um teste simples fora do card do convidado
- Confirmar que biblioteca funciona

---

### **2. ADICIONAR MAIS DEBUG**

```typescript
// Em DraggableOrderItem
useEffect(() => {
  console.log('🔵 DraggableOrderItem montado:', { 
    id, 
    hasListeners: !!listeners,
    isDisabled: disabled 
  });
}, []);

// Em DroppableGuestZone
useEffect(() => {
  console.log('🟢 DroppableGuestZone montada:', { 
    guestId,
    isDisabled: disabled 
  });
}, []);
```

---

### **3. VALIDAR BIBLIOTECA DND-KIT**

```bash
# Verificar versão
npm list @dnd-kit/core

# Verificar imports
grep -r "@dnd-kit" client/src/components/BillSplitPanel.tsx
```

---

## 📊 RESUMO EXECUTIVO

### ✅ **O QUE FUNCIONA:**
- ✅ Criar pedido "para toda mesa" (guestId NULL)
- ✅ Backend retorna pedidos não atribuídos
- ✅ Frontend recebe pedidos não atribuídos
- ✅ Pedidos aparecem na seção amarela
- ✅ Items são renderizados como draggable
- ✅ Zonas de drop são renderizadas
- ✅ Backend processa movimentação (quando chamado)
- ✅ Audit log funciona
- ✅ Mover por quantidade implementado

### ❌ **O QUE NÃO FUNCIONA:**
- ❌ **Evento drag não inicia** (problema crítico)
- ❌ Interface não atualiza após mover (não testável ainda)

### 🎯 **FOCO DE INVESTIGAÇÃO:**
1. **Por que o drag não está iniciando?**
   - Listeners não aplicados?
   - Evento bloqueado?
   - Conflito de eventos?

2. **Após resolver o drag:**
   - Testar se a atualização funciona
   - Validar se os delays são suficientes

---

**FIM DA ANÁLISE**
