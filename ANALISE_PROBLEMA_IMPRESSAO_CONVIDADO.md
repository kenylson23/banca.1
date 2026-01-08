# 🔍 Análise Profunda: Problema na Impressão de Fatura por Convidado

**Data:** 2026-01-05  
**Componente:** `PaymentSuccessDialog.tsx`  
**Problema:** Impressão individual por convidado não está disponível

---

## 🚨 Problema Identificado

### **Status Atual:**
O componente `PrintGuestBill` está **importado mas NUNCA usado** no `PaymentSuccessDialog`.

```typescript
// Linha 31-32: Importado
import { PrintGuestBill } from './PrintGuestBill';  // ✅ Importado
import { PrintInvoice } from './PrintInvoice';
import { PrintPayment } from './PrintPayment';

// ❌ PROBLEMA: Nunca é usado no código!
// Busca no arquivo: 0 ocorrências de <PrintGuestBill
```

### **O Que Está Faltando:**
- ❌ Opção para imprimir fatura individual de cada convidado
- ❌ Botão ou card para acionar impressão por convidado
- ❌ Seção "Imprimir por Convidado" removida

---

## 📋 Histórico do Problema

### **Versão Anterior (Documentada):**
No documento `RESUMO_MELHORIAS_FATURA_IMPLEMENTADAS.md`, havia uma seção:

```typescript
{/* Print Guest Bills */}
{guests.length > 0 && (
  <Card>
    <CardContent className="p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <Users className="h-6 w-6 text-purple-600" />
          <div>
            <div className="font-bold">Imprimir por Convidado</div>
            <div className="text-sm">Fatura individual para cada convidado</div>
          </div>
        </div>
        
        {/* Guest List */}
        <div className="ml-16 space-y-2">
          {guests.map((guest) => (
            <div key={guest.id}>
              <PrintGuestBill
                guest={guest}
                restaurantId={table.id}
                variant="ghost"
                size="sm"
                showIcon={true}
              />
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
)}
```

### **Versão Atual:**
❌ **Removida completamente** durante a refatoração para adicionar PDF

---

## 🔍 Análise de Incompatibilidades

### **1. Estrutura de Dados Incompatível**

#### **O que PrintGuestBill espera:**
```typescript
interface PrintGuestBillProps {
  guest: TableGuest;           // Estrutura simples
  orders: GuestOrder[];        // Array de pedidos formatados
  totalAmount: number;
  // ... outros props opcionais
}

interface TableGuest {
  id: string;
  name: string | null;
  guestNumber: number;
  totalSpent: string;          // ⚠️ Campo específico
  joinedAt: Date;
}

interface GuestOrder {
  orderId: string;
  items: GuestOrderItem[];     // Array específico
  totalAmount: string;
  createdAt: Date;
}
```

#### **O que PaymentSuccessDialog tem:**
```typescript
ordersByGuest: OrdersByGuestData['ordersByGuest']

// Estrutura real:
{
  guest: {
    id: string;
    name: string | null;
    guestNumber: number;
    subtotal: string;          // ⚠️ Nome diferente (não totalSpent)
    joinedAt: Date;
    // ... mais campos
  },
  orders: Array<{              // ⚠️ Estrutura diferente
    id: string;
    items?: Array<{
      id: string;
      menuItem?: { name: string };
      name: string;
      quantity: number;
      price: string;
      options?: Array<{ value: string }>;
    }>;
  }>;
  subtotal: string;
}
```

### **2. Problemas de Mapeamento**

| Campo PrintGuestBill | Campo Disponível | Status |
|---------------------|------------------|--------|
| `guest.totalSpent` | `og.subtotal` | ❌ Nome diferente |
| `orders: GuestOrder[]` | `og.orders` | ⚠️ Estrutura diferente |
| `orders[].items: GuestOrderItem[]` | `og.orders[].items` | ⚠️ Formato diferente |
| `totalAmount: number` | `parseFloat(og.subtotal)` | ✅ Conversível |

---

## 🛠️ Soluções Propostas

### **Opção 1: Adaptar Dados (Recomendado)**

Criar função helper para transformar `OrdersByGuest` em formato compatível:

```typescript
const transformGuestDataForPrint = (og: OrdersByGuestData['ordersByGuest'][0]) => {
  // Transformar guest
  const guest: TableGuest = {
    id: og.guest.id,
    sessionId: og.guest.sessionId,
    name: og.guest.name,
    guestNumber: og.guest.guestNumber,
    status: og.guest.status,
    totalSpent: og.subtotal,        // ✅ Mapear subtotal para totalSpent
    joinedAt: og.guest.joinedAt,
  };

  // Transformar orders
  const orders: GuestOrder[] = og.orders.map(order => ({
    orderId: order.id,
    orderStatus: order.status,
    totalAmount: order.totalPrice,
    createdAt: order.createdAt,
    items: (order.items || []).map(item => ({
      id: item.id,
      menuItemName: item.menuItem?.name || item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: (parseFloat(item.price) * item.quantity).toString(),
    })),
  }));

  return { guest, orders, totalAmount: parseFloat(og.subtotal) };
};
```

### **Opção 2: Atualizar PrintGuestBill**

Modificar `PrintGuestBill` para aceitar estrutura `OrdersByGuest` diretamente:

```typescript
interface PrintGuestBillProps {
  guestData: OrdersByGuestData['ordersByGuest'][0];  // ✅ Aceitar estrutura completa
  restaurant?: RestaurantInfo;
  table?: Table;
  // ... outros props
}
```

### **Opção 3: Criar Novo Componente (Overkill)**

Criar `PrintGuestBillV2` especificamente para `PaymentSuccessDialog`.

---

## 🎯 Solução Recomendada: Opção 1 + UI

### **Implementação:**

1. **Adicionar função helper de transformação**
2. **Criar nova seção no diálogo**
3. **Integrar PrintGuestBill com dados adaptados**

### **Código Proposto:**

```typescript
// No PaymentSuccessDialog.tsx

// Helper function
const transformGuestDataForPrint = (og: typeof ordersByGuest[0]) => {
  const guest: TableGuest = {
    id: og.guest.id,
    sessionId: og.guest.sessionId,
    name: og.guest.name,
    guestNumber: og.guest.guestNumber,
    status: og.guest.status,
    totalSpent: og.subtotal,
    joinedAt: og.guest.joinedAt,
  };

  const orders: GuestOrder[] = og.orders.map(order => ({
    orderId: order.id,
    orderStatus: order.status,
    totalAmount: order.totalPrice,
    createdAt: order.createdAt,
    items: (order.items || []).map(item => ({
      id: item.id,
      menuItemName: item.menuItem?.name || item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: (parseFloat(item.price) * item.quantity).toString(),
    })),
  }));

  return { guest, orders, totalAmount: parseFloat(og.subtotal) };
};

// Na seção Action Cards, adicionar:
{/* Print Individual Bills */}
{ordersByGuest.length > 1 && (
  <Card className={cn(
    "border-2 border-purple-200 hover:border-purple-400",
    "dark:border-purple-800 dark:hover:border-purple-600"
  )}>
    <CardContent className="p-4">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-base">Imprimir por Convidado</div>
            <div className="text-sm text-muted-foreground">
              Fatura individual para cada cliente
            </div>
          </div>
        </div>
        
        {/* Guest List */}
        <div className="space-y-2 pl-16">
          {ordersByGuest.map((og) => {
            const { guest, orders, totalAmount: guestTotal } = transformGuestDataForPrint(og);
            
            return (
              <div
                key={og.guest.id}
                className="flex items-center justify-between p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-950/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-700">
                    #{og.guest.guestNumber}
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      {og.guest.name || `Cliente ${og.guest.guestNumber}`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatKwanza(parseFloat(og.subtotal))}
                    </div>
                  </div>
                </div>
                
                <PrintGuestBill
                  guest={guest}
                  orders={orders}
                  totalAmount={guestTotal}
                  tableName={`Mesa ${table.number}`}
                  restaurantName={restaurant?.name}
                  restaurantAddress={restaurant?.address}
                  restaurantPhone={restaurant?.phone}
                  restaurantNIF={restaurant?.nif}
                  paymentMethod={payment.paymentMethod}
                  variant="ghost"
                  size="sm"
                />
              </div>
            );
          })}
        </div>
      </div>
    </CardContent>
  </Card>
)}
```

---

## 🎨 Proposta de UI

### **Localização:**
Adicionar card **entre** "Baixar PDF" e botão "Fechar"

### **Quando Exibir:**
- ✅ Quando `ordersByGuest.length > 1` (mais de um convidado)
- ❌ Ocultar se houver apenas 1 convidado (não faz sentido)

### **Visual:**
```
┌─────────────────────────────────────────────┐
│ 👥 Imprimir por Convidado                   │
│ Fatura individual para cada cliente         │
├─────────────────────────────────────────────┤
│  [#1] João Silva          12.500 Kz  [🖨️]  │
│  [#2] Maria Santos        18.000 Kz  [🖨️]  │
│  [#3] Pedro Costa         14.500 Kz  [🖨️]  │
└─────────────────────────────────────────────┘
```

---

## 📊 Vantagens da Solução

### **Usuário (Garçom):**
- ✅ Pode imprimir fatura individual rapidamente
- ✅ Útil quando clientes pagam separadamente
- ✅ Cada cliente leva seu próprio recibo

### **Cliente:**
- ✅ Recebe apenas seu consumo
- ✅ Fatura personalizada com seu nome
- ✅ Não vê consumo de outros

### **Negócio:**
- ✅ Transparência total
- ✅ Controle individualizado
- ✅ Rastreabilidade por pessoa

---

## ⚠️ Considerações

### **Performance:**
- Cada impressão abre janela separada
- Para muitos convidados, pode ser lento
- **Sugestão:** Adicionar opção "Imprimir Todos" (loop automático)

### **UX:**
- Mostrar apenas se >1 convidado
- Loading spinner durante impressão
- Toast de confirmação por impressão

### **Dados:**
- Verificar se `og.orders` tem itens
- Verificar se `og.orders[].items` existe
- Tratar casos de arrays vazios

---

## 🔧 Tipos Necessários

Adicionar ao arquivo:

```typescript
// Importar tipos necessários do PrintGuestBill
import type { TableGuest, GuestOrder, GuestOrderItem } from './PrintGuestBill';

// Ou definir localmente se não exportados:
interface TableGuest {
  id: string;
  sessionId: string;
  name: string | null;
  guestNumber: number;
  status: string;
  totalSpent: string;
  joinedAt: Date;
}

interface GuestOrderItem {
  id: string;
  menuItemName: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

interface GuestOrder {
  orderId: string;
  orderStatus: string;
  totalAmount: string;
  createdAt: Date;
  items: GuestOrderItem[];
}
```

---

## 📝 Checklist de Implementação

- [ ] Verificar exports em `PrintGuestBill.tsx`
- [ ] Adicionar função `transformGuestDataForPrint`
- [ ] Criar nova seção de UI no diálogo
- [ ] Adicionar condição `ordersByGuest.length > 1`
- [ ] Testar com 1 convidado (não deve aparecer)
- [ ] Testar com múltiplos convidados
- [ ] Testar impressão individual
- [ ] Verificar dados na impressão
- [ ] Testar com itens sem `menuItem.name`
- [ ] Testar com pedidos sem items

---

## 🎯 Resultado Esperado

Após implementação, o usuário terá **3 opções** de impressão:

1. **🖨️ Imprimir Fatura Completa** - Todos os convidados em uma fatura
2. **💾 Baixar PDF** - Fatura completa em PDF
3. **👥 Imprimir por Convidado** - Fatura individual para cada um (NOVO)

Cada opção serve um propósito específico:
- **Completa:** Para o restaurante/caixa
- **PDF:** Para arquivo digital/email
- **Individual:** Para cada cliente levar

---

## 🚀 Próximos Passos

1. ✅ Análise completa realizada
2. ⏭️ Implementar função de transformação
3. ⏭️ Criar UI da seção
4. ⏭️ Integrar PrintGuestBill
5. ⏭️ Testar com dados reais
6. ⏭️ Ajustar formatação se necessário
