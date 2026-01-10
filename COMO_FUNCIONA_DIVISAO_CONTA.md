# 📊 Como Funciona a Divisão de Conta

## 🎯 Visão Geral

O sistema de divisão de conta permite dividir a conta de uma mesa entre múltiplos clientes de forma flexível e intuitiva. Existem três formas principais de trabalhar com divisão de conta:

---

## 🔹 **1. Divisão Automática por Consumo Individual**

### Como Funciona:
- Cada cliente tem seu próprio "perfil" na mesa
- Os pedidos são atribuídos automaticamente ao cliente que os fez
- O sistema calcula automaticamente quanto cada cliente deve pagar baseado no que consumiu

### Fluxo:
1. **Adicionar Clientes à Mesa:**
   - Abra o diálogo da mesa (Modern POS)
   - Clique em "Adicionar Cliente" ou "Adicionar Convidado"
   - Cada cliente recebe um número/nome único

2. **Fazer Pedidos:**
   - Ao adicionar itens ao pedido, selecione para qual cliente é o item
   - O sistema rastreia automaticamente quem pediu o quê

3. **Visualizar Consumo:**
   - Na aba "Divisão" do diálogo da mesa
   - Veja uma lista de todos os clientes com seus consumos individuais
   - Cada cliente mostra:
     - Nome/Número do cliente
     - Status (Ativo, Pediu Conta, Pago, Saiu)
     - Total consumido
     - Lista de itens pedidos
     - Valor já pago (se houver)

4. **Pagar Individualmente:**
   - Clique no botão "💳 Pagar" ao lado do cliente
   - Selecione o método de pagamento
   - O sistema registra o pagamento e atualiza o status do cliente para "Pago"

### Vantagens:
✅ Controle preciso de quem pediu o quê  
✅ Cada cliente paga apenas o seu consumo  
✅ Ideal para grupos grandes  
✅ Reduz erros e confusões na hora do pagamento  

---

## 🔹 **2. Divisão Igual**

### Como Funciona:
- Divide o valor total da conta em partes iguais
- Cada parte tem o mesmo valor
- Não considera o que cada pessoa consumiu

### Fluxo:
1. **Criar Divisão:**
   - Na aba "Divisão" do diálogo da mesa
   - Selecione "Divisão Igual"
   - Defina em quantas partes dividir (ex: 4 pessoas)
   - Clique em "Criar Divisão"

2. **O Sistema Calcula:**
   - Total da mesa ÷ Número de partes = Valor por pessoa
   - Exemplo: 10.000 Kz ÷ 4 = 2.500 Kz por pessoa

3. **Finalizar Pagamentos:**
   - Cada divisão criada aparece na lista
   - Clique em "Finalizar" em cada parte
   - Selecione o método de pagamento
   - O sistema registra o pagamento

### Vantagens:
✅ Rápido e simples  
✅ Ideal quando todos dividem igualmente  
✅ Não precisa rastrear itens individuais  

---

## 🔹 **3. Movimentação de Itens (Drag & Drop)**

### Como Funciona:
- Permite mover itens entre clientes
- **NOVO:** Permite atribuir pedidos da mesa total a clientes específicos
- Útil quando alguém pediu para outro ou quando há mudança de planos
- Rastreia todas as movimentações com histórico de auditoria

### Fluxo:
1. **Visualizar Itens por Cliente:**
   - Na aba "Divisão" do diálogo da mesa
   - Clique em um cliente para expandir e ver seus itens

2. **Atribuir Pedidos Não Atribuídos (NOVO):**
   - Se há pedidos feitos para a "mesa total" (sem cliente específico)
   - Você verá uma seção amarela: "Pedidos da Mesa (Não Atribuídos)"
   - **Como atribuir:**
     - Clique e segure o item do pedido não atribuído
     - Arraste até o cliente que consumiu o item
     - Solte o item na área do cliente
     - Digite o motivo (ex: "Atribuição inicial", "Cliente solicitou")
     - Confirme
   - O item agora pertence ao cliente e será incluído na sua conta

3. **Mover Item Entre Clientes:**
   - **Método 1 - Drag & Drop:**
     - Clique e segure o item que deseja mover
     - Arraste até o cliente de destino
     - Solte o item
     - Digite o motivo da movimentação
     - Confirme
   
   - **Método 2 - Botão de Mover:**
     - Clique no ícone "↔️" ao lado do item
     - Selecione o cliente de destino
     - Digite o motivo
     - Confirme

4. **Regras de Movimentação:**
   - ❌ Não pode mover para cliente que já pagou
   - ❌ Não pode mover para cliente que já saiu
   - ✅ Pode mover entre clientes ativos
   - ✅ Pode mover para cliente aguardando conta
   - ✅ **NOVO:** Pode atribuir pedidos não atribuídos a qualquer cliente ativo

4. **Histórico de Auditoria:**
   - Clique em "📋 Ver Histórico" no topo
   - Veja todas as movimentações:
     - Quem moveu o item
     - De qual cliente para qual cliente
     - Motivo da movimentação
     - Data e hora
     - Valor do item

### Vantagens:
✅ Flexibilidade total  
✅ Corrige erros facilmente  
✅ Rastreamento completo  
✅ Transparência nas mudanças  

---

## 🆕 **Pedidos Não Atribuídos (Mesa Total)**

### O que são?
Pedidos não atribuídos são pedidos feitos para a "mesa total", sem especificar qual cliente consumiu. Isso acontece quando:
- O garçom faz um pedido rápido sem selecionar o cliente
- Sistema legado onde não havia atribuição por cliente
- Pedidos feitos antes de adicionar clientes à mesa

### Como Identificar:
- Aparece uma seção amarela: **"Pedidos da Mesa (Não Atribuídos)"**
- Mostra aviso: "Estes pedidos foram feitos para a mesa total"
- Lista todos os pedidos sem `guestId`

### Como Resolver:
1. **Atribuir Itens Individualmente:**
   - Arraste cada item para o cliente correto
   - Ideal quando cada item foi consumido por pessoas diferentes

2. **Dividir Igualmente:**
   - Use a opção "Divisão Igual" para dividir automaticamente
   - Ideal quando todos compartilharam igualmente

### Exemplo Visual:

```
┌─────────────────────────────────────────────────────────┐
│ 🛍️ Pedidos da Mesa (Não Atribuídos)                    │
│ ⚠️ Arraste os itens para atribuí-los a um cliente      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ 📋 Pedido #1234                                         │
│ ├─ 🍔 2x Hambúrguer       70,00 Kz  [pode arrastar]    │
│ ├─ 🍟 1x Batata Frita     15,00 Kz  [pode arrastar]    │
│ └─ 🥤 2x Refrigerante     10,00 Kz  [pode arrastar]    │
│                                                          │
│ 📋 Pedido #1235                                         │
│ └─ 🍕 1x Pizza            50,00 Kz  [pode arrastar]     │
│                                                          │
└─────────────────────────────────────────────────────────┘

        ↓ ARRASTAR ↓

┌─────────────────────────────────────────────────────────┐
│ 👤 João Silva          🔵 Ativo                         │
│ Consumo: 95,00 Kz                                       │
│                                                          │
│ ├─ 🍔 2x Hambúrguer     70,00 Kz                       │
│ └─ 🍟 1x Batata Frita   15,00 Kz                       │
└─────────────────────────────────────────────────────────┘
```

### Boas Práticas:
✅ Sempre atribua pedidos a clientes específicos desde o início  
✅ Se esquecer, atribua o mais rápido possível  
✅ Use motivos claros ao atribuir (ex: "Cliente confirmou consumo")  
✅ Verifique com os clientes antes de atribuir itens  

### Evite:
❌ Deixar muitos pedidos não atribuídos  
❌ Atribuir itens incorretamente  
❌ Fechar mesa com pedidos não atribuídos  

---

## 📋 **Estados dos Clientes**

### 🔵 **Ativo**
- Cliente está na mesa consumindo
- Pode receber novos pedidos
- Pode receber itens movidos de outros clientes

### 🟠 **Aguardando Conta / Pediu Conta**
- Cliente solicitou a conta
- Ainda não pagou
- Pode receber itens movidos

### 🟢 **Pago**
- Cliente já pagou sua parte
- Não pode receber novos itens
- Valor pago registrado no sistema

### ⚫ **Saiu**
- Cliente deixou a mesa
- Não pode receber novos itens
- Conta encerrada

---

## 💰 **Cálculos e Totais**

### Valores Calculados:
- **Total da Mesa:** Soma de todos os itens pedidos
- **Consumo por Cliente:** Soma dos itens atribuídos a cada cliente
- **Já Pago:** Total de pagamentos registrados
- **Falta Pagar:** Total da Mesa - Já Pago

### Exemplo Prático:

**Mesa 5 - Total: 15.000 Kz**

| Cliente | Itens | Subtotal | Status | Pago |
|---------|-------|----------|--------|------|
| João | Hambúrguer, Cerveja | 3.500 Kz | Pago | 3.500 Kz |
| Maria | Pizza, Refrigerante | 4.000 Kz | Aguardando | - |
| Pedro | Salada, Suco | 2.500 Kz | Ativo | - |
| Ana | Sobremesa, Café | 5.000 Kz | Ativo | - |

**Totais:**
- Total da Mesa: 15.000 Kz
- Já Pago: 3.500 Kz (João)
- Falta Pagar: 11.500 Kz

---

## 🎨 **Interface Visual**

### Card de Cliente:
```
┌─────────────────────────────────────────────┐
│ 👤 João Silva          🟢 Pago              │
│                        Pago: 3.500 Kz        │
│                        Consumo: 3.500 Kz     │
│                                              │
│ 🛍️ 2 pedido(s)  -  🕐 18:30                │
│                                              │
│ 💳 Pagar  🖨️ Imprimir  📋 Histórico         │
└─────────────────────────────────────────────┘
```

### Card Expandido (com itens):
```
┌─────────────────────────────────────────────┐
│ 👤 Maria Santos        🟠 Pediu Conta       │
│                        Consumo: 4.000 Kz     │
│                                              │
│ Itens:                                       │
│  • Pizza Margherita      3.500 Kz  [↔️]     │
│  • Refrigerante           500 Kz   [↔️]     │
│                                              │
│ 💳 Pagar  🖨️ Imprimir                       │
└─────────────────────────────────────────────┘
```

---

## 🔄 **Fluxo Completo de Uma Mesa**

### Cenário: Mesa com 3 amigos

**1️⃣ Abertura da Mesa:**
```
- Garçom abre Mesa 10
- Adiciona 3 clientes:
  - João (Cliente 1)
  - Maria (Cliente 2)
  - Pedro (Cliente 3)
```

**2️⃣ Pedidos:**
```
- João pede: Hambúrguer + Cerveja = 3.500 Kz
- Maria pede: Pizza + Vinho = 6.000 Kz
- Pedro pede: Salada + Suco = 2.500 Kz
Total da Mesa: 12.000 Kz
```

**3️⃣ Durante o Consumo:**
```
- Maria lembra que a cerveja era dela, não do João
- Garçom move "Cerveja" de João para Maria
- Motivo: "Cliente solicitou correção"
```

**4️⃣ Pagamentos:**
```
- João pede conta: 2.500 Kz (só hambúrguer)
  - Paga com cartão
  - Status: 🟢 Pago
  
- Maria pede conta: 7.000 Kz (pizza + vinho + cerveja)
  - Paga com Multicaixa
  - Status: 🟢 Pago
  
- Pedro pede conta: 2.500 Kz
  - Paga com dinheiro
  - Status: 🟢 Pago
```

**5️⃣ Fechamento:**
```
- Total pago: 12.000 Kz
- Falta pagar: 0 Kz
- Mesa pode ser fechada ✅
```

---

## 🛠️ **Recursos Técnicos**

### APIs Utilizadas:
- `GET /api/tables/{id}/orders-by-guest` - Busca pedidos por cliente
- `POST /api/tables/{id}/bill-splits` - Cria divisão de conta
- `POST /api/tables/{id}/bill-splits/{splitId}/finalize` - Finaliza pagamento
- `PATCH /api/order-items/{id}/reassign` - Move item entre clientes
- `POST /api/tables/{tableId}/guests/{guestId}/checkout` - Checkout individual

### Componentes:
- `BillSplitPanel.tsx` - Interface principal de divisão
- `GuestCheckoutDialog.tsx` - Diálogo de pagamento individual
- `DraggableOrderItem.tsx` - Item arrastável
- `DroppableGuestZone.tsx` - Zona de soltura
- `MoveItemDialog.tsx` - Diálogo de movimentação
- `AuditHistoryDialog.tsx` - Histórico de auditoria

### Tecnologias:
- **@dnd-kit** - Biblioteca de Drag & Drop
- **React Query** - Gerenciamento de estado e cache
- **Zod** - Validação de dados
- **shadcn/ui** - Componentes de UI

---

## 📱 **Impressões**

### Tipos de Impressão:
1. **Comanda Individual:** Imprime itens de um cliente específico
2. **Fatura Completa:** Imprime toda a conta da mesa
3. **Comprovante de Pagamento:** Imprime comprovante após pagamento individual

### Botões de Impressão:
- 🖨️ **Imprimir Comanda** - Ao lado de cada cliente
- 🖨️ **Imprimir Fatura** - No topo da divisão
- 🖨️ **Imprimir Comprovante** - Após finalizar pagamento

---

## ✅ **Boas Práticas**

### Recomendações:
1. **Sempre adicione clientes antes de fazer pedidos**
2. **Atribua itens ao cliente correto desde o início**
3. **Use movimentação apenas quando necessário**
4. **Sempre digite um motivo claro ao mover itens**
5. **Verifique os totais antes de finalizar pagamentos**
6. **Imprima comprovantes para os clientes**

### Evite:
❌ Criar muitas divisões para a mesma mesa  
❌ Mover itens sem motivo documentado  
❌ Fechar mesa com pagamentos pendentes  
❌ Não verificar se todos pagaram antes de fechar  

---

## 🐛 **Problemas Comuns e Soluções**

### Problema: "Não consigo arrastar itens"
**Solução:**
- Verifique se há mais de 1 cliente na mesa
- Certifique-se que o cliente destino não está "Pago" ou "Saiu"
- Tente usar o botão "↔️" como alternativa

### Problema: "Cliente não aparece na lista"
**Solução:**
- Recarregue a página
- Verifique se o cliente foi realmente adicionado
- Confira se não há filtros ativos

### Problema: "Total não bate"
**Solução:**
- Verifique se todos os itens estão atribuídos a um cliente
- Confira se há itens "órfãos" (sem cliente)
- Verifique o histórico de movimentações

### Problema: "Não consigo fechar a mesa"
**Solução:**
- Confirme que todos os clientes pagaram
- Verifique o valor "Falta Pagar" (deve ser 0)
- Confira se não há pedidos pendentes na cozinha

---

## 📊 **Estatísticas e Relatórios**

### Dados Rastreados:
- Total de divisões criadas
- Método de pagamento mais usado por mesa
- Tempo médio de permanência por cliente
- Ticket médio por cliente
- Número de movimentações de itens
- Histórico completo de auditoria

### Relatórios Disponíveis:
- Relatório de vendas por mesa
- Relatório de consumo por cliente
- Histórico de pagamentos
- Auditoria de movimentações

---

## 🎓 **Para Desenvolvedores**

### Arquitetura:
```
BillSplitPanel (Container)
├── OrdersByGuest (Lista de clientes)
│   ├── GuestCard (Card de cada cliente)
│   │   ├── GuestInfo (Informações)
│   │   ├── OrderItems (Lista de itens)
│   │   │   └── DraggableOrderItem (Item arrastável)
│   │   └── GuestActions (Botões de ação)
│   └── DroppableGuestZone (Zona de soltura)
├── SplitOptions (Opções de divisão)
└── BillSplitsList (Divisões criadas)
```

### Estado Principal:
```typescript
{
  splitType: 'igual' | 'por_pessoa' | 'personalizado',
  splitCount: number,
  selectedGuest: string | null,
  paymentMethod: string,
  ordersByGuest: OrdersByGuest[],
  billSplits: BillSplit[],
}
```

### Fluxo de Dados:
```
1. Query busca pedidos por cliente
2. Usuário interage (move item, cria divisão, paga)
3. Mutation envia alteração para API
4. API atualiza banco de dados
5. Cache é invalidado
6. Query re-busca dados atualizados
7. UI atualiza automaticamente
```

---

## 🚀 **Roadmap Futuro**

### ✅ Implementado Recentemente:
- [x] **Atribuição de pedidos não atribuídos** (2026-01-09)
  - Seção visual para pedidos da mesa total
  - Drag & Drop de itens não atribuídos para clientes
  - Histórico de auditoria para atribuições

### Melhorias Planejadas:
- [ ] Divisão personalizada por porcentagem
- [ ] Split de item específico (1 pizza dividida em 2)
- [ ] QR Code para pagamento individual
- [ ] Integração com POS mobile
- [ ] Notificação push quando conta está pronta
- [ ] Histórico de preferências de clientes
- [ ] Sugestões automáticas de divisão
- [ ] Atribuição em lote (selecionar múltiplos itens)

---

## 📞 **Suporte**

Para dúvidas ou problemas:
1. Consulte este guia primeiro
2. Verifique os guias relacionados:
   - `GUIA_DRAG_DROP_DIVISAO_CONTA.md`
   - `ANALISE_DIVISAO_CONTA_MESAS.md`
   - `MELHORIAS_DIVISAO_CONTA_IMPLEMENTADAS.md`
3. Verifique os testes em `TESTE_DRAG_DROP.md`

---

**Última atualização:** 2026-01-09  
**Versão do Sistema:** 1.0  
**Componente Principal:** `BillSplitPanel.tsx`
