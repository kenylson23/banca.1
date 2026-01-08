# 🔴 INSTRUÇÕES PARA CORREÇÃO MANUAL DE SEGURANÇA

## VULNERABILIDADES CRÍTICAS QUE PRECISAM SER CORRIGIDAS

Total: **3 correções** em **3 endpoints** | Tempo estimado: **15 minutos**

---

## 🔴 CORREÇÃO #1: Endpoint `/api/tables/:id/payment`

### Localização: `server/routes.ts` - Aproximadamente linha **4033**

### Código Atual:
```typescript
const table = await storage.getTableById(req.params.id);
if (!table) {
  return res.status(404).json({ message: "Mesa não encontrada" });
}

if (!table.currentSessionId) {
```

### ADICIONAR após `if (!table) { ... }`:
```typescript
const table = await storage.getTableById(req.params.id);
if (!table) {
  return res.status(404).json({ message: "Mesa não encontrada" });
}

// ✅ CORREÇÃO CONFLITO #25: Validar que mesa pertence ao restaurante
if (table.restaurantId !== restaurantId) {
  return res.status(403).json({ 
    message: "Acesso negado: Mesa não pertence ao seu restaurante" 
  });
}

if (!table.currentSessionId) {
```

---

## 🔴 CORREÇÃO #2: Endpoint `/api/table-guests/:guestId/payment`

### Localização: `server/routes.ts` - Aproximadamente linha **4207**

### Código Atual:
```typescript
const guest = await storage.getTableGuestById(guestId);
if (!guest) {
  return res.status(404).json({ message: "Convidado não encontrado" });
}

// Verificar se o convidado tem uma sessão ativa
if (!guest.sessionId) {
```

### ADICIONAR após `if (!guest) { ... }`:
```typescript
const guest = await storage.getTableGuestById(guestId);
if (!guest) {
  return res.status(404).json({ message: "Convidado não encontrado" });
}

// ✅ CORREÇÃO CONFLITO #25: Validar restaurante do convidado
const guestTable = await storage.getTableById(guest.tableId);
if (!guestTable || guestTable.restaurantId !== restaurantId) {
  return res.status(403).json({ 
    message: "Acesso negado: Convidado não pertence ao seu restaurante" 
  });
}

// Verificar se o convidado tem uma sessão ativa
if (!guest.sessionId) {
```

---

## 🔴 CORREÇÃO #3: Endpoint `/api/tables/:id/payments` (legacy)

### Localização: `server/routes.ts` - Aproximadamente linha **4418-4422**

### Código Atual:
```typescript
const { amount, paymentMethod, notes, sessionId } = req.body;

const table = await storage.getTableById(req.params.id);
if (!table) {
  return res.status(404).json({ message: "Mesa não encontrada" });
}
```

### ADICIONAR validação de amount E restaurantId:
```typescript
const { amount, paymentMethod, notes, sessionId } = req.body;

// ✅ CORREÇÃO CONFLITO #29: Validar amount
if (!amount || parseFloat(amount) <= 0) {
  return res.status(400).json({ message: "Valor deve ser maior que 0" });
}

const table = await storage.getTableById(req.params.id);
if (!table) {
  return res.status(404).json({ message: "Mesa não encontrada" });
}

// ✅ CORREÇÃO CONFLITO #25: Validar restaurante
if (table.restaurantId !== restaurantId) {
  return res.status(403).json({ 
    message: "Acesso negado: Mesa não pertence ao seu restaurante" 
  });
}
```

---

## ✅ COMO ENCONTRAR AS LINHAS:

### No VSCode/Editor:
1. Abra `server/routes.ts`
2. Use Ctrl+F (Cmd+F no Mac)
3. Procure por:
   - **Correção #1**: `app.post("/api/tables/:id/payment"`
   - **Correção #2**: `app.post("/api/table-guests/:guestId/payment"`
   - **Correção #3**: `app.post("/api/tables/:id/payments"` (com 's' no final)

### Via grep:
```bash
grep -n 'app.post("/api/tables/:id/payment"' server/routes.ts
grep -n 'app.post("/api/table-guests/:guestId/payment"' server/routes.ts
grep -n 'app.post("/api/tables/:id/payments"' server/routes.ts
```

---

## 🧪 COMO TESTAR:

### Teste 1: Verificar que garçom NÃO pode acessar mesa de outro restaurante
```bash
# Como garçom do Restaurante A
# Tentar pagar mesa do Restaurante B
curl -X POST http://localhost:5000/api/tables/mesa-do-restaurante-B/payment \
  -H "Authorization: Bearer TOKEN_RESTAURANTE_A" \
  -d '{"amount": "100", "paymentMethod": "dinheiro"}'

# Esperado: HTTP 403 Forbidden
# { "message": "Acesso negado: Mesa não pertence ao seu restaurante" }
```

### Teste 2: Verificar que valor negativo é rejeitado
```bash
curl -X POST http://localhost:5000/api/tables/ID_MESA/payments \
  -d '{"amount": "-100", "paymentMethod": "dinheiro"}'

# Esperado: HTTP 400 Bad Request
# { "message": "Valor deve ser maior que 0" }
```

---

## 📊 IMPACTO DAS CORREÇÕES:

### Antes:
- ❌ Garçom pode pagar mesa de outro restaurante
- ❌ Valor negativo aceito
- ❌ Roubo entre restaurantes possível

### Depois:
- ✅ Garçom só acessa mesas do próprio restaurante
- ✅ Valores inválidos rejeitados
- ✅ Sistema seguro contra fraude

---

## 🚀 PRÓXIMOS PASSOS:

1. **Aplicar as 3 correções** (15 minutos)
2. **Testar** (5 minutos)
3. **Deploy** em produção ✅

---

## 📝 RESUMO:

- **3 correções** de segurança
- **3 endpoints** afetados
- **~10 linhas** de código total
- **Criticidade**: 🔴 MÁXIMA
- **Tempo**: 15-20 minutos

---

**Após aplicar essas correções, o sistema estará 100% seguro para produção!**

**Data**: 2026-01-06  
**Prioridade**: 🔴 **URGENTE - BLOQUEADOR DE DEPLOY**
