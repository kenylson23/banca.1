# 🔄 Guia Completo: Movimentação de Pedidos Entre Convidados

**Data:** 2026-01-03  
**Objetivo:** Explicar detalhadamente como funciona a movimentação de itens de pedidos entre convidados

---

## 🎯 Visão Geral

A movimentação de pedidos permite **transferir itens** de um convidado para outro na mesma mesa. Isso é útil para:

- ✅ **Corrigir erros** de atribuição de pedidos
- ✅ **Dividir conta** de forma personalizada
- ✅ **Reorganizar** itens quando clientes trocam de lugar
- ✅ **Atender solicitações** de pagamento separado

---

## 🎨 Métodos de Movimentação

### **Método 1: Drag & Drop (Arrastar e Soltar)** 🖱️

**Localização:** `BillSplitPanel.tsx` (linhas 490-532)

**Como Funciona:**

```
┌────────────────────────────────────────────────────────────┐
│  Convidado 1 (João)                                        │
│  ┌─────────────────────────────────────────────┐          │
│  │ 🍔 1x Hamburguer        50 Kz   [grip icon] │ ← ARRASTAR│
│  │ 🍟 1x Batatas Fritas    20 Kz               │          │
│  └─────────────────────────────────────────────┘          │
└────────────────────────────────────────────────────────────┘
                         ↓ ARRASTAR
┌────────────────────────────────────────────────────────────┐
│  Convidado 2 (Maria)   [ZONA DE DROP DESTACADA]           │
│  ┌─────────────────────────────────────────────┐          │
│  │ 🥤 1x Refrigerante      15 Kz               │          │
│  │ 🍔 1x Hamburguer        50 Kz   ← SOLTAR    │          │
│  └─────────────────────────────────────────────┘          │
└────────────────────────────────────────────────────────────┘
```

**Passo a Passo:**

1. **Abrir mesa** e acessar o painel de divisão de conta
2. **Selecionar convidado** para expandir seus itens
3. **Clicar e segurar** no ícone de grip (⋮⋮) ao lado do item
4. **Arrastar** até o cartão de outro convidado
5. **Soltar** na zona destacada
6. **Diálogo de motivo** aparece automaticamente
7. **Confirmar** a movimentação

**Componentes Envolvidos:**

```typescript
// 1. DraggableOrderItem.tsx - Item arrastável
<DraggableOrderItem
  id={item.id}                    // ID único do item
  menuItemName="Hamburguer"        // Nome do produto
  quantity={1}                     // Quantidade
  totalPrice="50"                  // Preço total
  guestId={sourceGuestId}          // Convidado atual
  disabled={false}                 // Se pode arrastar
/>

// 2. DroppableGuestZone.tsx - Zona de destino
<DroppableGuestZone
  guestId={targetGuestId}          // Convidado destino
  disabled={false}                 // Se pode receber
>
  {/* Itens do convidado */}
</DroppableGuestZone>

// 3. DndContext - Gerenciador de drag-drop
<DndContext
  collisionDetection={closestCenter}
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
>
  {/* Conteúdo com drag-drop */}
</DndContext>
```

---

### **Método 2: Diálogo Manual (MoveItemDialog)** 📱

**Localização:** `MoveItemDialog.tsx`

**Como Funciona:**

```
┌─────────────────────────────────────────────────┐
│  Mover Item                              [X]    │
├─────────────────────────────────────────────────┤
│                                                  │
│  Item: 1x Hamburguer (50 Kz)                   │
│  De: Convidado 1 (João)                        │
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │ Selecione o convidado destino ▼       │    │
│  │                                        │    │
│  │ • Convidado 2 (Maria)                 │    │
│  │ • Convidado 3 (Pedro)                 │    │
│  └────────────────────────────────────────┘    │
│                                                  │
│  Motivo (opcional):                             │
│  ○ Pré-definido  ● Personalizado               │
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │ Divisão de conta                    ▼ │    │
│  └────────────────────────────────────────┘    │
│                                                  │
│         [Cancelar]  [Pular]  [Confirmar]       │
└─────────────────────────────────────────────────┘
```

**Passo a Passo:**

1. **Abrir mesa** no diálogo principal (`TableDialogPOSModern`)
2. **Ir para aba "Pedidos"** (`OrdersSection`)
3. **Clicar** no item do pedido que deseja mover
4. **Selecionar "Mover Item"** no menu
5. **Escolher convidado destino** no dropdown
6. **Selecionar motivo** (pré-definido ou personalizado)
7. **Confirmar** a movimentação

**Props do Diálogo:**

```typescript
interface MoveItemDialogProps {
  open: boolean;                   // Se está aberto
  onOpenChange: (open: boolean) => void;  // Callback ao fechar
  item: OrderItem;                 // Item a ser movido
  currentGuest: Guest;             // Convidado atual
  availableGuests: Guest[];        // Lista de convidados disponíveis
  sessionId: string;               // ID da sessão
  tableId?: string;                // ID da mesa (para invalidação)
}
```

---

## 📋 Motivos de Movimentação

### **Motivos Pré-definidos:**

```typescript
const predefinedReasons = [
  { value: 'erro_pedido', label: 'Erro ao anotar o pedido' },
  { value: 'cliente_trocou', label: 'Cliente trocou de lugar' },
  { value: 'dividir_conta', label: 'Divisão de conta' },
  { value: 'pagamento_separado', label: 'Cliente quer pagar separadamente' },
  { value: 'correcao', label: 'Correção solicitada pelo cliente' },
];
```

**Por que são importantes?**

- ✅ **Auditoria:** Rastreamento de todas as mudanças
- ✅ **Relatórios:** Identificar padrões de erros
- ✅ **Gestão:** Melhorar processos operacionais
- ✅ **Compliance:** Atender requisitos legais

---

## 🔧 Implementação Técnica

### **1. Fluxo de Drag & Drop**

```typescript
// BillSplitPanel.tsx - linha 242
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  setDraggedItem(null);

  if (!over) return;  // Não soltou em zona válida

  const itemId = active.id as string;
  const sourceGuestId = active.data.current?.sourceGuestId;
  const targetGuestId = over.id as string;

  // Se soltou no mesmo convidado, não faz nada
  if (sourceGuestId === targetGuestId) return;

  // Buscar dados do item e convidados
  const sourceGuest = ordersByGuest.find(og => og.guest.id === sourceGuestId);
  const targetGuest = ordersByGuest.find(og => og.guest.id === targetGuestId);
  const item = findItemById(itemId);

  // Abrir diálogo de motivo
  setReasonDialog({
    open: true,
    itemId: itemId,
    itemName: item.menuItemName,
    sourceGuestId: sourceGuestId,
    sourceGuestName: sourceGuest.guest.name || `Cliente ${sourceGuest.guest.guestNumber}`,
    targetGuestId: targetGuestId,
    targetGuestName: targetGuest.guest.name || `Cliente ${targetGuest.guest.guestNumber}`,
  });
};
```

### **2. API de Movimentação**

**Endpoint:** `PATCH /api/order-items/:itemId/reassign`

```typescript
// MoveItemDialog.tsx - linha 75
const moveItemMutation = useMutation({
  mutationFn: async (data: { 
    itemId: string; 
    newGuestId: string; 
    reason?: string; 
    tableId?: string 
  }) => {
    const response = await apiRequest(
      'PATCH',
      `/api/order-items/${data.itemId}/reassign`,
      { 
        newGuestId: data.newGuestId,
        reason: data.reason,
      }
    );
    return response;
  },
  onSuccess: async (_, variables) => {
    // Invalidar queries para atualizar UI
    queryClient.invalidateQueries({ 
      queryKey: [`/api/table-sessions/${sessionId}/guests`] 
    });
    
    if (variables.tableId) {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/tables/${variables.tableId}/orders-by-guest`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/tables/with-orders'] 
      });
      
      // Refetch imediato das queries ativas
      await queryClient.refetchQueries({ 
        queryKey: [`/api/tables/${variables.tableId}/orders-by-guest`],
        type: 'active'
      });
    }
    
    toast({
      title: 'Item movido',
      description: 'O item foi movido com sucesso para outro cliente',
    });
    
    // Fechar diálogo após delay
    setTimeout(() => {
      onOpenChange(false);
      // Limpar estado
    }, 300);
  },
  onError: (error: Error) => {
    toast({
      title: 'Erro ao mover item',
      description: error.message,
      variant: 'destructive',
    });
  },
});
```

**Payload da Requisição:**

```json
{
  "newGuestId": "guest-uuid-123",
  "reason": "Divisão de conta"
}
```

**Resposta:**

```json
{
  "success": true,
  "message": "Item movido com sucesso",
  "orderItem": {
    "id": "item-uuid-456",
    "guestId": "guest-uuid-123",
    "menuItemName": "Hamburguer",
    "quantity": 1,
    "price": "50.00"
  }
}
```

---

## 🔐 Regras de Negócio

### **1. Restrições de Movimentação**

```typescript
// Não pode mover se:
const cannotMove = 
  guestData.guest.status === 'pago' ||      // Convidado já pagou
  ordersByGuest.length === 1 ||              // Só há 1 convidado
  item.status === 'cancelado';               // Item cancelado
```

### **2. Validações**

- ✅ Convidado destino deve existir e estar ativo
- ✅ Item deve pertencer ao convidado origem
- ✅ Sessão deve estar ativa
- ✅ Mesa não pode estar fechada
- ✅ Item não pode estar cancelado

### **3. Recalcular Totais Automaticamente**

```typescript
// Após movimentação, o sistema automaticamente:
// 1. Subtrai do total do convidado origem
// 2. Adiciona ao total do convidado destino
// 3. Atualiza totalAmount da mesa
// 4. Atualiza totalSpent de cada convidado
// 5. Recalcula impostos/taxas se aplicável
```

---

## 📊 Auditoria e Histórico

### **Registro de Movimentação**

Cada movimentação cria um registro de auditoria:

```typescript
interface ItemMovementAudit {
  id: string;
  itemId: string;
  sourceGuestId: string;
  targetGuestId: string;
  reason: string;
  movedBy: string;          // Usuário que fez a movimentação
  movedAt: Date;
  tableId: string;
  sessionId: string;
  itemDetails: {
    name: string;
    quantity: number;
    price: string;
  };
}
```

### **Visualizar Histórico**

```typescript
// BillSplitPanel.tsx - linha 139
const [auditHistoryOpen, setAuditHistoryOpen] = useState(false);

// Botão para abrir histórico
<Button
  variant="outline"
  size="sm"
  onClick={() => setAuditHistoryOpen(true)}
>
  <History className="h-4 w-4 mr-2" />
  Ver Histórico
</Button>

// Componente de histórico
<AuditHistoryDialog
  open={auditHistoryOpen}
  onOpenChange={setAuditHistoryOpen}
  tableId={tableId}
  sessionId={sessionId}
/>
```

---

## 🎯 Casos de Uso Práticos

### **Caso 1: Erro de Atendente**

**Situação:** Garçom anotou item do João no pedido da Maria

**Solução:**
1. Abrir mesa
2. Ir para aba "Pedidos"
3. Localizar item incorreto
4. Clicar "Mover Item"
5. Selecionar "João" como destino
6. Motivo: "Erro ao anotar o pedido"
7. Confirmar

**Resultado:**
- ✅ Item movido para João
- ✅ Total de Maria reduzido
- ✅ Total de João aumentado
- ✅ Auditoria registrada

---

### **Caso 2: Divisão Personalizada**

**Situação:** Mesa de 4 pessoas, 2 vão pagar juntos

**Solução:**
1. Abrir BillSplitPanel
2. Ver itens de cada convidado
3. **Arrastar** itens do Convidado 3 para Convidado 1
4. **Arrastar** itens do Convidado 4 para Convidado 2
5. Motivo: "Divisão de conta"
6. Agora temos 2 grupos de pagamento

**Resultado:**
- ✅ Convidado 1 + 3 = Grupo A
- ✅ Convidado 2 + 4 = Grupo B
- ✅ Dois pagamentos separados
- ✅ Totais recalculados

---

### **Caso 3: Cliente Trocou de Lugar**

**Situação:** João e Maria trocaram de assento, pedidos ficaram trocados

**Solução:**
1. Abrir mesa
2. Usar drag-drop no BillSplitPanel
3. **Arrastar todos itens** de João para Maria
4. **Arrastar todos itens** de Maria para João
5. Motivo: "Cliente trocou de lugar"

**Resultado:**
- ✅ Pedidos reorganizados
- ✅ Cada um paga o seu
- ✅ Histórico mantido

---

## 🖥️ Interface de Usuário

### **Indicadores Visuais**

```typescript
// 1. Item sendo arrastado
const style = {
  transform: CSS.Translate.toString(transform),
  opacity: isDragging ? 0.5 : 1,        // 50% opacidade ao arrastar
  cursor: disabled ? 'default' : 'grab', // Cursor muda
};

// 2. Zona de destino ativa
<div className={`
  ${isOver && !disabled 
    ? 'border-primary bg-primary/5 shadow-inner'  // Destaque ao passar
    : 'border-transparent'}
`}>

// 3. Item desabilitado
<div className={`
  ${disabled ? 'opacity-50' : ''}  // Visual de desabilitado
`}>
```

### **Estados do Item**

| Estado | Visual | Pode Mover? |
|--------|--------|-------------|
| **Normal** | Cor padrão, grip visível | ✅ Sim |
| **Arrastando** | 50% opacidade, sombra | ✅ Em movimento |
| **Desabilitado** | 50% opacidade, grip oculto | ❌ Não |
| **Convidado Pago** | Verde, bloqueado | ❌ Não |
| **Único Convidado** | Sem grip | ❌ Não |

---

## 🚦 Feedback ao Usuário

### **Toast Notifications**

```typescript
// Sucesso
toast({
  title: 'Item movido',
  description: 'O item foi movido com sucesso para outro cliente',
});

// Erro - Validação
toast({
  title: 'Selecione um cliente',
  description: 'Por favor, selecione o cliente de destino',
  variant: 'destructive',
});

// Erro - API
toast({
  title: 'Erro ao mover item',
  description: error.message,
  variant: 'destructive',
});
```

### **Loading States**

```typescript
// Durante movimentação
{moveItemMutation.isPending ? (
  <Loader2 className="h-4 w-4 animate-spin" />
) : (
  <ArrowRightLeft className="h-4 w-4" />
)}
```

---

## 🔄 Sincronização de Dados

### **Invalidação de Queries**

Após mover item, várias queries são invalidadas para manter UI sincronizada:

```typescript
// 1. Guests da sessão
queryClient.invalidateQueries({ 
  queryKey: [`/api/table-sessions/${sessionId}/guests`] 
});

// 2. Orders por convidado
queryClient.invalidateQueries({ 
  queryKey: [`/api/tables/${tableId}/orders-by-guest`] 
});

// 3. Lista de mesas
queryClient.invalidateQueries({ 
  queryKey: ['/api/tables/with-orders'] 
});

// 4. Refetch imediato
await queryClient.refetchQueries({ 
  queryKey: [`/api/tables/${tableId}/orders-by-guest`],
  type: 'active'
});
```

---

## 📱 Responsividade

### **Desktop**
- ✅ Drag & Drop completo
- ✅ Grip visível
- ✅ Hover effects
- ✅ Tooltips

### **Mobile**
- ✅ Diálogo manual (MoveItemDialog)
- ✅ Touch-friendly buttons
- ✅ Sem drag-drop (problemas de UX)
- ✅ Seleção por tap

---

## 🎓 Melhores Práticas

### **Para Desenvolvedores**

1. **Sempre registrar motivo** (mesmo que opcional)
2. **Invalidar todas queries relacionadas** após movimentação
3. **Usar refetch imediato** para queries ativas
4. **Adicionar delay antes de fechar diálogo** (300ms) para feedback
5. **Desabilitar drag-drop** quando há só 1 convidado
6. **Bloquear movimentação** de convidados já pagos

### **Para Usuários/Atendentes**

1. **Revisar antes de mover** - Confirme que está movendo o item correto
2. **Escolher motivo adequado** - Facilita auditoria
3. **Verificar totais** - Veja se os valores bateram após mover
4. **Usar drag-drop** - Mais rápido que diálogo manual
5. **Consultar histórico** - Se tiver dúvida sobre movimentações

---

## 🐛 Troubleshooting

### **Problema 1: Item não move**

**Possíveis causas:**
- ✅ Convidado está com status "pago"
- ✅ Só há 1 convidado na mesa
- ✅ Item está cancelado
- ✅ Sessão não está ativa

**Solução:**
```typescript
// Verificar estado do item e convidado
console.log('Guest Status:', guest.status);
console.log('Can Move:', guest.status !== 'pago' && ordersByGuest.length > 1);
```

---

### **Problema 2: Totais não atualizam**

**Causa:** Queries não foram invalidadas

**Solução:**
```typescript
// Invalidar TODAS as queries relevantes
queryClient.invalidateQueries({ queryKey: ['/api/tables'] });
queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}`] });
queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/orders-by-guest`] });

// Forçar refetch imediato
await queryClient.refetchQueries({ 
  queryKey: [`/api/tables/${tableId}/orders-by-guest`] 
});
```

---

### **Problema 3: Drag & Drop não funciona no mobile**

**Causa:** Biblioteca @dnd-kit tem problemas com touch events

**Solução:** Use `MoveItemDialog` no mobile:
```typescript
const isMobile = window.innerWidth < 768;

{isMobile ? (
  <Button onClick={() => openMoveDialog(item)}>
    Mover Item
  </Button>
) : (
  <DraggableOrderItem {...props} />
)}
```

---

## 📚 Referências de Código

### **Componentes Principais**

| Arquivo | Linhas | Descrição |
|---------|--------|-----------|
| `MoveItemDialog.tsx` | 298 | Diálogo manual de movimentação |
| `MoveItemReasonDialog.tsx` | 179 | Diálogo para adicionar motivo |
| `DraggableOrderItem.tsx` | 65 | Item arrastável |
| `DroppableGuestZone.tsx` | 35 | Zona de destino |
| `BillSplitPanel.tsx` | 750 | Painel com drag-drop |
| `AuditHistoryDialog.tsx` | - | Histórico de movimentações |

### **Hooks e Utils**

```typescript
// useDraggable - @dnd-kit/core
const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
  id: itemId,
  data: { itemId, sourceGuestId, menuItemName, quantity, totalPrice },
  disabled: false,
});

// useDroppable - @dnd-kit/core
const { isOver, setNodeRef } = useDroppable({
  id: guestId,
  data: { guestId },
  disabled: false,
});

// useMutation - @tanstack/react-query
const moveItemMutation = useMutation({
  mutationFn: async (data) => { /* ... */ },
  onSuccess: () => { /* ... */ },
  onError: (error) => { /* ... */ },
});
```

---

## 🎬 Fluxograma Completo

```
┌─────────────────────────────────────┐
│  Usuário inicia movimentação        │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼─────┐   ┌─────▼──────┐
│ Drag-Drop  │   │  Diálogo   │
└──────┬─────┘   └─────┬──────┘
       │                │
       │   ┌────────────┘
       │   │
┌──────▼───▼─────────────────────────┐
│  Validações:                        │
│  • Convidado destino válido?        │
│  • Item pode ser movido?            │
│  • Sessão ativa?                    │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        │ Válido?     │
        └──────┬──────┘
         Sim   │   Não
     ┌─────────┴─────────┐
     │                   │
┌────▼────┐         ┌───▼────┐
│ Motivo? │         │ Erro   │
└────┬────┘         └────────┘
     │
┌────▼─────────────────────────────┐
│  API: PATCH /api/order-items/:id  │
└────┬─────────────────────────────┘
     │
┌────▼──────────────────────────┐
│  Atualizar no banco:          │
│  • order_items.guestId        │
│  • table_guests.totalSpent    │
│  • Criar audit log            │
└────┬──────────────────────────┘
     │
┌────▼──────────────────────────┐
│  Invalidar queries React      │
│  • orders-by-guest            │
│  • tables/with-orders         │
│  • table-sessions/guests      │
└────┬──────────────────────────┘
     │
┌────▼──────────────────────────┐
│  UI atualiza automaticamente  │
│  • Totais recalculados        │
│  • Item aparece no novo lugar │
│  • Toast de sucesso           │
└───────────────────────────────┘
```

---

## ✅ Checklist de Implementação

Para implementar movimentação de pedidos em novo local:

```
☐ 1. Instalar dependências
   ☐ @dnd-kit/core
   ☐ @dnd-kit/utilities

☐ 2. Criar componentes
   ☐ DraggableOrderItem
   ☐ DroppableGuestZone
   ☐ MoveItemDialog

☐ 3. Configurar DndContext
   ☐ Definir onDragStart
   ☐ Definir onDragEnd
   ☐ Adicionar DragOverlay

☐ 4. Implementar API
   ☐ Endpoint PATCH /api/order-items/:id/reassign
   ☐ Validações no backend
   ☐ Audit logging

☐ 5. Gestão de estado
   ☐ React Query mutations
   ☐ Invalidação de queries
   ☐ Loading states

☐ 6. UX
   ☐ Toast notifications
   ☐ Visual feedback (hover, drag)
   ☐ Motivos de movimentação
   ☐ Confirmações

☐ 7. Testes
   ☐ Drag & drop funciona
   ☐ Totais recalculam
   ☐ Auditoria registra
   ☐ Mobile alternativo funciona
```

---

## 🎓 Resumo Executivo

### **O que você aprendeu:**

1. ✅ **Dois métodos** de movimentação: Drag-Drop e Diálogo Manual
2. ✅ **Biblioteca @dnd-kit** para drag-drop moderno
3. ✅ **Componentes modulares**: DraggableOrderItem + DroppableGuestZone
4. ✅ **API endpoint**: `PATCH /api/order-items/:id/reassign`
5. ✅ **Motivos obrigatórios** para auditoria
6. ✅ **Sincronização automática** via React Query
7. ✅ **Validações e regras** de negócio

### **Como usar (resumido):**

**Drag & Drop:**
1. Abrir painel de divisão
2. Arrastar item (grip icon)
3. Soltar em outro convidado
4. Confirmar com motivo

**Diálogo Manual:**
1. Clicar no item
2. "Mover Item"
3. Selecionar destino
4. Escolher motivo
5. Confirmar

---

**Guia criado por:** Rovo Dev  
**Status:** ✅ Completo e Detalhado
