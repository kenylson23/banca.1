# Análise Profunda: Pagamento Individual com Descontos e Taxas

**Data:** 2026-01-07  
**Componentes Analisados:**
- `client/src/pages/table-checkout-v2.tsx` (Checkout V2)
- `server/routes.ts` (Rotas de pagamento)
- Linhas críticas: 4200-4350 (pagamento individual), 4027-4150 (pagamento mesa)

---

## 🎯 Resumo Executivo

O sistema possui **2 rotas distintas de pagamento** com lógicas **diferentes** para aplicação de descontos e taxas:

1. **`POST /api/table-guests/:guestId/payment`** - Pagamento individual de convidado
2. **`POST /api/tables/:id/payment`** - Pagamento geral da mesa

### ⚠️ PROBLEMA IDENTIFICADO

Quando no **Checkout V2** é selecionado **apenas 1 convidado** para pagamento individual com **descontos e taxas**, a rota `/api/table-guests/:guestId/payment` é chamada, mas:

❌ **Esta rota NÃO aceita os parâmetros `discount`, `discountType`, `serviceCharge`, `serviceChargeType`**

Os ajustes são **calculados no frontend** e enviados apenas no campo `amount`, mas os ajustes **não são salvos na sessão**.

---

## 📊 Fluxo Completo Detalhado

### **Cenário: Pagamento Individual com Desconto 10% e Taxa 10%**

```
Mesa: 4 convidados
Selecionado: 1 convidado (João)
Subtotal do João: R$ 100,00
Desconto (10%): -R$ 10,00
Após desconto: R$ 90,00
Taxa de serviço (10%): +R$ 9,00
Total final: R$ 99,00
```

---

## 🔍 Análise do Frontend (Checkout V2)

### **Arquivo:** `client/src/pages/table-checkout-v2.tsx`

#### **1. Cálculo dos Totais (Linhas 590-702)**

```typescript
const calculateTotals = useMemo(() => {
  let subtotal = totalAmount;
  let discounts = 0;
  let additions = 0;
  
  // 1. Manual discount
  if (discountValue && parseFloat(discountValue) > 0) {
    const discount = discountType === 'percentual'
      ? subtotal * (parseFloat(discountValue) / 100)
      : parseFloat(discountValue);
    discounts += Math.min(discount, subtotal);
  }
  
  // 2. Coupon, Loyalty points...
  
  // 3. Services (taxa de serviço)
  const afterDiscounts = Math.max(0, subtotal - discounts);
  
  if (manualServiceValue && parseFloat(manualServiceValue) > 0) {
    const charge = manualServiceType === 'percentual'
      ? afterDiscounts * (parseFloat(manualServiceValue) / 100)
      : parseFloat(manualServiceValue);
    additions += charge;
  }
  
  const finalTotal = Math.max(0, afterDiscounts + additions);
  
  return { subtotal, totalDiscounts: discounts, totalAdditions: additions, finalTotal };
}, [totalAmount, discountValue, discountType, manualServiceValue, manualServiceType, ...]);
```

✅ **Correto:** Desconto aplicado ANTES, taxa aplicada DEPOIS.

---

#### **2. Decisão de Rota (Linhas 434-452)**

```typescript
const processPaymentMutation = useMutation({
  mutationFn: async () => {
    // ...
    
    // ✅ NEW: Se apenas 1 convidado selecionado, usar rota de pagamento específico
    if (selectedGuestIds.length === 1) {
      const guestId = selectedGuestIds[0];
      const guestPayload = {
        amount: calculateTotals.finalTotal.toFixed(2), // ⚠️ APENAS O VALOR FINAL
        paymentMethod,
        notes: receivedAmount ? `Valor recebido: ${parseFloat(receivedAmount).toFixed(2)}` : 'Pagamento individual',
        receivedAmount: receivedAmount ? parseFloat(receivedAmount) : undefined,
      };
      
      console.log('🎯 [CHECKOUT] Usando rota de pagamento INDIVIDUAL:', {
        guestId,
        route: `/api/table-guests/${guestId}/payment`,
        payload: guestPayload
      });
      
      const res = await apiRequest('POST', `/api/table-guests/${guestId}/payment`, guestPayload);
      return res.json();
    }
    
    // Pagamento geral da mesa (múltiplos convidados)
    const payload = {
      tableId: id,
      sessionId: table.currentSessionId,
      amount: calculateTotals.finalTotal.toFixed(2),
      paymentMethod,
      discount: discountValue ? discountValue : undefined, // ✅ ENVIA AJUSTES
      discountType: discountValue ? discountType : undefined,
      serviceCharge: manualServiceValue ? manualServiceValue : undefined, // ✅ ENVIA AJUSTES
      serviceChargeType: manualServiceValue ? manualServiceType : undefined,
      // ...
    };
    
    const res = await apiRequest('POST', `/api/tables/${id}/payment`, payload);
    return res.json();
  }
});
```

### ❌ **PROBLEMA IDENTIFICADO #1: Perda de Informação**

Quando `selectedGuestIds.length === 1`:
- Envia apenas `amount` (valor final já calculado)
- **NÃO envia** `discount`, `discountType`, `serviceCharge`, `serviceChargeType`
- Backend não sabe que houve ajustes aplicados
- Ajustes não são salvos na sessão

---

## 🔍 Análise do Backend

### **Rota 1: Pagamento Individual** 
**Endpoint:** `POST /api/table-guests/:guestId/payment` (Linha 4200)

```typescript
app.post("/api/table-guests/:guestId/payment", isOperational, async (req, res) => {
  // ...
  const { amount, paymentMethod, notes, receivedAmount } = req.body;
  // ⚠️ NÃO ACEITA: discount, discountType, serviceCharge, serviceChargeType
  
  const guestId = req.params.guestId;
  const guest = await storage.getTableGuestById(guestId);
  
  // Buscar ajustes da sessão (linhas 4246-4294)
  const session = await db.select().from(tableSessions)
    .where(eq(tableSessions.id, guest.sessionId))
    .limit(1);
  
  let guestSubtotalAjustado = parseFloat(guest.subtotal || '0');
  
  if (session.length > 0) {
    const sessionDiscount = parseFloat(session[0].discount || '0');
    const sessionDiscountType = session[0].discountType || 'valor';
    const sessionServiceCharge = parseFloat(session[0].serviceCharge || '0');
    const sessionServiceChargeType = session[0].serviceChargeType || 'percentual';
    
    // ✅ Recalcula o subtotal esperado COM ajustes da sessão
    if (sessionDiscount > 0) {
      if (sessionDiscountType === 'percentual') {
        guestSubtotalAjustado = guestSubtotalAjustado * (1 - Math.min(sessionDiscount, 100) / 100);
      } else {
        // Desconto em valor: distribuir proporcionalmente
        const allGuests = await storage.getTableGuests(guest.sessionId);
        const totalSubtotal = allGuests.reduce((sum, g) => sum + parseFloat(g.subtotal || '0'), 0);
        const guestProportion = parseFloat(guest.subtotal || '0') / totalSubtotal;
        const guestDiscountShare = sessionDiscount * guestProportion;
        guestSubtotalAjustado = Math.max(0, guestSubtotalAjustado - guestDiscountShare);
      }
    }
    
    // Aplicar taxa de serviço
    if (sessionServiceCharge > 0) {
      if (sessionServiceChargeType === 'percentual') {
        guestSubtotalAjustado = guestSubtotalAjustado * (1 + sessionServiceCharge / 100);
      } else {
        // Taxa em valor: distribuir proporcionalmente
        const allGuests = await storage.getTableGuests(guest.sessionId);
        const totalSubtotal = allGuests.reduce((sum, g) => sum + parseFloat(g.subtotal || '0'), 0);
        const guestProportion = parseFloat(guest.subtotal || '0') / totalSubtotal;
        const guestChargeShare = sessionServiceCharge * guestProportion;
        guestSubtotalAjustado = guestSubtotalAjustado + guestChargeShare;
      }
    }
  }
  
  // Validação de valor (linhas 4296-4320)
  const minAllowed = guestSubtotalAjustado * 0.9;
  const maxAllowed = guestSubtotalAjustado * 1.1;
  
  // ⚠️ Aceita valores dentro da margem de ±10%
  
  // Criar pagamento (linhas 4323-4343)
  const [tablePayment] = await db.insert(tablePayments).values({
    restaurantId,
    tableId: guest.tableId,
    sessionId: guest.sessionId,
    amount: amount,
    paymentMethod,
    notes: /* ... */,
  }).returning();
  
  const guestPayment = await storage.createGuestPayment(restaurantId, {
    guestId: guestId,
    sessionId: guest.sessionId,
    tablePaymentId: tablePayment.id,
    amount: amount,
    paymentMethod,
  });
  
  // Atualizar sessão (linha 4346+)
  const allGuests = await storage.getTableGuests(guest.sessionId);
  const totalPaid = allGuests.reduce((sum, g) => sum + parseFloat(g.paidAmount || '0'), 0);
  
  // ✅ Atualiza totalAmount COM ajustes existentes na sessão
  // ...
});
```

### ✅ **Lógica Correta MAS com Limitação**

A rota:
1. ✅ Busca ajustes já salvos na sessão
2. ✅ Calcula o valor esperado com ajustes
3. ✅ Valida se o pagamento está correto
4. ✅ Atualiza `paidAmount` do convidado
5. ✅ Atualiza `session.paidAmount` e `session.totalAmount`

**MAS:**
❌ **Se os ajustes NÃO estiverem salvos na sessão ANTES, não funciona corretamente**

---

### **Rota 2: Pagamento Geral da Mesa**
**Endpoint:** `POST /api/tables/:id/payment` (Linha 4027)

```typescript
app.post("/api/tables/:id/payment", isOperational, async (req, res) => {
  // ...
  const { amount, paymentMethod, notes, receivedAmount, services, 
          discount, discountType, serviceCharge, serviceChargeType } = req.body;
  // ✅ ACEITA todos os parâmetros de ajustes
  
  const table = await storage.getTableById(req.params.id);
  
  // ✅ CORREÇÃO: Aplicar desconto e taxa à sessão (linhas 4054-4086)
  if (table.currentSessionId) {
    const updates: any = { updatedAt: new Date() };
    
    // Salvar desconto
    if (discount && parseFloat(discount) > 0) {
      updates.discount = discount;
      updates.discountType = discountType || 'valor';
    }
    
    // Salvar taxa de serviço
    if (serviceCharge && parseFloat(serviceCharge) > 0) {
      updates.serviceCharge = serviceCharge;
      updates.serviceChargeType = serviceChargeType || 'percentual';
    }
    
    // ✅ Aplicar updates
    if (Object.keys(updates).length > 1) {
      await db.update(tableSessions)
        .set(updates)
        .where(eq(tableSessions.id, table.currentSessionId));
    }
  }
  
  // Criar pagamento
  const payment = await storage.addTablePayment(restaurantId, {
    tableId: req.params.id,
    sessionId: table.currentSessionId,
    amount,
    paymentMethod,
    notes: /* ... */,
  });
  
  // Atualizar session.paidAmount e totalAmount COM ajustes
  // ...
});
```

### ✅ **Lógica Completa e Correta**

Esta rota:
1. ✅ Recebe ajustes nos parâmetros
2. ✅ **SALVA os ajustes na sessão** 
3. ✅ Cria o pagamento
4. ✅ Atualiza totais COM ajustes

---

## 🐛 Problemas Identificados

### **Problema #1: Perda de Ajustes em Pagamento Individual**

**Cenário:**
1. Usuário seleciona 1 convidado
2. Aplica desconto 10% e taxa 10%
3. Frontend calcula: `R$ 100 → R$ 90 (desconto) → R$ 99 (taxa)`
4. Frontend envia: `{ amount: "99.00" }` para `/api/table-guests/:guestId/payment`
5. Backend recebe `99.00` mas **não sabe que houve ajustes**
6. Ajustes **NÃO são salvos na sessão**

**Impacto:**
- ❌ Desconto e taxa não aparecem em relatórios
- ❌ Se outro convidado pagar depois, não aplica os mesmos ajustes
- ❌ Histórico da sessão não registra os ajustes
- ❌ Fatura não mostra breakdown correto

---

### **Problema #2: Auto-Save Não Sincronizado**

O Checkout V2 tem auto-save de ajustes (linhas 229-257):

```typescript
const saveAdjustmentsToSession = useCallback(async () => {
  if (table?.currentSessionId) {
    await fetch(`/api/tables/${id}/session-adjustments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        discount: discountValue || '0',
        discountType,
        serviceCharge: manualServiceValue || '0',
        serviceChargeType: manualServiceType,
      }),
    });
  }
}, [table?.currentSessionId, id, discountValue, discountType, manualServiceValue, manualServiceType]);

// Auto-save com debounce
useEffect(() => {
  if (table?.currentSessionId && (discountValue || manualServiceValue)) {
    const timeoutId = setTimeout(() => {
      saveAdjustmentsToSession();
    }, 1000); // Espera 1 segundo após a última mudança
    
    return () => clearTimeout(timeoutId);
  }
}, [discountValue, discountType, manualServiceValue, manualServiceType, table?.currentSessionId, saveAdjustmentsToSession]);
```

**MAS:**
- ⚠️ Debounce de 1 segundo
- ⚠️ Se usuário clicar rápido em "Pagar", pode não ter salvado ainda
- ⚠️ Não há feedback visual de "salvando..."

---

### **Problema #3: Distribuição Proporcional Incorreta**

No pagamento individual, quando há desconto/taxa em **valor fixo**, o backend distribui proporcionalmente (linhas 4263-4283):

```typescript
// Desconto em valor: distribuir proporcionalmente
const allGuests = await storage.getTableGuests(guest.sessionId);
const totalSubtotal = allGuests.reduce((sum, g) => sum + parseFloat(g.subtotal || '0'), 0);
const guestProportion = parseFloat(guest.subtotal || '0') / totalSubtotal;
const guestDiscountShare = sessionDiscount * guestProportion;
```

**Problema:**
- Se João tem R$ 100 e Maria tem R$ 50
- Desconto de R$ 30
- João recebe: R$ 30 × (100/150) = R$ 20
- Maria recebe: R$ 30 × (50/150) = R$ 10

**MAS no frontend:**
- Se seleciona APENAS João, aplica desconto de R$ 30 inteiro
- João paga: R$ 70
- Quando Maria for pagar, backend espera R$ 50 (sem ajuste já que João "consumiu" o desconto)

**Resultado:** Inconsistência entre expectativa e realidade.

---

## 💡 Soluções Propostas

### **Solução #1: Adicionar Parâmetros de Ajuste na Rota Individual** ⭐ RECOMENDADA

Modificar `/api/table-guests/:guestId/payment` para aceitar ajustes:

```typescript
app.post("/api/table-guests/:guestId/payment", isOperational, async (req, res) => {
  const { amount, paymentMethod, notes, receivedAmount, 
          discount, discountType, serviceCharge, serviceChargeType } = req.body;
  
  // Se ajustes foram enviados, salvar na sessão
  if (table.currentSessionId) {
    const updates: any = { updatedAt: new Date() };
    
    if (discount && parseFloat(discount) > 0) {
      updates.discount = discount;
      updates.discountType = discountType || 'valor';
    }
    
    if (serviceCharge && parseFloat(serviceCharge) > 0) {
      updates.serviceCharge = serviceCharge;
      updates.serviceChargeType = serviceChargeType || 'percentual';
    }
    
    if (Object.keys(updates).length > 1) {
      await db.update(tableSessions)
        .set(updates)
        .where(eq(tableSessions.id, guest.sessionId));
    }
  }
  
  // Restante da lógica...
});
```

E no frontend:

```typescript
if (selectedGuestIds.length === 1) {
  const guestId = selectedGuestIds[0];
  const guestPayload = {
    amount: calculateTotals.finalTotal.toFixed(2),
    paymentMethod,
    discount: discountValue || undefined, // ✅ ADICIONAR
    discountType: discountValue ? discountType : undefined,
    serviceCharge: manualServiceValue || undefined, // ✅ ADICIONAR
    serviceChargeType: manualServiceValue ? manualServiceType : undefined,
    notes: receivedAmount ? `Valor recebido: ${parseFloat(receivedAmount).toFixed(2)}` : 'Pagamento individual',
    receivedAmount: receivedAmount ? parseFloat(receivedAmount) : undefined,
  };
  
  const res = await apiRequest('POST', `/api/table-guests/${guestId}/payment`, guestPayload);
  return res.json();
}
```

---

### **Solução #2: Garantir Auto-Save Antes de Pagar**

Adicionar `await` no botão de pagamento:

```typescript
const handlePayment = async () => {
  // Garantir que ajustes foram salvos
  if (discountValue || manualServiceValue) {
    await saveAdjustmentsToSession();
  }
  
  // Agora processar pagamento
  processPaymentMutation.mutate();
};
```

---

### **Solução #3: Validação de Consistência**

Adicionar validação no backend para detectar inconsistências:

```typescript
// Comparar o valor recebido com o esperado
if (Math.abs(paymentAmount - guestSubtotalAjustado) > 1) { // Margem de R$ 1
  console.warn('[GuestPayment] ⚠️ INCONSISTÊNCIA DETECTADA:', {
    esperado: guestSubtotalAjustado.toFixed(2),
    recebido: paymentAmount.toFixed(2),
    diferenca: (paymentAmount - guestSubtotalAjustado).toFixed(2)
  });
  
  // Opcionalmente: retornar erro ou warning ao frontend
}
```

---

## 📋 Checklist de Implementação

### **Fase 1: Correção Imediata**
- [ ] Adicionar parâmetros `discount`, `discountType`, `serviceCharge`, `serviceChargeType` na rota `/api/table-guests/:guestId/payment`
- [ ] Salvar ajustes na sessão quando fornecidos
- [ ] Atualizar frontend para enviar ajustes no payload

### **Fase 2: Melhorias de Segurança**
- [ ] Adicionar `await saveAdjustmentsToSession()` antes de processar pagamento
- [ ] Adicionar indicador visual de "salvando ajustes..."
- [ ] Validar consistência entre valor enviado e esperado

### **Fase 3: Testes**
- [ ] Testar pagamento individual com desconto percentual
- [ ] Testar pagamento individual com desconto fixo
- [ ] Testar pagamento individual com taxa percentual
- [ ] Testar pagamento individual com taxa fixa
- [ ] Testar pagamento individual com desconto + taxa combinados
- [ ] Testar múltiplos convidados pagando sequencialmente com ajustes

---

## 🧪 Casos de Teste

### **Teste 1: Pagamento Individual com Desconto Percentual**

**Setup:**
- Mesa com 2 convidados: João (R$ 100) e Maria (R$ 50)
- Desconto: 10% (percentual)
- Taxa: 10% (percentual)

**Fluxo:**
1. Selecionar apenas João
2. Aplicar desconto 10% → R$ 90
3. Aplicar taxa 10% → R$ 99
4. Processar pagamento

**Expectativa:**
- ✅ João paga R$ 99
- ✅ `session.discount = "10"`
- ✅ `session.discountType = "percentual"`
- ✅ `session.serviceCharge = "10"`
- ✅ `session.serviceChargeType = "percentual"`
- ✅ Quando Maria pagar, recebe os mesmos ajustes: R$ 50 → R$ 45 → R$ 49,50

---

### **Teste 2: Pagamento Individual com Desconto Fixo**

**Setup:**
- Mesa com 2 convidados: João (R$ 100) e Maria (R$ 50)
- Desconto: R$ 30 (fixo)
- Taxa: R$ 15 (fixo)

**Fluxo:**
1. Selecionar apenas João
2. Aplicar desconto R$ 30
3. Aplicar taxa R$ 15

**Problema Atual:**
- Frontend calcula desconto inteiro para João: R$ 100 - R$ 30 = R$ 70
- Mas backend distribui proporcionalmente: João (2/3) = R$ 20, Maria (1/3) = R$ 10

**Solução:**
- Se pagamento individual com desconto fixo, converter para percentual
- Ou deixar claro no UI que desconto fixo será distribuído

---

## 📊 Diagrama de Fluxo

```
┌─────────────────────────────────────────────────────────────┐
│              CHECKOUT V2 - PAGAMENTO INDIVIDUAL              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │  Usuário seleciona:   │
                  │  - 1 convidado (João) │
                  │  - Desconto 10%       │
                  │  - Taxa 10%           │
                  └───────────────────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │  calculateTotals()    │
                  │  Subtotal: R$ 100     │
                  │  -Desconto: R$ 10     │
                  │  +Taxa: R$ 9          │
                  │  Final: R$ 99         │
                  └───────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │  selectedGuestIds.length === 1?        │
        └─────────────────────────────────────────┘
                     │                    │
                     │ SIM                │ NÃO
                     ▼                    ▼
    ┌─────────────────────────┐   ┌──────────────────────────┐
    │  POST /api/table-guests │   │  POST /api/tables/:id    │
    │  /:guestId/payment      │   │  /payment                │
    │                         │   │                          │
    │  Payload:               │   │  Payload:                │
    │  - amount: "99.00"      │   │  - amount: "99.00"       │
    │  ❌ NO discount         │   │  ✅ discount: "10"       │
    │  ❌ NO serviceCharge    │   │  ✅ discountType: "%"    │
    │                         │   │  ✅ serviceCharge: "10"  │
    │                         │   │  ✅ serviceChargeType    │
    └─────────────────────────┘   └──────────────────────────┘
                     │                    │
                     ▼                    ▼
    ┌─────────────────────────┐   ┌──────────────────────────┐
    │  Backend:               │   │  Backend:                │
    │  - Busca ajustes        │   │  - SALVA ajustes na      │
    │    existentes na sessão │   │    sessão                │
    │  - Se não existem,      │   │  - Cria pagamento        │
    │    ❌ usa apenas amount │   │  - Atualiza totais       │
    │  - Valida ±10%          │   │  ✅ Tudo sincronizado    │
    │  - Atualiza guest       │   │                          │
    └─────────────────────────┘   └──────────────────────────┘
                     │                    │
                     ▼                    ▼
              ❌ PROBLEMA!           ✅ FUNCIONA!
```

---

## 🎯 Conclusão

### **Estado Atual:**
- ✅ Pagamento geral da mesa COM ajustes: **FUNCIONA**
- ❌ Pagamento individual COM ajustes: **FUNCIONA PARCIALMENTE**
  - Frontend calcula corretamente
  - Backend valida corretamente
  - **MAS ajustes não são salvos na sessão**

### **Impacto:**
- 🔴 **ALTO** - Perda de informação financeira
- 🟡 **MÉDIO** - Inconsistência em pagamentos sequenciais
- 🟢 **BAIXO** - Sistema ainda funciona, mas não ideal

### **Recomendação:**
Implementar **Solução #1** imediatamente para garantir que ajustes sejam salvos corretamente em todos os cenários de pagamento.

---

**Documentação criada em:** 2026-01-07 17:30 UTC  
**Autor:** Rovo Dev  
**Status:** Análise Completa - Aguardando Implementação
