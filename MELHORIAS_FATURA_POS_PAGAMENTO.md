# Melhorias na Fatura Após Pagamento - Diálogo de Gestão de Mesa

## 📋 Análise do Fluxo Atual

### Componentes Envolvidos

1. **TableDialogPOSModern** (Diálogo principal de gestão)
   - Seção de Pagamento (`PaymentSection.tsx`)
   - Checkout Rápido integrado
   - Botão "Fechar Mesa" após pagamento

2. **table-checkout-v2.tsx** (Checkout completo wizard)
   - 4 passos: Revisar → Benefícios → Ajustes → Pagamento
   - Mutation `processPaymentMutation`
   - Exibe `PaymentSuccessDialog` após sucesso

3. **PaymentSuccessDialog** (Diálogo de sucesso)
   - Mostra resumo do pagamento
   - Opções de impressão
   - **PROBLEMA**: Dados limitados passados para o diálogo

### Dados Atualmente Passados para PaymentSuccessDialog

```typescript
<PaymentSuccessDialog
  open={showSuccessDialog}
  onClose={() => { ... }}
  table={table}                              // ✅ Mesa
  payment={paymentData}                      // ✅ Dados do pagamento (da API)
  guests={ordersByGuest}                     // ⚠️ PROBLEMA: Array de OrdersByGuest (não TableGuest[])
  totalAmount={calculateTotals.finalTotal}   // ✅ Total final
  onPrintComplete={() => { ... }}            // ✅ Callback
/>
```

### Interface Esperada pelo PaymentSuccessDialog

```typescript
interface PaymentSuccessDialogProps {
  open: boolean;
  onClose: () => void;
  table: Table;
  payment: PaymentData;
  guests: TableGuest[];        // ❌ INCOMPATIBILIDADE DE TIPOS
  totalAmount: number;
  onPrintComplete?: () => void;
}

interface TableGuest {
  id: string;
  sessionId: string;
  name: string | null;
  guestNumber: number;
  status: string;
  totalSpent: string;          // ❌ Campo não existe em OrdersByGuest
  joinedAt: Date;
}
```

---

## 🔍 Problemas Identificados

### 1. **Incompatibilidade de Tipos de Dados**

**Problema**: O componente recebe `ordersByGuest` (estrutura complexa com pedidos) mas espera `TableGuest[]` (estrutura simplificada).

**Estrutura Atual (`ordersByGuest`)**:
```typescript
{
  guest: {
    id: string;
    name: string | null;
    guestNumber: number;
    status: string;
    subtotal: string;      // ✅ Total do convidado
    paidAmount: string;
    // ... mais campos
  },
  orders: Order[];         // ✅ Pedidos completos
  subtotal: string;        // ✅ Subtotal
}
```

**Estrutura Esperada (`TableGuest`)**:
```typescript
{
  id: string;
  name: string | null;
  guestNumber: number;
  status: string;
  totalSpent: string;      // ❌ Nome diferente (deveria ser subtotal)
  joinedAt: Date;
}
```

### 2. **Fatura Não Mostra Detalhes dos Pedidos**

**Problema**: O diálogo de sucesso não exibe:
- ❌ Lista de itens pedidos por cada convidado
- ❌ Quantidade e preço unitário de cada item
- ❌ Opções/personalizações dos itens
- ❌ Descontos aplicados (manual, cupom, pontos)
- ❌ Taxas de serviço aplicadas
- ❌ Breakdown completo dos cálculos

**Atualmente Exibe Apenas**:
- ✅ Total por convidado
- ✅ Método de pagamento
- ✅ Total geral

### 3. **Impressão Simplificada**

**Função `handlePrintComplete` Atual**:
```typescript
const handlePrintComplete = async () => {
  // Cria HTML básico com:
  // - Método de pagamento
  // - Valor pago
  // - Lista de convidados com totais
  // ❌ NÃO inclui itens pedidos
  // ❌ NÃO inclui descontos/taxas
  // ❌ NÃO inclui detalhes dos pedidos
}
```

### 4. **Falta de Informações Fiscais/Comerciais**

**Informações Ausentes na Fatura**:
- ❌ Número da fatura/recibo
- ❌ Data e hora do pagamento
- ❌ Duração da sessão
- ❌ Informações do restaurante (nome, NIF, endereço)
- ❌ Informações do operador/garçom
- ❌ Número da mesa e área
- ❌ QR Code para validação (opcional)

---

## ✅ Melhorias Propostas

### Melhoria 1: Corrigir Incompatibilidade de Tipos

**Solução A - Adaptar os Dados no Checkout** (Recomendado):
```typescript
// Em table-checkout-v2.tsx, transformar ordersByGuest para TableGuest[]
const guestsForDialog: TableGuest[] = ordersByGuest.map((og) => ({
  id: og.guest.id,
  sessionId: og.guest.sessionId,
  name: og.guest.name,
  guestNumber: og.guest.guestNumber,
  status: og.guest.status,
  totalSpent: og.subtotal,  // ✅ Mapear corretamente
  joinedAt: og.guest.joinedAt,
}));

<PaymentSuccessDialog
  ...
  guests={guestsForDialog}
/>
```

**Solução B - Expandir PaymentSuccessDialog** (Mais Completo):
```typescript
// Alterar interface para aceitar estrutura completa
interface PaymentSuccessDialogProps {
  open: boolean;
  onClose: () => void;
  table: Table;
  payment: PaymentData;
  ordersByGuest: OrdersByGuestData['ordersByGuest'];  // ✅ Estrutura completa
  calculateTotals: {
    subtotal: number;
    totalDiscounts: number;
    totalAdditions: number;
    finalTotal: number;
    breakdown: Array<{
      type: 'discount' | 'addition';
      label: string;
      value: number;
    }>;
  };
  onPrintComplete?: () => void;
}
```

### Melhoria 2: Fatura Detalhada com Breakdown Completo

**Adicionar Seção de Detalhamento no Dialog**:

```typescript
// Estrutura proposta para exibição
<Card>
  <CardHeader>
    <CardTitle>Detalhes da Fatura</CardTitle>
  </CardHeader>
  <CardContent>
    {/* 1. Informações da Mesa */}
    <Section title="Informação da Mesa">
      - Mesa {table.number} ({table.area})
      - Duração: {sessionDuration}
      - {guests.length} convidados
    </Section>

    {/* 2. Itens por Convidado */}
    <Section title="Itens Consumidos">
      {ordersByGuest.map(og => (
        <GuestSection key={og.guest.id}>
          <GuestHeader>
            {og.guest.name || `Cliente ${og.guest.guestNumber}`}
          </GuestHeader>
          <ItemsList>
            {og.orders.flatMap(order => order.items).map(item => (
              <Item>
                <span>{item.quantity}x {item.menuItem?.name}</span>
                <span>{formatKwanza(parseFloat(item.price) * item.quantity)}</span>
                {item.options && (
                  <Options>{item.options.map(o => o.value).join(', ')}</Options>
                )}
              </Item>
            ))}
          </ItemsList>
          <Subtotal>{formatKwanza(og.subtotal)}</Subtotal>
        </GuestSection>
      ))}
    </Section>

    {/* 3. Cálculos e Ajustes */}
    <Section title="Cálculos">
      <Row>
        <span>Subtotal</span>
        <span>{formatKwanza(calculateTotals.subtotal)}</span>
      </Row>
      
      {calculateTotals.breakdown.map((item, i) => (
        <Row key={i} className={item.type === 'discount' ? 'text-green-600' : 'text-blue-600'}>
          <span>{item.label}</span>
          <span>{item.type === 'discount' ? '-' : '+'}{formatKwanza(Math.abs(item.value))}</span>
        </Row>
      ))}
      
      <Separator />
      
      <Row className="font-bold text-lg">
        <span>Total Final</span>
        <span>{formatKwanza(calculateTotals.finalTotal)}</span>
      </Row>
    </Section>

    {/* 4. Informações de Pagamento */}
    <Section title="Pagamento">
      <Row>
        <span>Método</span>
        <span>{getPaymentMethodLabel(payment.paymentMethod)}</span>
      </Row>
      <Row>
        <span>Valor Pago</span>
        <span>{formatKwanza(totalAmount)}</span>
      </Row>
      {payment.receivedAmount && (
        <>
          <Row>
            <span>Valor Recebido</span>
            <span>{formatKwanza(payment.receivedAmount)}</span>
          </Row>
          <Row>
            <span>Troco</span>
            <span>{formatKwanza(payment.receivedAmount - totalAmount)}</span>
          </Row>
        </>
      )}
    </Section>
  </CardContent>
</Card>
```

### Melhoria 3: Impressão Profissional Completa

**Template de Impressão Melhorado**:

```typescript
const generatePrintableInvoice = () => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Fatura - Mesa ${table.number}</title>
        <style>
          @media print {
            @page { margin: 0; }
            body { margin: 1cm; }
          }
          body { 
            font-family: 'Arial', sans-serif; 
            max-width: 80mm; 
            margin: 0 auto;
            font-size: 12px;
          }
          .header { 
            text-align: center; 
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          .restaurant-name { 
            font-size: 18px; 
            font-weight: bold; 
            margin-bottom: 5px;
          }
          .restaurant-info { 
            font-size: 10px; 
            color: #666;
          }
          .invoice-info {
            margin: 10px 0;
            font-size: 11px;
          }
          .section-title {
            font-weight: bold;
            margin-top: 15px;
            margin-bottom: 5px;
            border-bottom: 1px solid #ddd;
          }
          .guest-section {
            margin: 10px 0;
            padding: 5px;
            background: #f9f9f9;
          }
          .guest-name {
            font-weight: bold;
            margin-bottom: 5px;
          }
          .item-line {
            display: flex;
            justify-content: space-between;
            padding: 2px 0;
            font-size: 11px;
          }
          .item-options {
            font-size: 9px;
            color: #666;
            margin-left: 10px;
          }
          .subtotal {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            margin-top: 5px;
            padding-top: 5px;
            border-top: 1px dashed #999;
          }
          .calculations {
            margin-top: 15px;
            padding-top: 10px;
            border-top: 2px solid #000;
          }
          .calc-line {
            display: flex;
            justify-content: space-between;
            padding: 2px 0;
          }
          .calc-line.discount {
            color: #28a745;
          }
          .calc-line.addition {
            color: #007bff;
          }
          .total-line {
            display: flex;
            justify-content: space-between;
            font-size: 16px;
            font-weight: bold;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 2px solid #000;
          }
          .payment-info {
            margin-top: 15px;
            padding: 10px;
            background: #f0f0f0;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 10px;
            color: #666;
          }
          .qr-code {
            text-align: center;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <!-- HEADER -->
        <div class="header">
          <div class="restaurant-name">${restaurantName}</div>
          <div class="restaurant-info">
            ${restaurantAddress}<br>
            NIF: ${restaurantNIF}<br>
            Tel: ${restaurantPhone}
          </div>
        </div>

        <!-- INVOICE INFO -->
        <div class="invoice-info">
          <strong>Fatura Nº:</strong> ${payment.id}<br>
          <strong>Data:</strong> ${new Date().toLocaleString('pt-PT')}<br>
          <strong>Mesa:</strong> ${table.number} (${table.area})<br>
          <strong>Convidados:</strong> ${guests.length}<br>
          <strong>Duração:</strong> ${sessionDuration}
        </div>

        <!-- ITEMS BY GUEST -->
        <div class="section-title">ITENS CONSUMIDOS</div>
        ${ordersByGuest.map(og => `
          <div class="guest-section">
            <div class="guest-name">
              ${og.guest.name || `Cliente ${og.guest.guestNumber}`}
            </div>
            ${og.orders.flatMap(order => order.items || []).map(item => `
              <div class="item-line">
                <span>${item.quantity}x ${item.menuItem?.name || item.name}</span>
                <span>${formatKwanza(parseFloat(item.price) * item.quantity)}</span>
              </div>
              ${item.options && item.options.length > 0 ? `
                <div class="item-options">
                  ${item.options.map(o => o.value).join(', ')}
                </div>
              ` : ''}
            `).join('')}
            <div class="subtotal">
              <span>Subtotal:</span>
              <span>${formatKwanza(parseFloat(og.subtotal))}</span>
            </div>
          </div>
        `).join('')}

        <!-- CALCULATIONS -->
        <div class="calculations">
          <div class="calc-line">
            <span>Subtotal</span>
            <span>${formatKwanza(calculateTotals.subtotal)}</span>
          </div>
          
          ${calculateTotals.breakdown.map(item => `
            <div class="calc-line ${item.type}">
              <span>${item.label}</span>
              <span>${item.type === 'discount' ? '-' : '+'}${formatKwanza(Math.abs(item.value))}</span>
            </div>
          `).join('')}
          
          <div class="total-line">
            <span>TOTAL</span>
            <span>${formatKwanza(calculateTotals.finalTotal)}</span>
          </div>
        </div>

        <!-- PAYMENT INFO -->
        <div class="payment-info">
          <div class="calc-line">
            <span>Método de Pagamento:</span>
            <span>${getPaymentMethodLabel(payment.paymentMethod)}</span>
          </div>
          ${payment.receivedAmount ? `
            <div class="calc-line">
              <span>Valor Recebido:</span>
              <span>${formatKwanza(payment.receivedAmount)}</span>
            </div>
            <div class="calc-line">
              <span>Troco:</span>
              <span>${formatKwanza(payment.receivedAmount - totalAmount)}</span>
            </div>
          ` : ''}
        </div>

        <!-- QR CODE (opcional) -->
        <div class="qr-code">
          <img src="${generateQRCode(payment.id)}" width="100" height="100" />
          <div style="font-size: 9px; margin-top: 5px;">
            Código de Validação: ${payment.id.substring(0, 8)}
          </div>
        </div>

        <!-- FOOTER -->
        <div class="footer">
          Obrigado pela sua visita!<br>
          Volte sempre!
        </div>
      </body>
    </html>
  `;
};
```

### Melhoria 4: Componentes de Impressão Especializados

**Usar componentes existentes melhorados**:

```typescript
// PrintInvoice.tsx - Fatura completa da mesa
<PrintInvoice
  table={table}
  session={sessionData}
  ordersByGuest={ordersByGuest}
  payment={payment}
  calculateTotals={calculateTotals}
  restaurantInfo={restaurant}
/>

// PrintGuestBill.tsx - Fatura individual por convidado
{ordersByGuest.map(og => (
  <PrintGuestBill
    key={og.guest.id}
    guest={og.guest}
    orders={og.orders}
    subtotal={og.subtotal}
    restaurantInfo={restaurant}
  />
))}
```

---

## 📊 Resumo das Mudanças Necessárias

### Arquivos a Modificar:

1. **`PaymentSuccessDialog.tsx`**:
   - Alterar interface para aceitar `ordersByGuest` completo
   - Adicionar prop `calculateTotals` para breakdown
   - Adicionar seção de detalhamento de itens
   - Melhorar template de impressão
   - Adicionar informações fiscais/comerciais

2. **`table-checkout-v2.tsx`**:
   - Passar `ordersByGuest` completo (não só guests)
   - Passar `calculateTotals` para o dialog
   - Passar dados do restaurante

3. **`PaymentSection.tsx`** (Checkout Rápido):
   - Implementar mesmo fluxo de sucesso
   - Usar PaymentSuccessDialog após pagamento

### Prioridade de Implementação:

1. **Alta Prioridade** (Crítico para funcionalidade):
   - ✅ Corrigir incompatibilidade de tipos
   - ✅ Adicionar detalhamento de itens na fatura

2. **Média Prioridade** (Melhoria significativa):
   - ✅ Mostrar breakdown de cálculos (descontos/taxas)
   - ✅ Melhorar template de impressão

3. **Baixa Prioridade** (Nice to have):
   - ⭐ Adicionar QR Code de validação
   - ⭐ Informações fiscais completas (NIF, etc.)
   - ⭐ Exportação em PDF

---

## 🎯 Implementação Recomendada

### Passo 1: Corrigir Tipos (Imediato)

```typescript
// table-checkout-v2.tsx - Linha ~2433
<PaymentSuccessDialog
  open={showSuccessDialog}
  onClose={() => {
    setShowSuccessDialog(false);
    setLocation(`/${fromParam}`);
  }}
  table={table}
  payment={paymentData}
  ordersByGuest={ordersByGuest}           // ✅ Passar estrutura completa
  calculateTotals={calculateTotals}       // ✅ Adicionar breakdown
  restaurant={restaurant}                  // ✅ Adicionar info do restaurante
  sessionDuration={sessionDuration}        // ✅ Duração da sessão
  onPrintComplete={() => {
    toast({
      title: "Fatura impressa",
      description: "A fatura foi enviada para impressão",
    });
  }}
/>
```

### Passo 2: Atualizar PaymentSuccessDialog (Próximo)

Criar novo componente expandido com todas as seções detalhadas.

### Passo 3: Testar Fluxo Completo

- [ ] Teste com 1 convidado, 1 item
- [ ] Teste com múltiplos convidados, múltiplos itens
- [ ] Teste com descontos aplicados
- [ ] Teste com taxas de serviço
- [ ] Teste de impressão
- [ ] Teste de impressão por convidado

---

## 💡 Considerações Finais

O diálogo de sucesso atualmente funciona, mas apresenta informações limitadas. As melhorias propostas transformarão uma simples confirmação em uma **fatura profissional completa**, adequada para uso comercial e com todos os detalhes necessários para o cliente e para fins contábeis/fiscais.

A implementação pode ser feita de forma incremental, começando pela correção de tipos e adicionando progressivamente as seções de detalhamento.
