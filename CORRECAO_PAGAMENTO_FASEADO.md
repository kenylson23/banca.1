# ✅ Correção: Pagamento Faseado (Parcial)

**Data:** 2026-01-05  
**Status:** ✅ IMPLEMENTADO

---

## 🎯 Problema

O "Checkout Rápido" no `PaymentSection` só permitia pagamento **TOTAL** do valor pendente. Não era possível fazer pagamentos parciais/faseados.

**Exemplo:**
- Mesa com 10.000 Kz pendente
- Usuário queria pagar 5.000 Kz agora e 5.000 Kz depois
- ❌ Sistema só aceitava pagar os 10.000 Kz completos

---

## 🔍 Causa Raiz

No código original, o valor do pagamento era fixo:

```typescript
// ❌ ANTES: Sempre pagava o total pendente
const payload = {
  tableId: table.id,
  sessionId: table.currentSessionId,
  amount: totalUnpaid.toFixed(2),  // ← Sempre o total
  paymentMethod,
};
```

Não havia campo para o usuário especificar um valor diferente.

---

## 🔧 Solução Implementada

### 1. **Adicionado Estado para Valor Customizado**

```typescript
const [customAmount, setCustomAmount] = useState(''); // 🔧 FIX: Permitir valor customizado
```

### 2. **Lógica de Pagamento Flexível**

```typescript
// 🔧 FIX: Usar customAmount se fornecido, senão totalUnpaid (pagamento total)
const paymentAmount = customAmount && parseFloat(customAmount) > 0 
  ? parseFloat(customAmount) 
  : totalUnpaid;

// Validar que não está pagando mais que o pendente
if (paymentAmount > totalUnpaid) {
  throw new Error(`Valor de pagamento (${paymentAmount.toFixed(2)}) não pode ser maior que o pendente (${totalUnpaid.toFixed(2)})`);
}

if (paymentAmount <= 0) {
  throw new Error('Valor de pagamento deve ser maior que zero');
}

const payload = {
  tableId: table.id,
  sessionId: table.currentSessionId,
  amount: paymentAmount.toFixed(2),  // ← Valor flexível
  paymentMethod,
};
```

### 3. **Campo de Input na Interface**

```typescript
<div className="space-y-2">
  <Label htmlFor="custom-amount">
    Valor do Pagamento
    <span className="text-xs text-muted-foreground ml-2">
      (deixe vazio para pagar o total)
    </span>
  </Label>
  <Input
    id="custom-amount"
    type="number"
    step="0.01"
    min="0"
    max={totalUnpaid}
    placeholder={`Máx: ${totalUnpaid.toFixed(2)} Kz`}
    value={customAmount}
    onChange={(e) => setCustomAmount(e.target.value)}
  />
  
  {/* Preview do pagamento parcial */}
  {customAmount && parseFloat(customAmount) > 0 && (
    <div className="text-sm p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200">
      <div className="flex items-center justify-between">
        <span className="text-blue-700">Pagamento Parcial:</span>
        <span className="font-bold text-blue-700">
          {formatKwanza(parseFloat(customAmount))}
        </span>
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-blue-600">Restará após pagamento:</span>
        <span className="text-xs font-semibold text-blue-600">
          {formatKwanza(totalUnpaid - parseFloat(customAmount))}
        </span>
      </div>
    </div>
  )}
  
  {/* Mensagem quando não há valor customizado */}
  {!customAmount && (
    <p className="text-xs text-muted-foreground">
      💡 Pagamento total de {formatKwanza(totalUnpaid)} será processado
    </p>
  )}
</div>
```

### 4. **Feedback Inteligente no Toast**

```typescript
onSuccess: () => {
  const wasPartialPayment = customAmount && parseFloat(customAmount) > 0 && parseFloat(customAmount) < totalUnpaid;
  
  toast({
    title: wasPartialPayment ? "Pagamento parcial processado" : "Pagamento processado",
    description: wasPartialPayment 
      ? `${formatKwanza(parseFloat(customAmount))} recebido. Restam ${formatKwanza(totalUnpaid - parseFloat(customAmount))}`
      : "O pagamento foi registrado com sucesso",
  });
  
  // Limpar campos
  setCustomAmount('');
  setReceivedAmount('');
  setShowQuickCheckout(false);
  
  // Se foi pagamento parcial, não fechar o diálogo principal (para permitir mais pagamentos)
  if (!wasPartialPayment) {
    onClose();
  }
}
```

### 5. **Botão Dinâmico**

```typescript
<Button
  className="flex-1 bg-green-600 hover:bg-green-700"
  onClick={() => quickPaymentMutation.mutate()}
  disabled={quickPaymentMutation.isPending || !paymentMethod}
>
  {quickPaymentMutation.isPending ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      Processando...
    </>
  ) : (
    <>
      <CreditCard className="w-4 h-4 mr-2" />
      {customAmount && parseFloat(customAmount) > 0 && parseFloat(customAmount) < totalUnpaid
        ? `Pagar ${formatKwanza(parseFloat(customAmount))}`  // ← "Pagar 5.000,00 Kz"
        : 'Pagar Total'}  // ← "Pagar Total"
    </>
  )}
</Button>
```

---

## 📊 Fluxo de Uso

### Cenário 1: Pagamento Total (Comportamento Original)

1. Usuário abre "Checkout Rápido"
2. **Não preenche** o campo "Valor do Pagamento"
3. Seleciona método de pagamento
4. Clica em **"Pagar Total"**
5. Sistema paga todo o valor pendente
6. Toast: "Pagamento processado"
7. Diálogo fecha automaticamente

---

### Cenário 2: Pagamento Parcial (NOVO!)

1. Usuário abre "Checkout Rápido"
2. Vê que o pendente é **10.000 Kz**
3. **Digita 5.000** no campo "Valor do Pagamento"
4. Vê o preview:
   ```
   Pagamento Parcial: 5.000,00 Kz
   Restará após pagamento: 5.000,00 Kz
   ```
5. Seleciona método de pagamento
6. Clica em **"Pagar 5.000,00 Kz"**
7. Sistema processa pagamento de 5.000 Kz
8. Toast: "Pagamento parcial processado - 5.000,00 Kz recebido. Restam 5.000,00 Kz"
9. **Diálogo permanece aberto** (para fazer outro pagamento se quiser)
10. Valores atualizados:
    - Total: 10.000,00 Kz
    - Pago: 5.000,00 Kz ← ATUALIZADO
    - Restante: 5.000,00 Kz ← ATUALIZADO

---

## 🎨 Interface Visual

### Antes:
```
┌─────────────────────────────┐
│ Checkout Rápido             │
├─────────────────────────────┤
│ Valor a Pagar               │
│ 10.000,00 Kz                │
│                             │
│ Método: [Dinheiro ▼]        │
│                             │
│ [Cancelar] [Confirmar]      │
└─────────────────────────────┘
```

### Depois:
```
┌─────────────────────────────┐
│ Checkout Rápido             │
├─────────────────────────────┤
│ Valor Pendente Total        │
│ 10.000,00 Kz                │
│                             │
│ Valor do Pagamento          │
│ (deixe vazio para pagar     │
│  o total)                   │
│ [5000_____________] Kz      │ ← NOVO!
│                             │
│ ┌─────────────────────────┐ │
│ │ Pagamento Parcial:      │ │ ← PREVIEW
│ │ 5.000,00 Kz             │ │
│ │ Restará: 5.000,00 Kz    │ │
│ └─────────────────────────┘ │
│                             │
│ Método: [Dinheiro ▼]        │
│                             │
│ [Cancelar] [Pagar 5.000 Kz] │ ← BOTÃO DINÂMICO
└─────────────────────────────┘
```

---

## ✅ Validações Implementadas

### 1. **Valor Máximo**
```typescript
if (paymentAmount > totalUnpaid) {
  throw new Error(`Valor de pagamento (${paymentAmount.toFixed(2)}) não pode ser maior que o pendente (${totalUnpaid.toFixed(2)})`);
}
```

### 2. **Valor Mínimo**
```typescript
if (paymentAmount <= 0) {
  throw new Error('Valor de pagamento deve ser maior que zero');
}
```

### 3. **Campo Input com Constraints**
```typescript
<Input
  type="number"
  step="0.01"
  min="0"
  max={totalUnpaid}  // ← Não permite digitar mais que o pendente
/>
```

---

## 🧪 Testes

### Teste 1: Pagamento Total (Sem preencher campo)
1. Mesa com 10.000 Kz pendente
2. Abrir Checkout Rápido
3. **Não preencher** campo "Valor do Pagamento"
4. Selecionar método e confirmar
5. **Esperado:** Pagar 10.000 Kz completos ✅

### Teste 2: Pagamento Parcial (Metade)
1. Mesa com 10.000 Kz pendente
2. Abrir Checkout Rápido
3. **Digitar 5.000** no campo
4. Selecionar método e confirmar
5. **Esperado:** Pagar 5.000 Kz, restar 5.000 Kz ✅

### Teste 3: Múltiplos Pagamentos Parciais
1. Mesa com 10.000 Kz pendente
2. Pagar 3.000 Kz
3. Diálogo permanece aberto
4. Pagar 4.000 Kz
5. Diálogo permanece aberto
6. Pagar 3.000 Kz (total)
7. **Esperado:** 
   - Total pago: 10.000 Kz ✅
   - Diálogo fecha ✅

### Teste 4: Validação de Valor Maior
1. Mesa com 10.000 Kz pendente
2. Tentar digitar 15.000 Kz
3. **Esperado:** Erro "não pode ser maior que o pendente" ✅

### Teste 5: Validação de Valor Zero
1. Mesa com 10.000 Kz pendente
2. Digitar 0 no campo
3. **Esperado:** Erro "deve ser maior que zero" ✅

---

## 📝 Arquivos Modificados

### `client/src/components/table-dialog/sections/PaymentSection.tsx`

**Linhas modificadas:**
1. **Linha 65:** Adicionado estado `customAmount`
2. **Linhas 84-100:** Lógica de pagamento flexível com validações
3. **Linhas 111-130:** Feedback inteligente no toast
4. **Linhas 490-540:** Campo de input para valor customizado
5. **Linhas 618-648:** Botão dinâmico

---

## 🎯 Benefícios

### 1. **Flexibilidade**
- Permite pagamentos parciais
- Permite múltiplos pagamentos
- Mantém opção de pagamento total

### 2. **UX Melhorada**
- Preview do valor a pagar
- Preview do valor que restará
- Botão mostra exatamente o que vai ser pago
- Toast informativo
- Diálogo permanece aberto para pagamentos sequenciais

### 3. **Segurança**
- Validações no frontend e backend
- Não permite valor > pendente
- Não permite valor <= 0

### 4. **Retrocompatibilidade**
- Se não preencher o campo, funciona como antes (pagamento total)
- Não quebra fluxos existentes

---

## 🚀 Comparação: Antes vs Depois

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Tipos de pagamento** | Apenas total | Total OU Parcial |
| **Campo de valor** | Não existe | Existe (opcional) |
| **Múltiplos pagamentos** | Difícil | Fácil (diálogo permanece aberto) |
| **Feedback visual** | Genérico | Específico (parcial vs total) |
| **Validações** | Não havia | Completas (min/max) |
| **Preview** | Não existe | Mostra valor e restante |

---

## ✅ Status Final

| Funcionalidade | Status |
|----------------|--------|
| Pagamento total (padrão) | ✅ FUNCIONANDO |
| Pagamento parcial | ✅ IMPLEMENTADO |
| Múltiplos pagamentos parciais | ✅ FUNCIONANDO |
| Validações de valor | ✅ IMPLEMENTADAS |
| Preview visual | ✅ IMPLEMENTADO |
| Feedback inteligente | ✅ IMPLEMENTADO |
| Botão dinâmico | ✅ IMPLEMENTADO |

---

**Pagamento faseado implementado com sucesso! 🎉✅**
