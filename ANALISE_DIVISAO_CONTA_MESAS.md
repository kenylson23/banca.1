# 📊 Análise Completa: Divisão de Conta - Gestão de Mesas

**Data:** 2026-01-03  
**Objetivo:** Entender o fluxo completo de divisão de conta e os diálogos ativos na gestão de mesas

---

## 🎯 Visão Geral do Sistema

### Arquitetura de Diálogos

```
┌─────────────────────────────────────────────────────────────┐
│                   GESTÃO DE MESAS                            │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              TableDialogWrapper.tsx                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Renderiza: TableDialogPOSModern (Atual)             │  │
│  │  Alternativa: TableDialogSplitPanelEnhanced (Antigo) │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│         TableDialogPOSModern.tsx (PRINCIPAL)                 │
│                                                              │
│  Sections (5 Abas):                                         │
│  ├─ OverviewSection     → Visão geral da mesa              │
│  ├─ GuestsSection       → Gestão de pessoas/convidados     │
│  ├─ OrdersSection       → Gestão de pedidos                │
│  ├─ PaymentSection      → Pagamento (inline)               │
│  └─ HistorySection      → Histórico                        │
│                                                              │
│  Dialogs Auxiliares:                                        │
│  ├─ StartSessionDialog   → Iniciar sessão                  │
│  ├─ AddPersonDialog      → Adicionar pessoa                │
│  ├─ QuickOrderDialog     → Pedido rápido                   │
│  ├─ QRCodeDialog         → QR Code                         │
│  ├─ ConvertGuestDialog   → Converter convidado             │
│  ├─ CancelOrderDialog    → Cancelar pedido                 │
│  ├─ EditOrderDialog      → Editar pedido                   │
│  └─ MoveItemDialog       → Mover item entre convidados     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔀 Fluxos de Divisão de Conta

### **Opção 1: Divisão Rápida (Botão "Dividir Conta")**

**Localização:** `TableDialogPOSModern.tsx` - linha 604

```typescript
<Button 
  variant="outline" 
  size="lg"
  onClick={() => {
    onOpenChange(false);
    navigate(`/tables/${table?.id}/checkout?step=1&split=true`);
  }}
  disabled={currentTable?.status === 'livre' || ordersCount === 0}
>
  Dividir Conta
</Button>
```

**Fluxo:**
1. Usuario clica em "Dividir Conta" no rodapé do diálogo POS
2. Fecha o diálogo da mesa
3. Navega para `/tables/:id/checkout?step=1&split=true`
4. Abre o **TableCheckoutV2** com parâmetro `split=true`

---

### **Opção 2: Pagamento Inline (Seção Payment)**

**Localização:** `TableDialogPOSModern.tsx` - linha 549-556

```typescript
{activeSection === 'payment' && (
  <PaymentSection
    table={currentTable}
    guests={allSessionGuests || []}
    ordersByGuest={ordersByGuest || []}
    totalAmount={totalAmount}
    onClose={() => onOpenChange(false)}
  />
)}
```

**Características:**
- Pagamento dentro do próprio diálogo da mesa
- Não fecha o diálogo
- Sem wizard de steps
- Mais rápido para pagamento total

---

## 📄 Página de Checkout: `table-checkout-v2.tsx`

### **Estrutura de Steps (Wizard)**

```typescript
const STEPS = [
  { id: 1, name: "Revisar", icon: ShoppingBag, description: "Itens e clientes" },
  { id: 2, name: "Benefícios", icon: Gift, description: "Cupons e pontos" },
  { id: 3, name: "Ajustes", icon: Settings, description: "Descontos e taxas" },
  { id: 4, name: "Pagamento", icon: CreditCard, description: "Finalizar" },
];
```

### **Step 1: Revisar (Seleção de Convidados)**

**Problema Identificado e Corrigido:**
- ❌ **ANTES:** Resumo mostrava valores com desconto/taxa mesmo sem selecionar convidados
- ✅ **AGORA:** Resumo mostra apenas valores puros no Step 1

**Correção Aplicada (linhas 128-139):**
```typescript
useEffect(() => {
  updateURL(currentStep, discountValue, discountType, manualServiceValue, manualServiceType);
  
  // 🎯 CORREÇÃO: Limpar ajustes quando voltar ao Step 1
  if (currentStep === 1) {
    setDiscountValue('');
    setManualServiceValue('');
    setAppliedCoupon(null);
    setLoyaltyPointsToRedeem('');
  }
}, [currentStep, discountValue, discountType, manualServiceValue, manualServiceType, updateURL]);
```

**Funcionalidades:**
- ✅ Listar todos os convidados da mesa
- ✅ Permitir seleção múltipla de convidados (checkbox)
- ✅ Filtrar itens por convidados selecionados
- ✅ Mostrar subtotal sem ajustes
- ✅ Busca e ordenação de convidados

**Seleção de Convidados:**
```typescript
const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]);

// Filtrar pedidos baseado na seleção
const filteredOrdersByGuest = useMemo(() => 
  selectedGuestIds.length > 0
    ? ordersByGuest.filter((og: any) => selectedGuestIds.includes(og.guest.id))
    : ordersByGuest,
  [ordersByGuest, selectedGuestIds]
);

// Calcular total baseado na seleção
const totalAmount = selectedGuestIds.length > 0
  ? filteredOrdersByGuest.reduce((sum: number, og: any) => sum + parseFloat(og.subtotal || 0), 0)
  : ordersByGuestData?.totalAmount;
```

---

## 🎁 Componente: `BillSplitPanel.tsx`

### **Objetivo**
Componente especializado para divisão complexa de contas com drag-and-drop.

### **Recursos Principais**

1. **Tipos de Divisão:**
   - `igual` → Dividir valor igualmente
   - `por_pessoa` → Cada pessoa paga seus próprios itens
   - `personalizado` → Configuração manual

2. **Drag & Drop:**
   - Mover itens entre convidados
   - Reatribuir pedidos
   - Histórico de movimentações (auditoria)

3. **Gestão de Pagamentos Individuais:**
   - Pagar conta de convidado específico
   - Múltiplos métodos de pagamento
   - Impressão de conta individual

### **API Endpoints Usados**

```typescript
// Listar divisões existentes
GET /api/tables/${tableId}/bill-splits

// Criar nova divisão
POST /api/tables/${tableId}/bill-splits
Body: {
  splitType: 'igual' | 'por_pessoa' | 'personalizado',
  splitCount?: number,
  totalAmount: string,
  allocations?: any
}

// Finalizar divisão (pagar)
POST /api/tables/${tableId}/bill-splits/${splitId}/finalize
Body: {
  paymentMethod: string
}

// Mover item entre convidados
POST /api/table-guests/${sourceGuestId}/move-item
Body: {
  orderItemId: string,
  targetGuestId: string,
  reason: string,
  notes?: string
}
```

### **Gestão de Convidados**

```typescript
interface TableGuest {
  id: string;
  sessionId: string;
  name: string | null;
  guestNumber: number;
  status: 'ativo' | 'aguardando_conta' | 'pago' | 'saiu';
  totalSpent: string;
  joinedAt: Date;
}

// Status dos convidados
const getGuestStatusLabel = (status: string) => {
  return {
    ativo: 'Ativo',
    aguardando_conta: 'Pediu Conta',
    pago: 'Pago',
    saiu: 'Saiu',
  }[status];
};
```

---

## 🎨 Fluxo Visual: Como Dividir a Conta

### **Cenário 1: Divisão Simples (Todos pagam junto)**

```
1. Abrir mesa → TableDialogPOSModern
2. Clicar "Finalizar Pagamento" (rodapé direito)
3. PaymentSection aparece inline
4. Selecionar método de pagamento
5. Processar pagamento total
6. Mesa fechada ✅
```

### **Cenário 2: Divisão por Pessoa (Cada um paga o seu)**

```
1. Abrir mesa → TableDialogPOSModern
2. Clicar "Dividir Conta" (rodapé esquerdo)
3. Navega para /tables/:id/checkout?step=1&split=true
4. STEP 1: Selecionar convidados específicos
   └─ [✓] Convidado 1 (50 Kz)
   └─ [✓] Convidado 2 (75 Kz)
   └─ [ ] Convidado 3 (não selecionado)
5. STEP 2: Aplicar cupons/pontos (opcional)
6. STEP 3: Aplicar descontos/taxas (opcional)
7. STEP 4: Escolher método e finalizar
8. Volta para mesa com convidados restantes
9. Repetir para próximos convidados
```

### **Cenário 3: Divisão Complexa (Mover itens entre pessoas)**

```
1. Abrir mesa → TableDialogPOSModern
2. Ir para aba "Pedidos" (OrdersSection)
3. Clicar em item do pedido
4. Selecionar "Mover Item"
5. MoveItemDialog abre:
   ├─ Escolher convidado destino
   ├─ Selecionar motivo
   └─ Confirmar
6. Item é movido com auditoria
7. Totais recalculados automaticamente
8. Depois usar "Dividir Conta" normalmente
```

---

## 📱 Diálogos Auxiliares Detalhados

### **1. MoveItemDialog**
**Arquivo:** `client/src/components/MoveItemDialog.tsx`

**Propósito:** Mover item de pedido de um convidado para outro

**Motivos disponíveis:**
```typescript
const reasons = [
  { value: 'erro_atendente', label: 'Erro do atendente' },
  { value: 'pedido_errado', label: 'Pedido atribuído errado' },
  { value: 'dividir_conta', label: 'Divisão de conta' },
  { value: 'cliente_pagou', label: 'Cliente pagou por outro' },
  { value: 'outro', label: 'Outro motivo' },
];
```

### **2. AddPersonDialog**
**Arquivo:** `client/src/components/table-dialog/dialogs/AddPersonDialog.tsx`

**Propósito:** Adicionar novo convidado à mesa

**Fluxo:**
1. Preencher nome (opcional)
2. Vincular cliente cadastrado (opcional)
3. Definir número do assento (opcional)
4. Confirmar
5. Novo convidado criado com status "ativo"

### **3. ConvertGuestDialog**
**Arquivo:** `client/src/components/ConvertGuestDialog.tsx`

**Propósito:** Converter convidado anônimo em cliente cadastrado

**Benefícios:**
- Acumular pontos de fidelidade
- Histórico de compras
- Aplicar cupons personalizados
- Marketing direcionado

### **4. QRCodeDialog**
**Arquivo:** `client/src/components/table-dialog/dialogs/QRCodeDialog.tsx`

**Propósito:** Gerar QR Code para menu digital

**Link gerado:**
```
https://[dominio]/[restaurant-slug]/menu/[tableId]?guest=[guestToken]
```

---

## 🔄 Fluxo de Dados: Divisão de Conta

### **Estado Global (React Query)**

```typescript
// Dados da mesa
const { data: tablesData } = useQuery({
  queryKey: ['/api/tables/with-orders'],
});

// Pedidos por convidado
const { data: ordersByGuestData } = useQuery<OrdersByGuestData>({
  queryKey: [`/api/tables/${id}/orders-by-guest`],
});

// Estrutura retornada
interface OrdersByGuestData {
  ordersByGuest: Array<{
    guest: TableGuest;
    orders: GuestOrder[];
    totalAmount: number;
    subtotal: string;
  }>;
  anonymousOrders: Order[];
  totalAmount: string;
  paidAmount: string;
}
```

### **Cálculos de Totais**

```typescript
const calculateTotals = useMemo(() => {
  let subtotal = totalAmount;
  let discounts = 0;
  let additions = 0;
  const breakdown: any[] = [];
  
  // 1. Desconto manual
  if (discountValue && parseFloat(discountValue) > 0) {
    const discount = discountType === 'percentual'
      ? subtotal * (parseFloat(discountValue) / 100)
      : parseFloat(discountValue);
    discounts += Math.min(discount, subtotal);
  }
  
  // 2. Cupom
  if (appliedCoupon) {
    const discount = appliedCoupon.discountType === 'percentual'
      ? subtotal * (parseFloat(appliedCoupon.discountValue) / 100)
      : parseFloat(appliedCoupon.discountValue);
    discounts += discount;
  }
  
  // 3. Pontos de fidelidade
  if (loyaltyPointsToRedeem) {
    const pointsValue = parseFloat(loyaltyPointsToRedeem) * 
      parseFloat(loyaltyProgram?.currencyPerPoint || "1");
    discounts += pointsValue;
  }
  
  // 4. Taxas de serviço (sobre valor após descontos)
  const afterDiscounts = Math.max(0, subtotal - discounts);
  
  if (manualServiceValue && parseFloat(manualServiceValue) > 0) {
    const charge = manualServiceType === 'percentual'
      ? afterDiscounts * (parseFloat(manualServiceValue) / 100)
      : parseFloat(manualServiceValue);
    additions += charge;
  }
  
  return {
    subtotal,
    totalDiscounts: discounts,
    totalAdditions: additions,
    finalTotal: Math.max(0, subtotal - discounts + additions),
    breakdown,
  };
}, [totalAmount, discountValue, discountType, appliedCoupon, 
    loyaltyPointsToRedeem, manualServiceValue, manualServiceType]);
```

---

## 🎯 Problema Identificado e Soluções

### **Problema 1: Valores com ajustes no Step 1** ✅ RESOLVIDO

**Descrição:**
No Step 1 (Revisar), o resumo lateral já mostrava descontos e taxas aplicados antes do utilizador selecionar convidados.

**Causa Raiz:**
```typescript
// Código problemático (linhas 165-188)
useEffect(() => {
  if (table?.currentSessionId && tablesData) {
    // ❌ Restaurava ajustes SEMPRE ao carregar
    fetch(`/api/tables/${id}/sessions`)
      .then(/* restaurar descontos e taxas */);
  }
}, [table?.currentSessionId, id, tablesData]);
```

**Solução Aplicada:**

**1. Restaurar ajustes apenas após Step 1:**
```typescript
useEffect(() => {
  // ✅ Só restaura se currentStep > 1
  if (table?.currentSessionId && tablesData && currentStep > 1) {
    fetch(`/api/tables/${id}/sessions`)
      .then(/* restaurar descontos e taxas */);
  }
}, [table?.currentSessionId, id, tablesData, currentStep]);
```

**2. Limpar ajustes ao voltar para Step 1:**
```typescript
useEffect(() => {
  // ✅ Limpa tudo quando volta ao Step 1
  if (currentStep === 1) {
    setDiscountValue('');
    setManualServiceValue('');
    setAppliedCoupon(null);
    setLoyaltyPointsToRedeem('');
  }
}, [currentStep]);
```

**Resultado:**
- ✅ Step 1 mostra apenas valores puros (sem ajustes)
- ✅ Step 2+ restaura ajustes da sessão automaticamente
- ✅ Utilizador vê exatamente o que vai pagar por convidado

---

### **Problema 2: Erro de desestruturação useTableMutations** ✅ RESOLVIDO

**Descrição:**
```
TypeError: Cannot destructure property 'tableId' of 'object null'
at useTableMutations (useTableMutations.ts:9:37)
```

**Causa:**
```typescript
// ❌ TableDialogPOSModern.tsx linha 112
const mutations = useTableMutations(table?.id || null);

// Hook esperava objeto, mas recebia valor direto
export function useTableMutations({ tableId }: UseTableMutationsProps) {
  // tableId é undefined porque recebeu 'null' como argumento
}
```

**Solução:**
```typescript
// ✅ Passar objeto com propriedade tableId
const mutations = useTableMutations({ tableId: table?.id });
```

---

## 📋 Checklist: Como Implementar Divisão de Conta

### **Opção A: Divisão Rápida (Recomendado para maioria)**

```
☐ 1. Usuário abre mesa (TableDialogPOSModern)
☐ 2. Clica "Dividir Conta" no rodapé
☐ 3. Sistema navega para table-checkout-v2
☐ 4. STEP 1: Usuário seleciona convidados específicos
☐ 5. STEP 2-3: Aplica benefícios/ajustes (opcional)
☐ 6. STEP 4: Escolhe método de pagamento
☐ 7. Sistema processa pagamento parcial
☐ 8. Convidados pagos ficam com status "pago"
☐ 9. Volta para mesa e repete para outros
☐ 10. Quando todos pagarem, sessão fecha automaticamente
```

### **Opção B: Divisão com Movimentação de Itens**

```
☐ 1. Abrir mesa e ir para aba "Pedidos"
☐ 2. Identificar itens que estão no convidado errado
☐ 3. Clicar no item → "Mover Item"
☐ 4. Selecionar convidado destino
☐ 5. Escolher motivo: "Divisão de conta"
☐ 6. Confirmar movimentação
☐ 7. Sistema registra auditoria
☐ 8. Totais recalculados em tempo real
☐ 9. Depois usar "Dividir Conta" normalmente
```

### **Opção C: Pagamento Total sem Divisão**

```
☐ 1. Abrir mesa (TableDialogPOSModern)
☐ 2. Clicar "Finalizar Pagamento" (direita)
☐ 3. PaymentSection aparece inline
☐ 4. Selecionar método
☐ 5. Processar pagamento do valor total
☐ 6. Sessão encerrada, mesa liberada
```

---

## 🚀 Melhorias Futuras Sugeridas

### **1. Split Visual no Diálogo**

Adicionar botão "Dividir por Pessoa" diretamente na `PaymentSection`:

```typescript
// Em PaymentSection.tsx
<div className="grid grid-cols-2 gap-3">
  <Button onClick={payAll}>Pagar Tudo</Button>
  <Button onClick={splitPerGuest}>Dividir por Pessoa</Button>
</div>
```

### **2. Preview de Divisão no Step 1**

Mostrar quanto cada convidado selecionado pagará:

```typescript
// Em table-checkout-v2.tsx Step 1
{selectedGuestIds.map(guestId => {
  const guest = ordersByGuest.find(og => og.guest.id === guestId);
  return (
    <div key={guestId}>
      {guest.guest.name}: {formatKwanza(guest.totalAmount)}
    </div>
  );
})}
```

### **3. Atalho Rápido: Pagar Convidado Específico**

Adicionar botão na lista de convidados:

```typescript
// Em GuestsSection.tsx
<Button 
  size="sm"
  onClick={() => {
    navigate(`/tables/${tableId}/checkout?step=1&guest=${guestId}`);
  }}
>
  Pagar Conta
</Button>
```

### **4. Histórico de Divisões**

Mostrar divisões anteriores na `HistorySection`:

```typescript
// Buscar histórico
const { data: splitHistory } = useQuery({
  queryKey: [`/api/tables/${tableId}/bill-splits/history`],
});
```

---

## 📊 Métricas e Monitoramento

### **Eventos a Rastrear**

```typescript
// Analytics de divisão de conta
{
  event: 'bill_split_started',
  tableId: string,
  guestsCount: number,
  totalAmount: number,
  splitType: 'simple' | 'per_guest' | 'custom'
}

{
  event: 'guest_paid',
  tableId: string,
  guestId: string,
  amount: number,
  paymentMethod: string
}

{
  event: 'item_moved',
  fromGuestId: string,
  toGuestId: string,
  itemId: string,
  reason: string
}
```

### **KPIs Importantes**

- ✅ % de mesas com divisão de conta
- ✅ Tempo médio para dividir conta
- ✅ Número médio de movimentações de itens
- ✅ Taxa de erro/cancelamento em divisões
- ✅ Método de pagamento mais usado por convidado

---

## 🎓 Resumo Executivo

### **O que foi descoberto:**

1. ✅ Sistema tem 2 fluxos principais de pagamento:
   - **Inline** (dentro do diálogo da mesa)
   - **Wizard** (navegação para checkout dedicado)

2. ✅ Divisão de conta funciona via:
   - Seleção de convidados específicos no Step 1
   - Cálculo automático baseado nos pedidos deles
   - Múltiplos pagamentos parciais até fechar sessão

3. ✅ Componente `BillSplitPanel` existe mas não é usado no fluxo principal
   - Tem recursos avançados (drag-drop, auditoria)
   - API endpoints prontos
   - Pode ser integrado futuramente

4. ✅ Problemas identificados e corrigidos:
   - Resumo mostrando valores ajustados no Step 1
   - Erro de desestruturação no useTableMutations

### **Como fazer divisão de conta (para usuario final):**

**Método Simples:**
1. Abrir mesa
2. Clicar "Dividir Conta"
3. Selecionar convidados que vão pagar
4. Seguir wizard até pagamento
5. Repetir para próximos convidados

**Método Avançado (com movimentação):**
1. Ir para aba "Pedidos"
2. Mover itens para convidados corretos
3. Depois usar "Dividir Conta" normalmente

---

## 📚 Referências de Código

**Arquivos Principais:**
- `client/src/components/table-dialog/TableDialogPOSModern.tsx` (708 linhas)
- `client/src/pages/table-checkout-v2.tsx` (2285 linhas)
- `client/src/components/BillSplitPanel.tsx` (750 linhas)

**Diálogos Auxiliares:**
- `client/src/components/MoveItemDialog.tsx`
- `client/src/components/ConvertGuestDialog.tsx`
- `client/src/components/table-dialog/dialogs/AddPersonDialog.tsx`

**Hooks Importantes:**
- `client/src/components/table-dialog/hooks/useTableData.ts`
- `client/src/components/table-dialog/hooks/useTableMutations.ts`

---

**Análise criada por:** Rovo Dev  
**Status:** ✅ Completa e Testada
