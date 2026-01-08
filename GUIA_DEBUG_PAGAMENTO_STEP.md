# Guia de Debug: Pagamento no Step Individual

## 🔍 Como Testar e Verificar

### Passo 1: Abrir Console do Navegador
1. Pressione `F12` ou `Ctrl+Shift+I`
2. Vá na aba **Console**
3. Limpe o console (botão 🚫 ou `Ctrl+L`)

### Passo 2: Fazer Pagamento no Step
1. Vá para `/tables/{id}/checkout?step=3`
2. **Selecione APENAS 1 convidado** (importante!)
3. Escolha método de pagamento
4. Clique em "Finalizar Pagamento"

### Passo 3: Verificar Logs no Console

**🟢 Esperado - Rota Individual:**
```
🎯 [CHECKOUT] Usando rota de pagamento INDIVIDUAL:
  guestId: "abc123..."
  route: "/api/table-guests/abc123.../payment"
  payload: { amount: "2000.00", paymentMethod: "dinheiro", ... }
```

**🔴 Problema - Rota Geral:**
```
🎯 [CHECKOUT] Usando rota de pagamento GERAL da mesa:
  selectedGuestCount: 0 (ou > 1)
  route: "/api/tables/xyz/payment"
```

### Passo 4: Verificar Logs do Servidor

No terminal do servidor, procure por:

**🟢 Esperado:**
```
🎯 [GUEST PAYMENT] Nova rota de pagamento individual chamada!
🎯 [GUEST PAYMENT] Guest ID: abc123...
🎯 [GUEST PAYMENT] Body: { amount: "2000.00", paymentMethod: "dinheiro" }
🎯 [GUEST PAYMENT] Atualizando session paidAmount:
  sessionId: xyz789...
  guestsCount: 3
  totalPaid: 2000.00
  breakdown: [
    { name: "João", paid: "2000.00" },
    { name: "Maria", paid: "0.00" },
    { name: "Pedro", paid: "0.00" }
  ]
```

**🔴 Problema:**
Se não aparecer nenhum log com `[GUEST PAYMENT]`, significa que:
- O servidor não foi reiniciado OU
- A rota antiga está sendo chamada

## 🐛 Possíveis Problemas e Soluções

### Problema 1: selectedGuestIds está vazio
**Sintoma:** Log mostra `selectedGuestCount: 0`

**Causa:** Você não selecionou nenhum convidado no checkout

**Solução:** 
1. No step 1 do checkout, clique no checkbox do convidado
2. Você deve ver badge "X cliente selecionado"
3. Continue para step 3

### Problema 2: Múltiplos convidados selecionados
**Sintoma:** Log mostra `selectedGuestCount: 3`

**Causa:** Todos os convidados estão selecionados (padrão)

**Solução:**
1. Clique em "Desselecionar Todos"
2. Selecione APENAS 1 convidado
3. Continue para step 3

### Problema 3: Servidor não reiniciado
**Sintoma:** Nenhum log `[GUEST PAYMENT]` aparece

**Solução:**
```bash
# Parar o servidor (Ctrl+C)
# Reiniciar
npm run dev
```

### Problema 4: Cache do navegador
**Sintoma:** JavaScript antigo está sendo usado

**Solução:**
1. `Ctrl+Shift+R` (hard refresh)
2. Ou limpar cache: `F12` → Application → Clear Storage

## 📊 Como Verificar no Banco de Dados

Execute esta query para ver os valores:

```sql
SELECT 
  t.number as mesa,
  ts.total_amount,
  ts.paid_amount as session_paid,
  tg.name as guest_name,
  tg.subtotal as guest_subtotal,
  tg.paid_amount as guest_paid,
  tg.status as guest_status
FROM tables t
JOIN table_sessions ts ON t.current_session_id = ts.id
LEFT JOIN table_guests tg ON ts.id = tg.session_id
WHERE t.current_session_id IS NOT NULL
ORDER BY t.number, tg.created_at;
```

**Esperado após pagamento de João (2000 Kz):**
```
mesa | total_amount | session_paid | guest_name | guest_subtotal | guest_paid | guest_status
-----|--------------|--------------|------------|----------------|------------|-------------
  5  |   6000.00    |   2000.00    | João       |    2000.00     | 2000.00    | pago
  5  |   6000.00    |   2000.00    | Maria      |    2000.00     |   0.00     | pendente
  5  |   6000.00    |   2000.00    | Pedro      |    2000.00     |   0.00     | pendente
```

## 🎯 Checklist Completo

- [ ] Console do navegador aberto
- [ ] Console limpo antes do teste
- [ ] Ir para checkout: `/tables/{id}/checkout?step=1`
- [ ] Verificar que convidados aparecem no step 1
- [ ] Clicar em "Desselecionar Todos"
- [ ] Selecionar APENAS 1 convidado
- [ ] Ver badge "1 cliente selecionado"
- [ ] Ir para step 3 (Pagamento)
- [ ] Ver badge "Pagando para 1 cliente"
- [ ] Escolher método de pagamento
- [ ] Clicar "Finalizar Pagamento"
- [ ] **Verificar log no console do navegador**
- [ ] **Verificar log no terminal do servidor**
- [ ] Ver mensagem de sucesso
- [ ] Verificar no banco de dados

## 📸 O Que Enviar para Debug

Se ainda não funcionar, envie:
1. Screenshot do console do navegador (com os logs)
2. Screenshot/texto dos logs do servidor
3. Resultado da query SQL acima
4. URL exata que você está usando

---

**Próximo passo**: Reinicie o servidor e teste seguindo este guia!
