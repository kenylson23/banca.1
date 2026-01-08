# 🔍 Diagnóstico: Mesa 10 - Botão Não Aparece

**Data:** 2026-01-05  
**Problema:** Botão "Fechar Mesa" não aparece na mesa 10

---

## 📋 Condições Necessárias para o Botão Aparecer

O botão só aparece se **TODAS** estas condições forem verdadeiras:

```typescript
// PaymentSection.tsx - Linha 344
{totalAmount > 0 && onCloseTable && (
  // Card com botão
)}
```

### **Condição 1:** `totalAmount > 0`
- **O que verifica:** Se há valor na mesa
- **Pode falhar se:** Mesa não tem pedidos ou pedidos cancelados

### **Condição 2:** `onCloseTable` (função existe)
- **O que verifica:** Se o callback foi passado
- **Pode falhar se:** Prop não foi passada corretamente
- **Status:** ✅ Confirmado que está sendo passado

### **Condição 3 (implícita):** Mesa tem sessão ativa
- **O que verifica:** `table.status !== 'livre'`
- **Pode falhar se:** Mesa está livre (sem sessão)

---

## 🔍 Possíveis Causas

### **Causa 1: Mesa Sem Pedidos** ⭐ MAIS PROVÁVEL
```typescript
totalAmount = 0

Motivo:
- Mesa não tem nenhum pedido
- Todos os pedidos foram cancelados
- Pedidos não foram carregados corretamente
```

**Como verificar:**
1. Abrir diálogo da mesa 10
2. Ir para aba "Pedidos"
3. Verificar se há algum pedido listado
4. Verificar valor total na aba "Pagamento"

---

### **Causa 2: Mesa Está Livre**
```typescript
table.status = 'livre'

Motivo:
- Sessão não foi iniciada
- Sessão já foi encerrada
```

**Como verificar:**
1. Ver status da mesa no card
2. Verificar se há botão "Iniciar Sessão" (mesa livre)
3. Verificar se mostra convidados (mesa ocupada)

---

### **Causa 3: Dados Não Carregados**
```typescript
ordersByGuest = []
totalAmount = undefined ou null

Motivo:
- Query ainda carregando
- Erro ao buscar dados
- Mesa não existe
```

**Como verificar:**
1. Ver se há spinner de loading
2. Verificar console do navegador por erros
3. Ver aba Network por falhas de API

---

### **Causa 4: Prop onCloseTable Não Passada**
```typescript
onCloseTable = undefined

Motivo:
- PaymentSection não recebeu a prop
```

**Status:** ❌ DESCARTADO - Confirmado que está sendo passado

---

## 🧪 Teste de Diagnóstico

### **Passo 1: Verificar Console do Navegador**

Adicione logs temporários:

```typescript
// No PaymentSection.tsx, após linha 140
console.log('=== DIAGNÓSTICO MESA ===');
console.log('totalAmount:', totalAmount);
console.log('totalPaid:', totalPaid);
console.log('totalUnpaid:', totalUnpaid);
console.log('onCloseTable:', typeof onCloseTable);
console.log('table.status:', table.status);
console.log('ordersByGuest.length:', ordersByGuest?.length);
console.log('========================');
```

### **Passo 2: Verificar Aba Pagamento**

Na interface, verificar:
- [ ] Há valor no "Total da Mesa"?
- [ ] Há valor em "Pendente"?
- [ ] Aparece "Status do Pagamento"?
- [ ] Aparecem os 3 cards de opções (Checkout Rápido, Completo, Dividir)?
- [ ] Há seção "Resumo por Pessoa"?

### **Passo 3: Verificar Aba Pedidos**

- [ ] Existem pedidos listados?
- [ ] Pedidos têm valor?
- [ ] Pedidos não estão cancelados?

---

## 💡 Soluções por Causa

### **Se Causa 1 (totalAmount = 0):**

**Problema:** Mesa sem valor.

**Solução A - Adicionar Pedidos:**
1. Ir para aba "Pedidos"
2. Clicar "Novo Pedido"
3. Adicionar itens à mesa
4. Voltar para aba "Pagamento"
5. Botão deve aparecer

**Solução B - Se houver pedidos mas totalAmount = 0:**
Pode ser bug no cálculo. Verificar:
```typescript
// PaymentSection.tsx - Linha 132-138
const totalPaid = ordersByGuest
  ?.filter((og: any) => og.guest.status === 'pago')
  .reduce((sum: number, og: any) => sum + parseFloat(og.subtotal || '0'), 0) || 0;
const totalUnpaid = totalAmount - totalPaid;
```

---

### **Se Causa 2 (Mesa Livre):**

**Problema:** Sessão não iniciada.

**Solução:**
1. Ir para aba "Convidados"
2. Clicar "Iniciar Sessão"
3. Definir número de pessoas
4. Adicionar pedidos
5. Voltar para aba "Pagamento"

---

### **Se Causa 3 (Dados Não Carregados):**

**Problema:** Erro de carregamento.

**Solução:**
1. Fechar e reabrir diálogo
2. Refresh da página (F5)
3. Verificar console por erros
4. Verificar conexão com backend

---

## 🔧 Debug Rápido

### **Adicionar Card de Debug Temporário:**

```typescript
// Adicionar temporariamente antes do card de fechamento:
<Card className="border-2 border-yellow-500 bg-yellow-50">
  <CardHeader>
    <CardTitle>🐛 DEBUG - Mesa {table.number}</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-2 text-xs font-mono">
      <div>totalAmount: {totalAmount}</div>
      <div>totalPaid: {totalPaid}</div>
      <div>totalUnpaid: {totalUnpaid}</div>
      <div>onCloseTable: {onCloseTable ? 'YES' : 'NO'}</div>
      <div>table.status: {table.status}</div>
      <div>ordersByGuest: {ordersByGuest?.length || 0} items</div>
      <div>Condição: {(totalAmount > 0 && onCloseTable) ? 'TRUE ✅' : 'FALSE ❌'}</div>
    </div>
  </CardContent>
</Card>
```

---

## 📊 Checklist de Verificação

Para a Mesa 10 especificamente:

### **Verificação Básica:**
- [ ] Mesa tem sessão ativa? (status = 'occupied')
- [ ] Mesa tem convidados cadastrados?
- [ ] Mesa tem pedidos?
- [ ] Pedidos têm valor (não são R$ 0)?
- [ ] totalAmount > 0?

### **Verificação Técnica:**
- [ ] Query de ordersByGuest retornou dados?
- [ ] Prop onCloseTable foi passada?
- [ ] Não há erros no console?
- [ ] Componente PaymentSection renderizou?

### **Verificação Visual:**
- [ ] Card "Status do Pagamento" aparece?
- [ ] Os 3 cards de opções aparecem?
- [ ] Seção "Resumo por Pessoa" aparece?
- [ ] Há algum card verde ou laranja no final?

---

## 🎯 Cenários Comuns

### **Cenário A: Mesa Vazia**
```
Status: occupied
Pedidos: 0
totalAmount: 0
Botão: ❌ NÃO APARECE (correto - nada para fechar)
```

### **Cenário B: Mesa com Pedidos**
```
Status: occupied
Pedidos: 3
totalAmount: 45000
Botão: ✅ DEVE APARECER
```

### **Cenário C: Mesa Livre**
```
Status: livre
Pedidos: 0
totalAmount: 0
Botão: ❌ NÃO APARECE (correto - sem sessão)
```

---

## 🚀 Próximos Passos

### **1. Adicionar Logs de Debug:**
```typescript
// No início do PaymentSection
useEffect(() => {
  console.log('[PaymentSection] Mesa:', table.number);
  console.log('[PaymentSection] totalAmount:', totalAmount);
  console.log('[PaymentSection] onCloseTable:', !!onCloseTable);
  console.log('[PaymentSection] Condição:', totalAmount > 0 && onCloseTable);
}, [totalAmount, onCloseTable, table.number]);
```

### **2. Verificar no Browser:**
1. Abrir console (F12)
2. Abrir diálogo da mesa 10
3. Ir para aba "Pagamento"
4. Ver logs no console
5. Reportar valores

### **3. Investigar Backend:**
```bash
# Verificar dados da mesa 10 no banco
SELECT * FROM tables WHERE number = '10';
SELECT * FROM table_sessions WHERE tableId = '...';
SELECT * FROM orders WHERE sessionId = '...';
```

---

## 📝 Informações Necessárias

Para diagnosticar precisamente, preciso saber:

1. **Status da Mesa 10:**
   - Está livre ou ocupada?
   - Tem sessão ativa?

2. **Pedidos:**
   - Quantos pedidos tem?
   - Qual o valor total?

3. **Aba Pagamento:**
   - O que aparece no "Total da Mesa"?
   - Aparece "Status do Pagamento"?
   - Os 3 cards de opções aparecem?

4. **Console:**
   - Há erros no console do navegador?
   - Há warnings?

5. **Network:**
   - As requests para `/api/tables/10/orders-by-guest` retornam dados?

---

## 💡 Hipótese Principal

Baseado na experiência comum:

**Mesa 10 provavelmente tem `totalAmount = 0`**

Motivos possíveis:
- Mesa sem pedidos
- Todos os pedidos cancelados
- Bug no cálculo do total

**Como confirmar:**
Abrir aba "Pagamento" e ver se mostra "Total da Mesa: 0 Kz"

---

## ✅ Solução Temporária

Se a mesa deveria ter valor mas totalAmount = 0:

```typescript
// Forçar exibição para debug
{(totalAmount > 0 || true) && onCloseTable && (
  // Card aparece sempre
)}
```

Isso forçará o card a aparecer e você verá se o problema é realmente o totalAmount.
