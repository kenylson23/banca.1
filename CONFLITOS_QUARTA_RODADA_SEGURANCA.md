# 🔴 CONFLITOS CRÍTICOS - Quarta Rodada (Segurança e Validações)

## Resumo da Quarta Verificação Extrema

Focada em **validações de entrada**, **segurança** e **edge cases extremos**.

**Resultado**: Encontrados **7 NOVOS CONFLITOS**, sendo **3 CRÍTICOS (P0) de SEGURANÇA**!

---

## 🔴 CONFLITO #23: Validação de `amount` Inconsistente

### Severidade: 🔴 ALTA | Prioridade: **P0**

### O Problema:
Endpoint `/api/table-guests/:guestId/payment` (linha 4198) **NÃO valida adequadamente** o valor do pagamento!

### Código Atual:
```typescript
// Linha 4198 - SEM VALIDAÇÃO ADEQUADA
const paymentAmount = parseFloat(amount);
if (isNaN(paymentAmount) || paymentAmount <= 0) {
  return res.status(400).json({ message: "Valor de pagamento inválido" });
}
```

### vs Endpoint Principal (linha 3979):
```typescript
// ✅ VALIDAÇÃO CORRETA
if (!amount || parseFloat(amount) <= 0) {
  return res.status(400).json({ message: "Amount must be greater than 0" });
}
```

### Ataques Possíveis:
```javascript
// Caso 1: Valor muito pequeno (arredonda para 0)
amount = "0.001" → arredonda para "0.00" no banco ❌

// Caso 2: Valor gigantesco (overflow)
amount = "999999999999999" → Pode causar overflow

// Caso 3: Valores especiais
amount = "Infinity" → parseFloat retorna Infinity ❌
amount = "1e308" → Número muito grande
```

---

## 🔴 CONFLITO #25: Vulnerabilidade de Segurança - Acesso Cross-Restaurant (CRÍTICO!)

### Severidade: 🔴 **CRÍTICA** | Prioridade: **P0**

### O Problema:
**NENHUM** endpoint de pagamento valida se a mesa pertence ao restaurante do usuário!

### Código Vulnerável:
```typescript
// Todos os endpoints fazem:
const restaurantId = currentUser.restaurantId!;
const table = await storage.getTableById(req.params.id);

// ❌ NÃO VERIFICA: table.restaurantId === restaurantId
// Garçom pode pagar mesa de OUTRO restaurante!
```

### Cenário de Ataque Real:
```
1. Garçom do Restaurante A (ID: rest-aaa)
2. Descobre tableId de mesa do Restaurante B (ID: rest-bbb)
3. POST /api/tables/mesa-do-B/payment
4. Backend aceita pagamento! ❌
5. Dinheiro do Restaurante B vai para conta do Restaurante A ❌
```

### Endpoints Vulneráveis:
- `/api/tables/:id/payment` ❌
- `/api/tables/:id/payments` ❌
- `/api/table-guests/:guestId/payment` ❌ (via guest.tableId)

### Correção Necessária:
```typescript
// SEMPRE validar:
const table = await storage.getTableById(req.params.id);
if (table.restaurantId !== restaurantId) {
  return res.status(403).json({ 
    message: "Acesso negado: Mesa não pertence ao seu restaurante" 
  });
}
```

---

## 🔴 CONFLITO #29: Endpoint Legacy Sem Nenhuma Validação

### Severidade: 🔴 ALTA | Prioridade: **P0**

### O Problema:
Endpoint `/api/tables/:id/payments` (plural, linha 4415) **NÃO valida `amount`**!

### Código:
```typescript
app.post("/api/tables/:id/payments", isCashierOrAbove, async (req, res) => {
  const { amount, paymentMethod, notes, sessionId } = req.body;
  
  // ❌ SEM VALIDAÇÃO!
  
  const payment = await storage.addTablePayment(restaurantId, {
    amount, // Pode ser NaN, negativo, string qualquer!
    ...
  });
});
```

### Ataques Possíveis:
```javascript
// Registrar pagamento negativo (roubo)
amount = "-10000"

// Registrar NaN
amount = "texto qualquer"

// SQL Injection potencial
amount = "0'; DROP TABLE payments;--"
```

---

## 🟡 CONFLITO #24: Desconto > 100% Não É Validado na Aplicação

### Severidade: 🔴 MÉDIA | Prioridade: P1

### O Problema:
`calculateTableTotal` limita desconto a 100%, mas **ao aplicar** desconto inicialmente, não há validação!

### Onde Aplicar Validação:
Endpoint que aplica desconto (precisa encontrar) deve validar:

```typescript
if (discountType === 'percentual' && (discount < 0 || discount > 100)) {
  return res.status(400).json({ 
    message: "Desconto percentual deve estar entre 0 e 100" 
  });
}
```

---

## 🟡 CONFLITO #26: Gorjetas Ilimitadas (Risco de Fraude)

### Severidade: 🟡 BAIXA | Prioridade: P2

### O Problema:
Cliente pode pagar **qualquer valor** acima do total, sem limite.

### Cenário:
```
Total: 100 Kz
Cliente "paga": 1.000.000 Kz (gorjeta de 999.900%)
Sistema aceita! ❌
```

### Risco:
- Erro de digitação (0 extras)
- Fraude (registrar pagamento falso)
- Lavagem de dinheiro

### Solução Recomendada:
```typescript
const maxTipPercent = 50; // 50% gorjeta máxima
const maxAllowedPayment = totalAmount * (1 + maxTipPercent / 100);

if (paymentAmount > maxAllowedPayment) {
  return res.status(400).json({
    message: `Valor muito alto. Máximo permitido: ${maxAllowedPayment.toFixed(2)} (inclui ${maxTipPercent}% gorjeta)`
  });
}
```

---

## 🟡 CONFLITO #27: Pagamento de 0 Kz Pode Ser Registrado

### Severidade: 🟡 BAIXA | Prioridade: P2

### O Problema:
Validação bloqueia `amount <= 0`, mas valores muito pequenos arredondam para 0:

```javascript
amount = "0.001" → parseFloat(0.001) ✅ Passa validação
0.001.toFixed(2) → "0.00" ❌ Inserido no banco como 0!
```

### Solução:
```typescript
const minAmount = 0.01; // 1 centavo mínimo
if (paymentAmount < minAmount) {
  return res.status(400).json({
    message: `Valor mínimo: ${minAmount.toFixed(2)}`
  });
}
```

---

## 🟡 CONFLITO #28: Double-Submit/Race Condition

### Severidade: 🟡 MÉDIA | Prioridade: P1

### O Problema:
Cliente clica "Pagar" 2x rápido → 2 pagamentos registrados!

### Soluções:
1. **Idempotency Key** (melhor):
   ```typescript
   const idempotencyKey = req.headers['x-idempotency-key'];
   // Verificar se pagamento com esse key já existe
   ```

2. **Debounce no Frontend**
3. **Lock Otimista** (última opção)

---

## 📊 ESTATÍSTICAS FINAIS - Todas as Rodadas

### Total de Conflitos Identificados: **29**

| Rodada | P0 (Críticos) | Status |
|--------|---------------|--------|
| 1ª | 6 | ✅ Corrigidos |
| 2ª | 3 | ✅ Corrigidos |
| 3ª | 4 | ✅ 3 corrigidos, 1 adiado (transações) |
| 4ª | **3** | ⚠️ **Pendentes** (SEGURANÇA!) |
| **TOTAL P0** | **16** | 12 ✅ / 4 ⚠️ |

### Breakdown Completo:

| Prioridade | Total | Resolvidos | Pendentes | % Resolvido |
|-----------|-------|-----------|-----------|-------------|
| **P0 - Críticos** | **16** | **12** | **4** | **75%** |
| P1 - Médios | 7 | 0 | 7 | 0% |
| P2 - Baixos | 6 | 0 | 6 | 0% |
| **TOTAL** | **29** | **12** | **17** | **41%** |

---

## 🚨 PRIORIDADE MÁXIMA:

### **CONFLITO #25 - VULNERABILIDADE DE SEGURANÇA CRÍTICA!**

**Este é o mais grave!** Garçons podem:
- ❌ Pagar mesas de outros restaurantes
- ❌ Roubar dinheiro entre restaurantes
- ❌ Causar prejuízos financeiros enormes

**DEVE ser corrigido IMEDIATAMENTE antes de qualquer deploy!**

---

## 📝 Pendentes P0 (Por Ordem de Urgência):

1. **#25** - Validação de restaurantId (SEGURANÇA!) - ⚠️ **URGENTE!**
2. **#23** - Validação de amount consistente
3. **#29** - Endpoint legacy sem validação
4. **#16** - Transações atômicas (adiado)

---

## ✅ Status do Sistema:

**Funcionalidade**: 100% ✅  
**Segurança**: ⚠️ **VULNERÁVEL!**  
**Robustez**: 75% ✅

**Recomendação**: ⚠️ **NÃO DEPLOY** até corrigir #25 (segurança crítica)!

---

**Data**: 2026-01-06  
**Status**: ⚠️ **VULNERABILIDADE DE SEGURANÇA CRÍTICA ENCONTRADA**  
**Ação**: Corrigir #25 IMEDIATAMENTE!
