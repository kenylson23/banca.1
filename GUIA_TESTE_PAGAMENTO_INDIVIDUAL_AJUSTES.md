# Guia de Teste - Pagamento Individual com Ajustes

**Data:** 2026-01-07  
**Implementações:** Soluções #1 e #2 aplicadas

---

## ✅ Implementações Concluídas

### **Solução #1: Backend Aceita Ajustes**
- ✅ Rota `/api/table-guests/:guestId/payment` aceita `discount`, `discountType`, `serviceCharge`, `serviceChargeType`
- ✅ Ajustes são salvos na sessão automaticamente
- ✅ Logs detalhados para debug

### **Solução #2: Frontend Garante Salvamento**
- ✅ Frontend envia ajustes no payload do pagamento individual
- ✅ `saveAdjustmentsToSession()` executado antes de processar pagamento
- ✅ Indicador visual "Salvando..." enquanto salva
- ✅ Delay de 300ms para garantir propagação

---

## 🧪 Casos de Teste

### **Teste 1: Pagamento Individual com Desconto Percentual + Taxa Percentual** ⭐

**Cenário:**
- Mesa com 2 convidados: João (R$ 100) e Maria (R$ 50)
- Total mesa: R$ 150
- Desconto: 10% (percentual)
- Taxa de serviço: 10% (percentual)

**Passos:**
1. ✅ Abrir mesa e iniciar sessão
2. ✅ Adicionar 2 convidados: João e Maria
3. ✅ Adicionar pedidos:
   - João: 2x Hambúrguer (R$ 50 cada) = R$ 100
   - Maria: 1x Pizza (R$ 50) = R$ 50
4. ✅ Ir para Checkout V2
5. ✅ Selecionar **apenas João** (1 convidado)
6. ✅ Aplicar desconto: **10%** (percentual)
7. ✅ Aplicar taxa: **10%** (percentual)
8. ✅ Observar indicador "Salvando..." aparecer
9. ✅ Aguardar 1 segundo (debounce)
10. ✅ Selecionar método de pagamento
11. ✅ Clicar em "Processar Pagamento"
12. ✅ Aguardar indicador "Salvando..." (se aparecer)
13. ✅ Confirmar pagamento

**Valores Esperados:**
```
João:
  Subtotal: R$ 100,00
  Desconto (10%): -R$ 10,00
  Após desconto: R$ 90,00
  Taxa (10%): +R$ 9,00
  TOTAL: R$ 99,00
```

**Verificações:**
- ✅ Console do navegador deve mostrar:
  ```
  🔄 [CHECKOUT] Salvando ajustes antes de processar pagamento...
  ✅ [CHECKOUT] Ajustes salvos com sucesso antes do pagamento
  🎯 [CHECKOUT] Usando rota de pagamento INDIVIDUAL com ajustes
  ```

- ✅ Console do servidor deve mostrar:
  ```
  🎯 [GUEST PAYMENT] Nova rota de pagamento individual chamada!
  🎯 [GUEST PAYMENT] Salvando desconto na sessão
  🎯 [GUEST PAYMENT] Salvando taxa de serviço na sessão
  ✅ [GUEST PAYMENT] Ajustes salvos na sessão com sucesso
  ```

- ✅ No banco de dados (sessão):
  ```sql
  SELECT id, discount, discount_type, service_charge, service_charge_type, paid_amount
  FROM table_sessions
  WHERE id = '<session-id>';
  
  -- Esperado:
  -- discount: "10"
  -- discount_type: "percentual"
  -- service_charge: "10"
  -- service_charge_type: "percentual"
  -- paid_amount: "99.00"
  ```

**Pagar Maria:**
14. ✅ Voltar ao Checkout V2
15. ✅ Selecionar **apenas Maria**
16. ✅ **NÃO alterar** desconto/taxa (já salvos)
17. ✅ Processar pagamento

**Valores Esperados Maria:**
```
Maria:
  Subtotal: R$ 50,00
  Desconto (10%): -R$ 5,00
  Após desconto: R$ 45,00
  Taxa (10%): +R$ 4,50
  TOTAL: R$ 49,50
```

**Verificação Final:**
- ✅ Total pago da sessão: R$ 148,50 (99,00 + 49,50)
- ✅ Mesa pode ser fechada sem pendências

---

### **Teste 2: Pagamento Individual com Desconto Fixo + Taxa Fixa** ⚠️

**Cenário:**
- Mesa com 2 convidados: João (R$ 100) e Maria (R$ 50)
- Total mesa: R$ 150
- Desconto: R$ 30 (fixo)
- Taxa de serviço: R$ 15 (fixo)

**Passos:**
1. ✅ Abrir mesa e iniciar sessão
2. ✅ Adicionar 2 convidados: João e Maria
3. ✅ Adicionar pedidos (João: R$ 100, Maria: R$ 50)
4. ✅ Ir para Checkout V2
5. ✅ Selecionar **apenas João**
6. ✅ Aplicar desconto: **R$ 30** (fixo)
7. ✅ Aplicar taxa: **R$ 15** (fixo)
8. ✅ Processar pagamento

**Valores Esperados João:**
```
João:
  Subtotal: R$ 100,00
  Desconto: -R$ 30,00
  Após desconto: R$ 70,00
  Taxa: +R$ 15,00
  TOTAL: R$ 85,00
```

**⚠️ ATENÇÃO - Comportamento Esperado:**

Quando Maria for pagar:
- Backend distribui ajustes proporcionalmente
- João (2/3): R$ 30 × (100/150) = R$ 20 de desconto
- Maria (1/3): R$ 30 × (50/150) = R$ 10 de desconto

Mas João já pagou com R$ 30 de desconto!

**Solução Atual:**
- ✅ O sistema aceita o pagamento de João com R$ 30
- ⚠️ Backend usa margem de ±10% para validação
- ✅ Se Maria pagar depois, receberá ajustes proporcionais

**Recomendação UX:**
- Adicionar aviso no UI: "Desconto fixo será aplicado integralmente a este convidado"
- Ou converter desconto fixo em percentual quando pagamento individual

---

### **Teste 3: Pagamento Individual SEM Ajustes**

**Cenário:**
- Mesa com 2 convidados
- **SEM desconto**
- **SEM taxa**

**Passos:**
1. ✅ Abrir mesa e iniciar sessão
2. ✅ Adicionar 2 convidados
3. ✅ Adicionar pedidos
4. ✅ Ir para Checkout V2
5. ✅ Selecionar apenas 1 convidado
6. ✅ **NÃO aplicar** desconto ou taxa
7. ✅ Processar pagamento

**Verificação:**
- ✅ Nenhum indicador "Salvando..." deve aparecer
- ✅ Pagamento deve processar normalmente
- ✅ Sessão deve manter discount = "0", serviceCharge = "0"

---

### **Teste 4: Múltiplos Convidados com Ajustes**

**Cenário:**
- Mesa com 3 convidados: João (R$ 100), Maria (R$ 50), Pedro (R$ 75)
- Total: R$ 225
- Desconto: 15% (percentual)
- Taxa: 12% (percentual)

**Passos:**
1. ✅ Selecionar **todos os 3 convidados**
2. ✅ Aplicar desconto 15%
3. ✅ Aplicar taxa 12%
4. ✅ Processar pagamento

**Rota Utilizada:**
- ✅ Deve usar `/api/tables/:id/payment` (múltiplos convidados)
- ✅ NÃO usa `/api/table-guests/:guestId/payment`

**Valores Esperados:**
```
Total:
  Subtotal: R$ 225,00
  Desconto (15%): -R$ 33,75
  Após desconto: R$ 191,25
  Taxa (12%): +R$ 22,95
  TOTAL: R$ 214,20
```

---

### **Teste 5: Pagamento Sequencial Individual**

**Cenário:**
- Mesa com 3 convidados
- Cada um paga individualmente
- Ajustes aplicados no primeiro pagamento

**Passos:**
1. ✅ João paga individualmente com desconto 10% e taxa 10%
2. ✅ Verificar sessão tem ajustes salvos
3. ✅ Maria paga individualmente **SEM alterar** ajustes
4. ✅ Verificar que Maria recebeu mesmos ajustes (10% e 10%)
5. ✅ Pedro paga individualmente **SEM alterar** ajustes
6. ✅ Verificar que Pedro recebeu mesmos ajustes

**Verificação Final:**
- ✅ Todos os 3 convidados receberam os mesmos percentuais de ajuste
- ✅ Total pago bate com total esperado
- ✅ Mesa pode ser fechada

---

### **Teste 6: Modificar Ajustes Durante Pagamento Sequencial**

**Cenário:**
- Mesa com 2 convidados
- João paga com desconto 10%
- Maria altera para desconto 15% antes de pagar

**Passos:**
1. ✅ João paga com desconto 10%, taxa 10%
2. ✅ Verificar sessão: discount = "10"
3. ✅ Voltar ao checkout
4. ✅ Selecionar Maria
5. ✅ **Alterar** desconto para 15%
6. ✅ Observar "Salvando..." aparecer
7. ✅ Processar pagamento de Maria

**Verificação:**
- ✅ Sessão deve ser atualizada: discount = "15"
- ✅ Maria paga com 15% de desconto
- ⚠️ João já pagou com 10% (diferente)
- ✅ Sistema aceita e registra a diferença

---

## 🔍 Logs para Debug

### **Console do Navegador**

Abra DevTools (F12) e vá para Console. Durante o teste, você verá:

```
🔄 [CHECKOUT] Salvando ajustes antes de processar pagamento...
✅ [CHECKOUT] Ajustes salvos com sucesso antes do pagamento
🎯 [CHECKOUT] Usando rota de pagamento INDIVIDUAL com ajustes: {
  guestId: "xxx",
  route: "/api/table-guests/xxx/payment",
  payload: {
    amount: "99.00",
    paymentMethod: "credit_card",
    discount: "10",
    discountType: "percentual",
    serviceCharge: "10",
    serviceChargeType: "percentual"
  },
  breakdown: {
    subtotal: 100,
    discount: "10",
    discountType: "percentual",
    serviceCharge: "10",
    serviceChargeType: "percentual",
    finalAmount: "99.00"
  }
}
```

### **Console do Servidor**

No terminal onde o servidor está rodando:

```
🎯 [GUEST PAYMENT] Nova rota de pagamento individual chamada!
🎯 [GUEST PAYMENT] Guest ID: xxx
🎯 [GUEST PAYMENT] Body: { amount: "99.00", discount: "10", ... }
🎯 [GUEST PAYMENT] Salvando desconto na sessão: {
  sessionId: "yyy",
  discount: "10",
  discountType: "percentual"
}
🎯 [GUEST PAYMENT] Salvando taxa de serviço na sessão: {
  sessionId: "yyy",
  serviceCharge: "10",
  serviceChargeType: "percentual"
}
✅ [GUEST PAYMENT] Ajustes salvos na sessão com sucesso
```

---

## 🗄️ Verificação no Banco de Dados

### **Verificar Ajustes na Sessão**

```sql
SELECT 
  id,
  table_id,
  discount,
  discount_type,
  service_charge,
  service_charge_type,
  total_amount,
  paid_amount,
  created_at,
  updated_at
FROM table_sessions
WHERE table_id = '<sua-table-id>'
ORDER BY created_at DESC
LIMIT 1;
```

**Esperado após pagamento individual:**
```
discount: "10.00" (ou o valor aplicado)
discount_type: "percentual" (ou "valor")
service_charge: "10.00"
service_charge_type: "percentual"
total_amount: "148.50" (exemplo com 2 convidados)
paid_amount: "99.00" (após primeiro pagamento)
```

### **Verificar Pagamento Individual**

```sql
SELECT 
  gp.id,
  gp.guest_id,
  gp.amount,
  gp.payment_method,
  tg.name as guest_name,
  tg.subtotal as guest_subtotal,
  tg.paid_amount as guest_paid
FROM guest_payments gp
JOIN table_guests tg ON tg.id = gp.guest_id
WHERE gp.session_id = '<session-id>'
ORDER BY gp.created_at;
```

### **Verificar Totais**

```sql
SELECT 
  t.number as mesa,
  ts.total_amount,
  ts.paid_amount,
  (ts.total_amount::numeric - ts.paid_amount::numeric) as pendente,
  ts.discount,
  ts.service_charge
FROM tables t
JOIN table_sessions ts ON ts.table_id = t.id
WHERE ts.status = 'ativa'
AND t.id = '<table-id>';
```

---

## ✅ Checklist de Validação

### **Frontend**
- [ ] Indicador "Salvando..." aparece ao aplicar desconto/taxa
- [ ] Indicador "Salvando..." aparece antes de processar pagamento
- [ ] Logs no console mostram ajustes sendo enviados
- [ ] Valores calculados estão corretos
- [ ] UI responde sem travamentos

### **Backend**
- [ ] Logs mostram recebimento de ajustes
- [ ] Logs mostram salvamento na sessão
- [ ] Ajustes são persistidos no banco
- [ ] Validação de valores funciona corretamente
- [ ] Erros são tratados adequadamente

### **Banco de Dados**
- [ ] `table_sessions.discount` atualizado
- [ ] `table_sessions.discount_type` atualizado
- [ ] `table_sessions.service_charge` atualizado
- [ ] `table_sessions.service_charge_type` atualizado
- [ ] `table_sessions.paid_amount` incrementado corretamente
- [ ] `guest_payments` registrado
- [ ] `table_guests.paid_amount` atualizado

### **Fluxo Completo**
- [ ] Primeiro convidado paga com ajustes
- [ ] Ajustes aparecem para segundo convidado
- [ ] Segundo convidado paga com mesmos ajustes
- [ ] Total pago bate com total esperado
- [ ] Mesa pode ser fechada sem erros
- [ ] Relatórios mostram ajustes corretamente

---

## 🐛 Troubleshooting

### **Problema: Ajustes não aparecem para segundo convidado**

**Causa:** Sessão não foi atualizada

**Solução:**
1. Verificar logs do servidor
2. Verificar se `saveAdjustmentsToSession()` foi chamado
3. Verificar no banco se `table_sessions` tem os ajustes

### **Problema: Indicador "Salvando..." não aparece**

**Causa:** Estado `isSavingAdjustments` não está sendo atualizado

**Solução:**
1. Verificar se `saveAdjustmentsToSession` tem `setIsSavingAdjustments(true/false)`
2. Verificar se há erros no console

### **Problema: Erro "Valor de pagamento inconsistente"**

**Causa:** Diferença entre valor enviado e esperado > 10%

**Solução:**
1. Verificar cálculos no frontend
2. Verificar se ajustes foram salvos corretamente
3. Ver logs detalhados no servidor

---

## 📊 Resultados Esperados

Após todos os testes:

✅ **Pagamento individual com ajustes funciona perfeitamente**
✅ **Ajustes são salvos e propagados corretamente**
✅ **Feedback visual claro para o usuário**
✅ **Dados financeiros consistentes e completos**
✅ **Relatórios mostram breakdown correto**

---

**Documento criado em:** 2026-01-07 17:35 UTC  
**Próximo passo:** Executar testes e validar implementação! 🚀
