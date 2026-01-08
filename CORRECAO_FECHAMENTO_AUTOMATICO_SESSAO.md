# Correção: Fechamento Automático de Sessão Após Pagamento Completo

## 🐛 Problema Reportado

Após fazer pagamento completo no **Checkout V2** com desconto e taxa de serviço, o sistema mostrava:
- ✅ "Pagamento feito com sucesso"
- ❌ Ao voltar ao diálogo Modern POS: **sessão não foi fechada**
- ❌ Ainda mostrava **valor pendente**

### Cenário do Bug:

1. Pedidos: 8.000 Kz
2. Desconto 15%: -1.200 Kz
3. Taxa serviço: +2.000 Kz
4. **Total: 8.800 Kz**
5. Pagamento de 8.800 Kz realizado ✅
6. **Esperado**: Sessão fechada automaticamente
7. **Real**: Sessão permanece aberta com valor pendente ❌

## 🔍 Causa Raiz

A função `autoUpdateTableStatusOnPayment` no `server/storage.ts` (linha 8388) tinha uma **lógica incompleta**:

```typescript
// ❌ CÓDIGO ANTIGO (PROBLEMA)
if (paidAmount >= totalAmount && totalAmount > 0) {
  // Fully paid
  await this.updateTableStatus(tableId, 'disponivel'); // ❌ Só atualiza status
}
```

**Problemas identificados**:
1. ✅ Verificava se pagamento estava completo
2. ✅ Atualizava status da mesa para "disponivel"
3. ❌ **NÃO fechava a sessão** (não atualizava `session.status = 'encerrada'`)
4. ❌ **NÃO limpava `currentSessionId`** da mesa
5. ❌ **NÃO resetava totais** da mesa

**Resultado**: Mesa mostrava status "disponivel" mas ainda tinha sessão ativa com valores pendentes.

## ✅ Solução Implementada

### Arquivo: `server/storage.ts` (linhas 8388-8448)

Implementado **fechamento completo e automático da sessão** quando pagamento está completo:

```typescript
// ✅ CORREÇÃO: Pagamento completo - Fechar sessão automaticamente
if (paidAmount >= totalAmount && totalAmount > 0) {
  console.log('✅ [autoUpdateTableStatusOnPayment] Pagamento completo! Fechando sessão automaticamente...');
  
  // 1. Atualizar sessão para 'encerrada'
  await db.update(tableSessions)
    .set({
      status: 'encerrada',
      endedAt: new Date(),
    })
    .where(eq(tableSessions.id, table.currentSessionId));
  
  // 2. Atualizar mesa para 'livre' e limpar sessão
  await db.update(tables)
    .set({
      status: 'livre',
      currentSessionId: null,  // ✅ CRÍTICO: Limpar sessão
      totalAmount: '0',         // ✅ Zerar totais
      customerName: null,
      customerCount: 0,
      lastActivity: new Date(),
      isOccupied: 0,
    })
    .where(eq(tables.id, tableId));
  
  console.log('✅ [autoUpdateTableStatusOnPayment] Sessão fechada e mesa liberada com sucesso');
}
```

## 📊 Fluxo Correto Agora

### 1. **Checkout V2 - Pagamento**
```
Subtotal:     8.000 Kz
Desconto:    -1.200 Kz (15%)
Taxa serviço: +2.000 Kz
TOTAL:        8.800 Kz
```

### 2. **Endpoint `/api/tables/:id/payment`** (server/routes.ts linha 4006)
- Recebe pagamento de 8.800 Kz
- Aplica desconto e taxa à sessão
- Atualiza `session.paidAmount = 8.800`
- Atualiza `session.totalAmount = 8.800`
- Chama `autoUpdateTableStatusOnPayment()`

### 3. **`autoUpdateTableStatusOnPayment`** (server/storage.ts linha 8388)
```typescript
// Verifica: paidAmount (8.800) >= totalAmount (8.800) ✅
if (8.800 >= 8.800 && 8.800 > 0) {
  // Fecha sessão automaticamente
  session.status = 'encerrada'
  session.endedAt = NOW
  
  // Libera mesa
  table.status = 'livre'
  table.currentSessionId = null
  table.totalAmount = '0'
}
```

### 4. **Resultado no Diálogo Modern POS**
- Mesa aparece como **livre** ✅
- Sessão **encerrada** ✅
- **SEM valores pendentes** ✅

## 🔍 Logs de Debug

Adicionados logs detalhados para diagnóstico:

```typescript
console.log('🔍 [autoUpdateTableStatusOnPayment] Verificando status:', {
  tableId,
  sessionId: table.currentSessionId,
  totalAmount: totalAmount.toFixed(2),
  paidAmount: paidAmount.toFixed(2),
  pendente: (totalAmount - paidAmount).toFixed(2),
  isFullyPaid: paidAmount >= totalAmount && totalAmount > 0
});
```

**Log esperado após pagamento completo:**
```
✅ [autoUpdateTableStatusOnPayment] Pagamento completo! Fechando sessão automaticamente...
✅ [autoUpdateTableStatusOnPayment] Sessão fechada e mesa liberada com sucesso
```

## 🎯 Comparação: Antes vs Depois

### Antes:
| Etapa | Status Mesa | Status Sessão | currentSessionId | Totais |
|-------|-------------|---------------|------------------|--------|
| Após pagamento | `disponivel` | `ocupada` ❌ | `session_id` ❌ | 8.800 Kz ❌ |
| Diálogo Modern POS | Mostra pendente ❌ | Sessão ativa ❌ | - | 8.800 Kz ❌ |

**Problema**: Sessão permanecia aberta mesmo com pagamento completo!

### Depois:
| Etapa | Status Mesa | Status Sessão | currentSessionId | Totais |
|-------|-------------|---------------|------------------|--------|
| Após pagamento | `livre` ✅ | `encerrada` ✅ | `null` ✅ | 0 Kz ✅ |
| Diálogo Modern POS | Mesa livre ✅ | Sem sessão ✅ | - | 0 Kz ✅ |

**Solução**: Sessão fecha automaticamente e mesa fica livre!

## 🧪 Como Testar

### Teste 1: Pagamento Completo com Desconto + Taxa
1. Abrir mesa e fazer pedidos (ex: 8.000 Kz)
2. No Checkout V2:
   - Aplicar desconto de 15% (-1.200 Kz)
   - Aplicar taxa de 2.000 Kz
   - Total: 8.800 Kz
3. Pagar 8.800 Kz com sucesso ✅
4. **Verificar**:
   - ✅ Mensagem "Pagamento feito com sucesso"
   - ✅ Voltar ao diálogo: Mesa deve estar **livre**
   - ✅ Sessão deve estar **encerrada**
   - ✅ **SEM valores pendentes**

### Teste 2: Pagamento Parcial
1. Pedidos: 10.000 Kz
2. Pagar apenas 5.000 Kz
3. **Verificar**:
   - ⏳ Mesa fica com status `pagamento_parcial`
   - ⏳ Sessão continua `ocupada`
   - ⏳ Mostra 5.000 Kz pendente

### Teste 3: Logs no Console
```bash
# Fazer pagamento completo e verificar logs
tail -f /tmp/server.log | grep autoUpdateTableStatusOnPayment
```

**Output esperado:**
```
🔍 [autoUpdateTableStatusOnPayment] Verificando status: { totalAmount: '8800.00', paidAmount: '8800.00', isFullyPaid: true }
✅ [autoUpdateTableStatusOnPayment] Pagamento completo! Fechando sessão automaticamente...
✅ [autoUpdateTableStatusOnPayment] Sessão fechada e mesa liberada com sucesso
```

## 📝 Arquivos Modificados

1. **`server/storage.ts`** (linhas 8388-8448):
   - Função `autoUpdateTableStatusOnPayment`
   - ✅ Adiciona fechamento automático de sessão
   - ✅ Limpa `currentSessionId` da mesa
   - ✅ Reseta totais para 0
   - ✅ Logs detalhados de debug

## 🔗 Correções Relacionadas

Esta correção completa o fluxo de pagamento iniciado em:
1. ✅ **Cálculo de totais com desconto + taxa** ([CORRECAO_CALCULO_TOTAL_MESAS.md](CORRECAO_CALCULO_TOTAL_MESAS.md))
2. ✅ **Filtro estrito de pedidos por sessão** ([CORRECAO_VALORES_FANTASMA_NOVA_SESSAO.md](CORRECAO_VALORES_FANTASMA_NOVA_SESSAO.md))
3. ✅ **Fechamento automático após pagamento completo** (este documento)

## 🎉 Resultado Final

**Problema resolvido!** O sistema agora:
- ✅ Calcula totais corretamente com descontos e taxas
- ✅ Atualiza `paidAmount` e `totalAmount` na sessão
- ✅ **Fecha sessão automaticamente** quando pagamento está completo
- ✅ Libera mesa e reseta totais
- ✅ Diálogo Modern POS mostra estado correto (sem pendências)
- ✅ Logs detalhados para diagnóstico

### Fluxo Completo Testado:
```
1. Pedidos: 8.000 Kz ✅
2. Desconto 15%: -1.200 Kz ✅
3. Taxa serviço: +2.000 Kz ✅
4. Total: 8.800 Kz ✅
5. Pagamento: 8.800 Kz ✅
6. Sessão fechada automaticamente ✅
7. Mesa livre ✅
8. SEM valores pendentes ✅
```

---
**Data da Correção**: 2026-01-06  
**Arquivos Modificados**: `server/storage.ts` (linhas 8388-8448)  
**Função Alterada**: `autoUpdateTableStatusOnPayment`
