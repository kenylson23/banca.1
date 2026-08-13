import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { DndContext, DragEndEvent, DragOverlay, closestCenter } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Users, 
  Split, 
  Check, 
  Clock, 
  Receipt, 
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  UserCircle,
  ShoppingBag,
  AlertCircle,
  Loader2,
  ArrowRightLeft,
  History
} from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { PrintGuestBill } from '@/components/PrintGuestBill';
import { GuestCheckoutDialog } from '@/components/GuestCheckoutDialog';
import { MoveItemDialog } from '@/components/MoveItemDialog';
import { DraggableOrderItem } from '@/components/DraggableOrderItem';
import { DroppableGuestZone } from '@/components/DroppableGuestZone';
import { AuditHistoryDialog } from '@/components/AuditHistoryDialog';
import { MoveItemReasonDialog } from '@/components/MoveItemReasonDialog';

interface TableGuest {
  id: string;
  sessionId: string;
  name: string | null;
  guestNumber: number;
  status: string;
  totalSpent: string;
  paidAmount?: string;
  subtotal?: string;
  customerId?: string | null;
  joinedAt: Date | null;
}

interface GuestOrderItem {
  id: string;
  menuItemName: string;
  quantity: number;
  price: string;
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

interface OrdersByGuest {
  guest: TableGuest;
  orders: GuestOrder[];
  totalAmount?: number;
  subtotal?: string;
}

interface BillSplit {
  id: string;
  splitType: string;
  totalAmount: string;
  splitCount: number;
  allocations: any;
  isFinalized: number;
  createdAt: Date;
}

interface BillSplitPanelProps {
  tableId: string;
  sessionId?: string;
  totalAmount: number;
  initialGuestId?: string | null;
}

const PAYMENT_METHODS = [
  { value: 'dinheiro', label: 'Dinheiro', icon: Banknote },
  { value: 'multicaixa', label: 'Multicaixa', icon: Smartphone },
  { value: 'transferencia', label: 'Transferência', icon: Building2 },
  { value: 'cartao', label: 'Cartão', icon: CreditCard },
];

const getGuestStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    ativo: 'Ativo',
    aguardando_conta: 'Pediu Conta',
    pago: 'Pago',
    saiu: 'Saiu',
  };
  return labels[status] || status;
};

const getGuestStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    ativo: 'bg-blue-500',
    aguardando_conta: 'bg-orange-500',
    pago: 'bg-green-500',
    saiu: 'bg-gray-500',
  };
  return colors[status] || 'bg-gray-500';
};

export function BillSplitPanel({ tableId, sessionId, totalAmount, initialGuestId }: BillSplitPanelProps) {
  const { toast } = useToast();
  
  const numericTotalAmount = typeof totalAmount === 'number' ? totalAmount : parseFloat(totalAmount || '0');
  
  const getGuestTotal = (guestData: OrdersByGuest): number => {
    if (guestData.subtotal) {
      return parseFloat(guestData.subtotal);
    }
    if (guestData.totalAmount !== undefined) {
      return guestData.totalAmount;
    }
    return 0;
  };
  
  const [splitType, setSplitType] = useState<'igual' | 'por_pessoa' | 'personalizado'>('por_pessoa');
  const [splitCount, setSplitCount] = useState(2);
  const [selectedGuest, setSelectedGuest] = useState<string | null>(initialGuestId || null);
  const [paymentMethodsBySplit, setPaymentMethodsBySplit] = useState<Record<string, string>>({});
  const [moveItemDialog, setMoveItemDialog] = useState<{
    open: boolean;
    item: GuestOrderItem | null;
    currentGuest: TableGuest | null;
  }>({
    open: false,
    item: null,
    currentGuest: null,
  });
  const [draggedItem, setDraggedItem] = useState<GuestOrderItem | null>(null);
  const [auditHistoryOpen, setAuditHistoryOpen] = useState(false);
  const [reasonDialog, setReasonDialog] = useState<{
    open: boolean;
    itemId: string;
    itemName: string;
    sourceGuestId: string;
    sourceGuestName: string;
    targetGuestId: string;
    targetGuestName: string;
    maxQuantity: number;
  } | null>(null);
  
  const [guestCheckoutDialog, setGuestCheckoutDialog] = useState<{
    open: boolean;
    guestId: string;
    guestName: string;
    amount: number;
  } | null>(null);

  const { data: ordersData, isLoading: loadingOrders } = useQuery<{ 
    ordersByGuest: OrdersByGuest[]; 
    anonymousOrders: any[]; 
    totalAmount: string;
    paidAmount: string; 
  }>({
    queryKey: [`/api/tables/${tableId}/orders-by-guest`],
    enabled: !!tableId,
  });
  
  const ordersByGuest = ordersData?.ordersByGuest || [];
  const anonymousOrders = ordersData?.anonymousOrders || [];
  const tablePaidAmount = parseFloat(ordersData?.paidAmount || '0');
  const remainingAmount = numericTotalAmount - tablePaidAmount;
  
  const { data: billSplits = [], isLoading: loadingSplits } = useQuery<BillSplit[]>({
    queryKey: [`/api/tables/${tableId}/bill-splits`],
    enabled: !!tableId,
  });

  const createSplitMutation = useMutation({
    mutationFn: async (data: { splitType: string; splitCount?: number; allocations?: any }) => {
      const res = await apiRequest('POST', `/api/tables/${tableId}/bill-splits`, {
        splitType: data.splitType,
        splitCount: data.splitCount,
        totalAmount: numericTotalAmount.toFixed(2),
        allocations: data.allocations,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/bill-splits`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/orders-by-guest`] });
      toast({ title: 'Divisão criada', description: 'A conta foi dividida com sucesso.' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível criar a divisão.',
        variant: 'destructive',
      });
    },
  });

  const distributeAnonymousItemsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/tables/${tableId}/distribute-anonymous-items`);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/orders-by-guest`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/bill-splits`] });
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      toast({
        title: '✅ Rateio Concluído',
        description: data.message || 'Itens anônimos distribuídos com sucesso entre a mesa.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao Ratear',
        description: error.message || 'Não foi possível distribuir os itens anônimos.',
        variant: 'destructive',
      });
    },
  });

  const finalizeSplitMutation = useMutation({
    mutationFn: async ({ splitId, paymentMethod }: { splitId: string; paymentMethod: string }) => {
      const res = await apiRequest('POST', `/api/tables/${tableId}/bill-splits/${splitId}/finalize`, {
        paymentMethod,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/bill-splits`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/orders-by-guest`] });
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      toast({ title: 'Pagamento finalizado', description: 'A parte foi paga com sucesso.' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível finalizar o pagamento.',
        variant: 'destructive',
      });
    },
  });

  const moveItemMutation = useMutation({
    mutationFn: async (data: { itemId: string; newGuestId: string; reason?: string; quantity?: number }) => {
      const response = await apiRequest(
        'PATCH',
        `/api/order-items/${data.itemId}/reassign`,
        {
          newGuestId: data.newGuestId,
          reason: data.reason,
          quantity: data.quantity,
        }
      );

      const json = await response.json().catch(() => null);

      if (!json || json.success !== true) {
        const message = (json && (json.message || json.details)) || 'Falha ao mover item';
        throw new Error(message);
      }

      return json as {
        success: true;
        message?: string;
        oldGuestId?: string | null;
        newGuestId: string;
        movedItemId?: string;
        movedQuantity?: number;
      };
    },

    onMutate: async (vars) => {
      const queryKey = [`/api/tables/${tableId}/orders-by-guest`];

      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<any>(queryKey);

      if (!previous) {
        return { previous };
      }

      const moveQty = Math.max(1, vars.quantity || 1);
      const optimisticId = `optimistic-${vars.itemId}-${Date.now()}`;

      const clone = (obj: any) => JSON.parse(JSON.stringify(obj));
      const next = clone(previous);

      const removeOrSplitItem = (items: any[]) => {
        const idx = (items || []).findIndex((it: any) => it.id === vars.itemId);
        if (idx === -1) return { removed: null as any, items };

        const found = items[idx];
        const availableQty = Math.max(1, Number(found.quantity || 1));
        const qtyToMove = Math.min(moveQty, availableQty);

        if (qtyToMove < availableQty) {
          const remainingQty = availableQty - qtyToMove;
          items[idx] = { ...found, quantity: remainingQty };
          return { removed: { ...found, id: optimisticId, quantity: qtyToMove }, items };
        }

        items.splice(idx, 1);
        return { removed: { ...found, id: optimisticId, quantity: qtyToMove }, items };
      };

      const upsertIntoGuest = (guestId: string, item: any) => {
        const og = (next.ordersByGuest || []).find((g: any) => g?.guest?.id === guestId);
        if (!og) return;

        if (!og.orders || og.orders.length === 0) {
          og.orders = [
            {
              id: `virtual-${guestId}`,
              originalOrderId: null,
              orderNumber: null,
              items: [],
              totalPrice: '0',
            },
          ];
        }

        og.orders[0].items = og.orders[0].items || [];
        og.orders[0].items.unshift({ ...item, guestId });
      };

      // 1) tentar remover de anonymousOrders (Mesa Completa)
      let movedItem: any = null;
      for (const ord of next.anonymousOrders || []) {
        if (!ord?.items?.length) continue;
        const result = removeOrSplitItem(ord.items);
        ord.items = result.items;
        if (result.removed) {
          movedItem = result.removed;
          break;
        }
      }

      // 2) se não estava na Mesa Completa, tentar remover de algum guest
      if (!movedItem) {
        for (const og of next.ordersByGuest || []) {
          for (const ord of og.orders || []) {
            if (!ord?.items?.length) continue;
            const result = removeOrSplitItem(ord.items);
            ord.items = result.items;
            if (result.removed) {
              movedItem = result.removed;
              break;
            }
          }
          if (movedItem) break;
        }
      }

      // 3) inserir no guest destino
      if (movedItem) {
        upsertIntoGuest(vars.newGuestId, movedItem);
      }

      queryClient.setQueryData(queryKey, next);
      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData([`/api/tables/${tableId}/orders-by-guest`], context.previous);
      }
      toast({
        title: 'Erro ao mover item',
        description: _err.message || 'Não foi possível mover o item.',
        variant: 'destructive',
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/orders-by-guest`] });
    },
  });

  const updateGuestStatusMutation = useMutation({
    mutationFn: async ({ guestId, status }: { guestId: string; status: string }) => {
      const res = await apiRequest('PATCH', `/api/table-guests/${guestId}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/orders-by-guest`] });
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      toast({ title: 'Status atualizado', description: 'Status do convidado atualizado com sucesso.' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
    },
  });

  const handleMarkAsPaid = (guestId: string) => {
    updateGuestStatusMutation.mutate({ guestId, status: 'pago' });
  };

  const handleCreateSplit = () => {
    if (splitType === 'igual') {
      const perPerson = numericTotalAmount / splitCount;
      const allocations = ordersByGuest.slice(0, splitCount).map((og, i) => ({
        guestId: og.guest.id,
        guestName: og.guest.name || `Cliente ${og.guest.guestNumber}`,
        label: og.guest.name || `Cliente ${og.guest.guestNumber}`,
        amount: i === splitCount - 1
          ? numericTotalAmount - Math.floor(perPerson * 100) / 100 * (splitCount - 1)
          : Math.floor(perPerson * 100) / 100,
      }));

      // Fill remaining with virtual companions if needed
      for (let i = ordersByGuest.length; i < splitCount; i++) {
        const idx = i - ordersByGuest.length + 1;
        const amount = i === splitCount - 1
          ? numericTotalAmount - allocations.reduce((s, a) => s + a.amount, 0)
          : Math.floor(perPerson * 100) / 100;
        allocations.push({
          guestId: `virtual-${idx}`,
          guestName: `Acompanhante ${idx}`,
          label: `Acompanhante ${idx}`,
          amount,
        });
      }

      createSplitMutation.mutate({
        splitType: 'igual',
        splitCount,
        allocations,
      });
    } else {
      const allocations = ordersByGuest.map((og) => ({
        guestId: og.guest.id,
        guestName: og.guest.name || `Cliente ${og.guest.guestNumber}`,
        label: og.guest.name || `Cliente ${og.guest.guestNumber}`,
        amount: getGuestTotal(og),
      }));
      createSplitMutation.mutate({
        splitType: 'por_pessoa',
        splitCount: ordersByGuest.length,
        allocations,
      });
    }
  };

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedItem(null);

    if (!over || active.id === over.id) return;

    const itemId = String(active.id);
    const targetGuestId = String(over.id);

    // Find source guest info
    let sourceGuestId = 'anonymous';
    let sourceGuestName = 'Mesa';
    let itemName = '';
    let maxQuantity = 1;

    for (const og of ordersByGuest) {
      for (const ord of og.orders || []) {
        const found = (ord.items || []).find((it: any) => it.id === itemId);
        if (found) {
          sourceGuestId = og.guest.id;
          sourceGuestName = og.guest.name || `Cliente ${og.guest.guestNumber}`;
          itemName = found.menuItemName || found.name || 'Item';
          maxQuantity = Number(found.quantity || 1);
          break;
        }
      }
      if (sourceGuestId !== 'anonymous') break;
    }

    if (sourceGuestId === 'anonymous') {
      for (const ord of anonymousOrders) {
        const found = (ord.items || []).find((it: any) => it.id === itemId);
        if (found) {
          itemName = found.name || found.menuItemName || 'Item';
          maxQuantity = Number(found.quantity || 1);
          break;
        }
      }
    }

    const targetGuest = ordersByGuest.find((og) => og.guest.id === targetGuestId);
    const targetGuestName = targetGuest?.guest?.name || `Cliente ${targetGuest?.guest?.guestNumber}` || 'Convidado';

    if (sourceGuestId === targetGuestId) return;

    setReasonDialog({
      open: true,
      itemId,
      itemName,
      sourceGuestId,
      sourceGuestName,
      targetGuestId,
      targetGuestName,
      maxQuantity,
    });
  }, [ordersByGuest, anonymousOrders]);

  if (loadingOrders) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="space-y-4">

        {/* Header com total e botão de histórico */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total da Mesa</p>
            <p className="text-2xl font-bold">{formatKwanza(numericTotalAmount)}</p>
            {tablePaidAmount > 0 && (
              <p className="text-sm text-green-600">
                Pago: {formatKwanza(tablePaidAmount)} | Restante: {formatKwanza(remainingAmount)}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAuditHistoryOpen(true)}
            data-testid="button-audit-history"
          >
            <History className="h-4 w-4 mr-1" />
            Histórico
          </Button>
        </div>

        <Separator />

        {/* Consumo por Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5" />
              Consumo por Cliente
            </CardTitle>
            <CardDescription>
              {ordersByGuest.length} cliente(s) nesta mesa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {ordersByGuest.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <UserCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum cliente registrado</p>
              </div>
            ) : (
              <ScrollArea className="max-h-[400px] pr-4">
                <div className="space-y-3">
                  {ordersByGuest.map((guestData) => (
                    <DroppableGuestZone key={guestData.guest.id} id={guestData.guest.id}>
                      <Card
                        className={`cursor-pointer transition-all ${
                          selectedGuest === guestData.guest.id ? 'ring-2 ring-primary' : ''
                        } ${guestData.guest.status === 'pago' ? 'opacity-60' : ''}`}
                        onClick={() => {
                          setSelectedGuest(selectedGuest === guestData.guest.id ? null : guestData.guest.id);
                        }}
                        data-testid={`card-guest-${guestData.guest.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <UserCircle className="h-6 w-6 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium">
                                    {guestData.guest.name || `Cliente ${guestData.guest.guestNumber}`}
                                  </span>
                                  <Badge className={getGuestStatusColor(guestData.guest.status)}>
                                    {getGuestStatusLabel(guestData.guest.status)}
                                  </Badge>
                                  {parseFloat(guestData.guest.paidAmount || '0') > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      Pago: {formatKwanza(parseFloat(guestData.guest.paidAmount || '0'))}
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs text-primary font-bold">
                                    Consumo: {formatKwanza(getGuestTotal(guestData))}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                  <ShoppingBag className="h-3 w-3" />
                                  <span>{guestData.orders.length} pedido(s)</span>
                                  {guestData.guest.joinedAt && (
                                    <>
                                      <span>-</span>
                                      <Clock className="h-3 w-3" />
                                      <span>
                                        {format(new Date(guestData.guest.joinedAt), "HH:mm", { locale: ptBR })}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <div className="text-2xl font-bold text-primary">
                                {formatKwanza(getGuestTotal(guestData))}
                              </div>
                              <div className="flex gap-2 mt-2">
                                <PrintGuestBill
                                  guest={{
                                    ...guestData.guest,
                                    joinedAt: guestData.guest.joinedAt || new Date(),
                                  }}
                                  orders={guestData.orders}
                                  totalAmount={getGuestTotal(guestData)}
                                  tableName={`Mesa ${tableId}`}
                                  variant="outline"
                                  size="sm"
                                />
                                {guestData.guest.status !== 'pago' && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const guestTotal = getGuestTotal(guestData);
                                        const guestPaid = parseFloat(guestData.guest.paidAmount || '0');
                                        const remaining = guestTotal - guestPaid;
                                        
                                        if (remaining <= 0) {
                                          toast({
                                            title: "Já pago",
                                            description: "Este convidado já pagou sua conta completa",
                                          });
                                          return;
                                        }
                                        
                                        setGuestCheckoutDialog({
                                          open: true,
                                          guestId: guestData.guest.id,
                                          guestName: guestData.guest.name || `Cliente ${guestData.guest.guestNumber}`,
                                          amount: remaining,
                                        });
                                      }}
                                      data-testid={`button-checkout-${guestData.guest.id}`}
                                    >
                                      <CreditCard className="h-3 w-3 mr-1" />
                                      Checkout
                                    </Button>
                                    
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkAsPaid(guestData.guest.id);
                                      }}
                                      disabled={updateGuestStatusMutation.isPending}
                                      data-testid={`button-mark-paid-${guestData.guest.id}`}
                                    >
                                      <Check className="h-3 w-3 mr-1" />
                                      Marcar Pago
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {selectedGuest === guestData.guest.id && guestData.orders && guestData.orders.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                              <div className="text-sm font-medium mb-3 flex items-center gap-2">
                                <span>Itens Consumidos:</span>
                                {ordersByGuest.length > 1 && (
                                  <span className="text-xs text-muted-foreground font-normal">
                                    (Arraste para mover)
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1">
                                {(guestData.orders || []).map((order: any) => {
                                  const originalOrderId = order.originalOrderId || order.id;
                                  const orderLabel = order.orderNumber || String(originalOrderId).slice(0, 8);
                                  const isVirtualOrder = !!order.originalOrderId;

                                  return (
                                    <div key={order.id} className="mb-3 last:mb-0">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                          <Receipt className="h-3.5 w-3.5" />
                                          <span>
                                            Pedido #{orderLabel}
                                            {isVirtualOrder ? ' (itens reatribuídos)' : ''}
                                          </span>
                                        </div>
                                        {isVirtualOrder && (
                                          <Badge variant="secondary" className="text-[10px] px-2 py-0">
                                            Reatribuído
                                          </Badge>
                                        )}
                                      </div>

                                      <div className="space-y-1">
                                        {(order.items || []).map((item: any) => (
                                          <DraggableOrderItem
                                            key={item.id}
                                            id={item.id}
                                            menuItemName={item.menuItemName || item.name || item.menuItem?.name}
                                            quantity={item.quantity}
                                            totalPrice={item.totalPrice || item.price || item.total}
                                            guestId={guestData.guest.id}
                                            disabled={
                                              guestData.guest.status === 'pago' ||
                                              (ordersByGuest.length === 1 && anonymousOrders.length === 0)
                                            }
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </DroppableGuestZone>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Seção de Pedidos Não Atribuídos */}
        {anonymousOrders.length > 0 && (
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-yellow-600" />
                  Pedidos da Mesa (Não Atribuídos)
                </CardTitle>
                <CardDescription className="mt-1">
                  {anonymousOrders.length} pedido(s) sem cliente específico — arraste para atribuir.
                  Pedidos &ldquo;Parcial&rdquo; significam que alguns itens já foram atribuídos a clientes.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 font-semibold flex items-center gap-1.5"
                onClick={() => distributeAnonymousItemsMutation.mutate()}
                disabled={distributeAnonymousItemsMutation.isPending}
                data-testid="button-distribute-anonymous"
              >
                {distributeAnonymousItemsMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRightLeft className="h-4 w-4" />
                )}
                Ratear Mesa Completa
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-md border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>
                    Estes pedidos foram feitos para a mesa total.{' '}
                    <strong>Arraste os itens</strong> para atribuí-los a um cliente específico,
                    ou use <strong>Ratear Mesa Completa</strong> para distribuir igualmente.
                  </p>
                </div>
              </div>

              <ScrollArea className="max-h-[300px] pr-4">
                <div className="space-y-3">
                  {anonymousOrders.map((order) => (
                    <Card key={order.id} className="border-yellow-200 dark:border-yellow-800">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              Pedido #{order.orderNumber || String(order.id).slice(0, 8)}
                            </span>

                            <Badge variant="outline" className="text-xs">
                              {order.items?.length || 0} item(ns)
                            </Badge>

                            {typeof order.totalItemsCount === 'number' &&
                              typeof order.unassignedItemsCount === 'number' &&
                              order.unassignedItemsCount < order.totalItemsCount && (
                                <Badge variant="secondary" className="text-xs">
                                  Parcial ({order.unassignedItemsCount}/{order.totalItemsCount})
                                </Badge>
                              )}
                          </div>
                          <span className="text-sm font-bold">
                            {formatKwanza(order.totalPrice || order.totalAmount || 0)}
                          </span>
                        </div>

                        {order.items && order.items.length > 0 && (
                          <div className="space-y-1 mt-2 pl-1 border-l-2 border-yellow-300 dark:border-yellow-700">
                            {order.items.map((item: any) => (
                              <DraggableOrderItem
                                key={item.id}
                                id={item.id}
                                menuItemName={item.name || item.menuItem?.name || 'Item'}
                                quantity={item.quantity}
                                totalPrice={(item.totalPrice || (parseFloat(item.price || '0') * item.quantity).toFixed(2)).toString()}
                                guestId="anonymous"
                                disabled={false}
                              />
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Secção de Divisão de Conta */}
        {ordersByGuest.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Split className="h-5 w-5" />
                Dividir Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tipo de Divisão</Label>
                <Select value={splitType} onValueChange={(v) => setSplitType(v as any)}>
                  <SelectTrigger data-testid="select-split-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="por_pessoa">Por Consumo Individual</SelectItem>
                    <SelectItem value="igual">Divisão Igual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {splitType === 'igual' && (
                <div>
                  <Label>Dividir em quantas partes?</Label>
                  <Input
                    type="number"
                    min="2"
                    value={splitCount}
                    onChange={(e) => setSplitCount(parseInt(e.target.value) || 2)}
                    data-testid="input-split-count"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Cada parte: {formatKwanza((totalAmount / splitCount).toFixed(2))}
                  </p>
                </div>
              )}

              {splitType === 'por_pessoa' && (
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm space-y-1">
                    {ordersByGuest.map((og) => (
                      <div key={og.guest.id} className="flex justify-between">
                        <span>{og.guest.name || `Cliente ${og.guest.guestNumber}`}</span>
                        <span className="font-medium">{formatKwanza(Number(og.subtotal || og.totalAmount || 0).toFixed(2))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleCreateSplit}
                disabled={createSplitMutation.isPending}
                data-testid="button-create-split"
              >
                {createSplitMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Split className="h-4 w-4 mr-2" />
                    Criar Divisão
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Divisões Criadas */}
        {billSplits.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Divisões Criadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {billSplits.map((split) => {
                const currentPaymentMethod = paymentMethodsBySplit[split.id] || 'dinheiro';
                const allocationsList = Array.isArray(split.allocations) ? split.allocations : [];

                return (
                  <Card key={split.id} data-testid={`card-split-${split.id}`}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {split.splitType === 'igual' ? 'Divisão Igual' : 'Por Consumo'}
                            </span>
                            <Badge variant={split.isFinalized ? 'default' : 'secondary'}>
                              {split.isFinalized ? 'Finalizado' : 'Pendente'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {split.splitCount} partes - {formatKwanza(split.totalAmount)} total
                          </p>
                        </div>
                        {!split.isFinalized && (
                          <div className="flex items-center gap-2">
                            <Select 
                              value={currentPaymentMethod} 
                              onValueChange={(method) => 
                                setPaymentMethodsBySplit(prev => ({ ...prev, [split.id]: method }))
                              }
                            >
                              <SelectTrigger className="w-[140px]" data-testid={`select-payment-method-${split.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {PAYMENT_METHODS.map((method) => (
                                  <SelectItem key={method.value} value={method.value}>
                                    <div className="flex items-center gap-2">
                                      <method.icon className="h-4 w-4" />
                                      {method.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              onClick={() => finalizeSplitMutation.mutate({ 
                                splitId: split.id, 
                                paymentMethod: currentPaymentMethod 
                              })}
                              disabled={finalizeSplitMutation.isPending}
                              data-testid={`button-finalize-split-${split.id}`}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Finalizar
                            </Button>
                          </div>
                        )}
                      </div>

                      {allocationsList.length > 0 && (
                        <div className="pt-2 border-t text-xs space-y-1">
                          <span className="font-medium text-muted-foreground">Detalhamento das Partes:</span>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            {allocationsList.map((alloc: any, idx: number) => (
                              <div key={idx} className="flex justify-between bg-muted/40 p-1.5 rounded">
                                <span>{alloc.label || alloc.guestName || `Parte ${idx + 1}`}</span>
                                <span className="font-semibold">{formatKwanza(alloc.amount)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Move Item Dialog */}
        {moveItemDialog.item && moveItemDialog.currentGuest && (
          <MoveItemDialog
            open={moveItemDialog.open}
            onOpenChange={(open) => {
              if (!open) {
                setMoveItemDialog({ open: false, item: null, currentGuest: null });
              }
            }}
            item={moveItemDialog.item}
            currentGuest={moveItemDialog.currentGuest}
            availableGuests={ordersByGuest.map((og) => og.guest)}
            sessionId={sessionId || ''}
            tableId={tableId}
          />
        )}

        {/* Audit History Dialog */}
        <AuditHistoryDialog
          open={auditHistoryOpen}
          onOpenChange={setAuditHistoryOpen}
          sessionId={sessionId || ''}
        />

        {/* Move Item Reason Dialog (for drag & drop) */}
        {reasonDialog && (
          <MoveItemReasonDialog
            open={reasonDialog.open}
            onOpenChange={(open) => {
              if (!open) {
                setReasonDialog(null);
              }
            }}
            itemName={reasonDialog.itemName}
            sourceGuestName={reasonDialog.sourceGuestName}
            targetGuestName={reasonDialog.targetGuestName}
            maxQuantity={reasonDialog.maxQuantity}
            onConfirm={async (reason, quantity) => {
              try {
                await moveItemMutation.mutateAsync({
                  itemId: reasonDialog.itemId,
                  newGuestId: reasonDialog.targetGuestId,
                  reason,
                  quantity,
                });
              } finally {
                setReasonDialog(null);
              }
            }}
            onCancel={() => {
              setReasonDialog(null);
            }}
          />
        )}

        {/* Guest Checkout Dialog */}
        {guestCheckoutDialog && (
          <GuestCheckoutDialog
            open={guestCheckoutDialog.open}
            onOpenChange={(open) => {
              if (!open) {
                setGuestCheckoutDialog(null);
              }
            }}
            guestId={guestCheckoutDialog.guestId}
            guestName={guestCheckoutDialog.guestName}
            amount={guestCheckoutDialog.amount}
            tableId={tableId}
            onSuccess={() => {
              setGuestCheckoutDialog(null);
              queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/orders-by-guest`] });
              toast({
                title: "Pagamento registrado",
                description: `Pagamento de ${guestCheckoutDialog.guestName} processado com sucesso`,
              });
            }}
          />
        )}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {draggedItem ? (
          <div className="bg-background border rounded-lg p-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm">
                {draggedItem.quantity}x {draggedItem.menuItemName}
              </span>
              <span className="text-sm font-medium ml-4">
                {formatKwanza(draggedItem.totalPrice)}
              </span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
