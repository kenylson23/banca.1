# ✅ Correção Aplicada: Sincronização de Pagamento entre Checkout e Gestão de Mesas

**Data:** 2026-01-05  
**Status:** ✅ CONCLUÍDO

---

## 🎯 Problema Identificado

O pagamento feito no checkout (step 4) não estava sendo **visualmente exibido** no diálogo de gestão das mesas (`TableDetailsDialog`), apesar de estar sendo corretamente processado e armazenado no backend.

---

## 🔍 Análise Completa

### Backend (✅ Funcionando Corretamente)
1. `storage.addTablePayment()` atualiza corretamente o `paidAmount` na tabela `table_sessions`
2. Distribui proporcionalmente o pagamento entre os `table_guests`
3. Endpoint `/api/tables/:id/orders-by-guest` retorna o `paidAmount` atualizado
4. WebSocket broadcast `table_payment_added` funciona corretamente

### Frontend - Checkout (✅ Funcionando Corretamente)
1. `processPaymentMutation` envia pagamento corretamente
2. Invalida **TODAS** as queries necessárias após o pagamento:
   - `/api/tables/${id}/orders-by-guest` ← Query usada pelo TableDetailsDialog
   - `/api/tables/with-orders`
   - `/api/tables/${id}/guests`
   - `/api/table-sessions`
   - `tables`

### Frontend - TableDetailsDialog (❌ PROBLEMA ENCONTRADO)
**Problema:** O componente não estava:
1. Extraindo o `paidAmount` do `ordersByGuestData`
2. Exibindo visualmente o valor pago e restante

---

## 🔧 Correções Aplicadas

### 1. Configuração de Cache Otimizada

**Arquivo:** `client/src/components/TableDetailsDialog.tsx` (linhas 347-353)

```typescript
const { data: ordersByGuestData } = useQuery<OrdersByGuestData>({
  queryKey: [`/api/tables/${currentTable?.id}/orders-by-guest`],
  enabled: open && !!currentTable?.id && currentTable?.status !== 'livre',
  refetchOnMount: true, // 🔧 FIX: Sempre buscar dados frescos ao abrir o diálogo
  refetchOnWindowFocus: true, // 🔧 FIX: Refetch quando a janela recebe foco
  staleTime: 0, // 🔧 FIX: Dados sempre considerados "stale" para forçar refetch após invalidações
});
```

**Benefício:** Garante que os dados sejam sempre atualizados quando:
- O diálogo é aberto
- A janela do navegador recebe foco
- Uma invalidação de query ocorre (após pagamento no checkout)

---

### 2. Extração do paidAmount

**Arquivo:** `client/src/components/TableDetailsDialog.tsx` (linhas 1005-1014)

```typescript
// 🔧 FIX: Get paid amount from ordersByGuestData
const paidAmount = useMemo(() => {
  if (ordersByGuestData?.paidAmount) {
    const paid = parseFloat(ordersByGuestData.paidAmount);
    console.log('[DEBUG TableDetailsDialog] Calculated paidAmount:', paid);
    return paid;
  }
  console.log('[DEBUG TableDetailsDialog] No paidAmount in data, returning 0');
  return 0;
}, [ordersByGuestData]);
```

**Benefício:** Extrai corretamente o valor pago da resposta da API e converte para número.

---

### 3. Exibição Visual do Pagamento

**Arquivo:** `client/src/components/TableDetailsDialog.tsx` (linhas 1729-1749)

```typescript
{/* 🔧 FIX: Show paid amount and remaining */}
{(() => {
  console.log('[DEBUG TableDetailsDialog] Rendering payment section. paidAmount:', paidAmount, 'totalAmount:', totalAmount);
  return paidAmount > 0 && (
    <div className="mt-3 space-y-2 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/60">Pago</span>
        <span className="text-green-400 font-semibold">{formatKwanza(paidAmount)}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/80 font-medium">Restante</span>
        <span className={cn(
          "font-bold",
          totalAmount - paidAmount > 0 ? "text-orange-400" : "text-green-400"
        )}>
          {formatKwanza(totalAmount - paidAmount)}
        </span>
      </div>
    </div>
  );
})()}
```

**Benefício:** Exibe claramente:
- ✅ Valor já pago (em verde)
- ✅ Valor restante (em laranja se pendente, verde se completo)
- ✅ Aparece apenas quando há pagamentos registrados

---

### 4. Logs de Debug Adicionados

**Locais:**
- `ordersByGuestData` recebido (linha 376-377)
- Cálculo do `paidAmount` (linhas 1008, 1012)
- Renderização da seção de pagamento (linha 1731)

**Benefício:** Facilita debugging e monitoramento do fluxo de dados em produção.

---

## 📊 Resultado Visual Esperado

### ANTES da Correção
```
┌─────────────────────────────┐
│ Total da Mesa               │
│ 10.000,00 Kz               │
│                             │
│ 3 pedidos | 3.333,33 Kz/pessoa │
└─────────────────────────────┘
```

### DEPOIS da Correção (com pagamento de 5.000 Kz)
```
┌─────────────────────────────┐
│ Total da Mesa               │
│ 10.000,00 Kz               │
│                             │
│ ┌─────────────────────────┐ │
│ │ Pago      5.000,00 Kz  │ │ ← Verde
│ │ Restante  5.000,00 Kz  │ │ ← Laranja
│ └─────────────────────────┘ │
│                             │
│ 3 pedidos | 3.333,33 Kz/pessoa │
└─────────────────────────────┘
```

### DEPOIS da Correção (pagamento completo de 10.000 Kz)
```
┌─────────────────────────────┐
│ Total da Mesa               │
│ 10.000,00 Kz               │
│                             │
│ ┌─────────────────────────┐ │
│ │ Pago      10.000,00 Kz │ │ ← Verde
│ │ Restante      0,00 Kz  │ │ ← Verde (completo!)
│ └─────────────────────────┘ │
│                             │
│ 3 pedidos | 3.333,33 Kz/pessoa │
└─────────────────────────────┘
```

---

## 🧪 Como Testar

### Teste 1: Pagamento Parcial
1. Abrir uma mesa com pedidos (ex: total 10.000 Kz)
2. Ir para o checkout (step 4)
3. Fazer um pagamento parcial de 5.000 Kz
4. Voltar para o diálogo de gestão de mesas
5. **Verificar:**
   - ✅ "Pago: 5.000,00 Kz" aparece em verde
   - ✅ "Restante: 5.000,00 Kz" aparece em laranja

### Teste 2: Pagamento Completo
1. Continuar do teste anterior
2. Ir novamente para o checkout
3. Pagar os 5.000 Kz restantes
4. Voltar para o diálogo de gestão de mesas
5. **Verificar:**
   - ✅ "Pago: 10.000,00 Kz" aparece em verde
   - ✅ "Restante: 0,00 Kz" aparece em verde

### Teste 3: Múltiplos Dispositivos
1. Abrir o diálogo de gestão de mesas em um dispositivo
2. Fazer um pagamento no checkout em outro dispositivo
3. **Verificar:**
   - ✅ O primeiro dispositivo atualiza automaticamente
   - ✅ Os valores aparecem corretamente

### Teste 4: Sem Pagamento
1. Abrir uma mesa com pedidos mas sem pagamentos
2. **Verificar:**
   - ✅ A seção de pagamento NÃO aparece (pois `paidAmount === 0`)
   - ✅ Apenas o total é exibido

---

## 🔄 Fluxo de Sincronização (COMPLETO)

```
┌─────────────────────┐
│  Usuário faz        │
│  pagamento no       │
│  Checkout Step 4    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────┐
│ POST /api/tables/:id/payment    │
│ • Valida dados                  │
│ • Aplica descontos              │
│ • Chama addTablePayment()       │
└──────────┬──────────────────────┘
           │
           ▼
┌────────────────────────────────────┐
│ storage.addTablePayment()          │
│ • INSERT table_payments            │
│ • UPDATE table_sessions.paidAmount │ ✅
│ • UPDATE table_guests.paidAmount   │ ✅
└──────────┬─────────────────────────┘
           │
           ▼
┌───────────────────────────────────┐
│ Checkout invalida queries:        │
│ • /api/tables/${id}/orders-by-guest │ ✅
│ • /api/tables/with-orders         │
│ • /api/tables/${id}/guests        │
└──────────┬────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ TableDetailsDialog:                 │
│ • Detecta invalidação               │
│ • Refetch orders-by-guest (staleTime: 0) │ ✅
└──────────┬──────────────────────────┘
           │
           ▼
┌────────────────────────────────────────┐
│ GET /api/tables/:id/orders-by-guest    │
│ • Retorna session.paidAmount (ATUALIZADO) │ ✅
└──────────┬─────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ TableDetailsDialog:                 │
│ • Extrai paidAmount ✅              │
│ • Calcula restante ✅               │
│ • Renderiza painel visual ✅        │
└─────────────────────────────────────┘
```

---

## 📝 Arquivos Modificados

### 1. `client/src/components/TableDetailsDialog.tsx`
- ✅ Linha 347-353: Configuração de cache otimizada
- ✅ Linha 376-377: Logs de debug para `ordersByGuestData`
- ✅ Linha 1005-1014: Extração do `paidAmount`
- ✅ Linha 1729-1749: Exibição visual do pagamento

**Total de alterações:** 4 seções

---

## 🎯 Benefícios da Correção

### 1. **Transparência Financeira**
- Usuários veem claramente quanto já foi pago
- Facilita o controle de pagamentos parciais
- Evita confusão sobre o status de pagamento

### 2. **UX Melhorada**
- Interface mais informativa
- Feedback visual claro (cores verde/laranja)
- Aparece apenas quando relevante (paidAmount > 0)

### 3. **Sincronização Garantida**
- `staleTime: 0` garante dados sempre frescos
- `refetchOnMount` atualiza ao abrir o diálogo
- `refetchOnWindowFocus` atualiza ao voltar para a aba

### 4. **Debugging Facilitado**
- Logs de console rastreiam o fluxo de dados
- Fácil identificar problemas de sincronização
- Visibilidade do que está sendo calculado

---

## ✅ Status Final

| Componente | Status | Observação |
|------------|--------|------------|
| Backend - addTablePayment | ✅ | Funcionando desde o início |
| Backend - orders-by-guest | ✅ | Funcionando desde o início |
| Checkout - Invalidações | ✅ | Funcionando desde o início |
| TableDetailsDialog - Query | ✅ | Otimizado com `staleTime: 0` |
| TableDetailsDialog - Extração | ✅ | **CORRIGIDO** |
| TableDetailsDialog - Exibição | ✅ | **CORRIGIDO** |

---

## 🚀 Próximos Passos (Opcional)

### Melhorias Futuras Sugeridas:
1. **WebSocket Real-time**: Escutar evento `table_payment_added` para atualização instantânea
2. **Animação de Transição**: Animar mudança dos valores com Framer Motion
3. **Histórico de Pagamentos**: Botão para ver lista completa de pagamentos
4. **Notificação Toast**: Exibir toast quando novo pagamento é detectado
5. **Progress Bar**: Barra visual do progresso de pagamento (% pago)

---

## 📄 Documentos Relacionados

- `ANALISE_SINCRONIZACAO_PAGAMENTO_MESAS.md` - Análise completa do problema
- `client/src/components/TableDetailsDialog.tsx` - Componente corrigido
- `server/routes.ts` - Endpoints de pagamento
- `server/storage.ts` - Função `addTablePayment`

---

**Correção aplicada com sucesso! ✅**
