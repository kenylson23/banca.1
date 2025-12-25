# 🔧 Plano de Correção - Clientes da Mesa Não Aparecem

**Data:** 25 de Dezembro de 2025  
**Status:** 🔴 PROBLEMA IDENTIFICADO

---

## 🐛 **Problemas Identificados:**

### **Problema #1: URL Incorreta no Mutation** 🎯 CRÍTICO

**Localização:** `client/src/components/TableDetailsDialogNew.tsx` linha 145

**Erro:**
```tsx
const response = await apiRequest('POST', `/api/table-guests`, {
  // ❌ ERRADO!
```

**Correto:**
```tsx
const response = await apiRequest('POST', `/api/tables/${tableId}/guests`, {
  // ✅ CORRETO
```

**Impacto:**
- ❌ Quando adiciona pessoa na mesa, dá erro 404
- ❌ Pessoa não é criada no banco
- ❌ Por isso não aparece em lugar nenhum

---

### **Problema #2: Parâmetros Incorretos** 🎯 MÉDIO

**Localização:** `client/src/components/TableDetailsDialogNew.tsx` linha 145-149

**Erro:**
```tsx
const response = await apiRequest('POST', `/api/table-guests`, {
  sessionId: table.currentSessionId,  // ❌ Não precisa
  tableId,                            // ❌ Não precisa (já está na URL)
  name: guestName,
});
```

**Correto (baseado no endpoint do servidor linha 3942):**
```tsx
const response = await apiRequest('POST', `/api/tables/${tableId}/guests`, {
  name: guestName,
  seatNumber: undefined,  // Opcional
});
```

O servidor pega `tableId` da URL e `sessionId` da mesa automaticamente.

---

### **Problema #3: Query Key Correta mas Mutation Falha** 🎯 ALTO

**Localização:** `client/src/components/TableDetailsDialogNew.tsx` linha 152

**Observação:**
```tsx
queryClient.invalidateQueries({ queryKey: [`/api/tables/${table?.id}/guests`] });
// ✅ Query key está CORRETO
```

Mas como a mutation falha (problema #1), essa invalidação nunca acontece.

---

## 📊 **Análise dos Endpoints (Servidor):**

### ✅ **GET `/api/tables/:id/guests`** (linha 3896)
```typescript
// Retorna lista de guests da mesa
app.get("/api/tables/:id/guests", isCashierOrAbove, async (req, res) => {
  const table = await storage.getTableById(req.params.id);
  const guests = await storage.getTableGuests(table.currentSessionId);
  res.json(guests);
});
```
**Status:** ✅ Funcionando corretamente

---

### ✅ **POST `/api/tables/:id/guests`** (linha 3920)
```typescript
// Cria guest na mesa
app.post("/api/tables/:id/guests", isCashierOrAbove, async (req, res) => {
  const { name, seatNumber } = req.body;  // ✅ Apenas name e seatNumber
  
  const guest = await storage.createTableGuest(restaurantId, {
    sessionId: table.currentSessionId,  // ✅ Pega da mesa
    tableId: table.id,                  // ✅ Pega da mesa
    name,
    seatNumber,
  });
  
  res.json(guest);
});
```
**Status:** ✅ Funcionando corretamente

---

### ✅ **GET `/api/tables/:id/orders-by-guest`** (linha 3997)
```typescript
// Retorna pedidos agrupados por guest
app.get("/api/tables/:id/orders-by-guest", isCashierOrAbove, async (req, res) => {
  const guests = await storage.getTableGuests(table.currentSessionId);
  
  const ordersByGuest = guests.map(guest => ({
    guest,
    orders: orders.filter(order => order.guestId === guest.id),
    subtotal: ...
  }));
  
  res.json({ ordersByGuest, anonymousOrders, totalAmount });
});
```
**Status:** ✅ Funcionando corretamente

---

## 🔍 **Fluxo Atual (QUEBRADO):**

```
1. Usuário clica "Adicionar Pessoa"
   ↓
2. Digita nome: "João Silva"
   ↓
3. Clica "Adicionar"
   ↓
4. Frontend: POST /api/table-guests ❌ (URL ERRADA!)
   ↓
5. Servidor: 404 Not Found
   ↓
6. Frontend: Toast de erro
   ↓
7. Pessoa NÃO é criada
   ↓
8. Query não é invalidada
   ↓
9. Lista continua vazia
   ↓
10. Checkout não vê guests
    ↓
11. BillSplitPanel não vê guests
```

---

## ✅ **Fluxo Correto (APÓS CORREÇÃO):**

```
1. Usuário clica "Adicionar Pessoa"
   ↓
2. Digita nome: "João Silva"
   ↓
3. Clica "Adicionar"
   ↓
4. Frontend: POST /api/tables/:id/guests ✅ (URL CORRETA!)
   ↓
5. Servidor: Cria guest no banco
   ↓
6. Servidor: Retorna guest criado
   ↓
7. Frontend: Toast de sucesso ✅
   ↓
8. Frontend: Invalida queries
   ↓
9. Query busca guests: GET /api/tables/:id/guests
   ↓
10. Frontend: Lista atualiza com "João Silva" ✅
    ↓
11. Ao ir para checkout:
    - GET /api/tables/:id/orders-by-guest
    - Retorna guests + pedidos
    - BillSplitPanel vê guests ✅
```

---

## 🛠️ **Plano de Correção:**

### **Fase 1: Corrigir Mutation (CRÍTICO)** ⚡

**Arquivo:** `client/src/components/TableDetailsDialogNew.tsx`

**Mudança:**
```tsx
// ANTES (linha 145):
const response = await apiRequest('POST', `/api/table-guests`, {
  sessionId: table.currentSessionId,
  tableId,
  name: guestName,
});

// DEPOIS:
const response = await apiRequest('POST', `/api/tables/${tableId}/guests`, {
  name: guestName,
});
```

**Tempo estimado:** 1 minuto  
**Impacto:** 🔴 CRÍTICO - Sem isso, nada funciona

---

### **Fase 2: Testar Criação de Guest** ✅

**Passos:**
1. Hard refresh no navegador
2. Ocupe uma mesa
3. Clique em "Adicionar Pessoa"
4. Digite um nome
5. Clique em "Adicionar"

**Resultado esperado:**
- ✅ Toast "Pessoa adicionada"
- ✅ Nome aparece na lista como badge
- ✅ Contador atualiza

---

### **Fase 3: Testar no Checkout** ✅

**Passos:**
1. Na mesa com guests, crie pedidos
2. Clique em "Fechar Conta"
3. Vá para página de checkout

**Resultado esperado:**
- ✅ Card "Consumo por Cliente" mostra guests
- ✅ Tab "Divisão de Conta" lista guests
- ✅ BillSplitPanel funciona

---

## 📋 **Checklist de Correção:**

### Implementação:
- [ ] Corrigir URL no mutation (linha 145)
- [ ] Remover parâmetros desnecessários (sessionId, tableId)
- [ ] Manter apenas `name` no body

### Testes:
- [ ] Criar guest na mesa
- [ ] Ver guest na lista (badge)
- [ ] Ver contador atualizar
- [ ] Ir para checkout
- [ ] Ver guests no "Consumo por Cliente"
- [ ] Ver guests na "Divisão de Conta"
- [ ] Testar dividir conta entre guests

---

## 🎯 **Root Cause Analysis:**

**Por que aconteceu?**

Quando implementamos a Fase 1-2 (gestão de pessoas), criamos um endpoint genérico `/api/table-guests` que NÃO EXISTE no servidor.

O servidor tem o padrão RESTful correto:
- `GET /api/tables/:id/guests`
- `POST /api/tables/:id/guests`

Mas esquecemos de ajustar o frontend para usar esse padrão.

---

## 💡 **Prevenção Futura:**

1. ✅ Sempre verificar rotas do servidor ANTES de implementar frontend
2. ✅ Seguir padrão RESTful consistente
3. ✅ Testar endpoints com curl/Postman antes de integrar
4. ✅ Adicionar testes automatizados

---

## 🚀 **Pronto para Implementar!**

Correção é **simples e rápida** (2 linhas de código).

**Tempo total:** ~5 minutos
**Complexidade:** Baixa
**Risco:** Nenhum (apenas URL)

---

**Status:** Aguardando aprovação para implementar  
**Próximo passo:** Aplicar correção e testar

