# 🔍 Análise Profunda - Problemas nos Diálogos de Gestão de Mesas

## 📋 Problemas Identificados

### 1️⃣ **PROBLEMA: Necessidade de Fechar Diálogo para Ver Próximo**

**Sintoma:** Usuário precisa fechar o diálogo atual antes de abrir outro diálogo relacionado.

**Causa Raiz:**
- Os diálogos são **modais bloqueantes** (Dialog do shadcn/ui)
- Não há sistema de **transição automática** entre diálogos
- Estado de abertura não é sincronizado entre componentes pais e filhos

**Diálogos Afetados:**
```
TableDetailsDialog (principal)
  ├─ QuickOrderDialog (criar pedido rápido)
  ├─ AddGuestDialog (adicionar pessoa)
  ├─ MoveItemDialog (mover item entre pessoas)
  ├─ GuestCheckoutDialog (checkout individual)
  ├─ TableCheckoutDialog (checkout mesa completa)
  ├─ ConvertGuestDialog (converter convidado em cliente)
  └─ EndSessionDialog (encerrar sessão)
```

**Problema Específico:**
- Quando `QuickOrderDialog` é aberto, o `TableDetailsDialog` continua aberto por baixo
- Ao fechar `QuickOrderDialog`, usuário volta para `TableDetailsDialog`
- Não há fluxo automático: "Pedido criado → Voltar para detalhes da mesa"

---

### 2️⃣ **PROBLEMA: Necessidade de Refresh para Ver Alterações**

**Sintoma:** Após ação (criar pedido, adicionar pessoa), dados não aparecem até refresh manual.

**Causa Raiz:**

#### A) Invalidação Incompleta de Queries
```typescript
// ❌ PROBLEMA: QuickOrderDialog invalida mas não espera refetch
onSuccess: (data) => {
  queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/orders-by-guest`] });
  onOpenChange(false); // Fecha imediatamente
}

// ✅ SOLUÇÃO: Invalidar + Refetch ou usar optimistic updates
```

#### B) Cache Stale do React Query
- React Query tem `staleTime` que pode estar muito alto
- Queries não são refetchadas automaticamente após invalidação
- `refetchOnWindowFocus` pode estar desabilitado

#### C) Race Conditions
```typescript
// PROBLEMA: Invalidação acontece antes do backend terminar
queryClient.invalidateQueries({ queryKey: ['/api/tables'] }); 
// Backend ainda está processando... 
// Query refetch pega dados antigos
```

#### D) Queries Não Invalidadas
```typescript
// MoveItemDialog só invalida:
queryClient.invalidateQueries({ 
  queryKey: ['/api/tables/sessions', sessionId, 'guests'] 
});

// ❌ FALTA invalidar:
// - /api/tables/${tableId}/orders-by-guest
// - /api/tables/${tableId}
// - /api/tables (lista principal)
```

---

## 🔧 Soluções Propostas

### SOLUÇÃO 1: Sistema de Callbacks em Cascata

**Objetivo:** Fechar diálogo filho → Atualizar diálogo pai → Manter fluxo natural

```typescript
// TableDetailsDialog
const [childDialogOpen, setChildDialogOpen] = useState({
  quickOrder: false,
  addGuest: false,
  moveItem: false,
});

<QuickOrderDialog
  open={childDialogOpen.quickOrder}
  onOpenChange={(open) => {
    setChildDialogOpen(prev => ({ ...prev, quickOrder: open }));
  }}
  onOrderCreated={() => {
    // 1. Fechar diálogo filho
    setChildDialogOpen(prev => ({ ...prev, quickOrder: false }));
    
    // 2. Invalidar queries
    invalidateAfterOrderCreated(queryClient, tableId);
    
    // 3. Forçar refetch imediato
    queryClient.refetchQueries({ queryKey: [`/api/tables/${tableId}/orders-by-guest`] });
    
    // 4. Manter TableDetailsDialog aberto (não chamar onOpenChange)
  }}
/>
```

---

### SOLUÇÃO 2: Invalidação Completa e Forçada

**Implementar em TODOS os diálogos:**

```typescript
// QuickOrderDialog - onSuccess
onSuccess: async (data) => {
  // 1. Toast de sucesso
  toast({ title: 'Pedido criado!' });
  
  // 2. Invalidar TODAS as queries relacionadas
  await invalidateAfterOrderCreated(queryClient, tableId);
  
  // 3. Forçar refetch IMEDIATO (não esperar staleTime)
  await Promise.all([
    queryClient.refetchQueries({ 
      queryKey: [`/api/tables/${tableId}/orders-by-guest`],
      type: 'active' 
    }),
    queryClient.refetchQueries({ 
      queryKey: [`/api/tables/${tableId}/guests`],
      type: 'active' 
    }),
  ]);
  
  // 4. Pequeno delay para garantir UI atualizada
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // 5. Fechar diálogo
  onOpenChange(false);
}
```

---

### SOLUÇÃO 3: Optimistic Updates

**Para melhor UX, atualizar UI imediatamente:**

```typescript
const addGuestMutation = useMutation({
  mutationFn: async (data) => {
    return apiRequest('POST', `/api/tables/${tableId}/guests`, data);
  },
  
  // ✨ Optimistic Update
  onMutate: async (newGuest) => {
    // Cancelar queries em andamento
    await queryClient.cancelQueries({ queryKey: ['table-guests', tableId] });
    
    // Snapshot dos dados atuais
    const previousGuests = queryClient.getQueryData(['table-guests', tableId]);
    
    // Atualizar cache otimisticamente
    queryClient.setQueryData(['table-guests', tableId], (old: any[]) => [
      ...old,
      { ...newGuest, id: 'temp-' + Date.now(), guestNumber: old.length + 1 }
    ]);
    
    return { previousGuests };
  },
  
  // Se falhar, reverter
  onError: (err, newGuest, context) => {
    queryClient.setQueryData(['table-guests', tableId], context.previousGuests);
  },
  
  // Sempre refetch após sucesso
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['table-guests', tableId] });
  },
});
```

---

### SOLUÇÃO 4: Corrigir MoveItemDialog

**Problema atual:**
```typescript
// ❌ Só invalida uma query
onSuccess: () => {
  queryClient.invalidateQueries({ 
    queryKey: ['/api/tables/sessions', sessionId, 'guests'] 
  });
}
```

**Solução:**
```typescript
// ✅ Invalidar TUDO que depende de items
onSuccess: () => {
  // Invalidar guests da sessão
  queryClient.invalidateQueries({ 
    queryKey: [`/api/table-sessions/${sessionId}/guests`] 
  });
  
  // Invalidar orders-by-guest (mostra items por pessoa)
  queryClient.invalidateQueries({ 
    queryKey: [`/api/tables/${tableId}/orders-by-guest`] 
  });
  
  // Invalidar mesa principal
  queryClient.invalidateQueries({ 
    queryKey: [`/api/tables/${tableId}`] 
  });
  
  // Invalidar lista de mesas
  queryClient.invalidateQueries({ 
    queryKey: ['/api/tables'] 
  });
  
  // Forçar refetch imediato
  queryClient.refetchQueries({ 
    queryKey: [`/api/tables/${tableId}/orders-by-guest`],
    type: 'active'
  });
  
  toast({ title: 'Item movido com sucesso!' });
  onOpenChange(false);
}
```

---

### SOLUÇÃO 5: Configurar React Query Globalmente

**Ajustar configuração para refetch mais agressivo:**

```typescript
// client/src/lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // ✅ Dados sempre considerados stale
      refetchOnWindowFocus: true, // ✅ Refetch ao focar janela
      refetchOnMount: true, // ✅ Refetch ao montar
      refetchOnReconnect: true, // ✅ Refetch ao reconectar
      retry: 1, // Tentar apenas 1x
    },
  },
});
```

---

## 📊 Mapeamento de Invalidações Necessárias

### Após Criar Pedido (QuickOrderDialog)
```typescript
✅ /api/tables/${tableId}/orders-by-guest
✅ /api/tables/${tableId}/guests
✅ /api/tables/${tableId}
✅ /api/tables
✅ /api/tables/with-orders
✅ /api/orders
⚠️  /api/table-sessions/${sessionId}/guests (FALTA)
```

### Após Adicionar Pessoa (AddGuestDialog)
```typescript
✅ /api/tables/${tableId}/guests (via invalidateAfterGuestAdded)
✅ /api/tables/${tableId}/orders-by-guest
✅ /api/tables
✅ /api/tables/with-orders
```

### Após Mover Item (MoveItemDialog)
```typescript
❌ /api/table-sessions/${sessionId}/guests (só esta)
⚠️  FALTA:
  - /api/tables/${tableId}/orders-by-guest
  - /api/tables/${tableId}
  - /api/tables
```

### Após Checkout (GuestCheckoutDialog)
```typescript
✅ /api/tables/${tableId}/guests
✅ /api/tables/${tableId}/orders-by-guest
✅ /api/tables/${tableId}
✅ /api/tables
✅ /api/tables/with-orders
```

---

## 🎯 Plano de Correção

### Fase 1: Corrigir Invalidações (CRÍTICO)
1. ✅ Adicionar invalidação completa no `MoveItemDialog`
2. ✅ Adicionar invalidação da sessão no `QuickOrderDialog`
3. ✅ Garantir refetch forçado após mutations
4. ✅ Adicionar delays estratégicos (300ms) para garantir backend finalizou

### Fase 2: Melhorar Fluxo de Diálogos
1. ✅ Implementar callbacks `onSuccess` em todos os diálogos filhos
2. ✅ Manter diálogo pai aberto após fechar filho
3. ✅ Adicionar loading states durante invalidações
4. ✅ Implementar transições suaves

### Fase 3: Optimistic Updates (OPCIONAL)
1. ⚠️  Implementar para ações frequentes (adicionar pessoa, criar pedido)
2. ⚠️  Adicionar rollback em caso de erro
3. ⚠️  Testar race conditions

### Fase 4: Configuração Global
1. ✅ Ajustar `staleTime` do React Query
2. ✅ Habilitar refetch automático
3. ✅ Adicionar error boundaries

---

## 🐛 Bugs Específicos Encontrados

### Bug 1: QuickOrderDialog não invalida sessão
**Arquivo:** `client/src/components/QuickOrderDialog.tsx`
**Linha:** 327-341
**Problema:** Não invalida `/api/table-sessions/${sessionId}/guests`

### Bug 2: MoveItemDialog invalidação incompleta
**Arquivo:** `client/src/components/MoveItemDialog.tsx`
**Linha:** 86-90
**Problema:** Só invalida uma query, faltam todas as outras

### Bug 3: Delay insuficiente antes de fechar diálogo
**Vários arquivos**
**Problema:** `onOpenChange(false)` chamado imediatamente após invalidação
**Solução:** Adicionar `setTimeout(() => onOpenChange(false), 300)`

---

## 📈 Impacto das Correções

### Antes:
- ❌ Usuário precisa fechar e reabrir diálogo
- ❌ Dados não aparecem sem F5
- ❌ UX ruim e confusa
- ❌ Perda de contexto

### Depois:
- ✅ Diálogos se fecham automaticamente
- ✅ Dados aparecem instantaneamente
- ✅ Fluxo natural e fluido
- ✅ UX profissional
- ✅ Feedback visual imediato

---

## 🔄 Próximos Passos

1. ✅ Corrigir `MoveItemDialog` (PRIORITÁRIO)
2. ✅ Corrigir `QuickOrderDialog` (PRIORITÁRIO)
3. ✅ Adicionar delays em todos os `onSuccess`
4. ✅ Testar fluxo completo: Abrir mesa → Adicionar pessoa → Criar pedido → Mover item → Checkout
5. ⚠️  Implementar optimistic updates (opcional)
6. ⚠️  Adicionar loading states globais
