import { useState } from 'react';
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
  totalAmount?: number;  // Pode não existir para alguns guests
  subtotal?: string;  // API retorna como subtotal (string)
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
  initialGuestId?: string | null; // ID do cliente para focar automaticamente
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
  
  // Garantir que totalAmount é número
  const numericTotalAmount = typeof totalAmount === 'number' ? totalAmount : parseFloat(totalAmount || '0');
  
  // Helper function to get guest total amount consistently
  const getGuestTotal = (guestData: OrdersByGuest): number => {
    // Priority: subtotal (string from API) -> totalAmount (number) -> 0
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
  const [paymentMethod, setPaymentMethod] = useState('dinheiro');
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
    maxQuantity: number; // Adicionar quantidade máxima
  } | null>(null);
  
  // ✅ SOLUÇÃO 3: Estado para checkout individual
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

      // ✅ Fail-fast: só considerar sucesso se a API afirmar success:true
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

    // ✅ Atualização otimista: aplicar mudança no cache imediatamente
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

        // se mover parcial, reduz a quantidade no source
        if (qtyToMove < availableQty) {
          const remainingQty = availableQty - qtyToMove;
          items[idx] = { ...found, quantity: remainingQty };
          return { removed: { ...found, id: optimisticId, quantity: qtyToMove }, items };
        }

        // se mover tudo, remove do source
        items.splice(idx, 1);
        return { removed: { ...found, id: optimisticId, quantity: qtyToMove }, items };
      };

      const upsertIntoGuest = (guestId: string, item: any) => {
        const og = (next.ordersByGuest || []).find((g: any) => g?.guest?.id === guestId);
        if (!og) return;

        // colocar no primeiro pedido, ou criar um "pedido" virtual se não existir
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

      // 3) inserir no guest alvo
      if (movedItem) {
        upsertIntoGuest(vars.newGuestId, movedItem);
      }

      // 4) limpar pedidos vazios da Mesa Completa (só UI)
      next.anonymousOrders = (next.anonymousOrders || []).filter((o: any) => (o.items || []).length > 0);

      queryClient.setQueryData(queryKey, next);

      return { previous };
    },

    onError: (error: Error, _vars, context) => {
      // rollback
      if (context?.previous) {
        queryClient.setQueryData([`/api/tables/${tableId}/orders-by-guest`], context.previous);
      }
      console.error('❌ [MoveItem] Erro na mutation:', error);
      toast({
        title: 'Erro ao atribuir item',
        description: error.message,
        variant: 'destructive',
      });
    },

    onSuccess: async () => {
      // ✅ Refetch final para reconciliar IDs reais/quantidades
      await queryClient.refetchQueries({ queryKey: [`/api/tables/${tableId}/orders-by-guest`] });

      toast({
        title: 'Item atribuído',
        description: 'O item foi atribuído ao cliente com sucesso.',
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/orders-by-guest`] });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setDraggedItem(null);

    if (!over) {
      return;
    }

    const itemId = active.id as string;
    const sourceGuestId = active.data.current?.sourceGuestId;
    const targetGuestId = over.id as string;
    const menuItemName = active.data.current?.menuItemName;
    const itemQuantity = active.data.current?.quantity || 1; // Pegar quantidade

    // Don't move if dropped on same guest (exceto se vier de anonymous)
    if (sourceGuestId === targetGuestId && sourceGuestId !== 'anonymous') {
      return;
    }

    // Check if target guest is eligible
    const targetGuest = ordersByGuest.find(g => g.guest.id === targetGuestId)?.guest;
    
    
    if (!targetGuest) {
      console.error('❌ [DragEnd] Target guest não encontrado!');
      toast({
        title: 'Cliente não encontrado',
        description: 'O cliente de destino não foi encontrado',
        variant: 'destructive',
      });
      return;
    }
    
    if (targetGuest.status === 'pago' || targetGuest.status === 'saiu') {
      toast({
        title: 'Cliente inválido',
        description: 'O cliente de destino já pagou ou saiu',
        variant: 'destructive',
      });
      return;
    }

    // Determinar nome do cliente de origem
    let sourceGuestName = 'Mesa (Pedido não atribuído)';
    if (sourceGuestId && sourceGuestId !== 'anonymous') {
      const sourceGuest = ordersByGuest.find(g => g.guest.id === sourceGuestId)?.guest;
      sourceGuestName = sourceGuest?.name || `Cliente ${sourceGuest?.guestNumber}`;
    }
    
    const targetGuestName = targetGuest.name || `Cliente ${targetGuest.guestNumber}`;
    
    // Open reason dialog
    try {
      setReasonDialog({
        open: true,
        itemId,
        itemName: menuItemName,
        sourceGuestId: sourceGuestId || 'anonymous',
        sourceGuestName,
        targetGuestId,
        targetGuestName,
        maxQuantity: itemQuantity, // Passar quantidade máxima
      });
    } catch (error) {
      console.error('❌ [DragEnd] Erro ao abrir diálogo:', error);
      toast({
        title: 'Erro ao abrir diálogo',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    }
  };

  const updateGuestStatusMutation = useMutation({
    mutationFn: async ({ guestId, status }: { guestId: string; status: string }) => {
      const res = await apiRequest('PATCH', `/api/tables/${tableId}/guests/${guestId}`, {
        status,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/orders-by-guest`] });
      toast({ title: 'Status atualizado' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
    },
  });

  const handleCreateSplit = () => {
    if (splitType === 'igual') {
      createSplitMutation.mutate({ splitType: 'igual', splitCount });
    } else if (splitType === 'por_pessoa') {
      const allocations = ordersByGuest.map(og => ({
        guestId: og.guest.id,
        guestName: og.guest.name || `Cliente ${og.guest.guestNumber}`,
        amount: Number(og.subtotal || og.totalAmount || 0).toFixed(2),
        isPaid: og.guest.status === 'pago',
      }));
      createSplitMutation.mutate({ 
        splitType: 'por_pessoa', 
        splitCount: ordersByGuest.length,
        allocations 
      });
    }
  };

  const handleMarkAsPaid = (guestId: string) => {
    updateGuestStatusMutation.mutate({ guestId, status: 'pago' });
  };

  const isLoading = loadingOrders || loadingSplits;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const guestsAwaitingBill = ordersByGuest.filter(og => og.guest.status === 'aguardando_conta');
  // remainingAmount já calculado acima usando paidAmount da sessão

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      onDragStart={(event) => {
        const item = event.active.data.current as GuestOrderItem;
        setDraggedItem(item);
      }}
      onDragOver={(event) => {
      }}
      onDragCancel={() => {
        setDraggedItem(null);
      }}
    >
      <div className="space-y-4">
        {/* History Button */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAuditHistoryOpen(true)}
            className="gap-2"
          >
            <History className="h-4 w-4" />
            Ver Histórico de Alterações
          </Button>
        </div>

        {/* Alert when specific guest is focused */}
        {initialGuestId && ordersByGuest.find(og => og.guest.id === initialGuestId) && (
          <Card className="border-blue-500/50 bg-blue-500/10">
            <CardContent className="py-3">
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-blue-500" />
                <span className="font-medium text-blue-500">
                  Checkout individual de: {ordersByGuest.find(og => og.guest.id === initialGuestId)?.guest.name || 
                    `Cliente ${ordersByGuest.find(og => og.guest.id === initialGuestId)?.guest.guestNumber}`}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {guestsAwaitingBill.length > 0 && (
        <Card className="border-orange-500/50 bg-orange-500/10">
          <CardContent className="py-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <span className="font-medium text-orange-500">
                {guestsAwaitingBill.length} cliente(s) pediram a conta
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total da Mesa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatKwanza(numericTotalAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Faltam Pagar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remainingAmount > 0 ? 'text-orange-500' : 'text-green-500'}`}>
              {formatKwanza(remainingAmount)}
            </div>
          </CardContent>
        </Card>
      </div>

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
                  <DroppableGuestZone
                    guestId={guestData.guest.id}
                    disabled={guestData.guest.status === 'pago'}
                  >
                    <Card 
                      key={guestData.guest.id} 
                      className={`hover-elevate cursor-pointer ${selectedGuest === guestData.guest.id ? 'ring-2 ring-primary' : ''}`}
                      onClick={(e) => {
                        // Não expandir se clicar nos botões
                        if ((e.target as HTMLElement).closest('button')) {
                          return;
                        }
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
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {guestData.guest.name || `Cliente ${guestData.guest.guestNumber}`}
                              </span>
                              <Badge className={getGuestStatusColor(guestData.guest.status)}>
                                {getGuestStatusLabel(guestData.guest.status)}
                              </Badge>
                              {parseFloat(guestData.guest.paidAmount || '0') > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  Pago: {formatKwanza(guestData.guest.paidAmount)}
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
                            {(() => {
                              const total = getGuestTotal(guestData);
                              const formatted = formatKwanza(total);
                              return formatted;
                            })()}
                          </div>
                          <div className="flex gap-2 mt-2">
                            <PrintGuestBill
                              guest={guestData.guest}
                              orders={guestData.orders}
                              totalAmount={getGuestTotal(guestData)}
                              tableName={`Mesa ${tableId}`}
                              variant="outline"
                              size="sm"
                            />
                            {guestData.guest.status !== 'pago' && (
                              <>
                                {/* ✅ SOLUÇÃO 3: Botão de checkout individual */}
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
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-yellow-600" />
              Pedidos da Mesa (Não Atribuídos)
            </CardTitle>
            <CardDescription>
              {anonymousOrders.length} pedido(s) sem cliente específico — arraste para atribuir. Pedidos “Parcial” significam que alguns itens já foram atribuídos a clientes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-md border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                  Estes pedidos foram feitos para a mesa total. 
                  <strong> Arraste os itens</strong> para atribuí-los a um cliente específico.
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

      {billSplits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Divisões Criadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {billSplits.map((split) => (
              <Card key={split.id} data-testid={`card-split-${split.id}`}>
                <CardContent className="p-4">
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
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
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
                            paymentMethod 
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
                </CardContent>
              </Card>
            ))}
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
          onConfirm={(reason, quantity) => {
            moveItemMutation.mutate({
              itemId: reasonDialog.itemId,
              newGuestId: reasonDialog.targetGuestId,
              reason,
              quantity,
            });
            setReasonDialog(null);
          }}
          onCancel={() => {
            setReasonDialog(null);
          }}
        />
      )}

      {/* ✅ SOLUÇÃO 3: Guest Checkout Dialog */}
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
