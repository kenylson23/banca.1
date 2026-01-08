# Resumo de Correções - Sessão 2026-01-05

## 1. ✅ Erro ao Fechar Mesa com Valores Pendentes

### Problema
```
Failed to load resource: the server responded with a status of 400 (Bad Request)
```

### Causa
Frontend não estava preservando as propriedades do erro (status, pendingAmount, unpaidGuests).

### Solução
- **queryClient.ts**: Adicionar `status: res.status` ao erro
- **useTableMutations.ts**: Tratamento inteligente de erro 400
- **TableDialogPOSModern.tsx**: Mesmo tratamento
- **TableCheckoutDialog.tsx**: Atualizado para novo formato

**Resultado**: Agora mostra mensagem clara com valores pendentes e lista de convidados não pagos.

---

## 2. ✅ Pagamento Individual Não Contabilizado

### Problema
```
- Pagamento feito no step individual
- Total Pago da mesa: 0,00 Kz
- Ao fechar: erro "valores pendentes"
```

### Causa Raiz
1. Não existia rota para pagamento de convidado específico
2. Frontend usava `/api/tables/:id/payment` que distribui proporcionalmente entre TODOS os convidados
3. Quando você pagava 100 Kz para Convidado A, sistema dividia entre A, B, C

### Solução Implementada

#### Backend - Nova Rota (server/routes.ts)
```typescript
app.post("/api/table-guests/:guestId/payment", isOperational, async (req, res) => {
  // Cria tablePayment diretamente (sem addTablePayment)
  // Cria guestPayment que atualiza paidAmount do convidado
  // Recalcula session.paidAmount somando todos os convidados
});
```

#### Frontend - Detecção de Contexto
```typescript
// PaymentSection.tsx e table-checkout-v2.tsx
if (selectedGuestIds.length === 1) {
  // Usa rota de pagamento individual
  await apiRequest('POST', `/api/table-guests/${guestId}/payment`, payload);
} else {
  // Usa rota geral da mesa
  await apiRequest('POST', `/api/tables/${id}/payment`, payload);
}
```

#### Logs de Debug Adicionados
- `🎯 [CHECKOUT]` - Frontend mostra qual rota está usando
- `🎯 [GUEST PAYMENT]` - Backend mostra processamento

**Resultado**: 
- Pagamento individual atualiza apenas o convidado específico
- Total da sessão é recalculado corretamente
- Validação de fechamento funciona

---

## 3. ✅ Erro: column "billing_period_start" does not exist

### Problema
```
error: column "billing_period_start" does not exist
```

### Causa
Tabela `subscription_payments` sem colunas `billing_period_start` e `billing_period_end`.

### Solução
- **Migration criada**: `server/migrations/add_billing_period_columns.sql`
- Adiciona colunas com valores padrão para registros existentes
- Auto-aplicada ao reiniciar servidor

---

## 4. ✅ Erro ao Criar Mesa: "expected string received null"

### Problema
```
expected string received null
```

### Causa
Campo `area` sendo enviado como `null` ou `undefined`, mas schema esperava `string`.

### Solução
1. **Schema (shared/schema.ts)**:
   ```typescript
   area: z.string().min(1, "...").max(100, "...").optional().nullable()
   ```

2. **Storage (server/storage.ts)**:
   ```typescript
   area: table.area || null,  // Converter vazio/undefined para null
   ```

**Resultado**: Mesa pode ser criada sem especificar área.

---

## 📄 Arquivos Modificados

### Backend
1. `server/routes.ts` - Nova rota de pagamento individual + logs
2. `server/storage.ts` - Correção area: null
3. `server/migrations/add_billing_period_columns.sql` - Nova migration

### Frontend
4. `client/src/lib/queryClient.ts` - Preservar status do erro
5. `client/src/components/table-dialog/sections/PaymentSection.tsx` - Detecção contexto + logs
6. `client/src/components/table-dialog/hooks/useTableMutations.ts` - Tratamento erro 400
7. `client/src/components/table-dialog/TableDialogPOSModern.tsx` - Tratamento erro 400
8. `client/src/components/tables/TableCheckoutDialog.tsx` - Novo formato parâmetros
9. `client/src/pages/table-checkout-v2.tsx` - Detecção contexto + logs

### Schema
10. `shared/schema.ts` - area nullable

---

## 🧪 Como Testar

### 1. Reiniciar Servidor (IMPORTANTE!)
```bash
# Parar (Ctrl+C)
npm run dev
```

### 2. Testar Criação de Mesa
- Criar mesa sem especificar área
- Deve criar com sucesso

### 3. Testar Pagamento Individual
- Abrir console (`F12`)
- Ir para `/tables/{id}/checkout?step=1`
- Selecionar APENAS 1 convidado
- Fazer pagamento no step 3
- **Verificar logs**:
  - Console: `🎯 [CHECKOUT] Usando rota de pagamento INDIVIDUAL`
  - Servidor: `🎯 [GUEST PAYMENT] Nova rota chamada`
- Verificar "Total Pago" atualizado corretamente

### 4. Testar Fechamento de Mesa
- Tentar fechar mesa com valores pendentes
- Deve mostrar mensagem detalhada com valores e convidados
- Fechar mesa após todos pagarem
- Deve fechar com sucesso

---

## 📚 Documentação Adicional

1. **GUIA_DEBUG_PAGAMENTO_STEP.md** - Guia passo a passo de teste
2. **CORRECAO_PAGAMENTO_CONVIDADO_INDIVIDUAL.md** - Explicação técnica completa
3. **CORRECAO_ERRO_FECHAMENTO_MESA.md** - Detalhes da correção de validação
4. **INSTRUCOES_CORRECAO_BILLING_PERIOD.md** - Como aplicar migration

---

## ⚠️ Próximos Passos

1. [ ] Reiniciar servidor
2. [ ] Testar criação de mesa
3. [ ] Testar pagamento individual com logs
4. [ ] Confirmar valores corretos
5. [ ] Testar fechamento de mesa
6. [ ] Remover logs de debug após confirmar funcionamento

---

**Status**: ✅ Todas as correções implementadas e prontas para teste
**Data**: 2026-01-05 18:00
