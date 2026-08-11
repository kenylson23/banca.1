# Análise Completa: Workflow das Mesas

## 1. Estrutura de Dados (Schema)

### Entidade `tables` — A Mesa Física
```
id, restaurantId, branchId
number            (número visível, ex: "10")
capacity          (capacidade de pessoas)
area              (ex: "Salão", "Terraço", "VIP")
qrCode            (data URL do QR code gerado)
status            ENUM: livre | ocupada | em_andamento | aguardando_pagamento | encerrada
tableStatus       ENUM (granular, separado): disponivel | aguardando_pedido | em_consumo | aguardando_pgto | pagamento_parcial | reservada
currentSessionId  (ID da sessão ativa — chave de integração)
totalAmount       (total corrente da sessão)
customerName, customerCount, lastActivity
positionX, positionY  (para vista de mapa)
isOccupied        (flag legacy, mantido por compatibilidade)
```

### Entidade `tableSessions` — A Sessão da Mesa
Cada abertura de mesa cria uma sessão. Guarda todo o histórico financeiro.
```
id, tableId, restaurantId, shiftId, operatorId
customerName, customerCount
totalAmount       (calculado dinamicamente com ajustes)
paidAmount        (soma dos pagamentos recebidos)
discount, discountType      (ajuste global da sessão)
serviceCharge, serviceChargeType  (taxa global)
sessionTotals, closingSnapshot   (JSON com snapshot no fecho)
status            ENUM: ocupada | encerrada ...
startedAt, endedAt, closedById
```

### Entidade `tableGuests` — As Pessoas na Mesa
Cada pessoa (convidado) em cada sessão.
```
id, sessionId, tableId, restaurantId
customerId       (null = anónimo; ligado = cliente registado)
name             (nome do convidado)
guestNumber      (número sequencial anónimo: 1, 2, 3...)
seatNumber       (lugar)
status           ENUM: ativo | aguardando_conta | pago | saiu
subtotal         (soma dos itens atribuídos a este convidado)
paidAmount       (já pago por este convidado)
discount, discountType     (ajuste individual por convidado)
serviceCharge, serviceChargeType
token            (token único para acesso QR do cliente)
```

### Entidade `orders` — Os Pedidos
Um pedido pode estar associado a: mesa + sessão + convidado.
```
id, restaurantId, tableId, tableSessionId, guestId
orderType        ENUM: mesa | delivery | takeout | balcao | pdv
status           ENUM: pendente | em_preparo | pronto | servido | cancelado
paymentStatus    ENUM: nao_pago | parcial | pago
subtotal, discount, serviceCharge, totalAmount
paidAmount, changeAmount, refundAmount
```

### Entidade `orderItems` — Os Itens do Pedido
```
id, orderId, menuItemId, guestId, quantity, price, notes
```
> **Nota:** `guestId` no orderItem permite atribuição granular de cada item a uma pessoa específica.

### Entidade `tablePayments` — Pagamentos da Mesa
Registo de cada transação de pagamento.
```
id, tableId, sessionId, restaurantId, operatorId
amount, paymentMethod, paymentSource
notes, createdAt
```

### Entidade `guestPayments` — Pagamentos por Convidado
Liga cada pagamento a um convidado específico (para divisão de conta).
```
id, guestId, sessionId, tablePaymentId, splitId
amount, paymentMethod
```

### Entidade `tableBillSplits` — Divisão de Conta
```
id, sessionId, tableId, splitType (igual | por_pessoa | personalizado)
totalAmount, splitCount, allocations (JSON), isFinalized
```

---

## 2. Estados da Mesa e Transições

```
livre
  │  POST /api/tables/:id/start-session
  ▼
ocupada           ← status inicial ao abrir sessão
  │  (primeiros pedidos chegam)
  ▼
em_andamento      ← pedidos em curso
  │  (solicitação de conta ou início de pagamento)
  ▼
aguardando_pagamento
  │  POST /api/tables/:id/payment OR /api/table-guests/:id/payment
  │  (pago totalmente → botão "Fechar Mesa" ativo)
  ▼
[Fechar mesa manualmente] POST /api/tables/:id/close-session
  │
  ▼
livre             ← mesa livre de novo
```

**Regras de negócio nas transições:**
- `waiters` NÃO podem fechar mesas nem registar pagamentos
- `close-session` valida se há `pendingAmount > 0` antes de fechar
- Se `canForceClose` → admin/manager pode forçar fecho com pendências (registo em audit log)
- O fechamento NÃO é automático após pagamento completo — é sempre manual

---

## 3. Workflow Completo (Passo a Passo)

### Fase 1 — Criação da Mesa (uma vez, permanente)
1. Admin acede a `/tables`
2. Clica "Nova Mesa" → dialog com: número, capacidade, área
3. `POST /api/tables` → backend gera QR code (URL: `https://<domain>/mesa/<number>?r=<restaurantId>`)
4. Mesa fica com `status = 'livre'`
5. WebSocket broadcast: `table_created`

### Fase 2 — Abertura da Mesa (por sessão)
1. Staff clica na `TableCard` → abre `TableDialogPOSModern`
2. Mesa está livre → mostra botão "Iniciar Sessão"
3. `StartSessionDialog` pede número de pessoas (opcional)
4. `POST /api/tables/:id/start-session` → cria `tableSession` + cria guests anónimos (1 por pessoa declarada) + atualiza `table.currentSessionId` + muda status para `ocupada`
5. WebSocket broadcast: `table_session_started`

### Fase 3 — Gestão de Convidados
- **Adicionar pessoa:** `POST /api/tables/:id/guests` → cria `tableGuest` na sessão atual
- **Remover pessoa:** `DELETE /api/table-guests/:guestId`
- **Converter anónimo em cliente:** `ConvertGuestDialog` vincula `customerId` ao guest
- Convidados podem escanear QR code e fazer pedidos pelo menu público

### Fase 4 — Criação de Pedidos
Existem dois caminhos:

**4a. Staff cria pedido (interno):**
- `QuickOrderDialog` → seleciona itens do menu → atribui a um convidado (opcional)
- `POST /api/orders` com `{tableId, tableSessionId, guestId, orderType: 'mesa', items: [...]}`
- Backend calcula subtotal, atualiza `guest.subtotal`, `table.totalAmount`

**4b. Cliente cria pedido (via QR Code/menu público):**
- Cliente escaneia QR → acede a `/mesa/<number>?r=<restaurantId>`
- Pode escanear como convidado anónimo ou autenticar via OTP (telefone)
- `POST /api/public/orders` com schema restrito (sem desconto, sem taxas)
- WebSocket emite `new_order`

### Fase 5 — Movimentação de Itens
- Staff pode mover items entre convidados: `PATCH /api/order-items/:itemId/move {guestId: targetGuestId}`
- Atualiza `orderItem.guestId`, recalcula `guest.subtotal` de ambos
- Auditado em `orderItemAuditLogs`

### Fase 6 — Pagamento

#### 6a. Pagamento Global da Mesa
- Tab "Pagamento" → `PaymentSection`
- Operador define: valor, método (dinheiro/multicaixa/transferencia/cartao), desconto, taxa de serviço
- `POST /api/tables/:id/payment {amount, paymentMethod, discount, discountType, serviceCharge}`
- Backend:
  1. Guarda desconto/taxa na `tableSession`
  2. Cria `tablePayment`
  3. Recalcula `session.totalAmount` com ajustes
  4. Atualiza `session.paidAmount = min(totalPago, totalAjustado)`
  5. Verifica se pode fechar (broadcast `table_payment_complete` se pago)

#### 6b. Pagamento Individual por Convidado
- Staff seleciona convidado → `POST /api/table-guests/:guestId/payment`
- Permite desconto/taxa individual (salvo em `tableGuest.discount`, `tableGuest.serviceCharge`)
- Backend:
  1. Cria `tablePayment` + `guestPayment`
  2. Atualiza `tableSession.paidAmount` a partir da soma de `guestPayments`
  3. Recalcula `session.totalAmount` considerando ajustes individuais por convidado
  4. Chama `autoUpdateTableStatusOnPayment`

#### 6c. Divisão de Conta (BillSplit)
- `POST /api/tables/:id/bill-splits {splitType, totalAmount, splitCount, allocations}`
- Tipos: `igual` (divide igualmente), `por_pessoa` (por subtotal de cada um), `personalizado`
- Cada alocação pode ser marcada como `isPaid`

### Fase 7 — Fecho da Mesa
1. Staff clica "Fechar Mesa" → `EndSessionDialog`
2. `POST /api/tables/:id/close-session {forceClose?}`
3. Backend valida (`validateSessionClosure`):
   - Há pedidos pendentes de pagamento? → `canClose = false`
   - `forceClose=true` + role admin/manager → permite forçar (com registo em auditLogs)
4. Se autorizado:
   - Atribui pontos de fidelidade aos clientes vinculados
   - `endTableSession` → `table.status = 'livre'`, `table.currentSessionId = null`, `session.endedAt = now()`
5. WebSocket broadcast: `table_session_ended`

---

## 4. APIs Disponíveis (Sumário)

| Método | Rota | Acesso | Função |
|--------|------|--------|--------|
| GET | `/api/tables` | admin | Listar mesas do restaurante |
| GET | `/api/tables/with-orders` | admin | Mesas com dados de pedidos/guests |
| GET | `/api/tables/open` | operational | Só mesas com sessão ativa |
| POST | `/api/tables` | admin | Criar mesa (gera QR code) |
| DELETE | `/api/tables/:id` | admin | Eliminar mesa |
| PATCH | `/api/tables/:id/status` | admin | Alterar status manualmente |
| PATCH | `/api/tables/:id/position` | admin | Mover posição no mapa |
| POST | `/api/tables/:id/start-session` | admin | Abrir sessão |
| POST | `/api/tables/:id/close-session` | operational | Fechar sessão |
| GET | `/api/tables/:id/orders-by-guest` | cashier+ | Pedidos agrupados por convidado |
| GET | `/api/tables/:id/guests` | cashier+ | Listar convidados |
| POST | `/api/tables/:id/guests` | cashier+ | Adicionar convidado |
| PATCH | `/api/tables/:id/guests/:guestId` | cashier+ | Atualizar convidado |
| DELETE | `/api/tables/:id/guests/:guestId` | cashier+ | Remover convidado |
| POST | `/api/tables/:id/payment` | operational | Pagamento global da mesa |
| POST | `/api/table-guests/:guestId/payment` | operational | Pagamento individual |
| POST | `/api/tables/:id/bill-splits` | cashier+ | Criar divisão de conta |
| GET | `/api/tables/:id/sessions` | cashier+ | Histórico de sessões |
| GET | `/api/tables/:id/payments` | cashier+ | Histórico de pagamentos |
| POST | `/api/tables/:id/guests/:guestId/checkout` | cashier+ | Checkout individual |
| POST | `/api/tables/:id/refund` | cashier+ | Reembolso |
| GET | `/api/table-sessions/:sessionId/guests` | cashier+ | Guests de uma sessão |
| GET | `/api/tables/:id/suggest-split` | cashier+ | Sugestão de divisão |
| POST | `/api/sessions/:sessionId/recalculate` | cashier+ | Recalcular totais |

**Rotas Públicas (QR Code/clientes):**
| GET | `/api/public/tables/:number` | público | Info da mesa para cliente |
| POST | `/api/public/tables/:number/join` | público | Convidado entra na sessão |
| POST | `/api/public/tables/:number/request-bill` | público | Pedir conta |
| GET | `/api/public/guest/:token` | público | Info do convidado pelo token |

---

## 5. Componentes Frontend

```
pages/tables.tsx
  └── TablesPanel.tsx                     ← grid/lista/mapa, KPIs, criar/eliminar mesa
       ├── TableCard.tsx                  ← card visual de cada mesa
       └── TableDialogWrapper.tsx         ← auto-detecta; usa TableDialogPOSModern
            └── TableDialogPOSModern.tsx  ← diálogo fullscreen principal (1524 linhas)
                 ├── hooks/
                 │    ├── useTableData.ts         ← polling 3s para dados da mesa
                 │    └── useTableMutations.ts    ← mutations: start/end session, guests, items
                 ├── sections/
                 │    ├── OverviewSection.tsx     ← resumo da mesa
                 │    ├── GuestsSection.tsx       ← lista de convidados
                 │    ├── OrdersSection.tsx       ← pedidos agrupados
                 │    ├── PaymentSection.tsx      ← pagamento global/individual
                 │    └── HistorySection.tsx      ← histórico de sessões
                 ├── panels/
                 │    ├── PaymentPanel.tsx        ← seleção de convidados + método de pagamento
                 │    └── GuestDetailPanel.tsx    ← detalhe de cada convidado
                 └── dialogs/
                      ├── StartSessionDialog.tsx
                      ├── AddPersonDialog.tsx
                      ├── EndSessionDialog.tsx
                      ├── QRCodeDialog.tsx
                      ├── CancelOrderDialog.tsx
                      ├── EditOrderDialog.tsx
                      └── MoveItemDialog.tsx
```

---

## 6. Lógica de Cálculo de Totais

O sistema tem **dois níveis de total**:

**Nível sessão (tableSessions.totalAmount):**
```
totalAmount = ordersSubtotal
            - sessionDiscount (valor ou %)
            + sessionServiceCharge (valor ou %)
```

**Nível convidado (tableGuests.subtotal → ajustado):**
```
guestTotal = guest.subtotal
           - guest.discount
           + guest.serviceCharge
```

Quando há ajustes individuais (por convidado), o `session.totalAmount` é recalculado como a soma dos `guestTotal` ajustados, ignorando os ajustes globais da sessão.

**Frontend (`useTableData`):** usa `Math.max(backendTotal, sumOfSubtotals)` como salvaguarda para coerência matemática.

---

## 7. Sincronização em Tempo Real

- **WebSocket** em `server/websocket.ts` emite broadcasts para todos os clientes
- `TablesPanel` escuta e invalida queries via `queryClient.invalidateQueries`
- `useTableData` faz polling automático a cada **3 segundos** enquanto o diálogo está aberto
- Eventos WebSocket relevantes:
  - `table_created`, `table_deleted`
  - `table_session_started`, `table_session_ended`
  - `table_payment_recorded`, `table_payment_complete`
  - `new_order`, `order_status_updated`
  - `guest_status_updated`, `guest_payment_added`

---

## 8. Permissões por Role

| Ação | waiter | cashier | manager | admin | superadmin |
|------|--------|---------|---------|-------|------------|
| Ver mesas | ✅ | ✅ | ✅ | ✅ | ✅ |
| Criar mesa | ❌ | ❌ | ❌ | ✅ | ✅ |
| Abrir sessão | ❌ | ❌ | ✅ | ✅ | ✅ |
| Criar pedido | ✅ | ✅ | ✅ | ✅ | ✅ |
| Registar pagamento | ❌ | ✅ | ✅ | ✅ | ✅ |
| Fechar mesa | ❌ | ✅ | ✅ | ✅ | ✅ |
| Forçar fecho c/ pendências | ❌ | ❌ | ✅ | ✅ | ✅ |
| Aplicar desconto | ❌ | ✅ | ✅ | ✅ | ✅ |

---

## 9. Pontos de Atenção / Riscos

1. **Dois sistemas de status paralelos:** `table.status` (5 estados) e `table.tableStatus` (6 estados granulares) coexistem. O frontend usa apenas `table.status`. O campo `tableStatus` existe mas não é claramente utilizado no UI atual.

2. **isOccupied:** campo legado mantido por "compatibilidade" — pode criar inconsistências.

3. **Cálculo de totais duplicado:** A lógica de `totalAmountAjustado` está repetida em duas rotas distintas (`/api/tables/:id/payment` e `/api/table-guests/:guestId/payment`) com código quase idêntico. Candidato a refactorização.

4. **`session.paidAmount` fonte de verdade dupla:** Na rota de pagamento de mesa (`/api/tables/:id/payment`) usa-se `tablePayments` como fonte. Na rota de pagamento por convidado (`/api/table-guests/:id/payment`) usa-se `guestPayments`. Podem divergir numa sessão mista.

5. **Polling 3s + WebSocket:** o sistema tem redundância (polling AND WebSocket). Causa requests desnecessários quando o diálogo está aberto.

6. **`start-session` requer role `isAdmin`** mas `close-session` requer `isOperational` — assimetria: cashier pode fechar mas não abrir.

7. **`TableDialogPOSModern` tem 1524 linhas** — muito grande, difícil de manter.

8. **Fecho automático desativado intencionalmente** (comentário no código) — pagamento completo NÃO fecha a mesa; requer ação manual explícita.
