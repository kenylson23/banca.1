# Correção: Cálculo de Total com Descontos e Taxas

## 🐛 Problema Identificado

O usuário reportou uma **inconsistência crítica no cálculo dos totais** no diálogo de gestão de mesas:

### Cenário do Problema:
1. **Pedido original**: 8.000 Kz
2. **Desconto de 15%**: -1.200 Kz → Subtotal: 6.800 Kz
3. **Taxa de serviço**: +2.000 Kz → **Total final esperado: 8.800 Kz**
4. **Problema**: O diálogo `TableDetailsDialog` mostrava apenas **8.000 Kz** (valor original)
5. **Erro ao pagar**: Sistema alertava que 8.800 Kz excede os 8.000 Kz esperados

## 🔍 Causa Raiz

O endpoint **`/api/tables/:id/orders-by-guest`** no backend calculava o `totalAmount` apenas como **soma dos pedidos**, **SEM aplicar os ajustes da sessão**:

```typescript
// ❌ CÓDIGO ANTIGO (ERRADO)
const totalAmount = orders
  .filter((o: any) => o.status !== 'cancelado')
  .reduce((sum: number, o: any) => sum + calculateOrderTotal(o), 0);
```

### Inconsistência:
- ✅ **Frontend** (`TableDialogPOSModern`): Aplicava corretamente desconto + taxa
- ❌ **Backend** (`/api/tables/:id/orders-by-guest`): Retornava apenas soma dos pedidos
- ❌ **Frontend** (`TableDetailsDialog`): Usava o valor do backend (errado)

## ✅ Solução Implementada

### Arquivo: `server/routes.ts` (linhas ~4961-5010)

Implementado o **mesmo algoritmo de cálculo** usado no frontend:

```typescript
// ✅ CORREÇÃO: Calculate total with session adjustments (discount + service fee)

// Step 1: Calculate subtotal from orders
const subtotalBeforeAdjustments = orders
  .filter((o: any) => o.status !== 'cancelado')
  .reduce((sum: number, o: any) => sum + calculateOrderTotal(o), 0);

// Step 2: Get session adjustments
const sessionDiscount = parseFloat(session?.discount || '0');
const sessionDiscountType = session?.discountType || 'valor';
const sessionServiceCharge = parseFloat(session?.serviceCharge || '0');
const sessionServiceChargeType = session?.serviceChargeType || 'percentual';

// Step 3: Apply discount
let totalAmount = subtotalBeforeAdjustments;
if (sessionDiscount > 0) {
  if (sessionDiscountType === 'percentual') {
    const discountPercent = Math.min(sessionDiscount, 100);
    totalAmount = totalAmount * (1 - discountPercent / 100);
  } else {
    totalAmount = Math.max(0, totalAmount - sessionDiscount);
  }
}

// Step 4: Apply service charge (on discounted amount)
if (sessionServiceCharge > 0) {
  if (sessionServiceChargeType === 'percentual') {
    totalAmount = totalAmount * (1 + sessionServiceCharge / 100);
  } else {
    totalAmount = totalAmount + sessionServiceCharge;
  }
}
```

## 🎯 Algoritmo de Cálculo

### Ordem de Aplicação:
1. **Subtotal**: Soma de todos os pedidos não cancelados
2. **Desconto**: Aplicado sobre o subtotal (percentual ou valor fixo)
3. **Taxa de Serviço**: Aplicada sobre o valor JÁ descontado (percentual ou valor fixo)

### Exemplo Prático:
```
Subtotal:         8.000 Kz
Desconto (15%):  -1.200 Kz
Valor após desc:  6.800 Kz
Taxa serviço:    +2.000 Kz
TOTAL FINAL:      8.800 Kz ✅
```

## 📊 Impacto

### Antes:
- ❌ Diálogo gestão mostrava: **8.000 Kz**
- ❌ Pagamento esperava: **8.000 Kz**
- ❌ Cliente tentava pagar: **8.800 Kz**
- ❌ **ERRO**: "Valor excede o esperado"

### Depois:
- ✅ Backend calcula: **8.800 Kz**
- ✅ Diálogo gestão mostra: **8.800 Kz**
- ✅ Pagamento espera: **8.800 Kz**
- ✅ Cliente paga: **8.800 Kz**
- ✅ **SUCESSO**: Pagamento processado corretamente

## 🔧 Debug Melhorado

Adicionado log detalhado no backend para facilitar diagnóstico:

```typescript
console.log(`[orders-by-guest] Mesa ${req.params.id}:`, {
  sessionId: table.currentSessionId,
  subtotalBeforeAdjustments: subtotalBeforeAdjustments.toFixed(2),
  sessionDiscount: sessionDiscount.toFixed(2),
  sessionDiscountType,
  sessionServiceCharge: sessionServiceCharge.toFixed(2),
  sessionServiceChargeType,
  totalAmount: totalAmount.toFixed(2),
  paidAmount: session?.paidAmount || '0.00',
});
```

## 📝 Componentes Afetados

### ✅ Agora Sincronizados:
1. **Backend**: `/api/tables/:id/orders-by-guest` (server/routes.ts)
2. **Frontend Modern**: `TableDialogPOSModern.tsx` (linhas 204-237)
3. **Frontend Classic**: `TableDetailsDialog.tsx` (linhas 994-1006)

Todos usam o **mesmo algoritmo** para garantir consistência.

## 🧪 Como Testar

1. Abrir uma mesa e fazer pedidos (ex: 8.000 Kz)
2. Aplicar desconto de 15% na sessão (via diálogo de gestão)
3. Aplicar taxa de serviço de 2.000 Kz
4. Verificar que ambos diálogos mostram **8.800 Kz**
5. Tentar pagar 8.800 Kz
6. ✅ Pagamento deve ser aceito sem erros

## 🎉 Resultado

**Problema resolvido!** O sistema agora:
- ✅ Calcula totais corretamente no backend
- ✅ Aplica descontos e taxas de forma consistente
- ✅ Sincroniza valores entre todos os diálogos
- ✅ Aceita pagamentos com valores ajustados
- ✅ Fornece logs detalhados para debug

---
**Data da Correção**: 2026-01-06  
**Arquivos Modificados**: `server/routes.ts`  
**Linhas Alteradas**: ~4961-5010  
