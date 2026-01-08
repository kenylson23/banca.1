# 🔍 Análise: Fechar Mesa com Pagamentos ou Pedidos Pendentes

**Data:** 2026-01-05  
**Pergunta:** Se um pagamento estiver pendente ou um pedido, será possível fechar a mesa?

---

## 📊 Resposta Rápida

### **Pagamento Pendente:**
- ❌ **NÃO** - Sistema bloqueia automaticamente
- ⚠️ **SIM com forceClose** - Apenas Admin/Manager podem forçar

### **Pedido Pendente (não pago):**
- ❌ **NÃO** - Pedido gera valor pendente = bloqueia
- ✅ **SIM** - Se pedido foi cancelado ou pago

---

## 🔍 Análise Detalhada

### **1. Validação de Pagamentos (validateSessionClosure)**

Quando você tenta fechar uma mesa, o sistema executa esta validação:

```typescript
async validateSessionClosure(sessionId: string): Promise<{
  canClose: boolean;           // Pode fechar?
  totalPending: number;         // Quanto falta pagar
  unpaidGuests: Array<...>;     // Quem não pagou
  warnings: string[];           // Avisos
}>
```

#### **Processo de Validação:**

```typescript
// Para cada convidado da mesa:
for (const guest of guests) {
  const subtotal = parseFloat(guest.subtotal || '0');     // Total do convidado
  const paid = parseFloat(guest.paidAmount || '0');       // Quanto já pagou
  const pending = subtotal - paid;                        // Quanto falta
  
  if (pending > 0.01) {  // Tolera 1 centavo de diferença
    totalPending += pending;
    unpaidGuests.push({
      id: guest.id,
      name: guest.name || `Convidado ${guest.guestNumber}`,
      pending: pending
    });
  }
}

return {
  canClose: totalPending <= 0,  // ✅ Só pode fechar se nada pendente
  totalPending,
  unpaidGuests,
  warnings
};
```

#### **Exemplo Prático:**

**Mesa 5 - 3 Convidados:**
```
Convidado #1 (João):
  Pedidos: 15.000 Kz
  Pago:    15.000 Kz
  Pendente: 0 Kz ✅

Convidado #2 (Maria):
  Pedidos: 20.000 Kz
  Pago:    20.000 Kz
  Pendente: 0 Kz ✅

Convidado #3 (Pedro):
  Pedidos: 10.000 Kz
  Pago:    5.000 Kz
  Pendente: 5.000 Kz ❌

TOTAL PENDENTE: 5.000 Kz
canClose: false ❌
```

---

### **2. Comportamento no Endpoint de Fechamento**

```typescript
// server/routes.ts - Linha 3792
const validation = await storage.validateSessionClosure(table.currentSessionId);

if (!validation.canClose && !req.body.forceClose) {
  return res.status(400).json({
    message: "Mesa possui valores pendentes de pagamento",
    pendingAmount: validation.totalPending,
    unpaidGuests: validation.unpaidGuests,
    warnings: validation.warnings,
    canForceClose: currentUser.role === 'admin' || 
                   currentUser.role === 'manager' || 
                   currentUser.role === 'superadmin'
  });
}
```

#### **Cenário 1: Sem Forçar (Padrão)**

**SE** `totalPending > 0` **E** `forceClose = false`:
- ❌ **BLOQUEIA** o fechamento
- Retorna erro 400 com detalhes:
  ```json
  {
    "message": "Mesa possui valores pendentes de pagamento",
    "pendingAmount": 5000,
    "unpaidGuests": [
      {
        "id": "uuid-pedro",
        "name": "Pedro",
        "pending": 5000
      }
    ],
    "warnings": [],
    "canForceClose": true
  }
  ```

#### **Cenário 2: Forçar Fechamento (Admin/Manager)**

**SE** `totalPending > 0` **E** `forceClose = true` **E** `role = admin/manager`:
- ✅ **PERMITE** o fechamento
- Mesa fecha mesmo com pendências
- Histórico registra que foi forçado

**Request:**
```typescript
POST /api/tables/:id/close-session
Body: {
  forceClose: true
}
```

---

## 🎯 Cenários Práticos

### **Cenário 1: Todos Pagaram** ✅

```
Mesa 5:
  Total: 45.000 Kz
  Pago:  45.000 Kz
  Pendente: 0 Kz

Ação: Caixa clica "Fechar Mesa"
Resultado: ✅ Mesa fecha normalmente
```

---

### **Cenário 2: Alguém Não Pagou** ❌

```
Mesa 5:
  Total: 45.000 Kz
  Pago:  35.000 Kz
  Pendente: 10.000 Kz (Cliente Pedro)

Ação: Caixa clica "Fechar Mesa"
Resultado: ❌ ERRO
  "Mesa possui valores pendentes de pagamento"
  "Pedro deve 10.000 Kz"

Opções:
  1. Processar pagamento de Pedro (10.000 Kz)
  2. Admin força fechamento (forceClose: true)
```

---

### **Cenário 3: Pedido Feito mas Não Pago** ❌

```
Mesa 5:
  Cliente João fez pedido de 15.000 Kz
  Status do pedido: "preparing" (preparando)
  Pagamento: 0 Kz

Ação: Caixa tenta fechar mesa
Resultado: ❌ BLOQUEADO
  Pedido não pago = valor pendente
  
Cálculo:
  subtotal do João = 15.000 Kz
  paidAmount do João = 0 Kz
  pending = 15.000 Kz ❌
```

---

### **Cenário 4: Pedido Cancelado** ✅

```
Mesa 5:
  Cliente João fez pedido de 15.000 Kz
  Pedido foi CANCELADO
  Status: "cancelled"

Resultado: ✅ Pedido cancelado não entra no subtotal
  
Cálculo:
  subtotal do João = 0 Kz (pedido cancelado não conta)
  paidAmount do João = 0 Kz
  pending = 0 Kz ✅
  
Mesa pode fechar normalmente
```

---

### **Cenário 5: Admin Força Fechamento** ⚠️

```
Mesa 5:
  Total: 45.000 Kz
  Pago:  40.000 Kz
  Pendente: 5.000 Kz

Situação: Cliente saiu sem pagar os últimos 5.000 Kz

Ação: Admin clica "Fechar Mesa"
  Sistema mostra: "Pendente 5.000 Kz. Forçar?"
  Admin confirma: forceClose = true

Resultado: ✅ Mesa fecha com pendência
  ⚠️ Registrado no sistema que foi forçado
  ⚠️ Restaurante assume o prejuízo
```

---

## 🔐 Permissões para Forçar

### **Podem Forçar Fechamento:**
- ✅ **Admin**
- ✅ **Manager**
- ✅ **Superadmin**

### **NÃO Podem Forçar:**
- ❌ **Cashier** - Precisa resolver pendências
- ❌ **Waiter** - Nem pode fechar normalmente

---

## 📊 Matriz de Decisão

| Situação | Pendente | forceClose | Role | Resultado |
|----------|----------|------------|------|-----------|
| Tudo pago | 0 Kz | false | qualquer | ✅ Fecha |
| Pendente 5K | 5.000 Kz | false | cashier | ❌ ERRO |
| Pendente 5K | 5.000 Kz | false | admin | ❌ ERRO |
| Pendente 5K | 5.000 Kz | true | cashier | ❌ ERRO (sem permissão) |
| Pendente 5K | 5.000 Kz | true | admin | ✅ Fecha (forçado) |
| Pendente 5K | 5.000 Kz | true | manager | ✅ Fecha (forçado) |

---

## 💡 Regras de Negócio

### **Regra 1: Pedidos Geram Valor**
Todo pedido **não cancelado** entra no subtotal do convidado:
```typescript
// Pedido "preparing", "ready", "completed" = CONTA
// Pedido "cancelled" = NÃO CONTA
```

### **Regra 2: Tolerância de 1 Centavo**
```typescript
if (pending > 0.01) {  // Tolera até 1 centavo
  // Considera como pendente
}
```
**Motivo:** Arredondamentos em cálculos podem gerar diferenças mínimas

### **Regra 3: Reconciliação**
Sistema verifica se:
```
Soma(subtotal de todos os convidados) = Total da sessão
```
Se houver diferença > 10 centavos, gera warning mas não bloqueia.

---

## 🎨 Interface do Usuário

### **Quando Há Pendências:**

#### **Toast/Erro Exibido:**
```
❌ Erro ao fechar mesa

Mesa possui valores pendentes de pagamento

Pendente: 5.000 Kz

Convidados não pagos:
  • Pedro: 5.000 Kz
  • Maria: 2.000 Kz

Total pendente: 7.000 Kz
```

#### **Se Admin/Manager:**
```
❌ Erro ao fechar mesa

Mesa possui 7.000 Kz pendentes

⚠️ Você pode forçar o fechamento, mas o 
   restaurante assumirá o prejuízo.

[ Cancelar ]  [ ⚠️ Forçar Fechamento ]
```

---

## 🔄 Fluxo Completo

```
1. Usuário clica "Fechar Mesa"
   ↓
2. Sistema calcula pendências
   ├─ Para cada convidado:
   │    subtotal - paidAmount = pending
   │
   └─ Total Pendente = Soma(pending)
   ↓
3. Total Pendente > 0?
   │
   ├─ SIM → BLOQUEIA
   │   │
   │   ├─ Mostra erro com detalhes
   │   │
   │   ├─ É Admin/Manager?
   │   │   ├─ SIM → Oferece "Forçar"
   │   │   └─ NÃO → Apenas erro
   │   │
   │   └─ forceClose = true?
   │       ├─ SIM → FECHA (com warning)
   │       └─ NÃO → MANTÉM BLOQUEADO
   │
   └─ NÃO → FECHA NORMALMENTE ✅
```

---

## ⚠️ Casos Especiais

### **1. Pedido em Preparação**
```
Cliente fez pedido mas ainda está sendo preparado
Status: "preparing"

Pergunta: Pode fechar mesa?
Resposta: ❌ NÃO - Pedido gera valor pendente
```

### **2. Pedido Pronto mas Não Pago**
```
Pedido foi entregue ao cliente
Status: "completed"
Pagamento: Não feito

Pergunta: Pode fechar mesa?
Resposta: ❌ NÃO - Valor não foi pago
```

### **3. Todos os Pedidos Cancelados**
```
Mesa tinha 3 pedidos
Todos foram cancelados
Subtotal de todos = 0 Kz

Pergunta: Pode fechar mesa?
Resposta: ✅ SIM - Não há valor pendente
```

### **4. Pagamento Parcial**
```
Mesa: 100.000 Kz
Pago: 95.000 Kz
Pendente: 5.000 Kz

Pergunta: Pode fechar mesa?
Resposta: ❌ NÃO - Ainda faltam 5.000 Kz
```

### **5. Cliente Saiu Sem Pagar (Prejuízo)**
```
Mesa: 50.000 Kz
Pago: 0 Kz
Cliente saiu

Ação: Admin força fechamento
Resultado: ✅ Mesa fecha
  ⚠️ Restaurante assume prejuízo de 50.000 Kz
  ⚠️ Registrado no sistema como "forçado"
```

---

## 📊 Resumo Executivo

### **Pergunta 1: Pagamento pendente - pode fechar?**
**Resposta:** ❌ **NÃO** (padrão)
- Sistema bloqueia automaticamente
- Mostra quanto falta e quem deve
- **Exceção:** Admin/Manager podem forçar

### **Pergunta 2: Pedido pendente (não pago) - pode fechar?**
**Resposta:** ❌ **NÃO**
- Pedido não pago = valor pendente
- Precisa:
  - Processar pagamento, OU
  - Cancelar pedido, OU
  - Admin forçar fechamento

### **Pergunta 3: Pedido cancelado - pode fechar?**
**Resposta:** ✅ **SIM**
- Pedido cancelado não conta no subtotal
- Não gera valor pendente

### **Regra Geral:**
```
Mesa só fecha normalmente se:
  Total de Pedidos = Total Pago
  (diferença máxima de 0.01 Kz)
```

---

## 🎯 Recomendações

### **Para Operação Normal:**
1. ✅ Processar todos os pagamentos antes de fechar
2. ✅ Cancelar pedidos não desejados
3. ✅ Verificar se totais estão corretos

### **Para Situações Especiais:**
1. ⚠️ Usar `forceClose` apenas quando necessário
2. ⚠️ Documentar motivo do fechamento forçado
3. ⚠️ Revisar pendências posteriormente

### **Para Segurança:**
1. 🔒 Apenas Admin/Manager podem forçar
2. 🔒 Sistema registra fechamentos forçados
3. 🔒 Auditoria disponível para revisão

---

## ✅ Conclusão

O sistema de encerramento de mesas é **rigoroso por padrão**:
- ❌ **NÃO permite** fechar com valores pendentes
- ⚠️ **PERMITE forçar** apenas para Admin/Manager
- ✅ **Garante** que nada seja perdido acidentalmente

Isso protege o restaurante de:
- Fechar mesa sem receber pagamento
- Perder controle de valores
- Erros operacionais

Ao mesmo tempo, oferece flexibilidade para situações excepcionais através do `forceClose`.
