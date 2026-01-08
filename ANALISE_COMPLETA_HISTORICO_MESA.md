# 🔍 Análise Completa: Histórico da Mesa - Melhorias Necessárias

**Data:** 2026-01-05  
**Componente:** `HistorySection.tsx`  
**Localização:** `client/src/components/table-dialog/sections/HistorySection.tsx`

---

## 📊 Estado Atual do Histórico

### **O Que É Exibido Atualmente:**

```typescript
// HistorySection.tsx - Linha 34-37
const { data: payments = [], isLoading } = useQuery<any[]>({
  queryKey: [`/api/tables/${table.id}/payments`],
  enabled: !!table.id,
});
```

#### **Dados Mostrados (Apenas Pagamentos):**
- ✅ ID do pagamento (8 primeiros caracteres)
- ✅ Data e hora do pagamento
- ✅ Valor pago
- ✅ Método de pagamento (Dinheiro, Cartão, MBWay, etc.)
- ✅ Observações (se houver)
- ✅ Badge "Pago" (status)

#### **Visualização:**
```
┌─────────────────────────────────────────┐
│ 💳 Pagamento #a1b2c3d4                  │
│ 🕐 05/01/2026 às 14:30                  │
│                                         │
│ Valor: 45.000 Kz                       │
│ Método: Dinheiro                        │
│ Observações: Cliente satisfeito         │
└─────────────────────────────────────────┘
```

---

## ❌ Problemas Identificados

### **1. Informações Limitadas**
O histórico mostra **apenas pagamentos**, sem contexto completo:
- ❌ Não mostra **quem pagou** (convidados)
- ❌ Não mostra **o que foi consumido** (itens)
- ❌ Não mostra **descontos aplicados**
- ❌ Não mostra **taxas de serviço**
- ❌ Não mostra **duração da sessão**
- ❌ Não mostra **número de convidados**
- ❌ Não mostra **quem processou** o pagamento (operador)

### **2. Sem Histórico de Sessões Anteriores**
Apenas mostra pagamentos, mas não há:
- ❌ Lista de sessões anteriores da mesa
- ❌ Quando a sessão começou/terminou
- ❌ Quantas pessoas estavam na sessão
- ❌ Total consumido por sessão

### **3. Sem Histórico de Pedidos**
- ❌ Não mostra pedidos feitos
- ❌ Não mostra itens cancelados
- ❌ Não mostra movimentações entre convidados
- ❌ Não mostra timeline de eventos

### **4. Sem Auditoria Detalhada**
Existe uma rota `/api/tables/sessions/:sessionId/audit-logs` mas não é usada:
- ❌ Não mostra quem adicionou cada item
- ❌ Não mostra quem moveu itens entre convidados
- ❌ Não mostra quem aplicou descontos
- ❌ Não mostra histórico de alterações

---

## 🗂️ APIs Disponíveis (Backend)

### **Rotas Implementadas:**

#### 1. **`GET /api/tables/:id/sessions`** (Linha 4144)
Retorna todas as sessões da mesa.

**Dados Disponíveis:**
- `id` - ID da sessão
- `tableId` - ID da mesa
- `startedAt` - Quando iniciou
- `endedAt` - Quando terminou (null se ativa)
- `peopleCount` - Número de pessoas
- `totalAmount` - Total da sessão
- `status` - Status (active, completed, cancelled)

#### 2. **`GET /api/tables/:id/payments`** (Linha 4159 e 9110)
Retorna pagamentos da mesa/sessão atual.

**Dados Disponíveis:**
- `id` - ID do pagamento
- `amount` - Valor
- `method` - Método (cash, card, mbway, etc.)
- `createdAt` - Data/hora
- `notes` - Observações
- `sessionId` - ID da sessão
- `userId` - Quem processou

#### 3. **`GET /api/tables/sessions/:sessionId/audit-logs`** (Linha 4082)
Retorna logs de auditoria da sessão.

**Dados Disponíveis:**
- `id` - ID do log
- `action` - Ação (item_added, item_moved, item_cancelled, etc.)
- `itemName` - Nome do item
- `quantity` - Quantidade
- `actor` - Quem fez a ação (nome do usuário)
- `sourceGuest` - Convidado origem (em movimentações)
- `targetGuest` - Convidado destino
- `reason` - Motivo (em movimentações)
- `timestamp` - Quando ocorreu

#### 4. **`GET /api/tables/:id/orders-by-guest`** (Linha 4501)
Retorna pedidos organizados por convidado.

**Dados Disponíveis:**
- `guest` - Dados do convidado
- `orders` - Array de pedidos
- `subtotal` - Total do convidado

#### 5. **`GET /api/tables/:id/guests`** (Linha 4177)
Retorna convidados da sessão atual.

---

## 🎯 Melhorias Propostas

### **Melhoria 1: Histórico de Sessões Completo** ⭐⭐⭐

#### **Implementação:**
Adicionar seção mostrando todas as sessões anteriores da mesa.

```typescript
// Buscar sessões
const { data: sessions = [] } = useQuery({
  queryKey: [`/api/tables/${table.id}/sessions`],
  enabled: !!table.id,
});

// Filtrar sessões concluídas
const completedSessions = sessions.filter(s => s.status === 'completed');
```

#### **Visualização Proposta:**
```
┌─────────────────────────────────────────────────────┐
│ 📅 HISTÓRICO DE SESSÕES                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Sessão #1 - 05/01/2026 12:00 → 14:30 (2h30min)   │
│ 👥 4 pessoas  |  💰 85.000 Kz  |  ✅ Finalizada   │
│                                                     │
│   📋 Detalhes:                                      │
│   • Hambúrgueres (4x) - 20.000 Kz                 │
│   • Batatas Fritas (2x) - 6.000 Kz               │
│   • Refrigerantes (4x) - 12.000 Kz               │
│   • Taxa de Serviço (10%) - 3.800 Kz             │
│   • Desconto Cupom PROMO20 - -5.000 Kz           │
│                                                     │
│   💳 Pagamento: Dinheiro                           │
│   👤 Processado por: João Silva                    │
│                                                     │
│ ─────────────────────────────────────────────────  │
│                                                     │
│ Sessão #2 - 04/01/2026 19:00 → 21:15 (2h15min)   │
│ 👥 2 pessoas  |  💰 45.000 Kz  |  ✅ Finalizada   │
│   [Ver Detalhes ▼]                                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### **Melhoria 2: Detalhes Expandidos de Cada Pagamento** ⭐⭐⭐

#### **Implementação:**
Buscar dados completos ao clicar em um pagamento.

```typescript
const [expandedPayment, setExpandedPayment] = useState<string | null>(null);

// Buscar detalhes quando expandir
const { data: paymentDetails } = useQuery({
  queryKey: [`/api/tables/${table.id}/orders-by-guest`, payment.sessionId],
  enabled: expandedPayment === payment.id,
});
```

#### **Visualização Proposta:**
```
┌─────────────────────────────────────────────────────┐
│ 💳 Pagamento #a1b2c3d4                 [▼ Expandido]│
│ 🕐 05/01/2026 às 14:30                              │
│                                                     │
│ 💰 Valor Total: 45.000 Kz                          │
│ 💳 Método: Dinheiro                                 │
│ 👤 Operador: João Silva                             │
│                                                     │
├─────────────────────────────────────────────────────┤
│ 📦 ITENS CONSUMIDOS:                                │
│                                                     │
│ Cliente #1 - Maria                                  │
│   2x Hambúrguer Clássico        10.000 Kz         │
│   1x Coca-Cola                   3.000 Kz         │
│   Subtotal:                     13.000 Kz         │
│                                                     │
│ Cliente #2 - Pedro                                  │
│   1x Pizza Margherita           15.000 Kz         │
│   1x Suco Natural                4.000 Kz         │
│   Subtotal:                     19.000 Kz         │
│                                                     │
├─────────────────────────────────────────────────────┤
│ 🧾 CÁLCULOS:                                        │
│   Subtotal                      32.000 Kz         │
│   + Taxa de Serviço (10%)        3.200 Kz         │
│   - Desconto Manual (10%)       -3.200 Kz         │
│   ────────────────────────────────────            │
│   TOTAL                         32.000 Kz         │
│                                                     │
│ 📝 Observações: Cliente satisfeito                  │
└─────────────────────────────────────────────────────┘
```

---

### **Melhoria 3: Timeline de Eventos (Auditoria)** ⭐⭐

#### **Implementação:**
Usar a rota `/api/tables/sessions/:sessionId/audit-logs`.

```typescript
const { data: auditLogs = [] } = useQuery({
  queryKey: [`/api/tables/sessions/${sessionId}/audit-logs`],
  enabled: showTimeline && !!sessionId,
});
```

#### **Visualização Proposta:**
```
┌─────────────────────────────────────────────────────┐
│ ⏱️ TIMELINE DE EVENTOS                              │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 14:30 ✅ Pagamento processado                       │
│       💰 45.000 Kz | Dinheiro | João Silva         │
│                                                     │
│ 14:25 🎁 Desconto aplicado                          │
│       -5.000 Kz (Cupom PROMO20) | Maria            │
│                                                     │
│ 14:15 ↔️ Item movido                                │
│       1x Coca-Cola | Cliente #1 → Cliente #2       │
│       Motivo: Cliente pediu troca                   │
│                                                     │
│ 13:45 ❌ Item cancelado                             │
│       1x Pizza Portuguesa | Pedro Silva            │
│       Motivo: Cliente desistiu                      │
│                                                     │
│ 13:30 ➕ Pedido adicionado                          │
│       2x Hambúrguer | Cliente #1 | Maria           │
│                                                     │
│ 12:00 🚪 Sessão iniciada                            │
│       4 pessoas | João Silva                        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### **Melhoria 4: Filtros e Busca** ⭐

#### **Implementação:**
Adicionar filtros para facilitar busca no histórico.

```typescript
const [filters, setFilters] = useState({
  dateRange: 'all', // today, week, month, all
  paymentMethod: 'all', // cash, card, all
  minAmount: null,
  maxAmount: null,
});
```

#### **Visualização Proposta:**
```
┌─────────────────────────────────────────────────────┐
│ 🔍 FILTROS                                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 📅 Período:                                         │
│   ( ) Hoje  ( ) Semana  (•) Mês  ( ) Tudo         │
│                                                     │
│ 💳 Método:                                          │
│   [Todos ▼]                                        │
│                                                     │
│ 💰 Valor:                                           │
│   Min: [_______] Max: [_______]                    │
│                                                     │
│ [Aplicar Filtros]  [Limpar]                        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### **Melhoria 5: Estatísticas da Mesa** ⭐⭐

#### **Implementação:**
Calcular e mostrar estatísticas gerais da mesa.

```typescript
const stats = useMemo(() => {
  return {
    totalSessions: sessions.length,
    totalRevenue: sessions.reduce((sum, s) => sum + parseFloat(s.totalAmount || '0'), 0),
    avgSessionDuration: calculateAvgDuration(sessions),
    avgPeopleCount: calculateAvgPeople(sessions),
    mostUsedPaymentMethod: getMostUsed(payments),
  };
}, [sessions, payments]);
```

#### **Visualização Proposta:**
```
┌─────────────────────────────────────────────────────┐
│ 📊 ESTATÍSTICAS DA MESA                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 📈 Total de Sessões: 45                             │
│ 💰 Receita Total: 2.850.000 Kz                     │
│ 📊 Ticket Médio: 63.333 Kz                         │
│ ⏱️ Duração Média: 2h 15min                         │
│ 👥 Média de Pessoas: 3.2                            │
│ 💳 Método Mais Usado: Dinheiro (60%)                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### **Melhoria 6: Exportar Histórico** ⭐

#### **Implementação:**
Permitir exportar histórico em PDF ou CSV.

```typescript
const handleExportPDF = () => {
  // Gerar PDF com histórico completo
};

const handleExportCSV = () => {
  // Gerar CSV com dados tabulares
};
```

#### **Visualização Proposta:**
```
┌─────────────────────────────────────────────────────┐
│ 📥 EXPORTAR HISTÓRICO                               │
├─────────────────────────────────────────────────────┤
│                                                     │
│ [📄 Exportar PDF]  [📊 Exportar CSV]               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 Proposta de Layout Completo

### **Estrutura em Abas:**

```
┌─────────────────────────────────────────────────────┐
│ HISTÓRICO DA MESA                                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ [📊 Estatísticas] [📅 Sessões] [💳 Pagamentos] [⏱️ Timeline] │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│ (Conteúdo da aba selecionada)                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### **Aba 1: Estatísticas**
- Cards com KPIs principais
- Gráficos simples (se possível)
- Resumo visual

### **Aba 2: Sessões**
- Lista de todas as sessões
- Detalhes expandíveis
- Ordenação por data

### **Aba 3: Pagamentos**
- Lista de pagamentos (atual)
- Detalhes expandidos com itens
- Filtros disponíveis

### **Aba 4: Timeline**
- Cronologia de eventos
- Auditoria completa
- Ações dos usuários

---

## 📋 Priorização das Melhorias

### **Alta Prioridade (Implementar Primeiro):**
1. ⭐⭐⭐ **Histórico de Sessões** - Crítico para entender uso da mesa
2. ⭐⭐⭐ **Detalhes Expandidos de Pagamentos** - Mostrar itens consumidos
3. ⭐⭐ **Estatísticas da Mesa** - KPIs valiosos para gestão

### **Média Prioridade:**
4. ⭐⭐ **Timeline de Eventos** - Auditoria detalhada
5. ⭐ **Filtros e Busca** - Facilitar navegação em muito histórico

### **Baixa Prioridade (Nice to Have):**
6. ⭐ **Exportar Histórico** - Funcionalidade adicional

---

## 🔧 Implementação Sugerida

### **Fase 1: Sessões e Detalhes (2-3h)**
- Buscar sessões da mesa
- Listar sessões anteriores
- Expandir detalhes de cada sessão
- Mostrar itens consumidos

### **Fase 2: Estatísticas (1-2h)**
- Calcular KPIs
- Criar cards visuais
- Adicionar gráficos simples

### **Fase 3: Timeline (2h)**
- Integrar audit logs
- Criar visualização de timeline
- Adicionar ícones e formatação

### **Fase 4: Filtros e Exportação (2h)**
- Implementar filtros
- Adicionar busca
- Criar exportação PDF/CSV

---

## 💻 Exemplo de Código

### **Buscar Sessões:**
```typescript
const { data: sessions = [], isLoading: loadingSessions } = useQuery({
  queryKey: [`/api/tables/${table.id}/sessions`],
  enabled: !!table.id,
});

const completedSessions = sessions
  .filter(s => s.status === 'completed')
  .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
```

### **Buscar Detalhes da Sessão:**
```typescript
const [expandedSession, setExpandedSession] = useState<string | null>(null);

const { data: sessionDetails } = useQuery({
  queryKey: [`/api/tables/${table.id}/orders-by-guest`, expandedSession],
  enabled: !!expandedSession,
});
```

### **Calcular Estatísticas:**
```typescript
const stats = useMemo(() => {
  const totalRevenue = sessions.reduce(
    (sum, s) => sum + parseFloat(s.totalAmount || '0'), 
    0
  );
  
  const avgDuration = sessions.reduce((sum, s) => {
    const duration = new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime();
    return sum + duration;
  }, 0) / sessions.length;
  
  return {
    totalSessions: sessions.length,
    totalRevenue,
    avgDuration: Math.round(avgDuration / 1000 / 60), // em minutos
    avgPeopleCount: sessions.reduce((sum, s) => sum + s.peopleCount, 0) / sessions.length,
  };
}, [sessions]);
```

---

## 🎯 Resultado Esperado

Após implementação das melhorias, o usuário terá:

### **Visão Completa:**
✅ Histórico completo de todas as sessões  
✅ Detalhes de cada pagamento com itens  
✅ Estatísticas e KPIs da mesa  
✅ Timeline de eventos e auditoria  
✅ Filtros para busca rápida  
✅ Exportação de dados  

### **Benefícios:**
✅ **Gestão** - Entender uso e performance de cada mesa  
✅ **Auditoria** - Rastrear todas as ações  
✅ **Análise** - Tomar decisões baseadas em dados  
✅ **Transparência** - Ver tudo que aconteceu  

---

## 📝 Conclusão

O histórico atual é **muito limitado** (apenas pagamentos básicos). Com as melhorias propostas, será transformado em uma **ferramenta poderosa** de gestão e análise, aproveitando todas as APIs disponíveis no backend.

**Próximo passo:** Implementar Fase 1 (Sessões e Detalhes) como prioridade máxima.
