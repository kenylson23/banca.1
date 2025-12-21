# 🎯 Plano: Controle de Pedidos da Mesa no PDV

## 📊 Problema Identificado

No PDV, ao acessar a aba "Mesas" e clicar em uma mesa, o `TableDetailsDialog` **NÃO exibe a lista de pedidos** da mesa, apenas mostra:
- ✅ Total da conta (aggregado)
- ✅ Informações da mesa
- ✅ Botões de ação (Criar Pedido, Fechar Conta)
- ❌ **Lista detalhada de pedidos** (FALTANDO)

### Causa Raiz
- Backend **JÁ RETORNA** os pedidos em `table.orders` via endpoint `/api/tables/with-orders`
- Frontend **RECEBE** os dados mas **NÃO RENDERIZA** a lista de pedidos no componente

---

## 🔧 Solução Proposta

### Fase 1: Adicionar Seção de Pedidos no TableDetailsDialog ✅

Adicionar um Card mostrando todos os pedidos ativos da mesa com:
- ID do pedido
- Status (pendente, em_preparo, pronto)
- Lista de itens
- Total do pedido
- Ações (ver detalhes, alterar status, cancelar)

### Fase 2: Componente de Item de Pedido

Criar componente reutilizável para exibir cada pedido:
```tsx
<OrderCard
  order={order}
  onStatusChange={handleStatusChange}
  onCancel={handleCancel}
  onViewDetails={handleViewDetails}
/>
```

### Fase 3: Integração com OrderDetailsDialog

Permitir abrir os detalhes completos do pedido ao clicar em "Ver Detalhes"

---

## 📐 Estrutura da Interface

```
┌─────────────────────────────────────────────┐
│ Mesa 5                    [Ocupada]     [X] │
├─────────────────────────────────────────────┤
│ Tabs: Visão Geral | Divisão | Financeiro   │
├─────────────────────────────────────────────┤
│ [Visão Geral - Tab Ativa]                   │
│                                              │
│ ┌─ Informações ─────────────────────────┐   │
│ │ 👥 João Silva (4 pessoas)              │   │
│ │ 🕐 Última atividade: 15:30             │   │
│ │ ────────────────────────────────────   │   │
│ │ Total da Conta: 15.000,00 Kz          │   │
│ └────────────────────────────────────────┘   │
│                                              │
│ [+ Criar Pedido]  [💳 Fechar Conta]         │
│                                              │
│ ┌─ Pedidos Ativos (3) ──────────────────┐   │
│ │                                         │   │
│ │ ┌─ Pedido #ABC123 ─────────────────┐   │   │
│ │ │ Status: [Em Preparo]  15:25      │   │   │
│ │ │ • 2x Hambúrguer - 3.000,00 Kz   │   │   │
│ │ │ • 1x Coca-Cola - 500,00 Kz      │   │   │
│ │ │ Total: 3.500,00 Kz               │   │   │
│ │ │ [Ver Detalhes] [Alterar Status]  │   │   │
│ │ └──────────────────────────────────┘   │   │
│ │                                         │   │
│ │ ┌─ Pedido #DEF456 ─────────────────┐   │   │
│ │ │ Status: [Pronto]      15:20      │   │   │
│ │ │ • 1x Pizza Margherita - 8.000 Kz│   │   │
│ │ │ Total: 8.000,00 Kz               │   │   │
│ │ │ [Ver Detalhes] [Alterar Status]  │   │   │
│ │ └──────────────────────────────────┘   │   │
│ │                                         │   │
│ │ ┌─ Pedido #GHI789 ─────────────────┐   │   │
│ │ │ Status: [Pendente]    15:15      │   │   │
│ │ │ • 2x Cerveja - 1.500,00 Kz      │   │   │
│ │ │ Total: 1.500,00 Kz               │   │   │
│ │ │ [Ver Detalhes] [Cancelar]        │   │   │
│ │ └──────────────────────────────────┘   │   │
│ └─────────────────────────────────────────┘   │
│                                              │
│ ┌─ Alterar Status ──────────────────────┐   │
│ │ [Ocupada] [Em Andamento]              │   │
│ │ [Aguardando] [Encerrar Mesa]          │   │
│ └────────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 💻 Código a Implementar

### 1. Modificar TableDetailsDialog.tsx

```tsx
// Adicionar após o Card de Informações (linha ~253)

{/* Seção de Pedidos Ativos */}
{table.orders && table.orders.length > 0 && (
  <Card>
    <CardHeader>
      <CardTitle className="text-base flex items-center justify-between">
        <span>Pedidos Ativos ({table.orders.length})</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] })}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {table.orders.map((order: any) => (
        <OrderCard
          key={order.id}
          order={order}
          onViewDetails={() => {
            setSelectedOrder(order);
            setOrderDetailsOpen(true);
          }}
          onStatusChange={handleOrderStatusChange}
          onCancel={handleCancelOrder}
        />
      ))}
    </CardContent>
  </Card>
)}
```

### 2. Criar Componente OrderCard

```tsx
interface OrderCardProps {
  order: any;
  onViewDetails: () => void;
  onStatusChange: (orderId: string, newStatus: string) => void;
  onCancel: (orderId: string) => void;
}

function OrderCard({ order, onViewDetails, onStatusChange, onCancel }: OrderCardProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      pendente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      em_preparo: 'bg-blue-100 text-blue-800 border-blue-300',
      pronto: 'bg-green-100 text-green-800 border-green-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pendente: 'Pendente',
      em_preparo: 'Em Preparo',
      pronto: 'Pronto',
    };
    return labels[status] || status;
  };

  return (
    <div className="border rounded-lg p-3 space-y-2 bg-card">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium">#{order.id.slice(-6)}</span>
          <Badge className={getStatusColor(order.status)}>
            {getStatusLabel(order.status)}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {format(new Date(order.createdAt), 'HH:mm')}
        </span>
      </div>

      <div className="space-y-1">
        {order.orderItems?.map((item: any) => (
          <div key={item.id} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              • {item.quantity}x {item.menuItem?.name || 'Item'}
            </span>
            <span className="font-medium">
              {formatKwanza(Number(item.price) * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Total:</span>
        <span className="font-bold text-primary">
          {formatKwanza(Number(order.totalAmount))}
        </span>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onViewDetails}
          className="flex-1"
        >
          Ver Detalhes
        </Button>
        {order.status === 'pendente' ? (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onCancel(order.id)}
          >
            Cancelar
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                Alterar Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onStatusChange(order.id, 'pendente')}>
                Pendente
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(order.id, 'em_preparo')}>
                Em Preparo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(order.id, 'pronto')}>
                Pronto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
```

### 3. Adicionar Handlers no TableDetailsDialog

```tsx
// Adicionar estados
const [selectedOrder, setSelectedOrder] = useState<any>(null);
const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);

// Adicionar mutations
const updateOrderStatusMutation = useMutation({
  mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
    const res = await apiRequest('PATCH', `/api/orders/${orderId}/status`, { status });
    return await res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
    toast({ title: 'Status atualizado', description: 'Status do pedido atualizado.' });
  },
  onError: (error: any) => {
    toast({
      title: 'Erro',
      description: error.message || 'Não foi possível atualizar o status.',
      variant: 'destructive',
    });
  },
});

const cancelOrderMutation = useMutation({
  mutationFn: async (orderId: string) => {
    const res = await apiRequest('PATCH', `/api/orders/${orderId}/status`, { status: 'cancelado' });
    return await res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
    toast({ title: 'Pedido cancelado', description: 'O pedido foi cancelado.' });
  },
  onError: (error: any) => {
    toast({
      title: 'Erro',
      description: error.message || 'Não foi possível cancelar o pedido.',
      variant: 'destructive',
    });
  },
});

const handleOrderStatusChange = (orderId: string, newStatus: string) => {
  updateOrderStatusMutation.mutate({ orderId, status: newStatus });
};

const handleCancelOrder = (orderId: string) => {
  cancelOrderMutation.mutate(orderId);
};
```

---

## 🎨 Melhorias UX

1. **Atualização em Tempo Real**: WebSocket já está configurado, pedidos atualizam automaticamente
2. **Feedback Visual**: Cores diferentes para cada status de pedido
3. **Ações Rápidas**: Botões de ação direto em cada pedido
4. **Scroll Independente**: ScrollArea permite visualizar muitos pedidos
5. **Contador de Pedidos**: Badge mostrando quantidade total

---

## 🧪 Testes Necessários

1. ✅ Verificar se `table.orders` está sendo retornado pelo backend
2. ⏳ Criar pedido para mesa e verificar se aparece na lista
3. ⏳ Alterar status do pedido e verificar atualização visual
4. ⏳ Cancelar pedido e verificar remoção da lista
5. ⏳ Testar com múltiplos pedidos (3-5) na mesma mesa
6. ⏳ Verificar responsividade em mobile
7. ⏳ Testar atualização via WebSocket

---

## 📊 Benefícios Esperados

### Para o Garçom/Atendente:
- ✅ Visão completa de todos os pedidos da mesa em um único lugar
- ✅ Controle rápido do status de cada pedido
- ✅ Facilidade para identificar o que está pronto/em preparo
- ✅ Gestão mais eficiente do tempo de atendimento

### Para o Gerente:
- ✅ Monitoramento de performance por mesa
- ✅ Identificação de gargalos no atendimento
- ✅ Melhor controle operacional

### Para o Cliente:
- ✅ Atendimento mais rápido e preciso
- ✅ Menos erros de pedidos
- ✅ Melhor experiência geral

---

## 🚀 Timeline de Implementação

| Tarefa | Tempo Estimado | Status |
|--------|----------------|--------|
| Análise do problema | 30 min | ✅ Concluído |
| Criar componente OrderCard | 1h | ⏳ Pendente |
| Integrar no TableDetailsDialog | 1h | ⏳ Pendente |
| Adicionar mutations e handlers | 30 min | ⏳ Pendente |
| Estilização e UX | 30 min | ⏳ Pendente |
| Testes manuais | 1h | ⏳ Pendente |
| Ajustes e correções | 30 min | ⏳ Pendente |
| **Total** | **4h 30min** | - |

---

## 📝 Próximos Passos

**Agora você pode escolher:**

1. **🚀 Implementar Agora** - Eu começo a implementar a solução completa
2. **🎨 Customizar Design** - Ajustar layout/cores antes de implementar
3. **📋 Adicionar Features** - Sugerir funcionalidades extras (ex: filtros, ordenação)
4. **🔍 Revisar Backend** - Verificar se dados estão corretos antes de continuar

**Qual opção você prefere?**
