# 🔴 5 NOVOS CONFLITOS CRÍTICOS ENCONTRADOS

## Resumo da Segunda Verificação

Após corrigir os 6 conflitos P0 iniciais, realizei uma **segunda verificação profunda** e encontrei **5 NOVOS CONFLITOS**, sendo **3 CRÍTICOS (P0)**!

---

## 🔴 CONFLITO #11: `calculateTableTotal` Ignora Descontos e Taxas

### Severidade: 🔴 **CRÍTICA** | Prioridade: **P0**

### O Problema:
Função `calculateTableTotal` (storage.ts linha 1993) calcula total como **soma de pedidos**, mas:
- ❌ **NÃO aplica descontos da sessão**
- ❌ **NÃO aplica taxas de serviço**
- ❌ Atualiza `session.totalAmount` com valor **INCORRETO**

### Código Atual:
```typescript
async calculateTableTotal(restaurantId: string, tableId: string): Promise<number> {
  // Soma apenas pedidos
  const total = tableOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
  
  // ❌ Atualiza SEM ajustes
  await db.update(tables).set({ totalAmount: total.toFixed(2) });
  await db.update(tableSessions).set({ totalAmount: total.toFixed(2) });
  
  return total;
}
```

### Onde é Chamado:
- Linha 2685: Ao **completar pedido**

### Impacto CRÍTICO:
```
1. Mesa com desconto 15% e taxa 2.000 Kz
2. session.totalAmount = 8.800 Kz (correto) ✅
3. Cliente adiciona mais 1 pedido
4. calculateTableTotal() é chamado
5. session.totalAmount = 8.500 Kz (SEM ajustes) ❌
6. PERDEU o desconto e taxa aplicados! ❌
```

---

## 🔴 CONFLITO #12: Auto-Fechamento NÃO Funciona em Pagamentos Individuais

### Severidade: 🔴 **ALTA** | Prioridade: **P0**

### O Problema:
Endpoint `/api/table-guests/:guestId/payment` **NÃO chama** `autoUpdateTableStatusOnPayment`!

### Comparação:

| Endpoint | Chama autoUpdate? |
|----------|-------------------|
| `/api/tables/:id/payment` | ✅ SIM (linha 4147) |
| `/api/tables/:id/payments` | ✅ SIM (linha 4474) |
| `/api/table-guests/:guestId/payment` | ❌ **NÃO** |

### Cenário Real:
```
Guest 1 paga: 4.400 Kz
Guest 2 paga: 4.400 Kz (completa o pagamento!)

session.totalAmount = 8.800 Kz ✅
session.paidAmount = 8.800 Kz ✅

Mas: autoUpdateTableStatusOnPayment NÃO é chamado ❌
Resultado: Mesa NÃO fecha automaticamente! ❌
```

---

## 🟡 CONFLITO #13: `table.totalAmount` vs `session.totalAmount` Inconsistência

### Severidade: 🟡 MÉDIA | Prioridade: P1

### O Problema:
Existem **2 colunas diferentes** armazenando o mesmo dado:
1. `tables.totalAmount`
2. `tableSessions.totalAmount`

### Sincronização:

| Operação | `table.totalAmount` | `session.totalAmount` |
|----------|--------------------|-----------------------|
| Criar sessão | ✅ Atualizado | ✅ Atualizado |
| Pagamento | ❌ NÃO atualizado | ✅ Atualizado |
| Novo pedido | ✅ calculateTableTotal | ✅ calculateTableTotal |

### Consequência:
- Valores **divergem** após pagamento
- Frontend pode mostrar valores diferentes

---

## 🔴 CONFLITO #14: `calculateTableTotal` Sobrescreve Ajustes Manualmente Aplicados

### Severidade: 🔴 **CRÍTICA** | Prioridade: **P0**

### O Problema:
Se garçom aplicar desconto/taxa E depois cliente adicionar pedido, os ajustes são **PERDIDOS**!

### Fluxo do Bug:
```
Passo 1: Pedidos = 8.000 Kz
Passo 2: Garçom aplica desconto 15%
         → session.totalAmount = 6.800 Kz ✅
Passo 3: Garçom aplica taxa 2.000 Kz
         → session.totalAmount = 8.800 Kz ✅
Passo 4: Cliente adiciona pedido de 500 Kz
         → Sistema chama calculateTableTotal()
         → Soma TODOS: 8.000 + 500 = 8.500 Kz
         → session.totalAmount = 8.500 Kz ❌
         → PERDEU desconto e taxa! ❌
```

---

## 🟡 CONFLITO #15: Ordenação de Operações em `addTablePayment`

### Severidade: 🟡 BAIXA | Prioridade: P2

### O Problema:
Distribuição proporcional aos guests usa `session.paidAmount` que pode estar desatualizado no momento da execução.

### Impacto:
- Valores proporcionais ligeiramente incorretos
- Baixa probabilidade de ocorrer
- Não bloqueia operações

---

## 📊 ESTATÍSTICAS FINAIS:

### Total de Conflitos Identificados: **15**

| Rodada | P0 (Críticos) | P1 (Médios) | P2 (Baixos) |
|--------|---------------|-------------|-------------|
| 1ª Rodada | 6 (✅ corrigidos) | 2 | 2 |
| 2ª Rodada | **3 (⚠️ novos!)** | 1 | 1 |
| **TOTAL** | **9** | **3** | **3** |

### Status Atual:
- ✅ **6 conflitos P0** corrigidos (1ª rodada)
- ⚠️ **3 conflitos P0** ainda restam (2ª rodada)
- ⚠️ **3 conflitos P1** pendentes
- ⏳ **3 conflitos P2** baixa prioridade

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS:

1. **Corrigir CONFLITO #11**: Função `calculateTableTotal` deve aplicar ajustes
2. **Corrigir CONFLITO #12**: Adicionar `autoUpdateTableStatusOnPayment` em pagamento individual
3. **Corrigir CONFLITO #14**: Preservar ajustes manuais ao adicionar novos pedidos

---

**Data**: 2026-01-06  
**Status**: ⚠️ **3 conflitos P0 críticos ainda não resolvidos**
