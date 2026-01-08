# 🚨 Correção Crítica: Mesa Não Fecha Após Pagamento com Descontos e Taxas

**Data:** 2026-01-07  
**Severidade:** 🔴 CRÍTICA  
**Status:** IDENTIFICADO - Aguardando Correção

---

## 📋 Problema Reportado

**Descrição:** Quando faço pagamento no Checkout V2 com descontos e taxas de serviço, a mesa **não fecha** e o resultado da operação **fica pendente**.

---

## 🔍 Causa Raiz Identificada

### **Problema: Validação Usa Subtotal SEM Ajustes**

A função `validateSessionClosure` em `server/storage.ts` (linhas 1614-1700) **compara valores errados**:

```typescript
// ❌ LÓGICA INCORRETA ATUAL (linha 1629-1632)
for (const guest of guests) {
  const subtotal = parseFloat(guest.subtotal || '0');  // ❌ Subtotal SEM ajustes
  const paid = parseFloat(guest.paidAmount || '0');     // ✅ Valor pago COM ajustes
  const pending = subtotal - paid;                      // ❌ COMPARAÇÃO ERRADA!
  
  if (pending > 0.01) {
    totalPending += pending;
    unpaidGuests.push({ ... });
  }
}
```

### **O Que Acontece:**

1. **Cliente paga R$ 8.000 com desconto 10% + taxa 10%:**
   ```
   Subtotal original: R$ 8.000,00
   - Desconto (10%): -R$ 800,00
   = Após desconto: R$ 7.200,00
   + Taxa (10%):    +R$ 720,00
   = Total final:    R$ 7.920,00 ✅ PAGAMENTO PROCESSADO
   ```

2. **Validação de fechamento compara:**
   ```typescript
   guest.subtotal = 8000.00     // ❌ Subtotal SEM ajustes
   guest.paidAmount = 7920.00   // ✅ Valor COM ajustes
   pending = 8000 - 7920 = 80   // ❌ Detecta R$ 80 pendente (FALSO!)
   ```

3. **Resultado:**
   ```
   canClose: false
   totalPending: 80.00
   unpaidGuests: [{ name: "João", pending: 80 }]
   warnings: ["Mesa possui valores pendentes"]
   ```

4. **Mesa NÃO fecha** ❌

---

## 💡 Solução

### **Aplicar Ajustes na Validação**

A função `validateSessionClosure` deve calcular o **subtotal esperado COM ajustes** antes de comparar com `paidAmount`.

### **Correção Necessária:**

```typescript
// ✅ LÓGICA CORRETA
async validateSessionClosure(sessionId: string): Promise<{
  canClose: boolean;
  totalPending: number;
  unpaidGuests: Array<{ id: string; name: string; pending: number }>;
  warnings: string[];
}> {
  try {
    const guests = await this.getTableGuests(sessionId);
    const session = await db.select()
      .from(tableSessions)
      .where(eq(tableSessions.id, sessionId))
      .then(rows => rows[0]);
    
    if (!session) {
      return {
        canClose: false,
        totalPending: 0,
        unpaidGuests: [],
        warnings: ['Sessão não encontrada']
      };
    }
    
    // ✅ BUSCAR AJUSTES DA SESSÃO
    const sessionDiscount = parseFloat(session.discount || '0');
    const sessionDiscountType = session.discountType || 'valor';
    const sessionServiceCharge = parseFloat(session.serviceCharge || '0');
    const sessionServiceChargeType = session.serviceChargeType || 'percentual';
    
    let totalPending = 0;
    const unpaidGuests = [];
    const warnings = [];
    
    // Calcular subtotal total para distribuição proporcional
    const totalGuestSubtotal = guests.reduce((sum, g) => sum + parseFloat(g.subtotal || '0'), 0);
    
    for (const guest of guests) {
      let guestSubtotalOriginal = parseFloat(guest.subtotal || '0');
      let guestSubtotalAjustado = guestSubtotalOriginal;
      
      // ✅ APLICAR DESCONTO
      if (sessionDiscount > 0) {
        if (sessionDiscountType === 'percentual') {
          // Desconto percentual: aplicar diretamente
          guestSubtotalAjustado = guestSubtotalAjustado * (1 - Math.min(sessionDiscount, 100) / 100);
        } else {
          // Desconto fixo: distribuir proporcionalmente
          const guestProportion = totalGuestSubtotal > 0 ? guestSubtotalOriginal / totalGuestSubtotal : 0;
          const guestDiscountShare = sessionDiscount * guestProportion;
          guestSubtotalAjustado = Math.max(0, guestSubtotalAjustado - guestDiscountShare);
        }
      }
      
      // ✅ APLICAR TAXA DE SERVIÇO
      if (sessionServiceCharge > 0) {
        if (sessionServiceChargeType === 'percentual') {
          // Taxa percentual: aplicar diretamente
          guestSubtotalAjustado = guestSubtotalAjustado * (1 + sessionServiceCharge / 100);
        } else {
          // Taxa fixa: distribuir proporcionalmente
          const guestProportion = totalGuestSubtotal > 0 ? guestSubtotalOriginal / totalGuestSubtotal : 0;
          const guestChargeShare = sessionServiceCharge * guestProportion;
          guestSubtotalAjustado = guestSubtotalAjustado + guestChargeShare;
        }
      }
      
      // ✅ COMPARAR COM VALOR AJUSTADO
      const paid = parseFloat(guest.paidAmount || '0');
      const pending = guestSubtotalAjustado - paid;
      
      console.log(`[validateSessionClosure] Convidado: ${guest.name}`, {
        subtotalOriginal: guestSubtotalOriginal.toFixed(2),
        subtotalAjustado: guestSubtotalAjustado.toFixed(2),
        paid: paid.toFixed(2),
        pending: pending.toFixed(2)
      });
      
      if (pending > 0.01) { // Tolera 1 centavo de diferença
        totalPending += pending;
        unpaidGuests.push({
          id: guest.id,
          name: guest.name || `Convidado ${guest.guestNumber}`,
          pending: Math.round(pending * 100) / 100
        });
      }
    }
    
    // ✅ VALIDAR COM SESSION TOTAL
    const sessionTotalAmount = parseFloat(session.totalAmount || '0');
    const sessionPaidAmount = parseFloat(session.paidAmount || '0');
    const sessionPending = sessionTotalAmount - sessionPaidAmount;
    
    console.log(`[validateSessionClosure] Validação da Sessão:`, {
      sessionTotalAmount: sessionTotalAmount.toFixed(2),
      sessionPaidAmount: sessionPaidAmount.toFixed(2),
      sessionPending: sessionPending.toFixed(2),
      guestsTotalPending: totalPending.toFixed(2)
    });
    
    // Se há diferença entre sessão e convidados, usar o maior valor
    if (Math.abs(sessionPending) > Math.abs(totalPending)) {
      totalPending = sessionPending;
      if (sessionPending > 0.01) {
        warnings.push(`Diferença detectada entre total da sessão (${sessionPending.toFixed(2)}) e soma dos convidados`);
      }
    }
    
    const canClose = totalPending <= 0.01; // Tolera 1 centavo
    
    if (!canClose) {
      warnings.push(`Valor pendente: ${totalPending.toFixed(2)} Kz`);
    }
    
    return {
      canClose,
      totalPending: Math.round(totalPending * 100) / 100,
      unpaidGuests,
      warnings
    };
    
  } catch (error) {
    console.error('[validateSessionClosure] Erro:', error);
    return {
      canClose: false,
      totalPending: 0,
      unpaidGuests: [],
      warnings: ['Erro ao validar fechamento']
    };
  }
}
```

---

## 🧪 Teste do Cenário

### **Antes da Correção:**

```
Mesa com R$ 8.000,00
Aplica desconto 10% + taxa 10%
Paga R$ 7.920,00

Validação:
  guest.subtotal = 8000.00 (SEM ajustes)
  guest.paidAmount = 7920.00 (COM ajustes)
  pending = 80.00 ❌ FALSO POSITIVO

Resultado: Mesa NÃO fecha
```

### **Depois da Correção:**

```
Mesa com R$ 8.000,00
Aplica desconto 10% + taxa 10%
Paga R$ 7.920,00

Validação:
  guest.subtotalOriginal = 8000.00
  guest.subtotalAjustado = 7920.00 (COM ajustes)
  guest.paidAmount = 7920.00
  pending = 0.00 ✅ CORRETO

Resultado: Mesa FECHA ✅
```

---

## 📊 Impacto

### **Gravidade: CRÍTICA**

- 🔴 **Bloqueio operacional:** Mesas não podem ser fechadas
- 🔴 **Experiência do usuário:** Usuário fica preso no checkout
- 🔴 **Dados inconsistentes:** Mesa fica em estado "pendente" indefinidamente
- 🟡 **Workaround disponível:** Usar `forceClose: true` (mas cria auditoria desnecessária)

### **Frequência:**

- ✅ Pagamento SEM ajustes: Funciona
- ❌ Pagamento COM desconto: Falha
- ❌ Pagamento COM taxa: Falha
- ❌ Pagamento COM ambos: Falha

---

## 🎯 Checklist de Implementação

- [ ] Aplicar correção em `server/storage.ts` (função `validateSessionClosure`)
- [ ] Adicionar logs detalhados para debug
- [ ] Testar cenário: pagamento com desconto percentual
- [ ] Testar cenário: pagamento com desconto fixo
- [ ] Testar cenário: pagamento com taxa percentual
- [ ] Testar cenário: pagamento com taxa fixa
- [ ] Testar cenário: pagamento com desconto + taxa combinados
- [ ] Testar cenário: pagamento individual (1 convidado)
- [ ] Testar cenário: pagamento múltiplos convidados
- [ ] Verificar se mesa fecha corretamente
- [ ] Verificar se não há falsos positivos

---

## 🔗 Arquivos Relacionados

- `server/storage.ts` (linhas 1614-1700) - Função `validateSessionClosure`
- `server/routes.ts` (linhas 3776-3850) - Rota `POST /api/tables/:id/close-session`
- `client/src/pages/table-checkout-v2.tsx` - Frontend de pagamento

---

## 💭 Observações Adicionais

1. **A lógica de cálculo de ajustes JÁ existe** em outros lugares:
   - `POST /api/table-guests/:guestId/payment` (linhas 4290-4323)
   - Pode-se extrair para função auxiliar reutilizável

2. **A correção deve ser consistente** com a lógica de pagamento:
   - Usar mesmos cálculos de desconto/taxa
   - Mesma ordem de aplicação (desconto primeiro, taxa depois)

3. **Tolerância de 1 centavo** é adequada para arredondamentos

---

**Documentação criada em:** 2026-01-07 17:35 UTC  
**Autor:** Rovo Dev  
**Status:** Aguardando Implementação - PRIORIDADE MÁXIMA
