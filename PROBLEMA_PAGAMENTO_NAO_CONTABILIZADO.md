# 🚨 Problema: Pagamento pelo Checkout Não É Contabilizado

**Data:** 2026-01-05  
**Problema:** Pagamento feito pelo checkout wizard não é reconhecido como pago

---

## 🔍 Problema Identificado:

### **Dois Cálculos Diferentes de `totalPaid`:**

#### **1. TableDialogPOSModern (Linha 178):**
```typescript
const totalPaid = currentTable?.paidAmount || 0;
```
- ✅ Usa campo `paidAmount` da mesa (atualizado pelo backend após pagamento)

#### **2. PaymentSection (Linha 132-135):**
```typescript
const totalPaid = ordersByGuest
  ?.filter((og: any) => og.guest.status === 'pago')
  .reduce((sum: number, og: any) => sum + parseFloat(og.subtotal || '0'), 0) || 0;
```
- ❌ Filtra apenas convidados com `status === 'pago'`
- ❌ Esse status pode não ser atualizado após pagamento pelo checkout

---

## 🎯 O Que Acontece:

### **Fluxo Atual:**
```
1. Usuário faz pagamento pelo checkout wizard
   ↓
2. Backend registra pagamento
   ↓
3. Backend atualiza `mesa.paidAmount = 20.400`
   ↓
4. Backend atualiza `convidado.paidAmount = 20.400`
   ↓
5. MAS: `convidado.status` pode não mudar para 'pago' ❌
   ↓
6. PaymentSection filtra por status === 'pago'
   ↓
7. Não encontra nenhum convidado
   ↓
8. totalPaid = 0 ❌
   ↓
9. totalUnpaid = 20.400 ❌
   ↓
10. Mostra "Pendente" mesmo estando pago ❌
```

---

## ✅ Solução:

### **Usar o mesmo cálculo de totalPaid:**

O PaymentSection deve usar o `paidAmount` da mesa (ou dos convidados), não filtrar por status.

```typescript
// ❌ ERRADO (atual)
const totalPaid = ordersByGuest
  ?.filter((og: any) => og.guest.status === 'pago')
  .reduce((sum: number, og: any) => sum + parseFloat(og.subtotal || '0'), 0) || 0;

// ✅ CORRETO (deve ser)
const totalPaid = ordersByGuest
  ?.reduce((sum: number, og: any) => sum + parseFloat(og.guest.paidAmount || '0'), 0) || 0;
```

**Diferença:**
- ANTES: Filtra por `status === 'pago'` (pode não estar atualizado)
- DEPOIS: Soma `paidAmount` de cada convidado (sempre atualizado pelo backend)

---

## 📊 Exemplo:

### **Mesa 10 - Situação Atual:**
```
Convidado #1:
  subtotal: 20.400 Kz
  paidAmount: 20.400 Kz ✅ (atualizado pelo backend)
  status: 'ativo' ❌ (não mudou para 'pago')

Cálculo ERRADO:
  totalPaid = convidados com status 'pago' = 0 ❌
  totalUnpaid = 20.400 - 0 = 20.400 ❌

Cálculo CORRETO:
  totalPaid = soma de paidAmount = 20.400 ✅
  totalUnpaid = 20.400 - 20.400 = 0 ✅
```

---

## 🔧 Correção Necessária:

Mudar PaymentSection para calcular `totalPaid` corretamente.
